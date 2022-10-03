import { Schema, Document } from 'mongoose' 

export const UserCollectionName = 'user';
export const TokenCollectionName = 'token';

export interface IUser extends Document {
  userId: string;
  email: string;
  phone: string;
  password: string;
}

export interface IToken extends Document {
  userId: string;
  token: string;
  refreshToken: string;
  issueDate: Date;
  refreshIssueDate: Date;
  expiresIn: string;
  refreshExpiresIn: string;
}

export const UserSchema: Schema<IUser> = new Schema({
  userId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true},
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true, unique: false }
}, { 
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }, 
  collection: UserCollectionName,
  minimize: false
});

export const TokenSchema: Schema<IToken> = new Schema({
  userId: { type: String, index: true, required: true, unique: true},
  token: { type: String, required: true, unique: false },
  refreshToken: { type: String, required: true, unique: false },
  issueDate: { type: Date, index: true, required: true, unique: false },
  refreshIssueDate: { type: Date, index: true, required: true, unique: false },
  expiresIn: { type: String, index: false, required: true, unique: false },
  refreshExpiresIn: { type: String, index: false, required: true, unique: false }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  collection: TokenCollectionName,  
  minimize: false
});

UserSchema.index({ email: 1 });
TokenSchema.index({ userId: 1 });