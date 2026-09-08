'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(false); // สลับระหว่าง เข้าสู่ระบบ / ลงทะเบียน
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState(''); // เก็บชื่อร้านค้า
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const trialStartDate = new Date();
    const trialEndDate = new Date();
    trialEndDate.setDate(trialStartDate.getDate() + 30); // ทดลองใช้ฟรี 30 วัน

    if (!isLogin) {
      // โหมดสมัครสมาชิก: บันทึกข้อมูลร้านลง Supabase
      supabase
        .from('shops')
        .insert([
          {
            shop_name: shopName || 'ร้านค้าใหม่',
            email: email,
            plan: 'TRIAL',
            trial_start_date: trialStartDate.toISOString(),
            trial_end_date: trialEndDate.toISOString(),
          }
        ])
        .then(({ error }) => {
          if (error) {
            console.error('Error saving shop to Supabase:', error.message);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + error.message);
            setLoading(false);
          } else {
            // บันทึกสถานะลง localStorage ฝั่ง Client
            const authData = {
              email: email,
              shopName: shopName || 'ร้านค้าใหม่',
              plan: 'TRIAL',
              trialStartDate: trialStartDate.toISOString(),
              trialEndDate: trialEndDate.toISOString(),
              isLoggedIn: true
            };
            localStorage.setItem('nj_auth_user', JSON.stringify(authData));
            setLoading(false);
            router.push('/');
          }
        });
    } else {
      // โหมดเข้าสู่ระบบ
      const authData = {
        email: email,
        shopName: shopName || 'ร้านค้าของพี่',
        plan: 'TRIAL',
        trialStartDate: trialStartDate.toISOString(),
        trialEndDate: trialEndDate.toISOString(),
        isLoggedIn: true
      };
      localStorage.setItem('nj_auth_user', JSON.stringify(authData));
      setLoading(false);
      router.push('/');
    }
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
          
          {/* ถ้าเป็นการสมัครสมาชิก ให้กรอกชื่อร้านค้า */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อร้านค้า</label>
              <input 
                type="text" 
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="เช่น ร้านข้าวพันผัก" 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">อีเมล หรือ เบอร์โทรศัพท์</label>
            <input 
              type="text" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com" 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800"
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
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800"
            />
          </div>

          {/* ปุ่มกดส่งฟอร์ม */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 mt-2 disabled:opacity-50"
          >
            {loading ? 'กำลังบันทึกข้อมูล...' : (isLogin ? 'เข้าสู่ระบบ' : '🚀 เริ่มต้นทดลองใช้ฟรี 1 เดือน')}
          </button>

        </form>

        {/* สลับโหมด เข้าสู่ระบบ / สมัครสมาชิก */}
        <div className="text-center mt-6">
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-emerald-600 hover:underline font-medium"
          >
            {isLogin ? 'ยังไม่มีบัญชีร้านค้า? ลงทะเบียนทดลองใช้ฟรี 1 เดือน' : 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ'}
          </button>
        </div>

      </div>
    </div>
  );
}