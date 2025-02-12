// app/_not-found.tsx
"use client";

import Link from 'next/link';

export default function CustomNotFound() {

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 dark:text-gray-200">404</h1>
        <p className="text-2xl text-gray-600 dark:text-gray-400 mb-8">Page Not Found</p>
        <p className="text-gray-500 dark:text-gray-300 mb-4">
          Sorry, the page you are looking for does not exist.
        </p>
        <Link href="/" className="text-blue-500 hover:underline">
          Go back to the homepage
        </Link>
      </div>
    </div>
  );
}