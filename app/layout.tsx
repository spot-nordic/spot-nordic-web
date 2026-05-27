import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'Spot Nordic',
  description: 'Premium E-Commerce and Documentation Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Added suppressHydrationWarning to the body tag to ignore browser extension injections */}
      <body suppressHydrationWarning className="antialiased min-h-screen bg-background text-foreground flex flex-col">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}