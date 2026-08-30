'use client';

import { useState, useEffect } from 'react';
import { Camera, Calendar, ArrowLeft, Check, X, FileText, AlertCircle, Upload } from 'lucide-react';
import Link from 'next/link';

export default function ExpensePage() {
  const [formData, setFormData] = useState({
    category: 'ค่าวัตถุดิบ / ของสด',
    paymentMethod: 'เงินสด',
    amount: '',
    vendor: '',
    date: new Date().toISOString().split('T')[0],
    note: '',
    receiptImage: null as string | null
  });

  const [expenses, setExpenses] = useState<any[]>([]);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('expenseTransactions') || '[]');
    setExpenses(saved);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, receiptImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      alert('กรุณากรอกจำนวนเงินให้ถูกต้องครับพี่');
      return;
    }

    const newExpense = {
      ...formData,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };

    const updated = [newExpense, ...expenses];
    setExpenses(updated);
    localStorage.setItem('expenseTransactions', JSON.stringify(updated));

    setSuccessMessage('บันทึกรายจ่ายสำเร็จเรียบร้อยแล้วครับพี่! 🐾');
    setTimeout(() => setSuccessMessage(''), 3000);

    setFormData({
      category: 'ค่าวัตถุดิบ / ของสด',
      paymentMethod: 'เงินสด',
      amount: '',
      vendor: '',
      date: new Date().toISOString().split('T')[0],
      note: '',
      receiptImage: null
    });
  };

  const categories = [
    'ค่าวัตถุดิบ / ของสด',
    'ค่าบรรจุภัณฑ์ / กล่อง',
    'ค่าน้ำ / ค่าไฟ / ค่าเช่า',
    'ค่าจ้างพนักงาน',
    'อุปกรณ์ / เครื่องมือ',
    'อื่นๆ'
  ];

  const paymentMethods = ['เงินสด', 'โอนผ่านบัญชี'];

  return (
    <div className="pb-20 max-w-3xl mx-auto font-sans p-4 sm:p-6">
      
      {/* กรอบการ์ดใหญ่รวมทั้งหมด (Main Container Card) */}
      <div className="bg-white rounded-[2.55rem] p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-7 relative overflow-hidden">
        
        {/* Success Overlay */}
        {successMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-lg z-50 animate-in slide-in-from-top-4">
            <Check className="w-5 h-5" />
            <span className="text-sm font-bold">{successMessage}</span>
          </div>
        )}

        {/* Header Section */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="w-11 h-11 shrink-0 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center transition border border-slate-200 shadow-sm">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-lg font-black text-slate-800 flex items-center gap-2 tracking-tight">
                💸 บันทึกรายจ่าย (เงินออก) 🐕
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-1">
                จดไว้จะได้ไม่ลืม หักลดหย่อนภาษีร้านได้ชัวร์! สู้ๆ นะครับพี่ 🐾
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex px-3 py-1 bg-rose-50 border border-rose-200 text-rose-600 rounded-full text-xs font-bold">
            รายจ่าย / ภาษี 🧾
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Categories (Pill Buttons) */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-800">
              🏷️ เลือกหมวดหมู่รายจ่าย 💸
            </label>
            <div className="flex flex-wrap gap-2.5">
              {categories.map((cat) => {
                const isSelected = formData.category === cat;
                return (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setFormData({ ...formData, category: cat })}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition border ${
                      isSelected 
                        ? 'bg-rose-500 text-white border-rose-600 shadow-sm' 
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-rose-50 hover:border-rose-200'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input Box Area (กล่องเทา) */}
          <div className="bg-slate-50 border border-slate-200/80 p-5 sm:p-6 rounded-2xl space-y-4">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-800">
              💳 รายละเอียดการจ่ายเงิน 💵
            </label>

            {/* Payment Method Toggle */}
            <div className="flex gap-2">
              {paymentMethods.map((method) => {
                const isSelected = formData.paymentMethod === method;
                return (
                  <button
                    type="button"
                    key={method}
                    onClick={() => setFormData({ ...formData, paymentMethod: method })}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition border ${
                      isSelected
                        ? 'bg-rose-100 text-rose-900 border-rose-300 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {method}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Amount */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500">ยอดเงินที่จ่าย 💸</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-400 font-bold text-sm">฿</span>
                  <input 
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition"
                  />
                </div>
              </div>

              {/* Vendor */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500">ชื่อร้านค้า / ผู้ขาย 🏪</label>
                <input 
                  type="text"
                  placeholder="เช่น แม็คโคร, ตลาดสด..."
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition"
                />
              </div>
            </div>
          </div>

          {/* Summary Card (กล่องสรุปยอดสีชมพูพาสเทล) */}
          <div className="bg-rose-50 border border-rose-200/70 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-bold text-rose-800/80 mb-1">🧾 ยอดรายจ่ายที่จะบันทึก</p>
              <p className="text-2xl font-black text-rose-600">
                ฿{formData.amount ? Number(formData.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'}
              </p>
            </div>
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-rose-100 flex items-center justify-center text-rose-500">
              <Upload className="w-5 h-5" />
            </div>
          </div>

          {/* Receipt Image Upload */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-800">
              📸 แนบรูปใบเสร็จ / บิล 🧾
            </label>
            <div className="border-2 border-dashed border-slate-200 hover:border-rose-400 bg-slate-50/50 rounded-2xl p-6 text-center transition cursor-pointer relative">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              {formData.receiptImage ? (
                <div className="space-y-3">
                  <img src={formData.receiptImage} alt="Receipt Preview" className="max-h-40 mx-auto rounded-xl shadow-sm border border-slate-200 object-contain" />
                  <p className="text-xs font-bold text-rose-600">แตะเพื่อเปลี่ยนรูปภาพใหม่ 🔄</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                    <Camera className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-600">อัปโหลดรูปบิล หรือถ่ายรูปเก็บไว้</p>
                  <p className="text-[10px] text-slate-400">หลักฐานสำคัญสำหรับหักลดหย่อนภาษี</p>
                </div>
              )}
            </div>
          </div>

          {/* Date & Note Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-800">
                📅 วันที่ทำรายการ 🗓️
              </label>
              <input 
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-800">
                📝 หมายเหตุ (ถ้ามี) 📝
              </label>
              <input 
                type="text"
                placeholder="โน้ตกันลืม..."
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button 
              type="button"
              onClick={() => window.history.back()}
              className="flex-1 py-3.5 bg-white border-2 border-rose-100 text-rose-500 rounded-xl font-bold text-sm hover:bg-rose-50 transition flex justify-center items-center gap-2 shadow-sm"
            >
              ❌ ยกเลิก
            </button>
            <button 
              type="submit"
              className="flex-[2] py-3.5 bg-rose-500 text-white rounded-xl font-bold text-sm hover:bg-rose-600 transition shadow-sm flex justify-center items-center gap-2"
            >
              🚀 บันทึกรายจ่ายเลย! 🐕
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}