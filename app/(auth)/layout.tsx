import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-grow flex items-center justify-center bg-muted/20">
        {children}
      </main>
      <Footer />
    </>
  );
}