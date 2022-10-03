import { DBMap } from '@db/models/Configure';

const currDbs = {
  'ledgerModels': 1
}

export const dbConf: DBMap<typeof currDbs> = {
  ledgerModels: {
    name: 'ledgerModels',
    collections: {
      Ledger: 'ledger',
      System: 'system',
      User: 'user',
      Token: 'token'
    }
  }
}