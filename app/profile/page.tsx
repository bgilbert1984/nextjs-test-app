"use client";
import { useSession } from 'next-auth/react';

export default function ProfilePage() {
const { data: session, status } = useSession();

if (status === "loading") {
    return <div>Loading...</div>;
}

if (!session) {
    return <div>You are not signed in.</div>;
}

  return (
    <div>
        <h1>Profile</h1>
        <p>User ID: {session.user?.id}</p>
        <p>Email: {session.user?.email}</p>
        <p>Name: {session.user?.name}</p> 
    </div>
);
}