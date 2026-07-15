// app/(auth)/register/RegisterForm.tsx
'use client';

import { useActionState, useEffect } from 'react';
import { registerAction } from '@/app/actions/auth';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, null);

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
        <label htmlFor="username">Имя пользователя</label>
        <input id="username" type="text" name="username" placeholder="Введите имя" required />
      </div>
      <div style={{ marginTop: '10px' }}>
        <label htmlFor="password">Пароль</label>
        <input
          id="password"
          type="password"
          name="password"
          placeholder="Введите пароль"
          required
        />
      </div>
      {state?.error && <p style={{ marginTop: '10px', color: 'red' }}>{state.error}</p>}
      <button type="submit" disabled={isPending} style={{ marginTop: '15px' }}>
        {isPending ? 'Загрузка...' : 'Зарегистрироваться'}
      </button>
    </form>
  );
}
