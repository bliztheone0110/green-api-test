import { setupServer } from 'msw/node'

// Each API test supplies its own handlers with server.use(...).
export const server = setupServer()
