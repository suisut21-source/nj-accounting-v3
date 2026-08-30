'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(false); // สลับระหว่าง เข้าสู่ระบบ / ลงทะเบียน
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('business'); // 'business' หรือ 'personal'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // จำลองการล็อกอินหรือสมัครสมาชิกสำเร็จ แล้วพาไปหน้าหลัก Dashboard
    console.log({ email, password, userType });
    router.push('/'); 
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        
        {/* โลโก้และน้องหมาโกเด้น NJ */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-50 rounded-full mb-3 shadow-inner border border-amber-100">
            <span className="text-3xl">🐕</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">NJ Accounting</h1>
          <p className="text-xs font-medium text-amber-700 bg-amber-50 py-1 px-3 rounded-full inline-block mt-2 border border-amber-200/60">
            ให้ NJ เป็นส่วนหนึ่งในการทำบัญชีของพี่นะครับ 🐾
          </p>
        </div>

        {/* ฟอร์ม */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">อีเมล หรือ เบอร์โทรศัพท์</label>
            <input 
              type="text" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com" 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">รหัสผ่าน</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* ถ้าเป็นการสมัครสมาชิก ให้เลือกประเภทผู้ใช้งาน */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">เลือกประเภทการใช้งานของคุณ</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUserType('business')}
                  className={`p-3 text-left rounded-xl border transition-all ${
                    userType === 'business' 
                      ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 font-medium' 
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-lg mb-1">🏪</div>
                  <div className="text-sm font-semibold">เจ้าของกิจการ</div>
                  <div className="text-xs text-slate-500 mt-0.5">ร้านค้า / ขายของออนไลน์</div>
                </button>

                <button
                  type="button"
                  onClick={() => setUserType('personal')}
                  className={`p-3 text-left rounded-xl border transition-all ${
                    userType === 'personal' 
                      ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 font-medium' 
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-lg mb-1">👔</div>
                  <div className="text-sm font-semibold">บุคคลธรรมดา</div>
                  <div className="text-xs text-slate-500 mt-0.5">เงินเดือน / ฟรีแลนซ์</div>
                </button>
              </div>
            </div>
          )}

          {/* ปุ่มกดส่งฟอร์ม */}
          <button 
            type="submit"
            className="w-full py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 mt-2"
          >
            {isLogin ? 'เข้าสู่ระบบ' : 'ลงทะเบียนใช้งาน'}
          </button>

        </form>

        {/* สลับโหมด เข้าสู่ระบบ / สมัครสมาชิก */}
        <div className="text-center mt-6">
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-emerald-600 hover:underline font-medium"
          >
            {isLogin ? 'ยังไม่มีบัญชี? สมัครสมาชิกที่นี่' : 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ'}
          </button>
        </div>

      </div>
    </div>
  );
}