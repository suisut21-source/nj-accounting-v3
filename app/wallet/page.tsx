'use client';

import { useState, useEffect } from 'react';
import { Wallet, ArrowRightLeft, ArrowUpRight, ArrowDownLeft, Building2, Banknote } from 'lucide-react';
import Link from 'next/link';

export default function WalletPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [balances, setBalances] = useState({
    kasikorn: 0,
    scb: 0,
    cash: 0
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // 1. ดึงข้อมูลจาก localStorage ทั้งหมด
    const income = JSON.parse(localStorage.getItem('incomeTransactions') || '[]');
    const expense = JSON.parse(localStorage.getItem('expenseTransactions') || '[]');
    const transfers = JSON.parse(localStorage.getItem('transferTransactions') || '[]');

    let kasikornTotal = 0;
    let scbTotal = 0;
    let cashTotal = 0;

    // 2. ประมวลผลเงินเข้า (Income)
    const formattedIncome = income.map((item: any) => {
      const cashInDrawer = Number(item.cashInDrawer || 0);
      const bankTransfer = Number(item.bankTransfer || 0);
      
      // ถ้าระบุแยกช่องทางมา
      if (cashInDrawer > 0 || bankTransfer > 0) {
        cashTotal += cashInDrawer;
        if (item.bankAccount === 'ไทยพาณิชย์' || item.channel?.includes('ไทยพาณิชย์')) {
          scbTotal += bankTransfer;
        } else {
          kasikornTotal += bankTransfer; // ค่าเริ่มต้นเข้าบัญชีหลัก กสิกรไทย
        }
      } else {
        // กรณีบันทึกแบบยอดรวม (เช่น ขายหน้าร้านทั่วไป) ให้ลงบัญชีหลักหรือเงินสดตามช่องทาง
        const totalAmount = Number(item.amount || 0);
        if (item.channel?.includes('เงินสด') || item.paymentMethod === 'เงินสด') {
          cashTotal += totalAmount;
        } else if (item.channel?.includes('ไทยพาณิชย์') || item.bankAccount === 'ไทยพาณิชย์') {
          scbTotal += totalAmount;
        } else {
          kasikornTotal += totalAmount; // ค่าเริ่มต้นเข้ากสิกรไทย
        }
      }

      const totalDisplay = cashInDrawer + bankTransfer || Number(item.amount || 0);

      return {
        ...item,
        type: 'income',
        typeName: 'เงินเข้า',
        displayAmount: totalDisplay,
        channel: item.channel || 'ขายหน้าร้าน'
      };
    });

    // 3. ประมวลผลเงินออก (Expense)
    const formattedExpense = expense.map((item: any) => {
      const amt = Number(item.amount || 0);
      if (item.paymentMethod === 'เงินสด' || item.channel?.includes('เงินสด')) {
        cashTotal -= amt;
      } else if (item.paymentMethod === 'ไทยพาณิชย์' || item.channel?.includes('ไทยพาณิชย์')) {
        scbTotal -= amt;
      } else {
        kasikornTotal -= amt; // หักจากบัญชีหลักเป็นค่าเริ่มต้น
      }

      return {
        ...item,
        type: 'expense',
        typeName: 'เงินออก',
        displayAmount: -amt,
        channel: item.paymentMethod || item.vendor || item.category || 'ค่าใช้จ่ายทั่วไป'
      };
    });

    // 4. ประมวลผลการโยกย้ายเงิน (Transfers)
    const formattedTransfers = transfers.map((item: any) => {
      const amt = Number(item.amount || 0);
      if (item.fromAccount === 'เงินสดหน้าร้าน') cashTotal -= amt;
      if (item.fromAccount === 'บัญชีหลัก (กสิกรไทย)') kasikornTotal -= amt;
      if (item.fromAccount === 'บัญชีสำรอง (ไทยพาณิชย์)') scbTotal -= amt;

      if (item.toAccount === 'เงินสดหน้าร้าน') cashTotal += amt;
      if (item.toAccount === 'บัญชีหลัก (กสิกรไทย)') kasikornTotal += amt;
      if (item.toAccount === 'บัญชีสำรอง (ไทยพาณิชย์)') scbTotal += amt;

      return {
        ...item,
        type: 'transfer',
        typeName: 'โยกย้ายเงิน',
        displayAmount: amt,
        channel: `${item.fromAccount} ➔ ${item.toAccount}`
      };
    });

    setBalances({
      kasikorn: kasikornTotal,
      scb: scbTotal,
      cash: cashTotal
    });

    const all = [...formattedIncome, ...formattedExpense, ...formattedTransfers].sort(
      (a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime()
    );

    setTransactions(all);
  }, []);

  const filteredTransactions = transactions.filter(tx => 
    tx.channel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.typeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.note?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto font-sans p-4 sm:p-6">
      
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-[2.5rem] border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-xl shadow-sm">
            💰
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-800 tracking-tight">กระเป๋าเงิน / บัญชีธนาคาร</h1>
              <span className="text-xs">🐕</span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">ยอดเงินอัปเดตตามรายการบันทึกจริงแบบ Real-time</p>
          </div>
        </div>

        {/* CTA Button */}
        <Link 
          href="/wallet/transfer"
          className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-2xl shadow-md transition flex items-center gap-2"
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>+ โยกย้ายเงินระหว่างบัญชี</span>
        </Link>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: Kasikorn Bank */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200/80 shadow-sm space-y-4 relative overflow-hidden hover:border-blue-300 transition">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <Building2 className="w-6 h-6" />
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[11px] font-bold">
              ใช้งานปกติ
            </span>
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">ออมทรัพย์ • xxx-x-xx123-x</p>
            <h2 className="text-base font-black text-slate-800 mt-0.5">บัญชีหลัก (กสิกรไทย)</h2>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
            <span className="text-xs text-slate-400 font-bold">ยอดเงินคงเหลือ</span>
            <span className="text-xl font-black text-emerald-600">
              {balances.kasikorn.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} <span className="text-xs text-slate-500 font-bold">บาท</span>
            </span>
          </div>
        </div>

        {/* Card 2: SCB */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200/80 shadow-sm space-y-4 relative overflow-hidden hover:border-blue-300 transition">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <Building2 className="w-6 h-6" />
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[11px] font-bold">
              ใช้งานปกติ
            </span>
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">ออมทรัพย์ • xxx-x-xx456-x</p>
            <h2 className="text-base font-black text-slate-800 mt-0.5">บัญชีสำรอง (ไทยพาณิชย์)</h2>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
            <span className="text-xs text-slate-400 font-bold">ยอดเงินคงเหลือ</span>
            <span className="text-xl font-black text-emerald-600">
              {balances.scb.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} <span className="text-xs text-slate-500 font-bold">บาท</span>
            </span>
          </div>
        </div>

        {/* Card 3: Cash Box */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200/80 shadow-sm space-y-4 relative overflow-hidden hover:border-emerald-300 transition">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <Banknote className="w-6 h-6" />
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[11px] font-bold">
              พร้อมใช้
            </span>
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">เงินสด • Cash Box</p>
            <h2 className="text-base font-black text-slate-800 mt-0.5">เงินสดหน้าร้าน</h2>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
            <span className="text-xs text-slate-400 font-bold">ยอดเงินคงเหลือ</span>
            <span className="text-xl font-black text-emerald-600">
              {balances.cash.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} <span className="text-xs text-slate-500 font-bold">บาท</span>
            </span>
          </div>
        </div>

      </div>

      {/* Transactions History Table Section */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200/80 shadow-sm p-6 space-y-5">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-black text-slate-800">ประวัติการเคลื่อนไหวเงินสดรวม (เงินเข้า - ออก - โยกย้าย)</h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">ตรวจสอบรายการเงินเข้าและออกจากทุกช่องทางได้ที่นี่</p>
          </div>

          <div className="w-full sm:w-72">
            <input 
              type="text"
              placeholder="🔍 ค้นหารายการ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-amber-400 transition"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">วันที่ / เวลา</th>
                <th className="py-3 px-4">รายการ</th>
                <th className="py-3 px-4">ประเภท</th>
                <th className="py-3 px-4">ช่องทาง / บัญชี</th>
                <th className="py-3 px-4 text-right">จำนวนเงิน (บาท)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 text-slate-400 font-normal">{tx.date || tx.createdAt?.split('T')[0]}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {tx.note || tx.typeName} {tx.vendor && `(${tx.vendor})`}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        tx.type === 'income' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' :
                        tx.type === 'expense' ? 'bg-rose-50 text-rose-700 border border-rose-200/60' :
                        'bg-blue-50 text-blue-700 border border-blue-200/60'
                      }`}>
                        {tx.type === 'income' && <ArrowDownLeft className="w-3 h-3 text-emerald-600" />}
                        {tx.type === 'expense' && <ArrowUpRight className="w-3 h-3 text-rose-600" />}
                        {tx.type === 'transfer' && <ArrowRightLeft className="w-3 h-3 text-blue-600" />}
                        {tx.typeName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{tx.channel}</td>
                    <td className={`py-3.5 px-4 text-right font-black text-sm ${
                      tx.displayAmount > 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {isNaN(tx.displayAmount) ? '฿0.00' : (tx.displayAmount > 0 ? `+${tx.displayAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}` : tx.displayAmount.toLocaleString(undefined, {minimumFractionDigits: 2}))}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400 font-normal">
                    ยังไม่มีประวัติรายการในระบบครับพี่ 🐾
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}