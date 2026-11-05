import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'سَنَد | منصة دعم واحتياجات العائلات في سوريا',
  description: 'منصة متكاملة تتيح للمغتربين السوريين شراء وتأمين الاحتياجات الأساسية (سلل غذائية، أدوية، مياه، وتدفئة) لعائلاتهم داخل سوريا بدفع آمن وتوصيل ميداني موثق.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans antialiased selection:bg-emerald-500 selection:text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
