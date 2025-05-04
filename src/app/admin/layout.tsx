
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin - RenewalRace',
  description: 'Yönetim paneli - Öğrenci kayıt yenileme takip sistemi',
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>; // Keep it simple, inherit from root layout styles
}
