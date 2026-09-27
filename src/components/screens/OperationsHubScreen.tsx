import React, { useState, useMemo } from 'react';
import {
  FileText,
  ShoppingCart,
  RotateCcw,
  Sliders,
  ArrowLeftRight,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  FileDown,
  CreditCard,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Warehouse,
  DollarSign,
  Receipt,
  X,
  Check,
  Calendar,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ScreenId, PaymentMethod } from '../../types';
import { PrintHeader } from '../common/PrintHeader';
import { PrintModal, PrintableInvoiceData } from '../common/PrintModal';

type OperationTypeFilter = 'all' | 'sales' | 'sales_return' | 'purchase' | 'purchase_return' | 'adjustment' | 'transfer';
type PaymentStatusFilter = 'all' | 'paid' | 'partial' | 'unpaid';
type DateRangeFilter = 'all' | 'today' | 'week' | 'month';

interface UnifiedOperationRow {
  id: string;
  docNo: string;
  date: string;
  type: 'sales' | 'sales_return' | 'purchase' | 'purchase_return' | 'adjustment' | 'transfer';
  typeName: string;
  partnerName: string;
  warehouseName: string;
  paymentMethod?: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  netTotal: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: 'مدفوع' | 'جزئي' | 'غير مدفوع' | 'غير مالي';
  targetScreen: ScreenId;
  rawInvoiceId: string;
}

