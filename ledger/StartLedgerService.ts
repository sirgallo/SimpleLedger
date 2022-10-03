import { InitLedgerService } from '@ledger/InitLedgerService';
import { serverConfiguration } from '../ServerConfigurations';

const server = new InitLedgerService(
  serverConfiguration.ledger.name,
  serverConfiguration.ledger.port,
  serverConfiguration.ledger.version,
  serverConfiguration.ledger.numOfCpus
);

try {
  server.startServer();
} catch (err) { console.log(err); }