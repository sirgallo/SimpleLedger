import { ROUTE, STATUSOK, INFO } from '@core/models/ILog'
import { IBaseRoute } from '@core/baseServer/core/models/IRouteMappings'

export const systemRouteMapping: Record<string, IBaseRoute>= {
  system: {
    key: '',
    name: '/system',
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
      addFunds: {
        key: 'addFunds',
        name: '/addfunds',
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
              text: 'funds added', 
              color: INFO 
            }
          }
        ]
      }
    }
  }
}