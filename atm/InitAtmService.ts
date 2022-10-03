import { randomBytes } from 'crypto';

import { BaseServer } from '@baseServer/core/BaseServer';
import { LogProvider } from '@core/providers/LogProvider';
import { SimpleQueueProvider } from '@core/providers/queue/SimpleQueueProvider';

import { ATMMongooseProvider } from '@db/providers/ATMMongooseProvider';
import { AuthProvider } from '@atm/providers/AuthProvider';
import { LedgerProvider } from '@atm/providers/LedgerProvider';
import { SystemProvider } from '@atm/providers/SystemProvider';

import { AtmOpsRoute } from '@atm/routes/AtmOpsRoute';
import { AuthRoute } from '@atm/routes/AuthRoute';
import { SystemRoute } from '@atm/routes/SystemRoute';
import { ISystem } from '@db/models/System';

import { dbConf } from '@db/DbConf';
import { mongoTestConfig } from '@atm/configs/MongoTestConfig';
import { atmRouteMapping } from '@atm/configs/AtmOpsRouteMapping';
import { authRouteMapping } from '@atm/configs/AuthRouteMapping';
import { systemRouteMapping } from '@atm/configs/SystemRouteMapping';

const ATM_OP_EVENT = 'ATM Op Event';
const HASH_LENGTH = 64;
const HASH_ENCODING = 'hex';

const genHash = (): string => randomBytes(HASH_LENGTH).toString(HASH_ENCODING);

export class InitAtmService extends BaseServer {
  private atmInitLog: LogProvider = new LogProvider(`${this.name} Init`);

  constructor(name: string, port?: number, version?: string, numOfCpus?: number) { 
    super(name, port, version, numOfCpus); 
  }

  async startServer() {
    try {
      const atmModel = new ATMMongooseProvider(mongoTestConfig, dbConf.atmModels.name);
      await atmModel.initDefault();

      const currSys: ISystem = await atmModel.MSystem.create({ 
        sysId: genHash(),
        balance: 10000
      });

      const atmTransactionQueue: SimpleQueueProvider = new SimpleQueueProvider(ATM_OP_EVENT);
      
      const authProv = new AuthProvider(atmModel);
      const ledgerProv = new LedgerProvider(atmModel, currSys.sysId);
      const sysProv = new SystemProvider(atmModel);

      const atmRoute = new AtmOpsRoute(atmRouteMapping.atm.name, ledgerProv, authProv, atmTransactionQueue);
      const authRoute = new AuthRoute(authRouteMapping.auth.name, authProv);
      const sysRoute = new SystemRoute(systemRouteMapping.system.name, sysProv);

      this.setRoutes([ 
        atmRoute,
        authRoute,
        sysRoute
      ]);

      this.run();
    } catch (err) {
      this.atmInitLog.error(err);
      throw err;
    }
  }
}