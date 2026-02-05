export const API_ENDPOINTS = {
  bookings: {
    list: 'https://functions.poehali.dev/07871607-696c-49db-b330-8d0d08b2896e',
    create: 'https://functions.poehali.dev/aadd0cd7-2b07-453f-b59d-37f41bb2dfca',
    updateStatus: 'https://functions.poehali.dev/04351be8-3746-49dd-9c00-c57ea8ad97f3',
    export: 'https://functions.poehali.dev/aec56852-2ec9-4a3d-88bb-f6a21b412e84',
    delete: 'https://functions.poehali.dev/37e87c6b-b6f0-4b41-86f9-92c4fd43af50',
  },
  reviews: {
    list: 'https://functions.poehali.dev/fa4a2381-b1d3-48ab-8ec7-3c9df4fe9d09',
    manage: 'https://functions.poehali.dev/25d54ff6-3db8-4b64-905a-f5ff9c92aaf3',
  },
  brands: {
    list: 'https://functions.poehali.dev/fb1ce7e8-8aed-4a0e-843a-7d3d9e949950',
    manage: 'https://functions.poehali.dev/0c2e65f4-dba5-473f-a94c-c2afd9ae6f66',
    details: 'https://functions.poehali.dev/1b5e4877-0e30-4fe9-96bb-0f60e28cde24',
  },
  services: {
    list: 'https://functions.poehali.dev/77b88f4f-b75a-4ad3-83c6-25a43b89be1e',
  },
  promotions: {
    list: 'https://functions.poehali.dev/9c49f10e-6e99-484f-8ece-cb16854a6f31',
    listAdmin: 'https://functions.poehali.dev/bcf2f19c-c6b1-4fc8-9b5a-ac3a651f75e6',
    create: 'https://functions.poehali.dev/1ab7b0bf-7ca1-4b9f-8fff-3e17b1d1d89c',
    update: 'https://functions.poehali.dev/92d26a64-26c0-4a02-bdf5-b34b30a0df66',
    delete: 'https://functions.poehali.dev/60dc8d6f-7ef7-47b0-b60a-5fd42327fa62',
  },
  blog: {
    list: 'https://functions.poehali.dev/d3e13ccc-11d8-4a01-9e93-b47cef6e7caf',
  },
  settings: {
    get: 'https://functions.poehali.dev/8bc3c490-c0ac-4106-91a2-e809a9fb2cdf',
    update: 'https://functions.poehali.dev/731360dc-a17d-4bc3-b22a-974f46b9bac2',
  },
  admin: {
    verify: 'https://functions.poehali.dev/b9ff3dc2-0baa-4edf-8abb-9df8a35a1c74',
  },
  images: {
    upload: 'https://functions.poehali.dev/ef2e4aae-4cbe-4cef-8f63-e26ce68d8775',
  },
  models: {
    upload: 'https://functions.poehali.dev/2a4d66c4-11e2-482e-a52b-e4e8ff21e44d',
    api: 'https://functions.poehali.dev/92b6cd3d-e28f-4e6e-80ab-8a4c0a8ef18e',
  },
  telegram: {
    send: 'https://functions.poehali.dev/bf7e0584-9ae8-45c1-ad77-7e46ea4edc1e',
  },
  sitemap: {
    generate: 'https://functions.poehali.dev/a6e2c5a4-fb4f-4148-886f-8b5879e5c67f',
  },
  email: {
    sendBooking: 'https://functions.poehali.dev/ed7b8fac-45d1-4595-a05f-b7aab8a6ae59',
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
