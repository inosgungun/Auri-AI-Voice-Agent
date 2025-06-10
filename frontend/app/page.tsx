import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#121212] text-white relative overflow-hidden">
      {/* Background Glow Animation */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-20">
        <div className="w-[600px] h-[600px] rounded-full bg-purple-500 blur-3xl animate-pulse" />
      </div>

      <div className="max-w-3xl text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Welcome to Auri
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-10">
          Your personal AI voice assistant for seamless conversations and productivity.
        </p>
        
        <div className="flex gap-6 justify-center flex-wrap">
          <Link href="/signup">
            <Button
              size="lg"
              className="px-8 py-4 text-lg bg-purple-600 hover:bg-purple-500 transition-transform transform hover:scale-105"
            >
              Get Started
            </Button>
          </Link>
          <Link href="/login">
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg border-white text-white hover:bg-white hover:text-black transition-transform transform hover:scale-105"
            >
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
