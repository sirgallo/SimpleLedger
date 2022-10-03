import { Request, Response, NextFunction } from 'express';

import { BaseRoute, RouteOpts } from '@core/baseServer/core/BaseRoute';
import { LogProvider } from '@core/providers/LogProvider';
import { AuthProvider } from '@ledger/providers/AuthProvider';
import { BalanceRequest, TransactionsRequest } from '@ledger/models/LedgerRequest';
import { extractErrorMessage } from '@core/utils/Utils';

import { authRouteMapping } from '@ledger/configs/AuthRouteMapping';

const NAME = 'Auth Route';

export class AuthRoute extends BaseRoute {
  name = NAME;
  
  private log: LogProvider = new LogProvider(NAME);

  constructor(
    rootpath: string, 
    private authProvider: AuthProvider
  ) {
    super(rootpath);
    this.log.initFileLogger();

    this.router.post(authRouteMapping.auth.subRouteMapping.authenticate.name, this.authenticate.bind(this));
    this.router.post(authRouteMapping.auth.subRouteMapping.register.name, this.register.bind(this));
  }

  private async authenticate(req: Request, res: Response, next: NextFunction) {
    const authReq: BalanceRequest = req.body;
    await this.pipeRequest(
      { 
        method: authRouteMapping.auth.subRouteMapping.authenticate.key, 
        customMsg: authRouteMapping.auth.subRouteMapping.authenticate 
      }, 
      req, res, next, 
      authReq
    );
  }

  private async register(req: Request, res: Response, next: NextFunction) {
    const registerReq: TransactionsRequest = req.body;
    await this.pipeRequest(
      { 
        method: authRouteMapping.auth.subRouteMapping.register.key, 
        customMsg: authRouteMapping.auth.subRouteMapping.register 
      }, 
      req, res, next, 
      registerReq
    );
  }

  async validateRoute(req: Request, res: Response, next: NextFunction): Promise<boolean> {
    return true;
  }

  async performRouteAction(opts: RouteOpts, req: Request, res: Response, next: NextFunction, ...params) {
    try {
      const resp = await this.authProvider[opts.method](...params);
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