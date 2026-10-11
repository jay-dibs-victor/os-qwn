function isAxiosError(error) {
  if (!error || typeof error !== 'object') return false;
  if (error.isAxiosError !== undefined) return !!error.isAxiosError;
  return 'response' in error || 'config' in error || 'request' in error;
}

const axios = {
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
  patch: jest.fn(() => Promise.resolve({ data: {} })),
  head: jest.fn(() => Promise.resolve({ data: {} })),
  options: jest.fn(() => Promise.resolve({ data: {} })),
  request: jest.fn(() => Promise.resolve({ data: {} })),
  isAxiosError,
  create: () => axios,
  defaults: {},
  interceptors: { request: [], response: [] },
};

module.exports = axios;
