"use client";
    import { signIn } from 'next-auth/react';
    import { useEffect } from 'react';
    import { useRouter } from 'next/navigation';


    export default function SignUpPage() {
        const router = useRouter();

        useEffect(() => {
            signIn('google', { callbackUrl: '/' }); // Redirect to home after sign in
        }, [router]);

      return <div>Redirecting to sign-in...</div>; // Or a loading spinner
    }