export const OperationsHubScreen: React.FC = () => {
  const {
    salesInvoices,
    salesReturns,
    purchaseInvoices,
    purchaseReturns,
    stockAdjustments,
    warehouseTransfers,
    warehouses,
    cashBanks,
    customers,
    suppliers,
    setCurrentScreen,
    setSelectedOperationTarget,
    recordInvoicePayment,
    company
  } = useApp();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<OperationTypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<PaymentStatusFilter>('all');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRangeFilter>('all');

  // Quick Payment Modal State
  const [paymentModalData, setPaymentModalData] = useState<{
    isOpen: boolean;
    type: 'sales' | 'purchase';
    invoiceId: string;
    invoiceNo: string;
    partnerName: string;
    netTotal: number;
    paidAmount: number;
    remainingAmount: number;
  } | null>(null);

  const [paymentInputAmount, setPaymentInputAmount] = useState<number>(0);
  const [paymentInputMethod, setPaymentInputMethod] = useState<PaymentMethod>('نقدي');
  const [paymentInputCashBank, setPaymentInputCashBank] = useState<string>(cashBanks[0]?.id || '');
  const [paymentInputRef, setPaymentInputRef] = useState<string>('');
  const [paymentInputNotes, setPaymentInputNotes] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Build unified operations data list
  const allOperations: UnifiedOperationRow[] = useMemo(() => {
    const rows: UnifiedOperationRow[] = [];

    // 1. Sales Invoices
    salesInvoices.forEach(inv => {
      const w = warehouses.find(wh => wh.id === inv.warehouseId);
      const isPaid = inv.remainingAmount <= 0;
      const isPartial = inv.paidAmount > 0 && inv.remainingAmount > 0;
      rows.push({
        id: inv.id,
        rawInvoiceId: inv.id,
        docNo: inv.invoiceNo,
        date: inv.date,
        type: 'sales',
        typeName: 'فاتورة مبيعات',
        partnerName: inv.customerName,
        warehouseName: w ? w.name : 'المخزن الرئيسي',
        paymentMethod: inv.paymentMethod,
        subtotal: inv.subtotal,
        taxAmount: inv.taxAmount,
        discountAmount: inv.invoiceDiscountAmount,
        netTotal: inv.netTotal,
        paidAmount: inv.paidAmount,
        remainingAmount: inv.remainingAmount,
        paymentStatus: isPaid ? 'مدفوع' : isPartial ? 'جزئي' : 'غير مدفوع',
        targetScreen: 'sales_invoice'
      });
    });

    // 2. Sales Returns
    salesReturns.forEach(ret => {
      const w = warehouses.find(wh => wh.id === ret.warehouseId);
      rows.push({
        id: ret.id,
        rawInvoiceId: ret.id,
        docNo: ret.returnNo,
        date: ret.date,
        type: 'sales_return',
        typeName: 'مردودات مبيعات',
        partnerName: ret.customerName,
        warehouseName: w ? w.name : 'المخزن الرئيسي',
        paymentMethod: ret.payments && ret.payments.length > 0 ? ret.payments[0].paymentMethod : 'نقدي',
        subtotal: ret.subtotal,
        taxAmount: ret.taxAmount,
        discountAmount: 0,
        netTotal: ret.netTotal,
        paidAmount: ret.netTotal,
        remainingAmount: 0,
        paymentStatus: 'مدفوع',
        targetScreen: 'sales_return'
      });
    });

    // 3. Purchase Invoices
    purchaseInvoices.forEach(inv => {
      const w = warehouses.find(wh => wh.id === inv.warehouseId);
      const isPaid = inv.remainingAmount <= 0;
      const isPartial = inv.paidAmount > 0 && inv.remainingAmount > 0;
      rows.push({
        id: inv.id,
        rawInvoiceId: inv.id,
        docNo: inv.invoiceNo,
        date: inv.date,
        type: 'purchase',
        typeName: 'فاتورة مشتريات',
        partnerName: inv.supplierName,
        warehouseName: w ? w.name : 'المخزن الرئيسي',
        paymentMethod: inv.paymentMethod,
        subtotal: inv.subtotal,
        taxAmount: inv.taxAmount,
        discountAmount: inv.invoiceDiscountAmount,
        netTotal: inv.netTotal,
        paidAmount: inv.paidAmount,
        remainingAmount: inv.remainingAmount,
        paymentStatus: isPaid ? 'مدفوع' : isPartial ? 'جزئي' : 'غير مدفوع',
        targetScreen: 'purchase_invoice'
      });
    });

    // 4. Purchase Returns
    purchaseReturns.forEach(ret => {
      const w = warehouses.find(wh => wh.id === ret.warehouseId);
      rows.push({
        id: ret.id,
        rawInvoiceId: ret.id,
        docNo: ret.returnNo,
        date: ret.date,
        type: 'purchase_return',
        typeName: 'مردودات مشتريات',
        partnerName: ret.supplierName,
        warehouseName: w ? w.name : 'المخزن الرئيسي',
        paymentMethod: ret.payments && ret.payments.length > 0 ? ret.payments[0].paymentMethod : 'نقدي',
        subtotal: ret.subtotal,
        taxAmount: ret.taxAmount,
        discountAmount: 0,
        netTotal: ret.netTotal,
        paidAmount: ret.netTotal,
        remainingAmount: 0,
        paymentStatus: 'مدفوع',
        targetScreen: 'purchase_return'
      });
    });

    // 5. Stock Adjustments
    stockAdjustments.forEach(adj => {
      const w = warehouses.find(wh => wh.id === adj.warehouseId);
      const val = adj.items.reduce((s, i) => s + Math.abs(i.diffQuantity * 100), 0);
      rows.push({
        id: adj.id,
        rawInvoiceId: adj.id,
        docNo: adj.docNo,
        date: adj.date,
        type: 'adjustment',
        typeName: `تسوية (${adj.type})`,
        partnerName: `تسوية جردية - ${adj.notes || 'مخزون'}`,
        warehouseName: w ? w.name : 'المخزن المعني',
        paymentMethod: 'تسوية أصول',
        subtotal: val,
        taxAmount: 0,
        discountAmount: 0,
        netTotal: val,
        paidAmount: val,
        remainingAmount: 0,
        paymentStatus: 'غير مالي',
        targetScreen: 'stock_adjustments'
      });
    });

    // 6. Warehouse Transfers
    warehouseTransfers.forEach(tr => {
      const fromW = warehouses.find(wh => wh.id === tr.fromWarehouseId);
      const toW = warehouses.find(wh => wh.id === tr.toWarehouseId);
      const qtySum = tr.items.reduce((s, i) => s + i.quantity, 0);
      rows.push({
        id: tr.id,
        rawInvoiceId: tr.id,
        docNo: tr.transferNo,
        date: tr.date,
        type: 'transfer',
        typeName: 'تحويل مخزني',
        partnerName: `من: ${fromW?.name || 'مخزن'} إلى: ${toW?.name || 'مخزن'}`,
        warehouseName: `${fromW?.name || ''} ⬅️ ${toW?.name || ''}`,
        paymentMethod: 'تحويل داخلي',
        subtotal: qtySum,
        taxAmount: 0,
        discountAmount: 0,
        netTotal: qtySum,
        paidAmount: qtySum,
        remainingAmount: 0,
        paymentStatus: 'غير مالي',
        targetScreen: 'warehouse_transfer'
      });
    });

    // Sort newest first
    return rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [salesInvoices, salesReturns, purchaseInvoices, purchaseReturns, stockAdjustments, warehouseTransfers, warehouses]);

  // Apply Filters
  const filteredOperations = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return allOperations.filter(row => {
      // Type
      if (typeFilter !== 'all' && row.type !== typeFilter) return false;

      // Status
      if (statusFilter === 'paid' && row.paymentStatus !== 'مدفوع') return false;
      if (statusFilter === 'partial' && row.paymentStatus !== 'جزئي') return false;
      if (statusFilter === 'unpaid' && row.paymentStatus !== 'غير مدفوع') return false;

      // Warehouse
      if (warehouseFilter !== 'all' && !row.warehouseName.includes(warehouseFilter)) return false;

      // Date Range
      if (dateRangeFilter === 'today' && row.date !== todayStr) return false;
      if (dateRangeFilter === 'week' && new Date(row.date) < oneWeekAgo) return false;
      if (dateRangeFilter === 'month' && new Date(row.date) < firstDayOfMonth) return false;

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        const matchDoc = row.docNo.toLowerCase().includes(q);
        const matchPartner = row.partnerName.toLowerCase().includes(q);
        const matchWarehouse = row.warehouseName.toLowerCase().includes(q);
        const matchType = row.typeName.toLowerCase().includes(q);
        if (!matchDoc && !matchPartner && !matchWarehouse && !matchType) return false;
      }

      return true;
    });
  }, [allOperations, typeFilter, statusFilter, warehouseFilter, dateRangeFilter, searchTerm]);

  // Overall Financial KPIs
  const kpis = useMemo(() => {
    const totalSalesAmount = salesInvoices.reduce((s, i) => s + (Number(i.netTotal) || 0), 0);
    const totalSalesPaid = salesInvoices.reduce((s, i) => s + (Number(i.paidAmount) || 0), 0);
    const totalSalesRemaining = salesInvoices.reduce((s, i) => s + (Number(i.remainingAmount) || 0), 0);
    const totalSalesVAT = salesInvoices.reduce((s, i) => s + (Number(i.taxAmount) || 0), 0);

    const totalPurchasesAmount = purchaseInvoices.reduce((s, i) => s + (Number(i.netTotal) || 0), 0);
    const totalPurchasesPaid = purchaseInvoices.reduce((s, i) => s + (Number(i.paidAmount) || 0), 0);
    const totalPurchasesRemaining = purchaseInvoices.reduce((s, i) => s + (Number(i.remainingAmount) || 0), 0);
    const totalPurchasesVAT = purchaseInvoices.reduce((s, i) => s + (Number(i.taxAmount) || 0), 0);

    const totalSalesReturnsAmount = salesReturns.reduce((s, i) => s + (Number(i.netTotal) || 0), 0);
    const totalPurchaseReturnsAmount = purchaseReturns.reduce((s, i) => s + (Number(i.netTotal) || 0), 0);

    const netTrade = (totalSalesAmount - totalSalesReturnsAmount) - (totalPurchasesAmount - totalPurchaseReturnsAmount);

    const unpaidCount = salesInvoices.filter(i => i.remainingAmount > 0).length;

    return {
      totalSalesAmount,
      totalSalesPaid,
      totalSalesRemaining,
      totalSalesVAT,
      salesCount: salesInvoices.length,
      totalPurchasesAmount,
      totalPurchasesPaid,
      totalPurchasesRemaining,
      totalPurchasesVAT,
      purchasesCount: purchaseInvoices.length,
      netTrade,
      unpaidCount,
      adjustmentsCount: stockAdjustments.length,
      transfersCount: warehouseTransfers.length
    };
  }, [salesInvoices, purchaseInvoices, salesReturns, purchaseReturns, stockAdjustments, warehouseTransfers]);

  // Direct Recall to View Invoice in its Screen
  const handleOpenInvoice = (row: UnifiedOperationRow) => {
    setSelectedOperationTarget({
      screen: row.targetScreen,
      id: row.rawInvoiceId,
      invoiceNo: row.docNo
    });
    setCurrentScreen(row.targetScreen);
  };

  // Open Quick Payment Modal
  const handleOpenPaymentModal = (row: UnifiedOperationRow) => {
    if (row.type !== 'sales' && row.type !== 'purchase') return;
    setPaymentModalData({
      isOpen: true,
      type: row.type,
      invoiceId: row.rawInvoiceId,
      invoiceNo: row.docNo,
      partnerName: row.partnerName,
      netTotal: row.netTotal,
      paidAmount: row.paidAmount,
      remainingAmount: row.remainingAmount
    });
    setPaymentInputAmount(row.remainingAmount);
    setPaymentInputMethod((row.paymentMethod as PaymentMethod) || 'نقدي');
    setPaymentInputCashBank(cashBanks[0]?.id || '');
    setPaymentInputRef('');
    setPaymentInputNotes('');
    setStatusMsg(null);
  };

  // Submit Quick Payment
  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalData) return;

    const res = recordInvoicePayment(paymentModalData.type, paymentModalData.invoiceId, {
      amount: paymentInputAmount,
      paymentMethod: paymentInputMethod,
      cashBankId: paymentInputCashBank,
      referenceNumber: paymentInputRef,
      notes: paymentInputNotes
    });

    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message });
      setTimeout(() => {
        setPaymentModalData(null);
        setStatusMsg(null);
      }, 1200);
    } else {
      setStatusMsg({ type: 'error', text: res.message });
    }
  };

  // Export to Excel / CSV
  const handleExportExcel = () => {
    const headers = ['م', 'رقم المستند', 'التاريخ', 'نوع العملية', 'الطرف (العميل/المورد)', 'المستودع', 'طريقة الدفع', 'الإجمالي', 'الضريبة', 'الصافي النهائي', 'المسدد', 'المتبقي', 'حالة السداد'];
    const rows = filteredOperations.map((r, i) => [
      i + 1,
      r.docNo,
      r.date,
      r.typeName,
      r.partnerName,
      r.warehouseName,
      r.paymentMethod || '-',
      r.subtotal.toFixed(2),
      r.taxAmount.toFixed(2),
      r.netTotal.toFixed(2),
      r.paidAmount.toFixed(2),
      r.remainingAmount.toFixed(2),
      r.paymentStatus
    ]);

    const csvContent = '\uFEFF' + [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `سجل_العمليات_والفواتير_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Print Modal State
  const [printModalData, setPrintModalData] = useState<PrintableInvoiceData | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Print individual invoice or operation with templates
  const handlePrintOperation = (row: UnifiedOperationRow) => {
    if (row.type === 'sales') {
      const inv = salesInvoices.find(s => s.id === row.rawInvoiceId);
      if (inv) {
        const cust = customers.find(c => c.id === inv.customerId);
        setPrintModalData({
          title: 'فاتورة مبيعات ضريبية معتمدة',
          invoiceNo: inv.invoiceNo,
          date: inv.date,
          dueDate: inv.dueDate,
          partnerType: 'عميل',
          partnerName: inv.customerName,
          partnerPhone: cust?.phone,
          partnerAddress: cust?.address,
          partnerTaxNo: cust?.linkedAccountCode,
          salesRepName: inv.salesRepName,
          warehouseName: inv.warehouseName,
          paymentMethod: inv.paymentMethod,
          items: inv.items.map(it => ({
            id: it.id,
            itemCode: it.itemCode,
            itemName: it.itemName,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            total: it.total,
            discountPercent: it.discountPercent,
            discountAmount: it.discountAmount,
            net: it.net
          })),
          subtotal: inv.subtotal,
          taxPercent: inv.taxPercent,
          taxAmount: inv.taxAmount,
          withholdingTaxPercent: inv.withholdingTaxPercent,
          withholdingTaxAmount: inv.withholdingTaxAmount,
          discountAmount: inv.invoiceDiscountAmount,
          netTotal: inv.netTotal,
          paidAmount: inv.paidAmount,
          remainingAmount: inv.remainingAmount,
          notes: inv.notes,
          payments: inv.payments
        });
        setIsPrintModalOpen(true);
        return;
      }
    } else if (row.type === 'purchase') {
      const inv = purchaseInvoices.find(p => p.id === row.rawInvoiceId);
      if (inv) {
        const sup = suppliers.find(s => s.id === inv.supplierId);
        setPrintModalData({
          title: 'فاتورة مشتريات وتوريد بضائع',
          invoiceNo: inv.invoiceNo,
          date: inv.date,
          dueDate: inv.dueDate,
          partnerType: 'مورد',
          partnerName: inv.supplierName,
          partnerPhone: sup?.phone,
          partnerAddress: sup?.address,
          partnerTaxNo: sup?.linkedAccountCode,
          warehouseName: inv.warehouseName,
          paymentMethod: inv.paymentMethod,
          items: inv.items.map(it => ({
            id: it.id,
            itemCode: it.itemCode,
            itemName: it.itemName,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            total: it.total,
            discountPercent: it.discountPercent,
            discountAmount: it.discountAmount,
            net: it.net
          })),
          subtotal: inv.subtotal,
          taxPercent: inv.taxPercent,
          taxAmount: inv.taxAmount,
          withholdingTaxPercent: inv.withholdingTaxPercent,
          withholdingTaxAmount: inv.withholdingTaxAmount,
          discountAmount: inv.invoiceDiscountAmount,
          netTotal: inv.netTotal,
          paidAmount: inv.paidAmount,
          remainingAmount: inv.remainingAmount,
          notes: inv.notes,
          payments: inv.payments
        });
        setIsPrintModalOpen(true);
        return;
      }
    } else if (row.type === 'sales_return') {
      const ret = salesReturns.find(r => r.id === row.rawInvoiceId);
      if (ret) {
        setPrintModalData({
          title: 'إشعار دائن - مردود مبيعات',
          invoiceNo: ret.returnNo,
          date: ret.date,
          partnerType: 'عميل',
          partnerName: ret.customerName,
          warehouseName: ret.warehouseName,
          paymentMethod: 'مردود مبيعات',
          items: ret.items.map(it => ({
            id: it.id,
            itemCode: it.itemCode,
            itemName: it.itemName,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            total: it.total,
            net: it.total
          })),
          subtotal: ret.subtotal,
          taxPercent: 14,
          taxAmount: ret.taxAmount,
          discountAmount: 0,
          netTotal: ret.netTotal,
          paidAmount: ret.netTotal,
          remainingAmount: 0,
          notes: ret.notes
        });
        setIsPrintModalOpen(true);
        return;
      }
    } else if (row.type === 'purchase_return') {
      const ret = purchaseReturns.find(r => r.id === row.rawInvoiceId);
      if (ret) {
        setPrintModalData({
          title: 'إشعار مدين - مردود مشتريات',
          invoiceNo: ret.returnNo,
          date: ret.date,
          partnerType: 'مورد',
          partnerName: ret.supplierName,
          warehouseName: ret.warehouseName,
          paymentMethod: 'مردود مشتريات',
          items: ret.items.map(it => ({
            id: it.id,
            itemCode: it.itemCode,
            itemName: it.itemName,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            total: it.total,
            net: it.total
          })),
          subtotal: ret.subtotal,
          taxPercent: 14,
          taxAmount: ret.taxAmount,
          discountAmount: 0,
          netTotal: ret.netTotal,
          paidAmount: ret.netTotal,
          remainingAmount: 0,
          notes: ret.notes
        });
        setIsPrintModalOpen(true);
        return;
      }
    } else if (row.type === 'adjustment') {
      const adj = stockAdjustments.find(a => a.id === row.rawInvoiceId);
      if (adj) {
        setPrintModalData({
          title: `محضر تسوية جردية مخزنية (${adj.type})`,
          invoiceNo: adj.docNo,
          date: adj.date,
          partnerType: 'جهة',
          partnerName: `إدارة المخازن والجرد - ${row.warehouseName}`,
          warehouseName: row.warehouseName,
          paymentMethod: 'تسوية أصول',
          items: adj.items.map(it => ({
            id: it.id,
            itemCode: it.itemCode,
            itemName: it.itemName,
            quantity: Math.abs(it.diffQuantity),
            unitPrice: it.costPrice,
            total: Math.abs(it.diffTotal),
            net: Math.abs(it.diffTotal)
          })),
          subtotal: row.subtotal,
          discountAmount: 0,
          netTotal: row.netTotal,
          paidAmount: row.netTotal,
          remainingAmount: 0,
          notes: adj.notes
        });
        setIsPrintModalOpen(true);
        return;
      }
    } else if (row.type === 'transfer') {
      const trf = warehouseTransfers.find(t => t.id === row.rawInvoiceId);
      if (trf) {
        setPrintModalData({
          title: 'إذن مناقلة وتحويل بضاعة بين المستودعات',
          invoiceNo: trf.transferNo,
          date: trf.date,
          partnerType: 'جهة',
          partnerName: row.partnerName,
          warehouseName: row.warehouseName,
          paymentMethod: 'تحويل مخزني داخلي',
          items: trf.items.map(it => ({
            id: it.id,
            itemCode: it.itemCode,
            itemName: it.itemName,
            quantity: it.quantity,
            unitPrice: 0,
            total: 0,
            net: 0
          })),
          subtotal: 0,
          discountAmount: 0,
          netTotal: 0,
          paidAmount: 0,
          remainingAmount: 0,
          notes: trf.notes
        });
        setIsPrintModalOpen(true);
        return;
      }
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in pb-12">
      {/* Print Header */}
      <div className="print-only">
        <PrintHeader title="سجل ومركز الفواتير والعمليات الشامل" docNumber="OPS-ALL" date={new Date().toISOString().split('T')[0]} />
      </div>

      {/* Screen Title & Top Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-200 pb-4 no-print">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-teal-600 to-emerald-700 text-white rounded-2xl shadow-lg shadow-teal-600/20">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">مركز وسجل الفواتير والعمليات</h1>
              <span className="bg-teal-100 text-teal-800 text-xs px-2.5 py-0.5 rounded-full font-bold border border-teal-200">
                {filteredOperations.length} حركة مسجلة
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              المنظومة التنفيذية لإدارة فواتير المبيعات، المشتريات، المردودات، والتحويلات والتسويات المخزنية
            </p>
          </div>
        </div>

        {/* Quick Create Buttons Bar */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCurrentScreen('sales_invoice')}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>فاتورة مبيعات</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentScreen('purchase_invoice')}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>فاتورة مشتريات</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentScreen('sales_return')}
            className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-600/20 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>مردود مبيعات</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentScreen('stock_adjustments')}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-600/20 transition cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>تسوية جردية</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentScreen('warehouse_transfer')}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>تحويل مخزني</span>
          </button>

          <div className="h-6 w-px bg-slate-300 mx-1 hidden sm:block" />

          <button
            type="button"
            onClick={handleExportExcel}
            className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
            title="تصدير السجل إلى Excel"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
            title="طباعة السجل"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>طباعة</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const originalTitle = document.title;
              document.title = `سجل_العمليات_والفواتير_${new Date().toISOString().split('T')[0]}`;
              window.print();
              setTimeout(() => { document.title = originalTitle; }, 1500);
            }}
            className="flex items-center gap-1 px-3 py-2 bg-rose-50 border border-rose-300 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition cursor-pointer"
            title="طباعة وتصدير السجل بتنسيق PDF"
          >
            <FileDown className="w-3.5 h-3.5 text-rose-600" />
            <span>طباعة PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 no-print">
        {/* Total Sales */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[11px] font-bold text-slate-500">إجمالي المبيعات</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-base font-black text-slate-900 font-mono">
            {kpis.totalSalesAmount.toLocaleString('ar-EG', { minimumFractionDigits: 0 })} <span className="text-[10px] font-normal text-slate-500">ج.م</span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium flex justify-between">
            <span>{kpis.salesCount} فاتورة</span>
            <span className="text-emerald-700 font-bold">محصل: {kpis.totalSalesPaid.toLocaleString('ar-EG')}</span>
          </div>
        </div>

        {/* Total Purchases */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-[11px] font-bold text-slate-500">إجمالي المشتريات</span>
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div className="text-base font-black text-slate-900 font-mono">
            {kpis.totalPurchasesAmount.toLocaleString('ar-EG', { minimumFractionDigits: 0 })} <span className="text-[10px] font-normal text-slate-500">ج.م</span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium flex justify-between">
            <span>{kpis.purchasesCount} فاتورة</span>
            <span className="text-blue-700 font-bold">مسدد: {kpis.totalPurchasesPaid.toLocaleString('ar-EG')}</span>
          </div>
        </div>

        {/* Net Flow */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-indigo-600">
            <span className="text-[11px] font-bold text-slate-500">صافي المبيعات التجارية</span>
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="text-base font-black text-slate-900 font-mono">
            {kpis.netTrade.toLocaleString('ar-EG', { minimumFractionDigits: 0 })} <span className="text-[10px] font-normal text-slate-500">ج.م</span>
          </div>
          <div className="text-[10px] text-indigo-600 font-semibold">
            {kpis.netTrade >= 0 ? 'فائض تشغيلي إيجابي' : 'عجز في السيولة'}
          </div>
        </div>

        {/* Unpaid Debt */}
        <div className="bg-white border border-rose-100 rounded-2xl p-3.5 shadow-sm space-y-1 bg-rose-50/30">
          <div className="flex items-center justify-between text-rose-600">
            <span className="text-[11px] font-bold text-rose-700">مديونيات عملاء آجلة</span>
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="text-base font-black text-rose-700 font-mono">
            {kpis.totalSalesRemaining.toLocaleString('ar-EG', { minimumFractionDigits: 0 })} <span className="text-[10px] font-normal text-slate-500">ج.م</span>
          </div>
          <div className="text-[10px] text-rose-600 font-bold">
            {kpis.unpaidCount} فاتورة بانتظار التحصيل
          </div>
        </div>

        {/* VAT Tax */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-teal-600">
            <span className="text-[11px] font-bold text-slate-500">ضريبة ق.م محصلة 14%</span>
            <Receipt className="w-4 h-4" />
          </div>
          <div className="text-base font-black text-slate-900 font-mono">
            {kpis.totalSalesVAT.toLocaleString('ar-EG', { minimumFractionDigits: 0 })} <span className="text-[10px] font-normal text-slate-500">ج.م</span>
          </div>
          <div className="text-[10px] text-slate-400">
            مدخلات: {kpis.totalPurchasesVAT.toLocaleString('ar-EG')} ج.م
          </div>
        </div>

        {/* Warehouse Adjustments & Transfers */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-[11px] font-bold text-slate-500">عمليات المخازن</span>
            <Warehouse className="w-4 h-4" />
          </div>
          <div className="text-base font-black text-slate-900 font-mono">
            {kpis.adjustmentsCount + kpis.transfersCount} <span className="text-[10px] font-normal text-slate-500">عملية</span>
          </div>
          <div className="text-[10px] text-slate-400">
            {kpis.adjustmentsCount} تسوية | {kpis.transfersCount} تحويل
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3 no-print">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="بحث برقم الفاتورة، اسم العميل، اسم المورد..."
              className="w-full pr-9 pl-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-semibold"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Operation Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as OperationTypeFilter)}
              className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-bold text-slate-700 cursor-pointer"
            >
              <option value="all">كل العمليات والفواتير</option>
              <option value="sales">فواتير مبيعات فقط</option>
              <option value="sales_return">مردودات مبيعات</option>
              <option value="purchase">فواتير مشتريات فقط</option>
              <option value="purchase_return">مردودات مشتريات</option>
              <option value="adjustment">تسويات جردية</option>
              <option value="transfer">تحويلات بين المخازن</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as PaymentStatusFilter)}
              className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-bold text-slate-700 cursor-pointer"
            >
              <option value="all">كافة حالات السداد</option>
              <option value="paid">مسدد بالكامل (خالص)</option>
              <option value="partial">مسدد جزئياً (متبقي رصيد)</option>
              <option value="unpaid">آجل لم يسدد</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <select
              value={dateRangeFilter}
              onChange={e => setDateRangeFilter(e.target.value as DateRangeFilter)}
              className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-bold text-slate-700 cursor-pointer"
            >
              <option value="all">كل الفترات الزمنية</option>
              <option value="today">فواتير اليوم فقط</option>
              <option value="week">آخر 7 أيام</option>
              <option value="month">الشهر الحالي</option>
            </select>
          </div>
        </div>

        {/* Active Filters Row */}
        {(typeFilter !== 'all' || statusFilter !== 'all' || dateRangeFilter !== 'all' || searchTerm) && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-bold text-teal-700">تصفية نشطة:</span>
              <span>عرض {filteredOperations.length} من أصل {allOperations.length} حركة</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setTypeFilter('all');
                setStatusFilter('all');
                setDateRangeFilter('all');
                setSearchTerm('');
              }}
              className="text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>إلغاء التصفية وإعادة ضبط</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Operations Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden print-card">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-black text-slate-800">جدول كشف الحركات والعمليات الشامل</h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            تحديث فوري ومتزامن مع المستودعات والأرصدة
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="p-3 text-center">م</th>
                <th className="p-3">رقم المستند</th>
                <th className="p-3">التاريخ</th>
                <th className="p-3">نوع الحركة</th>
                <th className="p-3">الطرف / البيان</th>
                <th className="p-3">المستودع</th>
                <th className="p-3">الدفع</th>
                <th className="p-3 text-left">الصافي</th>
                <th className="p-3 text-left">المسدد</th>
                <th className="p-3 text-left">المتبقي</th>
                <th className="p-3 text-center">الحالة</th>
                <th className="p-3 text-center no-print">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOperations.length === 0 ? (
                <tr>
                  <td colSpan={12} className="p-8 text-center text-slate-400">
                    لا توجد فواتير أو حركات تطابق معايير البحث المحددة
                  </td>
                </tr>
              ) : (
                filteredOperations.map((row, index) => {
                  return (
                    <tr key={row.id + index} className="hover:bg-teal-50/40 transition">
                      <td className="p-3 text-center font-bold text-slate-400">{index + 1}</td>
                      <td className="p-3 font-mono font-bold text-slate-800">
                        <button
                          type="button"
                          onClick={() => handleOpenInvoice(row)}
                          className="hover:text-blue-600 hover:underline cursor-pointer"
                          title="استدعاء ومعاينة الفاتورة"
                        >
                          {row.docNo}
                        </button>
                      </td>
                      <td className="p-3 text-slate-600 font-mono">{row.date}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          row.type === 'sales'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : row.type === 'purchase'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : row.type === 'sales_return'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : row.type === 'purchase_return'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {row.typeName}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-800 max-w-[200px] truncate" title={row.partnerName}>
                        {row.partnerName}
                      </td>
                      <td className="p-3 text-slate-600 text-[11px]">{row.warehouseName}</td>
                      <td className="p-3 font-semibold text-slate-700">{row.paymentMethod || '-'}</td>
                      <td className="p-3 text-left font-mono font-bold text-slate-900">
                        {row.netTotal.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-left font-mono text-emerald-700 font-bold">
                        {row.paidAmount.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-left font-mono font-bold text-rose-600">
                        {row.remainingAmount > 0 ? row.remainingAmount.toLocaleString('ar-EG', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          row.paymentStatus === 'مدفوع'
                            ? 'bg-emerald-100 text-emerald-800'
                            : row.paymentStatus === 'جزئي'
                            ? 'bg-amber-100 text-amber-800'
                            : row.paymentStatus === 'غير مدفوع'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {row.paymentStatus}
                        </span>
                      </td>
                      <td className="p-3 text-center no-print">
                        <div className="flex items-center justify-center gap-1">
                          {/* Recall Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenInvoice(row)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            title="استدعاء وتعديل الفاتورة"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Print with Multiple Templates */}
                          <button
                            type="button"
                            onClick={() => handlePrintOperation(row)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                            title="طباعة واختيار نموذج الطباعة (ضريبي / كاشير / عصري / تسليم)"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Quick Payment Button (for sales/purchase with remaining debt) */}
                          {(row.type === 'sales' || row.type === 'purchase') && row.remainingAmount > 0 && (
                            <button
                              type="button"
                              onClick={() => handleOpenPaymentModal(row)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                              title="تسجيل دفعة سداد جديدة"
                            >
                              <CreditCard className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {/* Table Footer Totals */}
            <tfoot className="bg-slate-50 border-t-2 border-slate-300 font-black text-slate-800">
              <tr>
                <td colSpan={7} className="p-3 text-right">الإجمالي لعدد ({filteredOperations.length}) حركة معروضة:</td>
                <td className="p-3 text-left font-mono text-slate-900">
                  {filteredOperations.reduce((s, i) => s + i.netTotal, 0).toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-3 text-left font-mono text-emerald-700">
                  {filteredOperations.reduce((s, i) => s + i.paidAmount, 0).toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-3 text-left font-mono text-rose-600">
                  {filteredOperations.reduce((s, i) => s + i.remainingAmount, 0).toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Quick Payment Modal */}
      {paymentModalData && paymentModalData.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 no-print">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-600 text-white rounded-xl">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">تسجيل دفعة سداد فورية</h3>
                  <p className="text-[11px] text-slate-400">
                    {paymentModalData.type === 'sales' ? 'تحصيل من عميل' : 'سداد لمورد'} - فاتورة {paymentModalData.invoiceNo}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPaymentModalData(null)}
                className="text-slate-400 hover:text-white rounded-lg p-1 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="p-5 space-y-4 text-xs">
              {statusMsg && (
                <div className={`p-3 rounded-xl font-bold flex items-center gap-2 ${
                  statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{statusMsg.text}</span>
                </div>
              )}

              {/* Invoice Summary Box */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">الطرف:</span>
                  <span className="font-bold text-slate-900">{paymentModalData.partnerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">إجمالي الفاتورة:</span>
                  <span className="font-mono font-bold text-slate-900">{paymentModalData.netTotal.toLocaleString('ar-EG')} ج.م</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">المسدد سابقاً:</span>
                  <span className="font-mono font-bold text-emerald-700">{paymentModalData.paidAmount.toLocaleString('ar-EG')} ج.م</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 text-sm">
                  <span className="text-rose-600 font-bold">المتبقي المستحق:</span>
                  <span className="font-mono font-black text-rose-600">{paymentModalData.remainingAmount.toLocaleString('ar-EG')} ج.م</span>
                </div>
              </div>

              {/* Amount to Pay */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">مبلغ الدفعة الحالية (ج.م) *</label>
                <input
                  type="number"
                  step="0.01"
                  max={paymentModalData.remainingAmount}
                  value={paymentInputAmount}
                  onChange={e => setPaymentInputAmount(Number(e.target.value))}
                  className="w-full text-base font-bold font-mono border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 bg-white"
                  required
                />
              </div>

              {/* Method and CashBank */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">طريقة الدفع *</label>
                  <select
                    value={paymentInputMethod}
                    onChange={e => setPaymentInputMethod(e.target.value as PaymentMethod)}
                    className="w-full border border-slate-300 rounded-xl p-2 font-bold bg-white"
                  >
                    <option value="نقدي">نقدي</option>
                    <option value="فيزا">فيزا / بطاقة</option>
                    <option value="تحويل بنكي">تحويل بنكي</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الخزينة / البنك *</label>
                  <select
                    value={paymentInputCashBank}
                    onChange={e => setPaymentInputCashBank(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2 font-bold bg-white"
                    required
                  >
                    {cashBanks.map(cb => (
                      <option key={cb.id} value={cb.id}>{cb.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reference */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">رقم الإيصال / الحوالة / الشيك</label>
                <input
                  type="text"
                  value={paymentInputRef}
                  onChange={e => setPaymentInputRef(e.target.value)}
                  placeholder="رقم مرجعي اختياري"
                  className="w-full border border-slate-300 rounded-xl p-2 font-mono"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات وبيان الدفعة</label>
                <input
                  type="text"
                  value={paymentInputNotes}
                  onChange={e => setPaymentInputNotes(e.target.value)}
                  placeholder="ملاحظات تظهر بسند القبض/الصرف"
                  className="w-full border border-slate-300 rounded-xl p-2"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalData(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>تأكيد السداد وتوليد السند</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Templates Modal */}
      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        data={printModalData}
      />
    </div>
  );
};
