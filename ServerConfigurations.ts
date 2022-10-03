import { 
  ServerConfiguration,
  IServerConfiguration
} from '@core/baseServer/core/models/ServerConfiguration';

export const serverConfiguration: ServerConfiguration<Record<string, IServerConfiguration>> = {
  ledger: {
    port: 1098,
    name: 'Ledger API',
    numOfCpus: 1,
    version: '0.0.1-dev'
  }
}