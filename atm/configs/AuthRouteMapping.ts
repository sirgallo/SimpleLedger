import { ROUTE, STATUSOK, INFO } from '@core/models/ILog'
import { IBaseRoute } from '@core/baseServer/core/models/IRouteMappings'

export const authRouteMapping: Record<string, IBaseRoute>= {
  auth: {
    key: '',
    name: '/auth',
    subRouteMapping: {
      authenticate: {
        key: 'authenticate',
        name: '/authenticate',
        customConsoleMessages: [
          {
            1: { 
              text: '/login', 
              color: ROUTE 
            },
            2: { 
              text: '200', 
              color: STATUSOK 
            },
            3: { 
              text: 'authenticated', 
              color: INFO 
            }
          }
        ]
      },
      register: {
        key: 'register',
        name: '/register',
        customConsoleMessages: [
          {
            1: { 
              text: '/register', 
              color: ROUTE 
            },
            2: { 
              text: '200', 
              color: STATUSOK 
            },
            3: { 
              text: 'registered', 
              color: INFO 
            }
          }
        ]
      }
    }
  }
}