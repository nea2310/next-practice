'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import {
  findUserByUsername,
  createUser,
  verifyPassword,
  generateToken,
  setAuthCookie,
  clearAuthCookie,
} from '@/lib/auth';

export async function registerAction(prevState: any, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  const existing = await findUserByUsername(username);
  if (existing) return { error: 'User already exists' };

  const user = await createUser(username, password);
  const token = generateToken(user);
  await setAuthCookie(token);

  return { token, user: { id: user.id, username: user.username } };
}

export async function loginAction(prevState: any, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  const user = await findUserByUsername(username);
  if (!user) return { error: 'Invalid credentials' };

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return { error: 'Invalid credentials' };

  const token = generateToken(user);
  await setAuthCookie(token);

  return { token, user: { id: user.id, username: user.username } };
}

export async function logoutAction() {
  await clearAuthCookie();
  redirect('/login');
}