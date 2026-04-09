/**
 * Mock pocketbase client.
 * This file is kept to prevent build errors from legacy code (e.g. Header.tsx)
 * that still imports pocketbase. The project uses Supabase for backend services.
 */

const pb = {
  authStore: {
    model: null,
    isValid: false,
    token: '',
    clear: () => {},
  },
  collection: (name: string) => ({
    getList: async () => ({ items: [], totalItems: 0, page: 1, totalPages: 1 }),
    getFullList: async () => [],
    getOne: async () => ({ id: 'mock-id' }),
    create: async () => ({ id: 'mock-id' }),
    update: async () => ({ id: 'mock-id' }),
    delete: async () => true,
    authWithPassword: async () => ({ token: '', record: {} }),
    authRefresh: async () => ({ token: '', record: {} }),
  }),
  files: {
    getUrl: () => '',
  },
  cancelAllRequests: () => {},
}

export default pb
