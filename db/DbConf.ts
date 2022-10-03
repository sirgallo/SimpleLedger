import { DBMap } from '@db/models/Configure';

const currDbs = {
  'atmModels': 1
}

export const dbConf: DBMap<typeof currDbs> = {
  atmModels: {
    name: 'atmModels',
    collections: {
      Ledger: 'ledger',
      System: 'system',
      User: 'user',
      Token: 'token'
    }
  }
}