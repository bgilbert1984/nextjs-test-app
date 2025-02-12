"use client"
import { useSession } from 'next-auth/react'; // Import

export default function FeaturesPage() {
  const { data: session, status } = useSession();
  const loading = status === 'loading';

    if (loading) {
      return <p>Loading...</p>
    }
    if (session) {
      return (
        <main>
          <h1>Features</h1>
          <p>This is the features page, and you are logged in as {session.user.email}.</p>
        </main>
      );
    } else {
        return (
            <main>
                <h1>Features</h1>
                <p>This is the features page, please log in.</p>
            </main>
        )
    }
}