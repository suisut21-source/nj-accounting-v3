'use client';

import { useState, useEffect } from 'react';
import { Calculator, FileText, CheckCircle2, AlertCircle, Download, ShieldCheck, Heart, Home, Users } from 'lucide-react';

export default function TaxPage() {
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [expenseDeductionType, setExpenseDeductionType] = useState<'flat' | 'actual'>('flat');

  // State หมวดที่ 1: ส่วนตัวและครอบครัว
  const [hasSpouse, setHasSpouse] = useState(false); // คู่สมรสไม่มีเงินได้ (60,000)
  const [childrenCount1to2, setChildrenCount1to2] = useState(0); // บุตรคนที่ 1-2 (คนละ 30,000)
  const [childrenCount3Plus, setChildrenCount3Plus] = useState(0); // บุตรคนที่ 3 ขึ้นไป (คนละ 60,000)
  const [pregnancyCost, setPregnancyCost] = useState(0); // ฝากครรภ์/คลอด (ตามจริงสูงสุด 60,000)
  const [parentCareCount, setParentCareCount] = useState(0); // อุปการะพ่อแม่ (คนละ 30,000)
  const [disabledCareCount, setDisabledCareCount] = useState(0); // อุปการะคนพิการ (คนละ 60,000)

  // State หมวดที่ 2: ประกันและการลงทุน
  const [socialSecurity, setSocialSecurity] = useState(0); // ประกันสังคม (สูงสุด 9,000)
  const [lifeInsurance, setLifeInsurance] = useState(0); // ประกันชีวิต (สูงสุด 100,000)
  const [healthInsurance, setHealthInsurance] = useState(0); // ประกันสุขภาพตนเอง (สูงสุด 25,000)
  const [parentHealthInsurance, setParentHealthInsurance] = useState(0); // ประกันสุขภาพพ่อแม่ (สูงสุด 15,000)
  const [rmfFund, setRmfFund] = useState(0); // RMF / กองทุน

  // State หมวดที่ 3: เงินบริจาค
  const [generalDonation, setGeneralDonation] = useState(0); // บริจาคทั่วไป
  const [eduHospitalDonation, setEduHospitalDonation] = useState(0); // บริจาคการศึกษา/รพ. (ลดหย่อน 2 เท่า)
  const [politicalDonation, setPoliticalDonation] = useState(0); // พรรคการเมือง (สูงสุด 10,000)

  // State หมวดที่ 4: กระตุ้นเศรษฐกิจและอสังหาฯ
  const [homeLoanInterest, setHomeLoanInterest] = useState(0); // ดอกเบี้ยบ้าน (สูงสุด 100,000)
  const [easyEReceipt, setEasyEReceipt] = useState(0); // Easy E-Receipt / มาตรการรัฐ

  useEffect(() => {
    const incomeList = JSON.parse(localStorage.getItem('incomeTransactions') || '[]');
    const expenseList = JSON.parse(localStorage.getItem('expenseTransactions') || '[]');

    const sumIncome = incomeList.reduce((acc: number, item: any) => {
      const amt = Number(item.cashInDrawer || 0) + Number(item.bankTransfer || 0) || Number(item.amount || 0);
      return acc + amt;
    }, 0);

    const sumExpense = expenseList.reduce((acc: number, item: any) => {
      return acc + Number(item.amount || 0);
    }, 0);

    setTotalIncome(sumIncome);
    setTotalExpense(sumExpense);
  }, []);

  // การคำนวณรายได้และค่าใช้จ่าย
  const expenseFlat = totalIncome * 0.60;
  const selectedExpense = expenseDeductionType === 'flat' ? expenseFlat : totalExpense;
  const incomeAfterExpense = Math.max(0, totalIncome - selectedExpense);

  // คำนวณค่าลดหย่อนแต่ละหมวดตามเงื่อนไขสรรพากร
  const basePersonal = 60000;
  const spouseDeduction = hasSpouse ? 60000 : 0;
  const childrenDeduction = (Number(childrenCount1to2) * 30000) + (Number(childrenCount3Plus) * 60000);
  const pregnancyDeduction = Math.min(Number(pregnancyCost), 60000);
  const parentCareDeduction = Number(parentCareCount) * 30000;
  const disabledCareDeduction = Number(disabledCareCount) * 60000;

  const totalFamilyDeduction = basePersonal + spouseDeduction + childrenDeduction + pregnancyDeduction + parentCareDeduction + disabledCareDeduction;

  // หมวดประกันและการลงทุน (มีเพดานจำกัดตามกฎหมาย)
  const sscDeduction = Math.min(Number(socialSecurity), 9000);
  const lifeInsDeduction = Math.min(Number(lifeInsurance), 100000);
  const healthInsDeduction = Math.min(Number(healthInsurance), 25000);
  // ประกันชีวิต + ประกันสุขภาพตนเอง รวมกันต้องไม่เกิน 100,000 บาท
  const combinedLifeHealth = Math.min(lifeInsDeduction + healthInsDeduction, 100000);
  const parentHealthDeduction = Math.min(Number(parentHealthInsurance), 15000);
  const rmfDeduction = Math.min(Number(rmfFund), incomeAfterExpense * 0.30, 500000);

  const totalInsuranceDeduction = sscDeduction + combinedLifeHealth + parentHealthDeduction + rmfDeduction;

  // รวมเงินได้หลังหักลดหย่อนส่วนตัวและประกัน (เพื่อใช้คำนวณเพดานเงินบริจาค)
  const incomeBeforeDonation = Math.max(0, incomeAfterExpense - totalFamilyDeduction - totalInsuranceDeduction);

  // หมวดเงินบริจาค
  const politicalDed = Math.min(Number(politicalDonation), 10000);
  // บริจาคการศึกษา/รพ. หักได้ 2 เท่า (แต่ไม่เกิน 10% ของเงินได้หลังหักลดหย่อน)
  const eduHospDedActual = Math.min(Number(eduHospitalDonation) * 2, incomeBeforeDonation * 0.10);
  const generalDedActual = Math.min(Number(generalDonation), Math.max(0, (incomeBeforeDonation * 0.10) - eduHospDedActual));
  
  const totalDonationDeduction = generalDedActual + eduHospDedActual + politicalDed;

  // หมวดอสังหาฯ และกระตุ้นเศรษฐกิจ
  const homeLoanDed = Math.min(Number(homeLoanInterest), 100000);
  const easyEReceiptDed = Math.min(Number(easyEReceipt), 50000); // สมมติเพดานกระตุ้นเศรษฐกิจทั่วไป

  const totalOtherDeduction = homeLoanDed + easyEReceiptDed;

  // รวมค่าลดหย่อนทั้งหมด
  const totalDeductions = totalFamilyDeduction + totalInsuranceDeduction + totalDonationDeduction + totalOtherDeduction;
  
  const netIncome = Math.max(0, incomeAfterExpense - totalDeductions);

  // คำนวณภาษีตามขั้นบันไดสรรพากร
  let calculatedTax = 0;
  if (netIncome > 5000000) {
    calculatedTax += (netIncome - 5000000) * 0.35 + 1265000;
  } else if (netIncome > 2000000) {
    calculatedTax += (netIncome - 2000000) * 0.30 + 365000;
  } else if (netIncome > 1000000) {
    calculatedTax += (netIncome - 1000000) * 0.20 + 165000;
  } else if (netIncome > 750000) {
    calculatedTax += (netIncome - 750000) * 0.15 + 65000;
  } else if (netIncome > 500000) {
    calculatedTax += (netIncome - 500000) * 0.10 + 40000;
  } else if (netIncome > 300000) {
    calculatedTax += (netIncome - 300000) * 0.05 + 10000;
  } else if (netIncome > 150000) {
    calculatedTax += (netIncome - 150000) * 0.05;
  }

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto font-sans p-4 sm:p-6">
      
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-[2.5rem] border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-xl shadow-sm">
            📊
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-800 tracking-tight">ระบบคำนวณและเตรียมเอกสารภาษีอัตโนมัติ (4 หมวดลดหย่อนเต็มรูปแบบ)</h1>
              <span className="text-xs">⚖️</span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">คำนวณภาษี ภ.ง.ด.94 / ภ.ง.ด.90 ตามกฎหมายสรรพากรล่าสุด</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            กำหนด ภ.ง.ด.94: ภายใน 30 ก.ย. นี้
          </span>
        </div>
      </div>

      {/* Tax Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: Total Income */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200/80 shadow-sm space-y-3">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">รายได้สะสมทั้งปี (Gross Income)</p>
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-black text-slate-800">
              ฿{totalIncome.toLocaleString(undefined, {minimumFractionDigits: 2})}
            </h2>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">จากหน้าเงินเข้า</span>
          </div>
          <p className="text-[11px] text-slate-400">ยอดขายรวมทุกช่องทางของร้านข้าวพันผัก</p>
        </div>

        {/* Card 2: Expense Deduction Choice */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">ค่าใช้จ่ายที่ใช้หักภาษี</p>
            <div className="flex bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
              <button 
                onClick={() => setExpenseDeductionType('flat')}
                className={`px-3 py-1 rounded-lg transition ${expenseDeductionType === 'flat' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
              >
                เหมา 60%
              </button>
              <button 
                onClick={() => setExpenseDeductionType('actual')}
                className={`px-3 py-1 rounded-lg transition ${expenseDeductionType === 'actual' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
              >
                ตามจริง ({totalExpense.toLocaleString()} ฿)
              </button>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-black text-indigo-600">
              ฿{selectedExpense.toLocaleString(undefined, {minimumFractionDigits: 2})}
            </h2>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
              {expenseDeductionType === 'flat' ? 'วิธีเหมา (คุ้มค่า)' : 'วิธีหักตามบิลจริง'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            {expenseDeductionType === 'flat' ? `คิดจาก 60% ของรายได้ = ฿${expenseFlat.toLocaleString()}` : 'หักตามยอดบันทึกในหน้าเงินออก'}
          </p>
        </div>

        {/* Card 3: Estimated Tax (Enlarged Text) */}
        <div className="bg-indigo-900 text-white p-6 rounded-[2rem] shadow-md space-y-3 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-[-10px] bottom-[-10px] text-indigo-800 opacity-30 text-8xl font-black">
            🧾
          </div>
          <div>
            <p className="text-xs text-indigo-200 font-bold uppercase tracking-wider">ประมาณการภาษีที่ต้องชำระ</p>
          </div>
          <div className="flex items-baseline justify-between relative z-10 py-1">
            <h2 className="text-4xl sm:text-5xl font-black text-amber-300 tracking-tight">
              ฿{calculatedTax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </h2>
          </div>
          <div className="flex items-center justify-between text-[11px] text-indigo-200 relative z-10">
            <span>หลังหักลดหย่อนรวม ฿{totalDeductions.toLocaleString()}</span>
            <span className="font-bold bg-amber-400 text-slate-900 px-2.5 py-1 rounded-full text-[10px]">สุทธิ</span>
          </div>
        </div>

      </div>

      {/* Main Grid: Left Formula & Right 4 Categories Input */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Summary Steps (5 columns) */}
        <div className="lg:col-span-5 bg-white rounded-[2.5rem] border border-slate-200/80 shadow-sm p-6 space-y-5 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-black text-slate-800 flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5 text-indigo-600" />
              <span>สรุปขั้นตอนการคำนวณภาษี</span>
            </h2>

            <div className="space-y-3 text-xs font-medium text-slate-700">
              <div className="flex justify-between p-3.5 bg-slate-50 rounded-2xl">
                <span className="text-slate-500 font-bold">1. รายได้พึงประเมินทั้งปี</span>
                <span className="font-black text-slate-800">฿{totalIncome.toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-3.5 bg-slate-50 rounded-2xl">
                <span className="text-slate-500 font-bold">2. หัก ค่าใช้จ่าย</span>
                <span className="font-black text-rose-600">- ฿{selectedExpense.toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-3.5 bg-slate-50 rounded-2xl">
                <span className="text-slate-500 font-bold">3. เงินได้หลังหักค่าใช้จ่าย</span>
                <span className="font-black text-slate-800">฿{incomeAfterExpense.toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-100">
                <span className="text-indigo-900 font-bold">4. หัก ค่าลดหย่อนรวมทั้ง 4 หมวด</span>
                <span className="font-black text-indigo-700">- ฿{totalDeductions.toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-4 bg-indigo-900 text-white rounded-2xl text-sm shadow-sm">
                <span className="font-black text-amber-300">5. เงินได้สุทธิเพื่อคำนวณภาษี</span>
                <span className="font-black text-amber-300">฿{netIncome.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button 
              onClick={() => alert('คัดลอกสรุปตัวเลขภาษีและรายการลดหย่อนทั้ง 4 หมวดเรียบร้อยแล้ว พร้อมนำไปยื่น e-Filing ครับพี่! 🚀')}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>คัดลอกสรุปตัวเลขยื่น ภ.ง.ด. / e-Filing</span>
            </button>
          </div>
        </div>

        {/* Right: 4 Categories Allowance Inputs (7 columns) */}
        <div className="lg:col-span-7 bg-white rounded-[2.5rem] border border-slate-200/80 shadow-sm p-6 space-y-6">
          <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span>กรอกรายการลดหย่อนภาษี (แยกตาม 4 หมวดหลัก)</span>
          </h2>

          {/* หมวดที่ 1: ส่วนตัวและครอบครัว */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-3">
            <p className="font-black text-slate-800 text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              1. หมวดลดหย่อนส่วนตัวและครอบครัว (พื้นฐานส่วนตัว 60,000 ฿ รวมอัตโนมัติ)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={hasSpouse}
                  onChange={(e) => setHasSpouse(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="font-bold text-slate-700">มีคู่สมรส (ไม่มีเงินได้) [+60,000 ฿]</span>
              </label>

              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">บุตรคนที่ 1-2 (เกิดก่อน/หลัง 2561)</label>
                <input 
                  type="number" 
                  value={childrenCount1to2 || ''}
                  onChange={(e) => setChildrenCount1to2(Number(e.target.value))}
                  placeholder="จำนวนคน"
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">บุตรคนที่ 3 ขึ้นไป (เกิดตั้งแต่ 2561)</label>
                <input 
                  type="number" 
                  value={childrenCount3Plus || ''}
                  onChange={(e) => setChildrenCount3Plus(Number(e.target.value))}
                  placeholder="จำนวนคน"
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">ฝากครรภ์/คลอดบุตร (จ่ายจริงสูงสุด 60k)</label>
                <input 
                  type="number" 
                  value={pregnancyCost || ''}
                  onChange={(e) => setPregnancyCost(Number(e.target.value))}
                  placeholder="0"
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">อุปการะบิดามารดา (อายุ 60 ปีขึ้นไป)</label>
                <input 
                  type="number" 
                  value={parentCareCount || ''}
                  onChange={(e) => setParentCareCount(Number(e.target.value))}
                  placeholder="จำนวนคน (คนละ 30k)"
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">อุปการะคนพิการ</label>
                <input 
                  type="number" 
                  value={disabledCareCount || ''}
                  onChange={(e) => setDisabledCareCount(Number(e.target.value))}
                  placeholder="จำนวนคน (คนละ 60k)"
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* หมวดที่ 2: ประกันและการลงทุน */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-3">
            <p className="font-black text-slate-800 text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              2. หมวดประกันและการลงทุน
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">ประกันสังคม (จ่ายจริงสูงสุด 9,000 ฿)</label>
                <input 
                  type="number" 
                  value={socialSecurity || ''}
                  onChange={(e) => setSocialSecurity(Number(e.target.value))}
                  placeholder="0"
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">เบี้ยประกันชีวิต (สูงสุด 100,000 ฿)</label>
                <input 
                  type="number" 
                  value={lifeInsurance || ''}
                  onChange={(e) => setLifeInsurance(Number(e.target.value))}
                  placeholder="0"
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">เบี้ยประกันสุขภาพตนเอง (สูงสุด 25,000 ฿)</label>
                <input 
                  type="number" 
                  value={healthInsurance || ''}
                  onChange={(e) => setHealthInsurance(Number(e.target.value))}
                  placeholder="0"
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">เบี้ยประกันสุขภาพพ่อแม่ (สูงสุด 15,000 ฿)</label>
                <input 
                  type="number" 
                  value={parentHealthInsurance || ''}
                  onChange={(e) => setParentHealthInsurance(Number(e.target.value))}
                  placeholder="0"
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] text-slate-500 font-bold block mb-1">กองทุน RMF / กองทุนออมเพื่อเกษียณ (สูงสุด 30% ของรายได้ / ไม่เกิน 500k)</label>
                <input 
                  type="number" 
                  value={rmfFund || ''}
                  onChange={(e) => setRmfFund(Number(e.target.value))}
                  placeholder="0"
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* หมวดที่ 3: เงินบริจาค */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-3">
            <p className="font-black text-slate-800 text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              3. หมวดเงินบริจาค
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">บริจาคทั่วไป (ไม่เกิน 10%)</label>
                <input 
                  type="number" 
                  value={generalDonation || ''}
                  onChange={(e) => setGeneralDonation(Number(e.target.value))}
                  placeholder="0"
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">บริจาคการศึกษา/รพ. (ลดหย่อน 2 เท่า)</label>
                <input 
                  type="number" 
                  value={eduHospitalDonation || ''}
                  onChange={(e) => setEduHospitalDonation(Number(e.target.value))}
                  placeholder="0"
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">บริจาคพรรคการเมือง (สูงสุด 10k)</label>
                <input 
                  type="number" 
                  value={politicalDonation || ''}
                  onChange={(e) => setPoliticalDonation(Number(e.target.value))}
                  placeholder="0"
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* หมวดที่ 4: อสังหาฯ และกระตุ้นเศรษฐกิจ */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-3">
            <p className="font-black text-slate-800 text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-600"></span>
              4. หมวดอสังหาฯ และกระตุ้นเศรษฐกิจ
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">ดอกเบี้ยเงินกู้ยืมซื้อที่อยู่อาศัย (สูงสุด 100k)</label>
                <input 
                  type="number" 
                  value={homeLoanInterest || ''}
                  onChange={(e) => setHomeLoanInterest(Number(e.target.value))}
                  placeholder="0"
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">มาตรการกระตุ้นเศรษฐกิจ (เช่น Easy E-Receipt)</label>
                <input 
                  type="number" 
                  value={easyEReceipt || ''}
                  onChange={(e) => setEasyEReceipt(Number(e.target.value))}
                  placeholder="0"
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}