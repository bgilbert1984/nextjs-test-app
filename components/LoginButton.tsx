"use client"
// components/LoginButton.tsx
import { useRouter } from 'next/navigation';

const LoginButton = () => {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/api/auth/google');
  };

  return (
    <button onClick={handleLogin}>Login with Google</button>
  );
};

export default LoginButton;