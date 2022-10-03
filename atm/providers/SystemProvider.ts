import { ClientSession } from 'mongoose';

import { ATMMongooseProvider } from '@db/providers/ATMMongooseProvider';

import { SystemEndpoints } from '@atm/models/Endpoints';
import { 
  UpdateFundsRequest, SysBalanceRequest, SysBalanceResponse 
} from '@atm/models/SystemRequest';
import { ISystem } from '@db/models/System';

const applySession = (session?: ClientSession): { $session: ClientSession } => { 
  if (session) { 
    return { $session: session }
  }
};

export class SystemProvider implements SystemEndpoints {
  constructor(private atmDb: ATMMongooseProvider) {}

  async getBalance(opts: SysBalanceRequest, session?: ClientSession): Promise<SysBalanceResponse> {
    const sysObj: ISystem = await this.atmDb.MSystem.findOne(
      { sysId: opts.sysId },
      null,
      applySession(session));

    return {
      balance: sysObj.balance
    }
  }
  
  async updateFunds(opts: UpdateFundsRequest, session?: ClientSession): Promise<boolean> {
    const updateBalance = (prev: number, update: number) => opts.operation === 'add' ? prev + update : prev - update;

    const currSys: ISystem = await this.atmDb.MSystem.findOne(
      { sysId: opts.sysId },
      null,
      applySession(session)
    );

    if (currSys.balance >= opts.transactionSize) {
      await this.atmDb.MSystem.findOneAndUpdate(
        { sysId: opts.sysId },
        { $set: { balance: updateBalance(currSys.balance, opts.transactionSize) }},
        applySession(session)
      );
    }

    return true;
  }
}