import { asyncExponentialBackoff } from '@core/utils/AsyncExponentialBackoff';
import { LedgerEndpoints } from 'ledger/models/Endpoints';
import { 
  BalanceRequest, BalanceResponse, CreateTransactionRequest, 
  TransactionsRequest, TransactionsResponse 
} from 'ledger/models/LedgerRequest';

import { atmRouteMapping } from 'ledger/configs/AtmOpsRouteMapping';

export class ATMCLIProvider implements LedgerEndpoints { 
  private endpoints: Record<string, string>;

  constructor(private atmHost: string, private port?: number, private https?: boolean) {
    this.parseUrl(); 
    this.setEndpoints();
  }

  async getBalance(opts: BalanceRequest): Promise<BalanceResponse> {
    return await asyncExponentialBackoff(
      this.endpoints.getBalance, 5, 500, { json: opts }
    );
  }

  async getTransactions(opts: TransactionsRequest): Promise<TransactionsResponse> {
    return await asyncExponentialBackoff(
      this.endpoints.getTransactions, 5, 500, { json: opts }
    );
  }

  async createTransaction(opts: CreateTransactionRequest): Promise<boolean> {
    return await asyncExponentialBackoff(
      this.endpoints.createTransaction, 5, 500, { json: opts }
    );
  }

  private parseUrl() {
    const port = `${ this.port ? ':' + this.port : this.port }`

    if (! this.https) {
      this.atmHost = ! this.atmHost.includes('http://') 
        ? `http://${this.atmHost}${port}/store` 
        : this.atmHost + port
    } else {
      this.atmHost = ! this.atmHost.includes('https://') 
        ? `https://${this.atmHost}${port}/store`
        : this.atmHost + port
    }
  }

  private setEndpoints() {
    this.endpoints = {
      getBalance: `${this.atmHost}${atmRouteMapping.store.subRouteMapping.getBalance.name}`,
      getTransactions: `${this.atmHost}${atmRouteMapping.store.subRouteMapping.getTransactions.name}`,
      createTransaction: `${this.atmHost}/${atmRouteMapping.store.subRouteMapping.createTransaction.name}`
    }
  }
}