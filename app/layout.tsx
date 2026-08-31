import './globals.css';
import Sidebar from './components/Sidebar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>
        <div className="flex flex-row min-h-screen bg-[#F8FAFC] font-sans text-slate-800 overflow-x-hidden">
  <div className="w-64 flex-shrink-0">
    <Sidebar />
  </div>
  <main className="flex-1 p-4 md:p-6 overflow-y-auto">
    {children}
  </main>
</div>
      </body>
    </html>
  );
}