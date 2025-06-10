'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
    const { user, getSession } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const session = getSession();
        if (!session) {
            router.push('/login');
        }
    }, [getSession, router]);

    if (!user) {
        return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            {/* Header Section with Auri Welcome */}
            <div className="bg-gray-800 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
                    <div className="flex items-center space-x-6 mb-6 md:mb-0">
                        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                                Welcome to Auri
                            </h1>
                            <p className="text-gray-400">Your personal voice assistant</p>
                        </div>
                    </div>
                    <div className="bg-gray-700 rounded-xl p-4 shadow-lg">
                        <h3 className="text-lg font-semibold mb-3 text-center">Ready to talk?</h3>
                        <Link 
                            href="/dashboard/agent" 
                            className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                            Talk to Auri
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Dashboard Content */}
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Welcome back, <span className="text-purple-400">{user.username}</span>!
                    </h2>
                    <p className="text-gray-400">What would you like to do today?</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Quick Actions Card */}
                    <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all duration-300">
                        <div className="p-6">
                            <div className="flex items-center mb-6">
                                <div className="p-3 rounded-lg bg-purple-900/30 mr-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-white">Quick Actions</h3>
                            </div>
                            <div className="space-y-4">
                                <Link 
                                    href="/dashboard/agent" 
                                    className="block w-full px-6 py-3 text-center text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-[1.02] shadow-md"
                                >
                                    Start New Session
                                </Link>
                                <Link 
                                    href="/dashboard/profile" 
                                    className="block w-full px-6 py-3 text-center text-gray-200 bg-gray-700 rounded-lg font-medium hover:bg-gray-600 transition-all transform hover:scale-[1.02] shadow-md"
                                >
                                    View Profile
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Account Information Card */}
                    <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700 hover:border-blue-500 transition-all duration-300">
                        <div className="p-6">
                            <div className="flex items-center mb-6">
                                <div className="p-3 rounded-lg bg-blue-900/30 mr-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-white">Account Information</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-gray-700/50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-400 mb-1">Email</p>
                                    <p className="text-white font-medium">{user.email}</p>
                                </div>
                                {user.phone && (
                                    <div className="bg-gray-700/50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-400 mb-1">Phone</p>
                                        <p className="text-white font-medium">{user.phone}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}