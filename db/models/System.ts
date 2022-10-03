import { Schema, Document } from 'mongoose'; 

export const SystemsCollectionsName = 'system';

export interface ISystem extends Document {
  sysId: string;
  balance: number;
}

export const SystemSchema: Schema<ISystem> = new Schema({
  sysId: { type: String, required: true, unique: true },
  balance: { type: Number, required: true, unique: false }
}, 
{ 
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }, 
  collection: SystemsCollectionsName,
  minimize: false
});