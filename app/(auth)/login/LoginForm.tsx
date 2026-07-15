// app/(auth)/login/LoginForm.tsx
'use client';

import { useActionState, useEffect } from 'react';
import { loginAction } from '@/app/actions/auth';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    if (state?.token && state?.user) {
      login(state.token, state.user);
      router.push('/main');
    }
  }, [state, login, router]);
  return (
    <form action={formAction}>
      <div>
        <label>Имя пользователя</label>
        <input type="text" name="username" required />
      </div>
      <div>
        <label>Пароль</label>
        <input type="password" name="password" required />
      </div>
      {state?.error && <p style={{ color: 'red' }}>{state.error}</p>}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Загрузка...' : 'Войти'}
      </button>
    </form>
  );
}
