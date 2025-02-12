"use client";

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';

function Header() {
    const { data: session, status } = useSession();
    const loading = status === "loading";

    return (
        <header className="absolute w-full z-30">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-20">
                    {/* Site branding */}
                    <div className="shrink-0 mr-4">
                        {/* Replace with your logo or site name */}
                        <Link href="/" className="block text-white text-lg font-bold" aria-label="Your Site Name">
                            Your Site Name
                        </Link>
                    </div>

                    {/* Desktop navigation */}
                    <nav className="hidden md:flex md:grow">
                        <ul className="flex grow justify-end flex-wrap items-center">
                            <li>
                                <Link href="/" className="text-gray-300 hover:text-gray-200 px-4 py-2">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/features" className="text-gray-300 hover:text-gray-200 px-4 py-2">
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link href="/pricing" className="text-gray-300 hover:text-gray-200 px-4 py-2">
                                    Pricing
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-gray-300 hover:text-gray-200 px-4 py-2">
                                    About
                                </Link>
                            </li>
                            <li>
                                {/* Conditional Rendering for Sign In/Out */}
                                {loading ? (
                                    <span className="text-gray-400">Loading...</span>
                                ) : session ? (
                                    <>
                                        <Link href="/profile" className="text-gray-300 hover:text-gray-200 px-4 py-2">
                                            {session.user?.name || session.user?.email} {/* Display user info */}
                                        </Link>
                                         <button
                                            className="btn-sm text-white bg-gray-700 hover:bg-gray-600 ml-3"
                                            onClick={() => signOut()}
                                        >
                                            Sign Out
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/signin" className="text-gray-300 hover:text-gray-200 px-4 py-2">
                                            Sign In
                                        </Link>
                                       <button
                                            className="btn-sm text-white bg-blue-600 hover:bg-blue-700 ml-3"
                                            onClick={() => signIn('google')} // Use 'google' provider ID
                                        >
                                            Sign Up
                                        </button>
                                    </>
                                )}
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </header>
    );
}

export default Header;