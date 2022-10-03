import { IMongoCredentials } from '@core/models/dataAccess/IMongoose'

export const mongoTestConfig: IMongoCredentials= {
  host: 'atmdbprimary',
  port: 27017,
  user: 'devModelsUser',
  password: 'devModelsTestPass'
}