import { Providers } from './providers';
import type { Metadata } from 'next';
import { useSession } from "next-auth/react";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import UserHeader from '@/components/UserHeader';

const inter = Inter({ subsets: ["latin"] });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'BalikBarang - Condition Intelligence',
  description: 'Forensically Verified Asset Return Intelligence',
};

function LayoutContent ({ children }: { children: React.ReactNode }) {
  const {data: session} = useSession();

  const userName = session?.user?.name || 'Inspector';
  const userImage = session?.user?.image || 'https://github.com/shadcn.png';
  const initials = userName.substring(0 , 2).toUpperCase();
  return (
    <div className = "flex items-center gap-4">
      <div className = "text-right hidden sm:block">
        <div className = "text-sm font-medium text-gray-900">{userName}</div>
        <div className = "text-xs text-gray-500">Lead Quality Assurance Inspectore</div>
      </div>
      <Avatar>
        <AvatarImage src={userImage} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
    </div>
  );
}
export default function RootLayout ({ children}: {children: React.ReactNode}){
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex-col">
        <Providers>
          <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-7x1 mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <div className="flex items-center gap-8">
                <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                  <div className="w-8 h-8 bg-[#7a1b2f] rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xl">B</span>
                  </div>
                    <div className="leading-tight hidden sm:block">
                    <div className="font-bold text-gray-900">BalikBarang</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Condition Intelligence</div>
                  </div>
                </Link>
                  <nav className="hidden md:flex items-center gap-6">
                  <Link href="/dashboard" className="h-16 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-900 flex items-center transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/riwayat" className="h-16 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-900 flex items-center transition-colors">
                    Riwayat
                  </Link>
                  <Link href="/subscription" className="h-16 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-900 flex items-center transition-colors">
                    Subscription
                  </Link>
                </nav>
              </div>

              <UserHeader  />
            </div>
          </header>
          <main className="flex-1 max-w-7x1 mx-auto w-full p-4 sm:p-6 lg:p-8">
            {children}
          </main>
           <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500">
              <p>© 2025 BalikBarang. Forensically Verified Asset Return Intelligence.</p>
              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                <span className="w-2 h-2 rounded-full bg-[#7a1b2f]"></span>
                Audit System Online
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
