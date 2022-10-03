import { InitAtmService } from '@atm/InitAtmService';
import { serverConfiguration } from '../ServerConfigurations';

const server = new InitAtmService(
  serverConfiguration.atm.name,
  serverConfiguration.atm.port,
  serverConfiguration.atm.version,
  serverConfiguration.atm.numOfCpus
);

try {
  server.startServer();
} catch (err) { console.log(err); }