export const API_ENDPOINTS = {
  bookings: {
    list: 'https://functions.poehali.dev/07871607-696c-49db-b330-8d0d08b2896e', // get-bookings
    create: 'https://functions.poehali.dev/a6d5798a-4b6c-4b15-8fd8-0264c1c51660', // create-booking
    updateStatus: 'https://functions.poehali.dev/10a90c1d-6a39-498f-8e57-4d4ca76b442d', // update-booking-status
    export: 'https://functions.poehali.dev/aec56852-2ec9-4a3d-88bb-f6a21b412e84', // export-bookings
    delete: 'https://functions.poehali.dev/6441c23c-e63f-4a3e-8cd7-aabdb983ca45', // delete-bookings
  },
  reviews: {
    list: 'https://functions.poehali.dev/fe3a5b5b-90b1-406c-82f5-e74bbf2ebdd9', // get-reviews
    add: 'https://functions.poehali.dev/0916c610-058d-41be-ba74-88b82dac175e', // reviews-add
    import: 'https://functions.poehali.dev/e046b52b-bb1a-44dd-a9e3-989af297c485', // reviews-import-yandex
    update: 'https://functions.poehali.dev/32d0d28e-e35c-44a4-b9b2-bf9152960524', // update-review
    delete: 'https://functions.poehali.dev/c627baa8-d31a-4aea-a57f-13d47053d8e8', // delete-review
  },
  brands: {
    list: 'https://functions.poehali.dev/3811becc-a55e-4be9-a710-283d3eee897f', // get-brands
    manage: 'https://functions.poehali.dev/6e998d6c-035e-480a-b85e-9b690fa6733a', // manage-brands
    details: 'https://functions.poehali.dev/a19b0c72-97a3-4d31-978e-35840f99a22c', // get-brand-details
  },
  services: {
    list: 'https://functions.poehali.dev/43a403bc-db40-4188-82e3-9949126abbfc', // get-services
  },
  promotions: {
    list: 'https://functions.poehali.dev/f1aecbb9-bab7-4235-a31d-88082b99927d', // get-promotions
    listAdmin: 'https://functions.poehali.dev/0a5a5f24-24e2-4ab9-9cd1-b55adbc62b49', // get-promotions-admin
    create: 'https://functions.poehali.dev/41e1a512-82fb-463c-ae25-c5687f6dc664', // new-promotion-notify
    update: 'https://functions.poehali.dev/07f352c0-0a8d-4307-9048-288381aa9f45', // update-promotion-admin
    delete: 'https://functions.poehali.dev/7198e7ad-0464-4bc3-93f4-9200099874b5', // delete-promotion-admin
    subscribe: 'https://functions.poehali.dev/57151564-a5c5-4699-93d7-040cd4af8da6', // subscribe-promotion
    subscribers: 'https://functions.poehali.dev/199ae90d-71d2-441d-b460-e56731e4a2fb', // get-subscribers-admin
  },
  blog: {
    list: 'https://functions.poehali.dev/e92433da-3db2-4e99-b9d6-a4596b987e6a', // blog
  },
  settings: {
    get: 'https://functions.poehali.dev/8bc3c490-c0ac-4106-91a2-e809a9fb2cdf', // get-settings
    update: 'https://functions.poehali.dev/731360dc-a17d-4bc3-b22a-974f46b9bac2', // update-settings
  },
  admin: {
    verify: 'https://functions.poehali.dev/f154dcd8-cf73-4c58-b0c2-63e293d16b4a', // verify-admin
  },
  images: {
    upload: 'https://functions.poehali.dev/0c2538b8-020a-4ffa-a9dc-cb7b0574de2b', // upload-image
  },
  models: {
    upload: 'https://functions.poehali.dev/158713b5-5bec-4512-afed-3075eb5db319', // models-upload
    api: 'https://functions.poehali.dev/c258cd9a-aa38-4b28-8870-18027041939b', // models-api
  },
  telegram: {
    send: 'https://functions.poehali.dev/d5431aca-bf68-41c1-b31f-e7bfa56a1f4b', // send-telegram-notification
  },
  max: {
    send: 'https://functions.poehali.dev/cd36e9ce-a071-42db-b619-b47ee9c00b7c', // send-max-notification
  },
  sitemap: {
    generate: 'https://functions.poehali.dev/bfb45887-88df-472e-86be-950f37a57385', // generate-sitemap
  },
  email: {
    sendBooking: 'https://functions.poehali.dev/8b118617-cafd-4196-b36d-7a784ab13dc6', // send-booking-email
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