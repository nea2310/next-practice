// app/(auth)/register/page.tsx
import { RegisterForm } from './RegisterForm';

export default async function RegisterPage() {
  return (
    <div style={{ maxWidth: '400px', margin: '50px auto' }}>
      <h2>Регистрация</h2>
      <RegisterForm />
      <p>
        Уже есть аккаунт? <a href="/login">Войти</a>
      </p>
    </div>
  );
}
