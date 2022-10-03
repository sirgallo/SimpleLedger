import { 
  ServerConfiguration,
  IServerConfiguration
} from '@core/baseServer/core/models/ServerConfiguration';

export const serverConfiguration: ServerConfiguration<Record<string, IServerConfiguration>> = {
  atm: {
    port: 1098,
    name: 'ATM API',
    numOfCpus: 1,
    version: '0.0.1-dev'
  }
}