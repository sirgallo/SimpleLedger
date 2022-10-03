import { Request, Response, NextFunction } from 'express';

import { BaseRoute, RouteOpts } from '@core/baseServer/core/BaseRoute';
import { LogProvider } from '@core/providers/LogProvider';
import { SystemProvider } from '@ledger/providers/SystemProvider';
import { BalanceRequest, TransactionsRequest } from '@ledger/models/LedgerRequest';
import { extractErrorMessage } from '@core/utils/Utils';

import { systemRouteMapping } from '@ledger/configs/SystemRouteMapping';

const NAME = 'System Route';

export class SystemRoute extends BaseRoute {
  name = NAME;
  
  private log: LogProvider = new LogProvider(NAME);

  constructor(
    rootpath: string, 
    private systemProvider: SystemProvider
  ) {
    super(rootpath);
    this.log.initFileLogger();

    this.router.post(systemRouteMapping.system.subRouteMapping.getBalance.name, this.getBalance.bind(this));
    this.router.post(systemRouteMapping.system.subRouteMapping.addFunds.name, this.addFunds.bind(this));
  }

  private async getBalance(req: Request, res: Response, next: NextFunction) {
    const getBalanceReq: BalanceRequest = req.body;
    await this.pipeRequest(
      { 
        method: systemRouteMapping.system.subRouteMapping.getBalance.key, 
        customMsg: systemRouteMapping.system.subRouteMapping.getBalance 
      }, 
      req, res, next, 
      getBalanceReq
    );
  }

  private async addFunds(req: Request, res: Response, next: NextFunction) {
    const addFundsReq: TransactionsRequest = req.body;
    await this.pipeRequest(
      { 
        method: systemRouteMapping.system.subRouteMapping.getTransactions.key, 
        customMsg: systemRouteMapping.system.subRouteMapping.getTransactions 
      }, 
      req, res, next, 
      addFundsReq
    );
  }

  async validateRoute(req: Request, res: Response, next: NextFunction): Promise<boolean> {
    return true;
  }

  async performRouteAction(opts: RouteOpts, req: Request, res: Response, next: NextFunction, ...params) {
    try {
      const resp = await this.systemProvider[opts.method](...params);
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
}