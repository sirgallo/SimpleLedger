import { 
  BalanceRequest, TransactionsRequest, CreateTransactionRequest,
  BalanceResponse, TransactionsResponse
} from 'ledger/models/LedgerRequest';

import { 
  SysBalanceRequest, SysBalanceResponse, UpdateFundsRequest
} from 'ledger/models/SystemRequest';
import { IUser } from '@db/models/User';

export interface LedgerEndpoints {
  getBalance(opts: BalanceRequest): Promise<BalanceResponse>;
  getTransactions(opts: TransactionsRequest): Promise<TransactionsResponse>;
  createTransaction(opts: CreateTransactionRequest): Promise<boolean>;
}

export interface SystemEndpoints {
  getBalance(opts: SysBalanceRequest): Promise<SysBalanceResponse>;
  updateFunds(opts: UpdateFundsRequest): Promise<boolean>;
}

export interface AuthEndpoints {
  authenticate(user: Partial<IUser>): Promise<string | Error>;
  register(newUser: Partial<IUser>): Promise<string>;
}