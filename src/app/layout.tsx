import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Changed font to Inter
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' }); // Define Inter font

export const metadata: Metadata = {
  title: 'RenewalRace - Vildan Koleji', // Updated title
  description: 'Öğrenci kayıt yenileme takip ve yarışma sistemi', // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}> {/* Use Inter font */}
        {children}
        <Toaster /> {/* Add Toaster component here */}
      </body>
    </html>
  );
}
