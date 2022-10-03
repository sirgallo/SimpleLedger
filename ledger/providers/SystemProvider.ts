import { ClientSession } from 'mongoose';

import { LedgerMongooseProvider } from '@db/providers/LedgerMongooseProvider';

import { SystemEndpoints } from '@ledger/models/Endpoints';
import { 
  UpdateFundsRequest, SysBalanceRequest, SysBalanceResponse 
} from '@ledger/models/SystemRequest';
import { ISystem } from '@db/models/System';

const applySession = (session?: ClientSession): { $session: ClientSession } => { 
  if (session) { 
    return { $session: session }
  }
};

export class SystemProvider implements SystemEndpoints {
  constructor(private ledgerDb: LedgerMongooseProvider) {}

  async getBalance(opts: SysBalanceRequest, session?: ClientSession): Promise<SysBalanceResponse> {
    const sysObj: ISystem = await this.ledgerDb.MSystem.findOne(
      { sysId: opts.sysId },
      null,
      applySession(session));

    return {
      balance: sysObj.balance
    }
  }
  
  async updateFunds(opts: UpdateFundsRequest, session?: ClientSession): Promise<boolean> {
    const updateBalance = (prev: number, update: number) => opts.operation === 'add' ? prev + update : prev - update;

    const currSys: ISystem = await this.ledgerDb.MSystem.findOne(
      { sysId: opts.sysId },
      null,
      applySession(session)
    );

    if (currSys.balance >= opts.transactionSize) {
      await this.ledgerDb.MSystem.findOneAndUpdate(
        { sysId: opts.sysId },
        { $set: { balance: updateBalance(currSys.balance, opts.transactionSize) }},
        applySession(session)
      );
    }

    return true;
  }
}