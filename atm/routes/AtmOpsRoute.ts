import { Request, Response, NextFunction } from 'express';

import { BaseRoute, RouteOpts } from '@core/baseServer/core/BaseRoute';
import { LogProvider } from '@core/providers/LogProvider';
import { LedgerProvider } from '@atm/providers/LedgerProvider';
import { AuthProvider } from '@atm/providers/AuthProvider';
import { 
  BalanceRequest, TransactionsRequest, CreateTransactionRequest
} from '@atm/models/LedgerRequest';
import { extractErrorMessage } from '@core/utils/Utils';

import { atmRouteMapping } from '@atm/configs/AtmOpsRouteMapping';
import { SimpleQueueProvider } from '@core/providers/queue/SimpleQueueProvider';

const NAME = 'ATM Ops Route';

export class AtmOpsRoute extends BaseRoute {
  name = NAME;
  
  private log: LogProvider = new LogProvider(NAME);

  constructor(
    rootpath: string, 
    private ledgerProvider: LedgerProvider,
    private authProvider: AuthProvider,
    private atmTransactionQueue: SimpleQueueProvider
  ) {
    super(rootpath);
    this.log.initFileLogger();

    this.router.post(atmRouteMapping.atm.subRouteMapping.getBalance.name, this.getBalance.bind(this));
    this.router.post(atmRouteMapping.atm.subRouteMapping.getTransactions.name, this.getTransactions.bind(this));
    this.router.post(atmRouteMapping.atm.subRouteMapping.createTransaction.name, this.createTransaction.bind(this));
    
    this.atmQueueOn();
  }

  private async getBalance(req: Request, res: Response, next: NextFunction) {
    const getBalanceReq: BalanceRequest = req.body;
    await this.pipeRequest(
      { 
        method: atmRouteMapping.atm.subRouteMapping.getBalance.key, 
        customMsg: atmRouteMapping.atm.subRouteMapping.getBalance 
      }, 
      req, res, next, 
      getBalanceReq
    );
  }

  private async getTransactions(req: Request, res: Response, next: NextFunction) {
    const getTransactionReq: TransactionsRequest = req.body;
    await this.pipeRequest(
      { 
        method: atmRouteMapping.atm.subRouteMapping.getTransactions.key, 
        customMsg: atmRouteMapping.atm.subRouteMapping.getTransactions 
      }, 
      req, res, next, 
      getTransactionReq
    );
  }

  private async createTransaction(req: Request, res: Response, next: NextFunction) {
    const createTransactionReq: CreateTransactionRequest = req.body;
    await this.pipeRequest(
      { 
        method: atmRouteMapping.atm.subRouteMapping.createTransaction.key, 
        customMsg: atmRouteMapping.atm.subRouteMapping.createTransaction 
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
    this.atmTransactionQueue.enqueue({ opts, res, params });
  }

  private atmQueueOn() {
    this.atmTransactionQueue.queueUpdate.on(this.atmTransactionQueue.eventName, async () => {
      if (this.atmTransactionQueue.length > 0) {
        const { opts, res, params } = this.atmTransactionQueue.dequeue();

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