import { Schema, Document } from 'mongoose' 

export type AtmOpType = 'spend' | 'receive' | 'withdraw';
export const LedgerCollectionName = 'ledger';

export interface ILedger extends Document {
  userId: string;
  operation: AtmOpType;
  transactionSize: number;
  totalBalance: number;
}

export const LedgerSchema: Schema<ILedger> = new Schema({
  userId: { type: String, required: false, unique: false },
  operation: { type: String, required: false, unique: false },
  transactionSize: { type: Number, required: false, unique: false },
  totalBalance: { type: Number, required: false, unique: false }
}, { 
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }, 
  collection: LedgerCollectionName,
  minimize: false
});

/*
  Index on User Id and descending on createdAt, this allows for sub linear lookup

  Structure

  ...       uid1            uid2            uid3        ...
  ...        |               |               |          ...
        t3, t2, t1...   t3, t2, t1...   t3, t2, t1...  

*/
LedgerSchema.index({ userId: 1, createdAt: -1 });