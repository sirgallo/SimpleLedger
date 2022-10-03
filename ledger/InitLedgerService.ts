import { randomBytes } from 'crypto';

import { BaseServer } from '@baseServer/core/BaseServer';
import { LogProvider } from '@core/providers/LogProvider';
import { SimpleQueueProvider } from '@core/providers/queue/SimpleQueueProvider';

import { LedgerMongooseProvider } from '@db/providers/LedgerMongooseProvider';
import { AuthProvider } from '@ledger/providers/AuthProvider';
import { LedgerProvider } from '@ledger/providers/LedgerProvider';
import { SystemProvider } from '@ledger/providers/SystemProvider';

import { LedgerRoute } from '@ledger/routes/LedgerRoute';
import { AuthRoute } from '@ledger/routes/AuthRoute';
import { SystemRoute } from '@ledger/routes/SystemRoute';
import { ISystem } from '@db/models/System';

import { dbConf } from '@db/DbConf';
import { mongoTestConfig } from '@ledger/configs/MongoTestConfig';
import { ledgerRouteMapping } from '@ledger/configs/LedgerRouteMapping';
import { authRouteMapping } from '@ledger/configs/AuthRouteMapping';
import { systemRouteMapping } from '@ledger/configs/SystemRouteMapping';

const LEDGER_OP_EVENT = 'Ledger Op Event';
const HASH_LENGTH = 64;
const HASH_ENCODING = 'hex';

const genHash = (): string => randomBytes(HASH_LENGTH).toString(HASH_ENCODING);

export class InitLedgerService extends BaseServer {
  private ledgerInitLog: LogProvider = new LogProvider(`${this.name} Init`);

  constructor(name: string, port?: number, version?: string, numOfCpus?: number) { 
    super(name, port, version, numOfCpus); 
  }

  async startServer() {
    try {
      const ledgerModel = new LedgerMongooseProvider(mongoTestConfig, dbConf.ledgerModels.name);
      await ledgerModel.initDefault();

      const currSys: ISystem = await ledgerModel.MSystem.create({ 
        sysId: genHash(),
        balance: 10000
      });

      const ledgerTransactionQueue: SimpleQueueProvider = new SimpleQueueProvider(LEDGER_OP_EVENT);
      
      const authProv = new AuthProvider(ledgerModel);
      const ledgerProv = new LedgerProvider(ledgerModel, currSys.sysId);
      const sysProv = new SystemProvider(ledgerModel);

      const ledgerRoute = new LedgerRoute(ledgerRouteMapping.ledger.name, ledgerProv, authProv, ledgerTransactionQueue);
      const authRoute = new AuthRoute(authRouteMapping.auth.name, authProv);
      const sysRoute = new SystemRoute(systemRouteMapping.system.name, sysProv);

      this.setRoutes([ 
        ledgerRoute,
        authRoute,
        sysRoute
      ]);

      this.run();
    } catch (err) {
      this.ledgerInitLog.error(err);
      throw err;
    }
  }
}