// app/(auth)/login/page.tsx
import { LoginForm } from './LoginForm';

export default async function LoginPage() {
  return (
    <div style={{ maxWidth: '400px', margin: '50px auto' }}>
      <h2>Вход</h2>
      <LoginForm />
      <p>
        Нет аккаунта? <a href="/register">Зарегистрироваться</a>
      </p>
    </div>
  );
}
