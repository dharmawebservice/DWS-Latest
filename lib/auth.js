import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// No built-in fallback in production: a known default secret would let anyone forge an admin session.
// In local development only, a throwaway secret is used so the Vault still opens without setup.
const RAW = process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'dev-only-secret-not-for-production-use-0000' : '');
const SECRET = new TextEncoder().encode(RAW);
export const authConfigured = RAW.length >= 16;

export async function createToken() {
  if (!authConfigured) throw new Error('JWT_SECRET is missing or shorter than 16 characters');
  return await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('12h')
    .sign(SECRET);
}

export async function verifyToken(token) {
  if (!authConfigured) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('dws_admin')?.value;
    if (!token) return null;
    return await verifyToken(token);
  } catch (err) {
    console.error('Session error:', err);
    return null;
  }
}