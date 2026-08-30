'use client';

import { useState } from 'react';
import { 
  FiDollarSign, FiCalendar, FiTag, FiFileText, 
  FiCheckCircle, FiArrowLeft, FiTrendingUp, FiCreditCard, FiSmartphone, FiShield
} from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function IncomePage() {
  const router = useRouter();
  const [category, setCategory] = useState('ขายหน้าร้าน (เงินสด/โอน)');
  
  // สำหรับหน้าร้าน (แยกเงินสด / เงินโอนทันที)
  const [cashAmount, setCashAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  // สำหรับเดลิเวอรี
  const [deliveryGross, setDeliveryGross] = useState('');
  const [gpAmount, setGpAmount] = useState('');
  const [adsAmount, setAdsAmount] = useState('');
  const [loanDeduction, setLoanDeduction] = useState('');

  // สำหรับโครงการไทยช่วยไทย (ยอดขายเต็ม)
  const [thaiHelpGross, setThaiHelpGross] = useState('');

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [success, setSuccess] = useState(false);

  // คำนวณยอด
  const cash = parseFloat(cashAmount) || 0;
  const transfer = parseFloat(transferAmount) || 0;
  const delivery = parseFloat(deliveryGross) || 0;
  const gp = parseFloat(gpAmount) || 0;
  const ads = parseFloat(adsAmount) || 0;
  const loan = parseFloat(loanDeduction) || 0;
  const thaiGross = parseFloat(thaiHelpGross) || 0;

  const isStoreFront = category === 'ขายหน้าร้าน (เงินสด/โอน)';
  const isThaiHelp = category === 'โครงการไทยช่วยไทย';

  // ยอดเงินเข้าบัญชีตามประเภท
  const instantDeposit = transfer; 
  const nextDayDeliveryDeposit = Math.max(0, delivery - gp - ads - loan);

  const totalStoreSales = isStoreFront ? (cash + transfer) : isThaiHelp ? thaiGross : delivery;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalAmount = isStoreFront ? (cash + transfer) : isThaiHelp ? thaiGross : nextDayDeliveryDeposit;

    const newRecord = {
      id: Date.now(),
      date,
      channel: category,
      category,
      cash,
      transfer: isStoreFront ? transfer : 0,
      grossSales: totalStoreSales,
      amount: finalAmount,
      gpDeduction: isStoreFront ? 0 : gp,
      adDeduction: isStoreFront ? 0 : ads,
      debtDeduction: isStoreFront ? 0 : loan,
      netTransfer: isStoreFront ? transfer : nextDayDeliveryDeposit,
      note
    };

    try {
      const existingData = JSON.parse(localStorage.getItem('incomeTransactions') || '[]');
      const updatedData = [newRecord, ...existingData];
      localStorage.setItem('incomeTransactions', JSON.stringify(updatedData));
    } catch (error) {
      console.error('Failed to save to localStorage', error);
    }

    setSuccess(true);
    
    setTimeout(() => {
      router.push('/reports');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-md border border-slate-300 p-6 sm:p-8 space-y-6">
        
        {/* ส่วนหัว */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-10 h-10 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-800 flex items-center justify-center transition font-bold shadow-sm">
              <FiArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-emerald-200 text-emerald-900 flex items-center justify-center font-bold">
                  <FiDollarSign size={18} />
                </span>
                บันทึกปิดยอดขายประจำวัน 💰
              </h1>
              <p className="text-xs text-slate-600 font-medium mt-0.5">สู้ๆ นะครับพี่! วันนี้เป้าหมายอยู่แค่เอื้อมแล้ว ✨🐕</p>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-200 flex items-center justify-center text-2xl shadow-sm shrink-0 border border-amber-300 animate-bounce">
            🐕
          </div>
        </div>

        {success && (
          <div className="p-4 bg-emerald-100 border-2 border-emerald-400 text-emerald-900 rounded-2xl flex items-center gap-3 shadow-sm animate-pulse">
            <FiCheckCircle size={24} className="text-emerald-700 shrink-0" />
            <div>
              <p className="font-extrabold text-xs">เย้! บันทึกยอดขายสำเร็จเรียบร้อยแล้วครับพี่! 🎉</p>
              <p className="text-[11px] text-emerald-800 mt-0.5 font-medium">น้อง NJ กำลังพาท่านไปหน้ารายงานสรุปผลครับ 🚀...</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* เลือกประเภทการขาย */}
          <div>
            <label className="block text-xs font-black text-slate-900 mb-2 flex items-center gap-1.5">
              <FiTag size={15} className="text-amber-700" /> เลือกช่องทางการขายหรือโครงการวันนี้กันครับ 🏷️
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { name: 'ขายหน้าร้าน (เงินสด/โอน)', }, 
                { name: 'GrabFood',  }, 
                { name: 'LINE MAN',  }, 
                { name: 'ShopeeFood',  },
                { name: 'โครงการไทยช่วยไทย',  }
              ].map((item, idx) => (
                <button
                  type="button"
                  key={item.name}
                  onClick={() => setCategory(item.name)}
                  className={`py-3 px-3 rounded-2xl border-2 text-xs font-black transition-all text-center shadow-sm flex items-center justify-center gap-1.5 ${
                    category === item.name
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-md shadow-emerald-600/30 ring-2 ring-emerald-300 scale-[1.02]'
                      : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                  } ${idx === 4 ? 'col-span-2 sm:col-span-1' : ''}`}
                >
                  <span>{item.emoji}</span>
                  <span className="truncate">{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 1. ฟอร์มกรณีขายหน้าร้าน */}
          {isStoreFront ? (
            <div className="p-4 sm:p-5 bg-slate-100 border-2 border-slate-300 rounded-2xl space-y-4">
              <div className="font-black text-slate-900 text-xs flex items-center gap-2">
                <FiCreditCard className="text-emerald-700" size={16} /> แยกยอดเงินสดในเก๊ะ กับเงินโอนเข้าบัญชีกันครับ 💵💳
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-800 mb-1">ยอดเงินสด (เก็บเข้าเก๊ะร้าน) 🗄️</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 text-xs font-black">฿</span>
                    <input
                      type="number"
                      step="0.01"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-3.5 py-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs font-black text-slate-900 shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-800 mb-1">ยอดเงินโอน / QR (เข้าบัญชีทันที) 📱</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 text-xs font-black">฿</span>
                    <input
                      type="number"
                      step="0.01"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-3.5 py-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs font-black text-slate-900 shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : isThaiHelp ? (
            /* 2. ฟอร์มกรณีโครงการไทยช่วยไทย */
            <div className="p-4 sm:p-5 bg-indigo-100 border-2 border-indigo-300 rounded-2xl space-y-3">
              <div className="font-black text-indigo-950 text-xs flex items-center gap-2">
                <FiShield className="text-indigo-700" size={16} /> โครงการไทยช่วยไทย (ยอดขายรวม) 🇹🇭✨
              </div>
              <div>
                <label className="block text-[11px] font-black text-indigo-950 mb-1">ยอดขายรวมโครงการ (บาท) *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-indigo-600 font-black text-xs">฿</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={thaiHelpGross}
                    onChange={(e) => setThaiHelpGross(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-9 pr-4 py-3 bg-white border-2 border-indigo-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none text-sm font-black text-slate-900 shadow-sm"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* 3. ฟอร์มกรณีเดลิเวอรีปกติ */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-900 mb-2 flex items-center gap-1.5">
                  <FiSmartphone size={15} className="text-amber-700" /> ยอดขายรวมบนแอป {category} (Gross Sales) 🛵💨 *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 font-black text-xs">฿</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={deliveryGross}
                    onChange={(e) => setDeliveryGross(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-9 pr-4 py-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm font-black text-slate-900 shadow-sm"
                  />
                </div>
              </div>

              <div className="p-4 bg-amber-100 border-2 border-amber-300 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-amber-950 font-black text-xs">
                  ⚡ รายการหัก / ค่าบริการ / หักหนี้ (ถ้ามี) แจ้งได้เลยครับพี่
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-black text-slate-800 mb-1">หัก GP 📉</label>
                    <input
                      type="number"
                      step="0.01"
                      value={gpAmount}
                      onChange={(e) => setGpAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 bg-white border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-600 outline-none text-xs font-black text-slate-900 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-800 mb-1">หัก ค่าโฆษณา 📢</label>
                    <input
                      type="number"
                      step="0.01"
                      value={adsAmount}
                      onChange={(e) => setAdsAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 bg-white border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-600 outline-none text-xs font-black text-slate-900 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-800 mb-1">หัก ผ่อนหนี้ 💳</label>
                    <input
                      type="number"
                      step="0.01"
                      value={loanDeduction}
                      onChange={(e) => setLoanDeduction(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 bg-white border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-600 outline-none text-xs font-black text-slate-900 shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* สรุปยอด */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 bg-blue-100 border-2 border-blue-300 rounded-2xl shadow-sm">
              <p className="text-[11px] font-black text-blue-950 flex items-center gap-1">
                <span>📈</span> ยอดขายรวมของวันนี้
              </p>
              <p className="text-base sm:text-lg font-black text-blue-950 mt-0.5">
                ฿{totalStoreSales.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="p-4 bg-emerald-100 border-2 border-emerald-300 rounded-2xl shadow-sm">
              <p className="text-[11px] font-black text-emerald-950 flex items-center gap-1">
                <FiTrendingUp size={13} /> 
                {isStoreFront ? 'เงินโอนเข้าบัญชีทันที 💸' : isThaiHelp ? 'สถานะโครงการ 🌟' : 'เงินเข้าบัญชี (พรุ่งนี้เช้า) 🏦'}
              </p>
              <p className="text-base sm:text-lg font-black text-emerald-950 mt-0.5">
                ฿{(isStoreFront ? instantDeposit : isThaiHelp ? thaiGross : nextDayDeliveryDeposit).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* วันที่ */}
          <div>
            <label className="block text-xs font-black text-slate-900 mb-2 flex items-center gap-1.5">
              <FiCalendar size={15} className="text-amber-700" /> วันที่ทำรายการ 📅
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-xs font-black text-slate-900 shadow-sm"
            />
          </div>

          {/* หมายเหตุ */}
          <div>
            <label className="block text-xs font-black text-slate-900 mb-2 flex items-center gap-1.5">
              <FiFileText size={15} className="text-amber-700" /> หมายเหตุ / ข้อความน่ารักๆ (ถ้ามี) 📝
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="เช่น วันนี้ลูกค้าหน้าร้านแน่นมาก, เหนื่อยแต่สู้ตาย! 💪..."
              className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-xs font-bold text-slate-900 shadow-sm resize-none"
            />
          </div>

          {/* ปุ่มบันทึก */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Link
              href="/"
              className="px-6 py-3 rounded-xl border-2 border-slate-300 text-slate-800 hover:bg-slate-200 font-black text-xs transition-colors shadow-sm flex items-center gap-1"
            >
              <span>❌</span> ยกเลิก
            </Link>
            <button
              type="submit"
              className="px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-lg shadow-amber-500/30 transition-all border-2 border-amber-600 flex items-center gap-1.5"
            >
              <span>🚀</span> บันทึกปิดยอดขายเลย!
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}