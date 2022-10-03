import { ROUTE, STATUSOK, INFO } from '@core/models/ILog'
import { IBaseRoute } from '@core/baseServer/core/models/IRouteMappings'

export const atmRouteMapping: Record<string, IBaseRoute>= {
  atm: {
    key: '',
    name: '/atm',
    subRouteMapping: {
      getBalance: {
        key: 'getBalance',
        name: '/getbalance',
        customConsoleMessages: [
          {
            1: { 
              text: '/getbalance', 
              color: ROUTE 
            },
            2: { 
              text: '200', 
              color: STATUSOK 
            },
            3: { 
              text: 'balance retrieved', 
              color: INFO 
            }
          }
        ]
      },
      getTransactions: {
        key: 'getTransactions',
        name: '/gettransactions',
        customConsoleMessages: [
          {
            1: { 
              text: '/gettransactions', 
              color: ROUTE 
            },
            2: { 
              text: '200', 
              color: STATUSOK 
            },
            3: { 
              text: 'fetched transactions', 
              color: INFO 
            }
          }
        ]
      },
      createTransaction: {
        key: 'createTransaction',
        name: '/createtransaction',
        customConsoleMessages: [
          {
            1: { 
              text: '/createtransaction', 
              color: ROUTE 
            },
            2: { 
              text: '200', 
              color: STATUSOK 
            },
            3: { 
              text: 'created transaction', 
              color: INFO 
            }
          }
        ]
      }
    }
  }
}