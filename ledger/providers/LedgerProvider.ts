import { ClientSession } from 'mongoose';

import { LedgerMongooseProvider } from '@db/providers/LedgerMongooseProvider';
import { LedgerOpType, ILedger } from '@db/models/Ledger';

import { LedgerEndpoints } from '@ledger/models/Endpoints';
import { 
  BalanceRequest, BalanceResponse, CreateTransactionRequest, 
  TransactionsRequest, TransactionsResponse 
} from '@ledger/models/LedgerRequest';
import { SystemProvider } from '@ledger/providers/SystemProvider';

import lodash from 'lodash';
const { first } = lodash;

const parseDateRange = (limit: number): Date => new Date(new Date().setDate(new Date().getDate() - limit));

const MAX_DAYS = 30;

export class LedgerProvider implements LedgerEndpoints {
  private sysProv: SystemProvider;

  constructor(private ledgerDb: LedgerMongooseProvider, private sysId: string) {
    this.sysProv = new SystemProvider(this.ledgerDb);
  }

  async getBalance(opts: BalanceRequest): Promise<BalanceResponse> {
    const lookup = this.genTransactionLookup(opts.userId, parseDateRange(MAX_DAYS));
    const prevTransaction: ILedger = first(await this.ledgerDb.MLedger.aggregate(lookup));

    return {
      totalBalance: prevTransaction.totalBalance || 0
    }
  }

  async getTransactions(opts: TransactionsRequest): Promise<TransactionsResponse> {
    const lookup = this.genTransactionLookup(opts.userId, parseDateRange(MAX_DAYS));
    const transactions: ILedger[] = await this.ledgerDb.MLedger.aggregate(lookup);

    return { transactions }
  }

  async createTransaction(opts: CreateTransactionRequest): Promise<boolean> {
    const calcNewBalance = (op: LedgerOpType, size: number, prev: number) => op === 'spend' || op === 'withdraw' ? prev - size : prev + size;
    const lookup = this.genTransactionLookup(opts.userId, parseDateRange(1), 1);

    //  need this to be atomic
    const currSession: ClientSession = await this.ledgerDb.conn.startSession();
    currSession.startTransaction();

    const prevTransaction: ILedger = first(await this.ledgerDb.MLedger.aggregate(lookup).session(currSession));
  
    if (opts.operation === 'withdraw') {
      const currSysBalance = await this.sysProv.getBalance(
        { sysId: this.sysId },
        currSession
      )
      
      if (currSysBalance.balance >= opts.transactionSize && prevTransaction.totalBalance >= opts.transactionSize) {
        await this.sysProv.updateFunds({ 
          sysId: this.sysId, 
          operation: 'subtract',
          transactionSize: opts.transactionSize 
        }, currSession);
      }
    }
    
    await this.ledgerDb.MLedger.create({
      userId: opts.userId,
      operation: opts.operation,
      transactionSize: opts.transactionSize,
      totalBalance: prevTransaction ? calcNewBalance(opts.operation, opts.transactionSize, prevTransaction.totalBalance) : opts.transactionSize
    }, { $session: currSession });
    
    await currSession.commitTransaction();
    await currSession.endSession();

    return true;
  }

  private genTransactionLookup(userId: string, $gte: Date, limit?: number): any[] {
    const transactionLookupPipeline = [];

    transactionLookupPipeline.push(
      { 
        $match: {
          userId,
          createdAt: { $gte }
        }
      }, 
      {
        $project: {
          userId: 1, operation: 1, transactionSize: 1, 
          totalBalance: 1, createdAt: 1, _id: 0
        }
      }
    );

    if (limit) transactionLookupPipeline.push({ $limit: limit })

    return transactionLookupPipeline;
  }
}