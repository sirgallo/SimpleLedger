import { Model } from 'mongoose'

import { MongooseProvider } from '@core/providers/dataAccess/MongooseProvider'

import { dbConf } from '@db/DbConf';

import { ILedger, LedgerSchema } from '@db/models/Ledger';
import { ISystem, SystemSchema } from '@db/models/System';
import { IToken, IUser, UserSchema, TokenSchema } from '@db/models/User';

export class ATMMongooseProvider extends MongooseProvider {
  MLedger: Model<ILedger, any, any, any>;
  MSystem: Model<ISystem, any, any, any>;
  MToken: Model<IToken, any, any, any>;
  MUser: Model<IUser, any, any, any>;
  
  initDefaultModels() {
    this.MLedger = this.addModel<ILedger>(this.conn, dbConf.atmModels.collections.Ledger, LedgerSchema);
    this.MSystem = this.addModel<ISystem>(this.conn, dbConf.atmModels.collections.System, SystemSchema);
    this.MToken = this.addModel<IToken>(this.conn, dbConf.atmModels.collections.Token, TokenSchema);
    this.MUser = this.addModel<IUser>(this.conn, dbConf.atmModels.collections.User, UserSchema);
  }
}