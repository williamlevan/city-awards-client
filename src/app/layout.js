import '@/styles/globals.scss';
import { Providers } from './providers';  // The combined provider

export const metadata = {
  title: 'City Awards',
  description: 'A Next.js 13 app',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* 
          Nest everything inside the combined Providers 
          so NextAuth & your custom context are available 
        */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
