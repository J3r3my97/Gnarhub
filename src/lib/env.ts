function getEnvVar(key: string, required = true): string {
  const value = process.env[key];
  if (required && !value) {
    if (typeof window === 'undefined') {
      // Only throw on server during build/runtime, not in browser
      console.warn(`Missing environment variable: ${key}`);
    }
    return '';
  }
  return value || '';
}

export const env = {
  firebase: {
    apiKey: getEnvVar('NEXT_PUBLIC_FIREBASE_API_KEY'),
    authDomain: getEnvVar('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
    projectId: getEnvVar('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
    storageBucket: getEnvVar('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', false),
    messagingSenderId: getEnvVar('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', false),
    appId: getEnvVar('NEXT_PUBLIC_FIREBASE_APP_ID'),
  },
  stripe: {
    publishableKey: getEnvVar('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', false),
  },
  app: {
    url: getEnvVar('NEXT_PUBLIC_APP_URL', false) || 'http://localhost:3000',
  },
};

export function validateEnv(): { valid: boolean; missing: string[] } {
  const required = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ];

  const missing = required.filter((key) => !process.env[key]);

  return {
    valid: missing.length === 0,
    missing,
  };
}
