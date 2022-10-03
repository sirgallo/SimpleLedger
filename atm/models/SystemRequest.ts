type SysOps = 'add' | 'subtract';

export interface SysBalanceRequest {
  sysId: string;
  opts?: {
    session: any
  }
}

export interface SysBalanceResponse {
  balance: number;
}

export interface UpdateFundsRequest {
  sysId: string;
  operation: SysOps;
  transactionSize: number;
}