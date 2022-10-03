import { Request, Response, NextFunction } from 'express';

import { BaseRoute, RouteOpts } from '@core/baseServer/core/BaseRoute';
import { LogProvider } from '@core/providers/LogProvider';
import { LedgerProvider } from '@ledger/providers/LedgerProvider';
import { AuthProvider } from '@ledger/providers/AuthProvider';
import { 
  BalanceRequest, TransactionsRequest, CreateTransactionRequest
} from '@ledger/models/LedgerRequest';
import { extractErrorMessage } from '@core/utils/Utils';

import { ledgerRouteMapping } from '@ledger/configs/LedgerRouteMapping';
import { SimpleQueueProvider } from '@core/providers/queue/SimpleQueueProvider';

const NAME = 'Ledger Route';

export class LedgerRoute extends BaseRoute {
  name = NAME;
  
  private log: LogProvider = new LogProvider(NAME);

  constructor(
    rootpath: string, 
    private ledgerProvider: LedgerProvider,
    private authProvider: AuthProvider,
    private ledgerTransactionQueue: SimpleQueueProvider
  ) {
    super(rootpath);
    this.log.initFileLogger();

    this.router.post(ledgerRouteMapping.ledger.subRouteMapping.getBalance.name, this.getBalance.bind(this));
    this.router.post(ledgerRouteMapping.ledger.subRouteMapping.getTransactions.name, this.getTransactions.bind(this));
    this.router.post(ledgerRouteMapping.ledger.subRouteMapping.createTransaction.name, this.createTransaction.bind(this));
    
    this.ledgerQueueOn();
  }

  private async getBalance(req: Request, res: Response, next: NextFunction) {
    const getBalanceReq: BalanceRequest = req.body;
    await this.pipeRequest(
      { 
        method: ledgerRouteMapping.ledger.subRouteMapping.getBalance.key, 
        customMsg: ledgerRouteMapping.ledger.subRouteMapping.getBalance 
      }, 
      req, res, next, 
      getBalanceReq
    );
  }

  private async getTransactions(req: Request, res: Response, next: NextFunction) {
    const getTransactionReq: TransactionsRequest = req.body;
    await this.pipeRequest(
      { 
        method: ledgerRouteMapping.ledger.subRouteMapping.getTransactions.key, 
        customMsg: ledgerRouteMapping.ledger.subRouteMapping.getTransactions 
      }, 
      req, res, next, 
      getTransactionReq
    );
  }

  private async createTransaction(req: Request, res: Response, next: NextFunction) {
    const createTransactionReq: CreateTransactionRequest = req.body;
    await this.pipeRequest(
      { 
        method: ledgerRouteMapping.ledger.subRouteMapping.createTransaction.key, 
        customMsg: ledgerRouteMapping.ledger.subRouteMapping.createTransaction 
      }, 
      req, res, next, 
      createTransactionReq
    );
  }

  async validateRoute(req: Request, res: Response, next: NextFunction): Promise<boolean> {
    const userId: string = req.headers.userid as string;
    const token: string = req.headers.accesstoken as string;

    return await this.authProvider.checkToken(userId, token);
  }

  async performRouteAction(opts: RouteOpts, req: Request, res: Response, next: NextFunction, ...params) {
    this.ledgerTransactionQueue.enqueue({ opts, res, params });
  }

  private ledgerQueueOn() {
    this.ledgerTransactionQueue.queueUpdate.on(this.ledgerTransactionQueue.eventName, async () => {
      if (this.ledgerTransactionQueue.length > 0) {
        const { opts, res, params } = this.ledgerTransactionQueue.dequeue();

        try {
          const resp = await this.ledgerProvider[opts.method](...params);
          this.log.custom(opts.customMsg.customConsoleMessages[0], true);

          res
            .status(200)
            .send({ status: 'success', resp });
        } catch (err) {
          this.log.error(`Error on ${NAME} => ${err as Error}`);
          res
            .status(404)
            .send({ err: extractErrorMessage(err as Error) });
        }
      } 
    });
  }
}