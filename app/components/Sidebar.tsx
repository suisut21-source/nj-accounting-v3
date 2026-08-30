'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiHome, FiArrowDownLeft, FiArrowUpRight, FiRefreshCw, 
  FiTruck, FiFileText, FiPrinter, FiBarChart2, FiSettings 
} from 'react-icons/fi';

export default function Sidebar() {
  const pathname = usePathname();

  const menuSections = [
    {
      title: 'เมนูหลัก',
      items: [
        { name: 'หน้าหลัก', href: '/', icon: FiHome },
      ]
    },
    {
      title: 'บันทึกรายการ 📝',
      items: [
        { name: 'เงินเข้า', href: '/income', icon: FiArrowDownLeft },
        { name: 'เงินออก', href: '/expense', icon: FiArrowUpRight },
        { name: 'กระเป๋าเงิน / บัญชี', href: '/wallet', icon: FiRefreshCw },
      ]
    },
    {
      title: 'เดลิเวอรี 🛵',
      items: [
        { name: 'Grab', href: '/delivery/grab', icon: FiTruck },
        { name: 'LINE MAN', href: '/delivery/lineman', icon: FiTruck },
        { name: 'ShopeeFood', href: '/delivery/shopeefood', icon: FiTruck },
      ]
    },
    {
      title: 'ภาษี & เอกสาร 🗂️',
      items: [
        { name: 'ภาษีเงินได้ & VAT', href: '/tax', icon: FiFileText },
        { name: 'ใบเสร็จ / ใบกำกับภาษี', href: '/invoices', icon: FiPrinter },
        { name: 'รายงานสรุปการเงิน', href: '/reports', icon: FiBarChart2 },
        { name: 'ตั้งค่าร้านค้า', href: '/settings', icon: FiSettings },
      ]
    }
  ];

  return (
    <aside 
      className="w-64 min-h-screen p-4 flex flex-col justify-between shadow-md border-r"
      style={{ backgroundColor: '#ADD8E6', borderColor: '#93C5FD' }}
    >
      <div className="space-y-6">
        
        {/* โลโก้และชื่อร้าน */}
        <div className="flex items-center gap-3 p-3 bg-white/90 backdrop-blur-sm rounded-2xl border-2 shadow-sm" style={{ borderColor: '#CC5500' }}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-inner text-white" style={{ backgroundColor: '#CC5500' }}>
            🐕
          </div>
          <div>
            <h2 className="text-sm font-black leading-tight" style={{ color: '#CC5500' }}>NJ Accounting</h2>
            <p className="text-[11px] font-bold text-slate-700">ระบบบัญชีร้านค้า 🧀</p>
          </div>
        </div>

        {/* รายการเมนูแยกตามหมวดหมู่ */}
        <div className="space-y-5">
          {menuSections.map((section, idx) => (
            <div key={idx} className="space-y-1.5">
              <p className="text-[11px] font-black px-3 uppercase tracking-wider" style={{ color: '#1E3A8A' }}>
                {section.title}
              </p>
              <div className="space-y-1.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-all border-2 shadow-2xs ${
                        isActive
                          ? 'text-white shadow-md scale-[1.02]'
                          : 'bg-white/90 text-slate-700 hover:bg-white hover:shadow-sm'
                      }`}
                      style={{
                        backgroundColor: isActive ? '#CC5500' : undefined,
                        borderColor: isActive ? '#A34400' : 'rgba(255, 255, 255, 0.6)'
                      }}
                    >
                      <span 
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-sm border shadow-inner"
                        style={{
                          backgroundColor: isActive ? '#A34400' : '#E0F2FE',
                          color: isActive ? '#FFFFFF' : '#CC5500',
                          borderColor: isActive ? '#8A3900' : '#BAE6FD'
                        }}
                      >
                        <Icon size={15} />
                      </span>
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Footer เล็กๆ ด้านล่าง */}
      <div className="pt-4 border-t text-center" style={{ borderColor: 'rgba(255, 255, 255, 0.5)' }}>
        <p className="text-[10px] font-bold" style={{ color: '#1E3A8A' }}>NJ Shop v1.0 • สู้ๆ ครับพี่! 💪✨</p>
      </div>
    </aside>
  );
}