export const API_ENDPOINTS = {
  bookings: {
    list: 'https://functions.poehali.dev/07871607-696c-49db-b330-8d0d08b2896e',
    create: 'https://functions.poehali.dev/55c039ba-f940-49e1-8589-73ace0f01f05',
    updateStatus: 'https://functions.poehali.dev/04351be8-3746-49dd-9c00-c57ea8ad97f3',
    export: 'https://functions.poehali.dev/aec56852-2ec9-4a3d-88bb-f6a21b412e84',
    delete: 'https://functions.poehali.dev/6441c23c-e63f-4a3e-8cd7-aabdb983ca45',
  },
  reviews: {
    list: 'https://functions.poehali.dev/fe3a5b5b-90b1-406c-82f5-e74bbf2ebdd9',
    add: 'https://functions.poehali.dev/0916c610-058d-41be-ba74-88b82dac175e',
    import: 'https://functions.poehali.dev/e046b52b-bb1a-44dd-a9e3-989af297c485',
  },
  brands: {
    list: 'https://functions.poehali.dev/3811becc-a55e-4be9-a710-283d3eee897f',
    manage: 'https://functions.poehali.dev/6e998d6c-035e-480a-b85e-9b690fa6733a',
    details: 'https://functions.poehali.dev/9fd8ddff-189b-4246-afc3-73d082eb8699',
  },
  services: {
    list: 'https://functions.poehali.dev/43a403bc-db40-4188-82e3-9949126abbfc',
  },
  promotions: {
    list: 'https://functions.poehali.dev/f1aecbb9-bab7-4235-a31d-88082b99927d',
    listAdmin: 'https://functions.poehali.dev/0a5a5f24-24e2-4ab9-9cd1-b55adbc62b49',
    create: 'https://functions.poehali.dev/5a0a3612-f9b3-4eba-8ac1-3230f81d8bc4',
    update: 'https://functions.poehali.dev/07f352c0-0a8d-4307-9048-288381aa9f45',
    delete: 'https://functions.poehali.dev/4a0720cb-4906-457f-8860-4f6196d93031',
  },
  blog: {
    list: 'https://functions.poehali.dev/e92433da-3db2-4e99-b9d6-a4596b987e6a',
  },
  settings: {
    get: 'https://functions.poehali.dev/8bc3c490-c0ac-4106-91a2-e809a9fb2cdf',
    update: 'https://functions.poehali.dev/731360dc-a17d-4bc3-b22a-974f46b9bac2',
  },
  admin: {
    verify: 'https://functions.poehali.dev/f154dcd8-cf73-4c58-b0c2-63e293d16b4a',
  },
  images: {
    upload: 'https://functions.poehali.dev/2083652a-f56c-4d58-85e2-2e0af2b8a48a',
  },
  models: {
    upload: 'https://functions.poehali.dev/5b2da9ae-6907-49bc-8c1b-ca3ffd20d9e7',
    api: 'https://functions.poehali.dev/c258cd9a-aa38-4b28-8870-18027041939b',
  },
  telegram: {
    send: 'https://functions.poehali.dev/d5431aca-bf68-41c1-b31f-e7bfa56a1f4b',
  },
  sitemap: {
    generate: 'https://functions.poehali.dev/bfb45887-88df-472e-86be-950f37a57385',
  },
  email: {
    sendBooking: 'https://functions.poehali.dev/8b118617-cafd-4196-b36d-7a784ab13dc6',
  },
} as const;

interface FetchOptions extends RequestInit {
  authToken?: string;
}

export const apiRequest = async <T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> => {
  const { authToken, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  if (authToken) {
    headers['X-Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};