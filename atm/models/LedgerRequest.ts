import { AtmOpType, ILedger } from '@db/models/Ledger';

export interface BalanceRequest {
  userId: string;
}

export interface TransactionsRequest {
  userId: string;
}

export interface CreateTransactionRequest {
  userId: string;
  operation: AtmOpType;
  transactionSize: number;
}

export interface BalanceResponse {
  totalBalance: number;
}

export interface TransactionsResponse {
  transactions: ILedger[];
}

export interface CreateTransactionResponse {
  success: boolean;
}