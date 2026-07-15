// app/actions/auth.ts
'use server';

import {
  hashPassword,
  comparePassword,
  findUserByUsername,
  generateToken,
  setAuthCookie,
} from '@/lib/auth';
import { users } from '@/lib/db';
import { redirect } from 'next/navigation';

export async function registerAction(
  prevState: { error?: string; token?: string; user?: { id: string; username: string } } | null,
  formData: FormData
): Promise<{ error?: string; token?: string; user?: { id: string; username: string } } | null> {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { error: 'Username and password required' };
  }
  if (findUserByUsername(username)) {
    return { error: 'User already exists' };
  }

  const passwordHash = await hashPassword(password);
  const user = { id: Date.now().toString(), username, passwordHash };
  users.push(user);

  const token = generateToken(user);
  // Устанавливаем httpOnly cookie (для безопасности HTTP-запросов)
  await setAuthCookie(token);

  // Возвращаем токен и пользователя для клиента
  return { token, user: { id: user.id, username: user.username } };
}

export async function loginAction(
  prevState: { error?: string; token?: string; user?: { id: string; username: string } } | null,
  formData: FormData
): Promise<{ error?: string; token?: string; user?: { id: string; username: string } } | null> {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { error: 'Username and password required' };
  }
  const user = findUserByUsername(username);
  if (!user || !(await comparePassword(password, user.passwordHash))) {
    return { error: 'Invalid credentials' };
  }

  const token = generateToken(user);
  await setAuthCookie(token);

  return { token, user: { id: user.id, username: user.username } };
}

export async function logoutAction() {
  // Для выхода можно оставить редирект, так как он не требует возврата данных
  const { clearAuthCookie } = await import('@/lib/auth');
  await clearAuthCookie();
  redirect('/login');
}
