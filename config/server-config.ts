export const authConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  cookieName: 'AuthToken',
  cookieSigningKey: process.env.COOKIE_SIGNING_KEY!, // 32-byte hex
  cookieSerializeOptions: {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 12 * 60 * 60 * 24 * 1000, // 12 days
  },
} 