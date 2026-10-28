const base = (process.env.PRESENTATION_TEST_URL ?? 'http://127.0.0.1:5173').replace(/\/$/, '')

export const appURL = (path = '') => `${base}${path.startsWith('/') ? path : `/${path}`}`
