import { Schema, Document } from 'mongoose' 

export type AtmOpType = 'spend' | 'receive' | 'withdraw';
export const AccountCollectionName = 'account';

export interface IAccount extends Document {
  userId: string;
  balance: number;
}

export const AccountSchema: Schema<IAccount> = new Schema({
  userId: { type: String, required: true, unique: false },
  balance: { type: Number, required: true, unique: false }
}, { 
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }, 
  collection: AccountCollectionName,
  minimize: false
});

AccountSchema.index({ userId: 1 });