import { IMongoCredentials } from '@core/models/dataAccess/IMongoose'

export const mongoTestConfig: IMongoCredentials= {
  host: 'ledgerdbprimary',
  port: 27017,
  user: 'devModelsUser',
  password: 'devModelsTestPass'
}