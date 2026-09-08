'use client';

import { useState, useEffect } from 'react';

export default function InvoicePage() {
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerTaxId, setCustomerTaxId] = useState('');
  const [items, setItems] = useState([{ name: 'ข้าวพันผักสูตรดั้งเดิม', qty: 1, price: 45 }]);
  const [invoiceList, setInvoiceList] = useState<any[]>([]);

  useEffect(() => {
    const savedInvoices = JSON.parse(localStorage.getItem('invoiceList') || '[]');
    setInvoiceList(savedInvoices);
  }, []);

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItemRow = () => {
    setItems([...items, { name: '', qty: 1, price: 0 }]);
  };

  const removeItemRow = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (Number(item.qty) || 0) * (Number(item.price) || 0), 0);
  };

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName) {
      alert('กรุณากรอกชื่อลูกค้า');
      return;
    }

    const totalAmount = calculateTotal();
    const currentDate = new Date().toISOString().slice(0, 10);
    const timestampId = Date.now();
    const invoiceId = 'INV-' + timestampId.toString().slice(-6);

    const newInvoice = {
      id: invoiceId,
      timestampId: timestampId,
      date: currentDate,
      customerName,
      customerAddress,
      customerTaxId,
      items,
      total: totalAmount
    };

    // 1. บันทึกประวัติใบเสร็จ
    const updatedList = [newInvoice, ...invoiceList];
    setInvoiceList(updatedList);
    localStorage.setItem('invoiceList', JSON.stringify(updatedList));

    // 2. บันทึกรายรับพร้อมผูก timestampId เดียวกัน
    const existingIncomes = JSON.parse(localStorage.getItem('incomeTransactions') || '[]');
    const newIncomeRecord = {
      id: timestampId,
      date: currentDate,
      channel: 'หน้าร้าน / ทั่วไป',
      category: 'ขายสินค้า/อาหาร (ใบเสร็จ ' + invoiceId + ')',
      gross: totalAmount,
      deduct: 0,
      net: totalAmount,
      amount: totalAmount,
      note: 'ลูกค้า: ' + customerName
    };
    localStorage.setItem('incomeTransactions', JSON.stringify([newIncomeRecord, ...existingIncomes]));

    alert('บันทึกออกใบเสร็จและอัปเดตยอดเงินทุกหน้าเรียบร้อยแล้ว!');
    setCustomerName('');
    setCustomerAddress('');
    setCustomerTaxId('');
    setItems([{ name: 'ข้าวพันผัก', qty: 1, price: 45 }]);
  };

  const handleDeleteInvoice = (invToDelete: any) => {
    if (confirm('ต้องการลบใบเสร็จนี้ และลบยอดเงินออกจากระบบใช่หรือไม่?')) {
      const updatedList = invoiceList.filter(inv => inv.id !== invToDelete.id);
      setInvoiceList(updatedList);
      localStorage.setItem('invoiceList', JSON.stringify(updatedList));

      const existingIncomes = JSON.parse(localStorage.getItem('incomeTransactions') || '[]');
      const filteredIncomes = existingIncomes.filter((inc: any) => inc.id !== invToDelete.timestampId);
      localStorage.setItem('incomeTransactions', JSON.stringify(filteredIncomes));

      alert('ลบใบเสร็จและยอดเงินออกจากระบบเรียบร้อยแล้ว');
    }
  };

  const handlePrint = (inv: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>ใบเสร็จรับเงิน - ${inv.id}</title>
          <style>
            body { font-family: 'Sarabun', sans-serif; padding: 30px; color: #2D3748; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h2 { color: #5A895E; margin: 0; }
            .info { margin-bottom: 20px; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #CBD5E0; padding: 8px 12px; font-size: 14px; }
            th { background-color: #5A895E; color: white; }
            .text-right { text-align: right; }
            .total { font-weight: bold; font-size: 16px; margin-top: 15px; text-align: right; color: #5A895E; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>ร้านข้าวพันผัก (Khao Phan Phak Se)</h2>
            <p>ใบเสร็จรับเงิน / ใบกำกับภาษีอย่างย่อ</p>
          </div>
          <div class="info">
            <p><b>เลขที่ใบเสร็จ:</b> ${inv.id}</p>
            <p><b>วันที่:</b> ${inv.date}</p>
            <p><b>ลูกค้า:</b> ${inv.customerName} (${inv.customerAddress || '-'})</p>
            ${inv.customerTaxId ? `<p><b>เลขประจำตัวผู้เสียภาษี:</b> ${inv.customerTaxId}</p>` : ''}
          </div>
          <table>
            <thead>
              <tr>
                <th>รายการ</th>
                <th class="text-right">จำนวน</th>
                <th class="text-right">ราคา/หน่วย</th>
                <th class="text-right">รวม (บาท)</th>
              </tr>
            </thead>
            <tbody>
              ${inv.items.map((i: any) => `
                <tr>
                  <td>${i.name}</td>
                  <td class="text-right">${i.qty}</td>
                  <td class="text-right">${Number(i.price).toLocaleString()}</td>
                  <td class="text-right">${(i.qty * i.price).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <p class="total">ยอดสุทธิรวมทั้งสิ้น: ${Number(inv.total).toLocaleString()} บาท</p>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div 
        className="p-6 rounded-2xl shadow-md flex items-center justify-between text-white"
        style={{ backgroundColor: '#5A895E' }}
      >
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#F8E8D5' }}>📄 ออกใบเสร็จ / ใบกำกับภาษี</h1>
          <p className="text-sm mt-1 opacity-90" style={{ color: '#F8E8D5' }}>ออกบิลพร้อมเชื่อมโยงยอดเงินกับกระเป๋าเงินและหน้ารายงานอัตโนมัติ</p>
        </div>
      </div>

      <form 
        onSubmit={handleSaveInvoice} 
        className="p-6 rounded-2xl shadow-sm border space-y-4"
        style={{ backgroundColor: '#F8E8D5', borderColor: '#5A895E' }}
      >
        <h2 className="text-lg font-bold" style={{ color: '#5A895E' }}>📝 สร้างใบเสร็จใหม่</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold mb-1" style={{ color: '#5A895E' }}>ชื่อลูกค้า / ร้านค้า</label>
            <input 
              type="text" 
              value={customerName} 
              onChange={e => setCustomerName(e.target.value)} 
              placeholder="ระบุชื่อลูกค้า" 
              className="w-full p-2.5 bg-white border rounded-xl text-sm outline-none focus:border-[#5A895E]"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1" style={{ color: '#5A895E' }}>ที่อยู่</label>
            <input 
              type="text" 
              value={customerAddress} 
              onChange={e => setCustomerAddress(e.target.value)} 
              placeholder="ที่อยู่ลูกค้า (ถ้ามี)" 
              className="w-full p-2.5 bg-white border rounded-xl text-sm outline-none focus:border-[#5A895E]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1" style={{ color: '#5A895E' }}>เลขประจำตัวผู้เสียภาษี</label>
            <input 
              type="text" 
              value={customerTaxId} 
              onChange={e => setCustomerTaxId(e.target.value)} 
              placeholder="13 หลัก (ถ้ามี)" 
              className="w-full p-2.5 bg-white border rounded-xl text-sm outline-none focus:border-[#5A895E]"
            />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase" style={{ color: '#5A895E' }}>รายการอาหาร / สินค้า (เพิ่ม/ลบได้)</span>
            <button 
              type="button" 
              onClick={addItemRow}
              className="text-xs font-bold px-3 py-1.5 rounded-lg text-white shadow-sm"
              style={{ backgroundColor: '#5A895E' }}
            >
              + เพิ่มรายการ
            </button>
          </div>

          {items.map((item, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <input 
                type="text" 
                value={item.name} 
                onChange={e => handleItemChange(idx, 'name', e.target.value)}
                placeholder="ชื่อรายการ เช่น ข้าวพันผักใส่ไข่" 
                className="flex-1 p-2 bg-white border rounded-xl text-sm outline-none focus:border-[#5A895E]"
                required
              />
              <input 
                type="number" 
                value={item.qty} 
                onChange={e => handleItemChange(idx, 'qty', Number(e.target.value))}
                placeholder="จำนวน" 
                className="w-20 p-2 bg-white border rounded-xl text-sm text-center outline-none focus:border-[#5A895E]"
                min={1}
                required
              />
              <input 
                type="number" 
                value={item.price} 
                onChange={e => handleItemChange(idx, 'price', Number(e.target.value))}
                placeholder="ราคาต่อหน่วย" 
                className="w-28 p-2 bg-white border rounded-xl text-sm text-right outline-none focus:border-[#5A895E]"
                required
              />
              {items.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => removeItemRow(idx)}
                  className="px-3 py-2 text-white rounded-xl text-xs font-bold"
                  style={{ backgroundColor: '#EA9EB6' }}
                >
                  ลบ
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-[#5A895E]/30">
          <div className="text-lg font-bold" style={{ color: '#5A895E' }}>
            ยอดรวมทั้งสิ้น: <span className="text-slate-800">{calculateTotal().toLocaleString()} บาท</span>
          </div>
          <button 
            type="submit" 
            className="px-6 py-2.5 rounded-xl text-white font-bold shadow-md hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#5A895E' }}
          >
            บันทึกและออกใบเสร็จ (ส่งยอดไปหน้าหลัก/กระเป๋าเงิน)
          </button>
        </div>
      </form>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100" style={{ backgroundColor: '#F8E8D5' }}>
          <h2 className="font-bold text-base" style={{ color: '#5A895E' }}>📋 ประวัติใบเสร็จทั้งหมด ({invoiceList.length} รายการ)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-white" style={{ backgroundColor: '#5A895E' }}>
                <th className="p-4">เลขที่</th>
                <th className="p-4">วันที่</th>
                <th className="p-4">ลูกค้า</th>
                <th className="p-4 text-right">ยอดเงิน (บาท)</th>
                <th className="p-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {invoiceList.length > 0 ? (
                invoiceList.map((inv) => (
                  <tr key={inv.id} className="hover:bg-emerald-50/50 transition-colors">
                    <td className="p-4 font-semibold text-slate-800">{inv.id}</td>
                    <td className="p-4 text-slate-600">{inv.date}</td>
                    <td className="p-4 font-medium text-slate-800">{inv.customerName}</td>
                    <td className="p-4 text-right font-bold" style={{ color: '#5A895E' }}>{Number(inv.total).toLocaleString()}</td>
                    <td className="p-4 text-center space-x-2">
                      <button 
                        onClick={() => handlePrint(inv)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm"
                        style={{ backgroundColor: '#5A895E' }}
                      >
                        🖨️ พิมพ์
                      </button>
                      <button 
                        onClick={() => handleDeleteInvoice(inv)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm"
                        style={{ backgroundColor: '#EA9EB6' }}
                      >
                        🗑️ ลบ
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-400">
                    ยังไม่มีประวัติใบเสร็จในระบบ
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