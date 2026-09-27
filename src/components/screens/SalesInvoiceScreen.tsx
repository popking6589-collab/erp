import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Printer,
  UserPlus,
  PackagePlus,
  CreditCard,
  Calendar,
  Warehouse,
  Percent,
  Calculator,
  CheckCircle2,
  AlertCircle,
  Download
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  SalesInvoice,
  InvoiceItem,
  InvoicePayment,
  PaymentMethod,
  Customer,
  Item
} from '../../types';
import { ActionBar } from '../common/ActionBar';
import { PrintHeader } from '../common/PrintHeader';
import { QuickCustomerModal } from '../common/QuickCustomerModal';
import { QuickItemModal } from '../common/QuickItemModal';
import { PrintModal } from '../common/PrintModal';

export const SalesInvoiceScreen: React.FC = () => {
  const {
    salesInvoices,
    warehouses,
    customers,
    items,
    cashBanks,
    employees,
    addSalesInvoice,
    updateSalesInvoice,
    deleteSalesInvoice,
    canAccess,
    selectedOperationTarget,
    setSelectedOperationTarget
  } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isNewMode, setIsNewMode] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Quick modals state
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  // Invoice State
  const [invoiceNo, setInvoiceNo] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentTermsDays, setPaymentTermsDays] = useState(30);

  const [warehouseId, setWarehouseId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [salesRepEmployeeId, setSalesRepEmployeeId] = useState('');
  const [salesRepName, setSalesRepName] = useState('');

  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [invoiceDiscountPercent, setInvoiceDiscountPercent] = useState(0);
  const [taxPercent, setTaxPercent] = useState(14); // ضريبة القيمة المضافة 14%
  const [withholdingTaxPercent, setWithholdingTaxPercent] = useState(1); // إشعار خصم 1%

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('نقدي');
  const [payments, setPayments] = useState<InvoicePayment[]>([]);

  const [notes, setNotes] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentInvoice = salesInvoices[currentIndex];

  // Set form to current invoice when navigating
  useEffect(() => {
    if (currentInvoice && !isNewMode) {
      setInvoiceNo(currentInvoice.invoiceNo);
      setDate(currentInvoice.date);
      setDueDate(currentInvoice.dueDate);
      setPaymentTermsDays(currentInvoice.paymentTermsDays);
      setWarehouseId(currentInvoice.warehouseId);
      setCustomerId(currentInvoice.customerId);
      setSalesRepEmployeeId(currentInvoice.salesRepEmployeeId);
      setSalesRepName(currentInvoice.salesRepName);
      setInvoiceItems(currentInvoice.items);
      setInvoiceDiscountPercent(currentInvoice.invoiceDiscountPercent || 0);
      setTaxPercent(currentInvoice.taxPercent);
      setWithholdingTaxPercent(currentInvoice.withholdingTaxPercent);
      setPaymentMethod(currentInvoice.paymentMethod);
      setPayments(currentInvoice.payments || []);
      setNotes(currentInvoice.notes || '');
    }
  }, [currentInvoice, isNewMode]);

  // Target specific invoice if selected from Operations Hub or Navigation
  useEffect(() => {
    if (selectedOperationTarget && selectedOperationTarget.screen === 'sales_invoice') {
      const idx = salesInvoices.findIndex(inv =>
        (selectedOperationTarget.id && inv.id === selectedOperationTarget.id) ||
        (selectedOperationTarget.invoiceNo && inv.invoiceNo === selectedOperationTarget.invoiceNo)
      );
      if (idx !== -1) {
        setCurrentIndex(idx);
        setIsNewMode(false);
      }
      setSelectedOperationTarget(null);
    }
  }, [selectedOperationTarget, salesInvoices, setSelectedOperationTarget]);

  // Handle Customer Selection -> Auto-set Sales Rep
  const handleCustomerChange = (newCustId: string) => {
    setCustomerId(newCustId);
    const selectedCust = customers.find(c => c.id === newCustId);
    if (selectedCust) {
      setSalesRepEmployeeId(selectedCust.salesRepEmployeeId);
      setSalesRepName(selectedCust.salesRepName || 'غير مسند');
    }
  };

  // Payment terms days change -> update due date
  const handlePaymentTermsChange = (days: number) => {
    setPaymentTermsDays(days);
    const baseDate = new Date(date || new Date());
    baseDate.setDate(baseDate.getDate() + Number(days));
    setDueDate(baseDate.toISOString().split('T')[0]);
  };

  // Add line item
  const handleAddItemRow = (selectedItemId?: string) => {
    const itemObj = items.find(i => i.id === selectedItemId) || items[0];
    if (!itemObj) return;

    const newItem: InvoiceItem = {
      id: 'inv-item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      itemId: itemObj.id,
      itemCode: itemObj.code,
      itemName: itemObj.name,
      quantity: 1,
      unitPrice: itemObj.sellingPrice,
      total: itemObj.sellingPrice,
      discountPercent: 0,
      discountAmount: 0,
      net: itemObj.sellingPrice
    };

    setInvoiceItems(prev => [...prev, newItem]);
  };

  // Update line item
  const updateItemRow = (rowId: string, field: keyof InvoiceItem, val: any) => {
    setInvoiceItems(prev => {
      return prev.map(item => {
        if (item.id === rowId) {
          const updated = { ...item, [field]: val };

          // If item selection changed, update prices
          if (field === 'itemId') {
            const foundItem = items.find(i => i.id === val);
            if (foundItem) {
              updated.itemCode = foundItem.code;
              updated.itemName = foundItem.name;
              updated.unitPrice = foundItem.sellingPrice;
            }
          }

          // Recalculate line
          const qty = Number(updated.quantity) || 0;
          const price = Number(updated.unitPrice) || 0;
          const total = qty * price;
          const discPct = Number(updated.discountPercent) || 0;
          const discAmt = (total * discPct) / 100;
          const net = total - discAmt;

          updated.total = total;
          updated.discountAmount = discAmt;
          updated.net = net;

          return updated;
        }
        return item;
      });
    });
  };

  const removeItemRow = (rowId: string) => {
    setInvoiceItems(prev => prev.filter(i => i.id !== rowId));
  };

  // Calculations
  const calculations = useMemo(() => {
    const subtotal = invoiceItems.reduce((s, i) => s + i.net, 0);
    const invoiceDiscountAmount = (subtotal * (Number(invoiceDiscountPercent) || 0)) / 100;
    const afterDiscount = subtotal - invoiceDiscountAmount;

    const taxAmount = (afterDiscount * (Number(taxPercent) || 0)) / 100;
    const withholdingTaxAmount = (afterDiscount * (Number(withholdingTaxPercent) || 0)) / 100;

    const netTotal = afterDiscount + taxAmount - withholdingTaxAmount;
    const paidAmount = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const remainingAmount = Math.max(0, netTotal - paidAmount);

    return {
      subtotal,
      invoiceDiscountAmount,
      afterDiscount,
      taxAmount,
      withholdingTaxAmount,
      netTotal,
      paidAmount,
      remainingAmount
    };
  }, [invoiceItems, invoiceDiscountPercent, taxPercent, withholdingTaxPercent, payments]);

  // Payments inside invoice
  const handleAddPaymentRow = () => {
    const defaultCb = cashBanks[0];
    const newPay: InvoicePayment = {
      id: 'pay-' + Date.now(),
      paymentMethod,
      cashBankId: defaultCb?.id || '',
      cashBankName: defaultCb?.name || 'الخزينة الرئيسية',
      amount: calculations.remainingAmount > 0 ? calculations.remainingAmount : 0,
      referenceNo: '',
      date: date || new Date().toISOString().split('T')[0],
      notes: 'دفعة سداد مع الفاتورة'
    };
    setPayments(prev => [...prev, newPay]);
  };

  const updatePaymentRow = (payId: string, field: keyof InvoicePayment, val: any) => {
    setPayments(prev => {
      return prev.map(p => {
        if (p.id === payId) {
          const upd = { ...p, [field]: val };
          if (field === 'cashBankId') {
            const cb = cashBanks.find(c => c.id === val);
            if (cb) upd.cashBankName = cb.name;
          }
          return upd;
        }
        return p;
      });
    });
  };

  const removePaymentRow = (payId: string) => {
    setPayments(prev => prev.filter(p => p.id !== payId));
  };

  // Actions
  const handleNew = () => {
    setIsNewMode(true);
    const nextNum = `INV-2026-000${salesInvoices.length + 1}`;
    setInvoiceNo(nextNum);
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
    setDueDate(today);
    setPaymentTermsDays(0);

    const firstWh = warehouses[0]?.id || '';
    const firstCust = customers[0];

    setWarehouseId(firstWh);
    setCustomerId(firstCust?.id || '');
    setSalesRepEmployeeId(firstCust?.salesRepEmployeeId || '');
    setSalesRepName(firstCust?.salesRepName || '');

    setInvoiceItems([]);
    setInvoiceDiscountPercent(0);
    setTaxPercent(14);
    setWithholdingTaxPercent(1);
    setPaymentMethod('نقدي');
    setPayments([]);
    setNotes('');
    setStatusMessage(null);

    // Add first empty item row
    setTimeout(() => {
      if (items.length > 0) {
        handleAddItemRow(items[0].id);
      }
    }, 50);
  };

  const handleSave = () => {
    if (!invoiceNo.trim()) {
      setStatusMessage({ type: 'error', text: 'يرجى إدخال رقم الفاتورة' });
      return;
    }
    if (!customerId) {
      setStatusMessage({ type: 'error', text: 'يرجى اختيار العميل' });
      return;
    }
    if (!warehouseId) {
      setStatusMessage({ type: 'error', text: 'يرجى اختيار المخزن المسحوب منه' });
      return;
    }
    if (invoiceItems.length === 0) {
      setStatusMessage({ type: 'error', text: 'يرجى إضافة صنف واحد على الأقل في الفاتورة' });
      return;
    }

    const wh = warehouses.find(w => w.id === warehouseId);
    const cust = customers.find(c => c.id === customerId);

    const invoiceData: SalesInvoice = {
      id: isNewMode ? 'inv-' + Date.now() : currentInvoice.id,
      invoiceNo: invoiceNo.trim(),
      date,
      dueDate,
      paymentTermsDays: Number(paymentTermsDays) || 0,
      warehouseId,
      warehouseName: wh?.name || 'المستودع الرئيسي',
      customerId,
      customerName: cust?.name || 'عميل نقدي',
      salesRepEmployeeId,
      salesRepName: salesRepName || 'غير مسند',
      items: invoiceItems,
      subtotal: calculations.subtotal,
      invoiceDiscountPercent: Number(invoiceDiscountPercent) || 0,
      invoiceDiscountAmount: calculations.invoiceDiscountAmount,
      taxPercent: Number(taxPercent) || 0,
      taxAmount: calculations.taxAmount,
      withholdingTaxPercent: Number(withholdingTaxPercent) || 0,
      withholdingTaxAmount: calculations.withholdingTaxAmount,
      netTotal: calculations.netTotal,
      paymentMethod,
      payments,
      paidAmount: calculations.paidAmount,
      remainingAmount: calculations.remainingAmount,
      notes: notes.trim() || undefined,
      createdAt: isNewMode ? new Date().toISOString() : currentInvoice.createdAt,
      updatedAt: new Date().toISOString()
    };

    if (isNewMode) {
      if (salesInvoices.some(i => i.invoiceNo === invoiceData.invoiceNo)) {
        setStatusMessage({ type: 'error', text: 'رقم الفاتورة مسجل مسبقاً' });
        return;
      }
      addSalesInvoice(invoiceData);
      setIsNewMode(false);
      setCurrentIndex(0);
      setStatusMessage({
        type: 'success',
        text: `تم حفظ فاتورة المبيعات (${invoiceData.invoiceNo}) بقيمة ${invoiceData.netTotal.toLocaleString('ar-EG')} ج.م وتم التأثير على المخزون وحساب العميل وميزان المراجعة فوراً`
      });
    } else {
      updateSalesInvoice(currentInvoice.id, invoiceData);
      setStatusMessage({ type: 'success', text: `تم تحديث الفاتورة (${invoiceData.invoiceNo})` });
    }
  };

  const handleDelete = () => {
    if (!currentInvoice) return;
    if (confirm(`هل أنت متأكد من حذف فاتورة المبيعات (${currentInvoice.invoiceNo})؟ سيتم عكس التأثير على المخزون ورصيد العميل`)) {
      deleteSalesInvoice(currentInvoice.id);
      setStatusMessage({ type: 'success', text: 'تم حذف الفاتورة وعكس تأثيرها المخزني والمالي بنجاح' });
      setCurrentIndex(Math.max(0, currentIndex - 1));
    }
  };

  const handlePrint = () => {
    setIsPrintModalOpen(true);
  };

  const handleExportExcel = () => {
    const activeInv = currentInvoice || {
      invoiceNo,
      date,
      customerName: customers.find(c => c.id === customerId)?.name || 'العميل',
      netTotal: calculations.netTotal,
      items: invoiceItems
    };

    const headers = ['م', 'كود الصنف', 'اسم الصنف', 'الكمية', 'سعر الوحدة', 'إجمالي', 'خصم', 'الصافي'];
    const rows = (activeInv.items || []).map((it, idx) => [
      idx + 1,
      it.itemCode,
      it.itemName,
      it.quantity,
      it.unitPrice.toFixed(2),
      it.total.toFixed(2),
      (it.discountAmount || 0).toFixed(2),
      it.net.toFixed(2)
    ]);
    const csvContent = '\uFEFF' + [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `فاتورة_مبيعات_${activeInv.invoiceNo || 'جديدة'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Recall / Search invoice by number or customer
  const handleSearch = (searchVal: string) => {
    const idx = salesInvoices.findIndex(i =>
      i.invoiceNo.toLowerCase().includes(searchVal.toLowerCase()) ||
      i.customerName.includes(searchVal)
    );
    if (idx !== -1) {
      setCurrentIndex(idx);
      setIsNewMode(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Official Print Header */}
      <div className="print-only">
        <PrintHeader
          title="فاتورة مبيعات ضريبية"
          docNumber={invoiceNo}
          date={date}
        />
      </div>

      {/* Screen Title */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-slate-200 pb-3 no-print">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-md shadow-emerald-500/20">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">فاتورة مبيعات متطورة وشاملة</h1>
            <p className="text-xs text-slate-500">
              ربط المخازن والعملاء والمندوبين، احتساب الضريبة والخصم وإشعار 1%، دفعات متعددة وتأثير فوري على المخزون وميزان المراجعة
            </p>
          </div>
        </div>

        {/* Quick Coding & Print Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setIsCustomerModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-blue-600" />
            <span>+ تكويد عميل جديد</span>
          </button>
          <button
            type="button"
            onClick={() => setIsItemModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <PackagePlus className="w-4 h-4 text-emerald-600" />
            <span>+ تكويد صنف جديد</span>
          </button>
          <button
            type="button"
            onClick={handleExportExcel}
            className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
            title="تصدير بيانات الفاتورة إلى ملف Excel"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel</span>
          </button>
          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
            title="اختيار وتخصيص نماذج الطباعة"
          >
            <Printer className="w-4 h-4" />
            <span>نماذج الطباعة</span>
          </button>
        </div>
      </div>

      {/* Navigation & Action Bar */}
      <ActionBar
        onFirst={() => { setCurrentIndex(0); setIsNewMode(false); }}
        onPrev={() => { setCurrentIndex(Math.max(0, currentIndex - 1)); setIsNewMode(false); }}
        onNext={() => { setCurrentIndex(Math.min(salesInvoices.length - 1, currentIndex + 1)); setIsNewMode(false); }}
        onLast={() => { setCurrentIndex(salesInvoices.length - 1); setIsNewMode(false); }}
        onNew={handleNew}
        onSave={handleSave}
        onDelete={handleDelete}
        onPrint={handlePrint}
        isNewMode={isNewMode}
        canEdit={canAccess('sales_invoice', 'edit')}
        canDelete={canAccess('sales_invoice', 'delete')}
        canPrint={canAccess('sales_invoice', 'print')}
        searchPlaceholder="استدعاء فاتورة برقمها أو اسم العميل..."
        onSearchChange={handleSearch}
      />

      {statusMessage && (
        <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
          statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        } no-print`}>
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Invoice Document Form */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-5 print-card">
        {/* Top Header Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50/80 rounded-xl border border-slate-200 text-xs">
          {/* Invoice No */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">رقم الفاتورة (تلقائي) *</label>
            <input
              type="text"
              value={invoiceNo}
              onChange={e => setInvoiceNo(e.target.value)}
              className="w-full text-sm font-mono font-bold border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 bg-white"
              required
            />
          </div>

          {/* Date */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>تاريخ الفاتورة *</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={e => {
                setDate(e.target.value);
                handlePaymentTermsChange(paymentTermsDays);
              }}
              className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 bg-white"
              required
            />
          </div>

          {/* Warehouse Selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Warehouse className="w-3.5 h-3.5 text-emerald-600" />
              <span>المخزن المسحوب منه *</span>
            </label>
            <select
              value={warehouseId}
              onChange={e => setWarehouseId(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 bg-white font-semibold text-slate-800"
              required
            >
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-purple-600" />
              <span>طريقة الدفع بالعربي *</span>
            </label>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 bg-white font-bold"
            >
              <option value="نقدي">نقدي</option>
              <option value="آجل">آجل</option>
              <option value="فيزا">فيزا</option>
              <option value="تحويل بنكي">تحويل بنكي</option>
            </select>
          </div>

          {/* Customer Selection */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">العميل *</label>
              <button
                type="button"
                onClick={() => setIsCustomerModalOpen(true)}
                className="text-blue-600 hover:underline text-[11px] font-bold no-print"
              >
                + تكويد عميل جديد
              </button>
            </div>
            <select
              value={customerId}
              onChange={e => handleCustomerChange(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 bg-white font-bold text-slate-900"
              required
            >
              <option value="">-- اختر العميل --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name} ({c.governorate})
                </option>
              ))}
            </select>
          </div>

          {/* Automatic Sales Rep */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">اسم المندوب (يسمع تلقائياً)</label>
            <input
              type="text"
              value={salesRepName || 'غير مسند'}
              readOnly
              className="w-full text-sm font-bold border border-slate-200 rounded-lg p-2 bg-slate-100 text-blue-800"
            />
          </div>

          {/* Due date & Terms */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">مدة الدفع / الاستحقاق</label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0"
                value={paymentTermsDays}
                onChange={e => handlePaymentTermsChange(Number(e.target.value))}
                className="w-16 text-sm border border-slate-300 rounded-lg p-2 text-center"
                title="أيام"
              />
              <span className="text-[11px] text-slate-500">يوم إلى:</span>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="flex-1 text-sm border border-slate-300 rounded-lg p-2"
              />
            </div>
          </div>
        </div>

        {/* ITEMS TABLE (Unlimited items) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span>جدول الأصناف والكميات (عدد لا نهائي)</span>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                {invoiceItems.length} صنف
              </span>
            </h3>

            <div className="flex items-center gap-2 no-print">
              <button
                type="button"
                onClick={() => setIsItemModalOpen(true)}
                className="text-xs text-emerald-700 hover:bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-300 font-bold transition"
              >
                + تكويد صنف جديد
              </button>
              <button
                type="button"
                onClick={() => handleAddItemRow()}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة سطر صنف</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="p-2.5 w-10">م</th>
                  <th className="p-2.5 min-w-[220px]">اسم الصنف المكود</th>
                  <th className="p-2.5 w-24 text-center">الكمية</th>
                  <th className="p-2.5 w-28 text-left">سعر البيع</th>
                  <th className="p-2.5 w-28 text-left">الإجمالي</th>
                  <th className="p-2.5 w-24 text-center">خصم %</th>
                  <th className="p-2.5 w-28 text-left">الصافي</th>
                  <th className="p-2.5 w-10 text-center no-print">حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoiceItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="p-2.5 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="p-2.5">
                      <select
                        value={item.itemId}
                        onChange={e => updateItemRow(item.id, 'itemId', e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-lg p-1.5 bg-white font-bold text-slate-800"
                      >
                        {items.map(it => (
                          <option key={it.id} value={it.id}>
                            {it.code} - {it.name} (متوفر: {it.currentStock} {it.unit})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2.5 text-center">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={e => updateItemRow(item.id, 'quantity', Number(e.target.value))}
                        className="w-full text-xs font-bold border border-slate-300 rounded-lg p-1.5 text-center bg-white"
                      />
                    </td>
                    <td className="p-2.5 text-left">
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={e => updateItemRow(item.id, 'unitPrice', Number(e.target.value))}
                        className="w-full text-xs font-bold border border-slate-300 rounded-lg p-1.5 text-left bg-white text-emerald-800"
                      />
                    </td>
                    <td className="p-2.5 font-mono text-left font-semibold text-slate-700">
                      {item.total.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2.5 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.discountPercent}
                        onChange={e => updateItemRow(item.id, 'discountPercent', Number(e.target.value))}
                        className="w-full text-xs border border-slate-300 rounded-lg p-1.5 text-center bg-white"
                      />
                    </td>
                    <td className="p-2.5 font-mono text-left font-bold text-blue-900">
                      {item.net.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2.5 text-center no-print">
                      <button
                        type="button"
                        onClick={() => removeItemRow(item.id)}
                        className="text-slate-400 hover:text-rose-600 transition p-1"
                        title="حذف السطر"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAYMENTS & TOTALS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-3 border-t border-slate-200">
          {/* Left: Multiple Payments inside the Invoice (7 cols) */}
          <div className="lg:col-span-7 bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>تسجيل دفعات الفاتورة (أكثر من دفعة داخل الفاتورة نفسها)</span>
              </h4>
              <button
                type="button"
                onClick={handleAddPaymentRow}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer no-print"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة دفعة</span>
              </button>
            </div>

            {payments.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                لم يتم تسجيل دفعات مسددة فورية (الفاتورة آجلة بالكامل على حساب العميل)
              </p>
            ) : (
              <div className="space-y-2">
                {payments.map(pay => (
                  <div key={pay.id} className="flex flex-wrap items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 text-xs">
                    <select
                      value={pay.paymentMethod}
                      onChange={e => updatePaymentRow(pay.id, 'paymentMethod', e.target.value)}
                      className="border border-slate-200 rounded p-1 font-bold"
                    >
                      <option value="نقدي">نقدي</option>
                      <option value="فيزا">فيزا</option>
                      <option value="تحويل بنكي">تحويل بنكي</option>
                    </select>

                    <select
                      value={pay.cashBankId}
                      onChange={e => updatePaymentRow(pay.id, 'cashBankId', e.target.value)}
                      className="border border-slate-200 rounded p-1 flex-1 font-semibold"
                    >
                      {cashBanks.map(cb => (
                        <option key={cb.id} value={cb.id}>{cb.name}</option>
                      ))}
                    </select>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-500 font-bold">المبلغ:</span>
                      <input
                        type="number"
                        min="0"
                        value={pay.amount}
                        onChange={e => updatePaymentRow(pay.id, 'amount', Number(e.target.value))}
                        className="w-24 border border-slate-300 rounded p-1 font-mono font-bold text-left text-emerald-800"
                      />
                    </div>

                    <input
                      type="text"
                      placeholder="رقم الإيصال / الشيك"
                      value={pay.referenceNo || ''}
                      onChange={e => updatePaymentRow(pay.id, 'referenceNo', e.target.value)}
                      className="w-24 border border-slate-200 rounded p-1 text-[11px]"
                    />

                    <button
                      type="button"
                      onClick={() => removePaymentRow(pay.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 no-print"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Notes */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">شروط وملاحظات الفاتورة</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                placeholder="البضاعة المباعة ترد أو تستبدل خلال 14 يوماً من تاريخ الفاتورة..."
                className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
              />
            </div>
          </div>

          {/* Right: Calculations Summary Card (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900 text-white p-4 rounded-xl shadow-inner space-y-2.5 text-xs font-semibold">
            <h4 className="text-xs font-bold text-amber-400 pb-1 border-b border-slate-800 flex items-center gap-1.5">
              <Calculator className="w-4 h-4" />
              <span>إجماليات الفاتورة والضرائب والخصم</span>
            </h4>

            <div className="flex justify-between items-center text-slate-300">
              <span>إجمالي الأصناف قبل الخصم:</span>
              <span className="font-mono font-bold text-white">
                {calculations.subtotal.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م
              </span>
            </div>

            {/* General Invoice Discount */}
            <div className="flex justify-between items-center text-slate-300">
              <div className="flex items-center gap-1.5">
                <span>خصم إجمالي على الفاتورة:</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={invoiceDiscountPercent}
                  onChange={e => setInvoiceDiscountPercent(Number(e.target.value))}
                  className="w-12 bg-slate-800 text-amber-300 border border-slate-700 rounded px-1 py-0.5 text-center font-mono text-xs"
                />
                <span>%</span>
              </div>
              <span className="font-mono text-amber-400 font-bold">
                -{calculations.invoiceDiscountAmount.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* VAT 14% */}
            <div className="flex justify-between items-center text-slate-300">
              <div className="flex items-center gap-1.5">
                <span>ضريبة القيمة المضافة:</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={taxPercent}
                  onChange={e => setTaxPercent(Number(e.target.value))}
                  className="w-12 bg-slate-800 text-white border border-slate-700 rounded px-1 py-0.5 text-center font-mono text-xs"
                />
                <span>%</span>
              </div>
              <span className="font-mono text-white">
                +{calculations.taxAmount.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Withholding tax 1% (إشعار خصم 1%) */}
            <div className="flex justify-between items-center text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="text-orange-300">إشعار خصم 1% (أ.ت.ص):</span>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={withholdingTaxPercent}
                  onChange={e => setWithholdingTaxPercent(Number(e.target.value))}
                  className="w-12 bg-slate-800 text-orange-300 border border-slate-700 rounded px-1 py-0.5 text-center font-mono text-xs"
                />
                <span>%</span>
              </div>
              <span className="font-mono text-orange-400 font-bold">
                -{calculations.withholdingTaxAmount.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="border-t border-slate-700 pt-2 flex justify-between items-center text-sm font-black text-amber-300">
              <span>صافي القيمة المستحقة:</span>
              <span className="font-mono text-base">
                {calculations.netTotal.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م
              </span>
            </div>

            <div className="flex justify-between items-center text-emerald-400 pt-1 border-t border-slate-800/80">
              <span>إجمالي المسدد (الدفعات):</span>
              <span className="font-mono font-bold">
                {calculations.paidAmount.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م
              </span>
            </div>

            <div className="flex justify-between items-center text-rose-300">
              <span>المتبقي الآجل على العميل:</span>
              <span className="font-mono font-bold">
                {calculations.remainingAmount.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م
              </span>
            </div>
          </div>
        </div>

        {/* Invoice Footer Actions */}
        <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="text-xs text-slate-500">
            * الضغط على حفظ يقوم فورياً بإنشاء القيد المحاسبي المتوازن، خصم كميات الأصناف من المخزن المختار، وتحديث رصيد العميل.
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الفاتورة الضريبية</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/20 cursor-pointer flex items-center gap-1.5"
            >
              <span>{isNewMode ? 'حفظ وترحيل الفاتورة' : 'تحديث الفاتورة'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Modal: Add Customer from inside Invoice */}
      <QuickCustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onCreated={(newCust) => {
          handleCustomerChange(newCust.id);
        }}
      />

      {/* Quick Modal: Add Item from inside Invoice */}
      <QuickItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onCreated={(newItem) => {
          handleAddItemRow(newItem.id);
        }}
      />

      {/* Printable Invoice Modal with Multiple Templates */}
      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        data={{
          title: 'فاتورة مبيعات ضريبية',
          invoiceNo: invoiceNo || 'INV-DRAFT',
          date,
          dueDate,
          partnerType: 'عميل',
          partnerName: customers.find(c => c.id === customerId)?.name || 'عميل نقدي',
          partnerPhone: customers.find(c => c.id === customerId)?.phone,
          partnerAddress: customers.find(c => c.id === customerId)?.address,
          salesRepName,
          warehouseName: warehouses.find(w => w.id === warehouseId)?.name,
          paymentMethod,
          items: invoiceItems,
          subtotal: calculations.subtotal,
          taxPercent,
          taxAmount: calculations.taxAmount,
          withholdingTaxPercent,
          withholdingTaxAmount: calculations.withholdingTaxAmount,
          discountAmount: calculations.invoiceDiscountAmount,
          netTotal: calculations.netTotal,
          paidAmount: calculations.paidAmount,
          remainingAmount: calculations.remainingAmount,
          notes,
          payments
        }}
      />
    </div>
  );
};
