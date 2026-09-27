import React, { useState, useMemo, useEffect } from 'react';
import {
  GitBranch,
  Plus,
  Folder,
  FolderOpen,
  FileText,
  ChevronRight,
  ChevronDown,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Scale,
  Search,
  Filter,
  Layers,
  ArrowRightLeft,
  X,
  RotateCcw,
  SlidersHorizontal,
  Maximize2,
  Minimize2,
  Tag,
  FileSpreadsheet,
  Printer,
  Download,
  Eye,
  FileDown,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AccountNode, AccountCategory, AccountNature, FinancialStatement, LinkedModuleType } from '../../types';
import { ActionBar } from '../common/ActionBar';
import { PrintHeader } from '../common/PrintHeader';

export const AccountsScreen: React.FC = () => {
  const {
    accounts,
    addAccount,
    updateAccount,
    deleteAccount,
    journalEntries,
    canAccess,
    company,
    currentUser
  } = useApp();

  const [activeTab, setActiveTab] = useState<'tree' | 'trial_balance'>('tree');
  const [selectedCode, setSelectedCode] = useState<string>(accounts[0]?.code || '1');
  const [expandedCodes, setExpandedCodes] = useState<Record<string, boolean>>({
    '1': true,
    '11': true,
    '111': true,
    '2': true,
    '3': true,
    '4': true,
    '5': true
  });

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [natureFilter, setNatureFilter] = useState<'all' | 'debit' | 'credit'>('all');
  const [structureFilter, setStructureFilter] = useState<'all' | 'parent' | 'terminal'>('all');
  const [linkedModuleFilter, setLinkedModuleFilter] = useState<string>('all');

  // Export & PDF Preview Modal States
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfScope, setPdfScope] = useState<'all' | 'filtered'>('all');
  const [showPdfBalances, setShowPdfBalances] = useState(true);
  const [pdfStructureFilter, setPdfStructureFilter] = useState<'all' | 'parent' | 'terminal'>('all');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  // Form State
  const [isNewMode, setIsNewMode] = useState(false);
  const [code, setCode] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [parentCode, setParentCode] = useState<string | null>(null);
  const [category, setCategory] = useState<AccountCategory>('asset');
  const [nature, setNature] = useState<AccountNature>('debit');
  const [statement, setStatement] = useState<FinancialStatement>('balance_sheet');
  const [level, setLevel] = useState<number>(1);
  const [isParent, setIsParent] = useState<boolean>(false);
  const [linkedModule, setLinkedModule] = useState<LinkedModuleType>('general');
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Selected Account details
  const selectedAccount = useMemo(() => {
    return accounts.find(a => a.code === selectedCode);
  }, [accounts, selectedCode]);

  // Set form to selected account
  useEffect(() => {
    if (selectedAccount && !isNewMode) {
      setCode(selectedAccount.code);
      setNameAr(selectedAccount.nameAr);
      setNameEn(selectedAccount.nameEn || '');
      setParentCode(selectedAccount.parentCode || null);
      setCategory(selectedAccount.category);
      setNature(selectedAccount.nature);
      setStatement(selectedAccount.statement);
      setLevel(selectedAccount.level);
      setIsParent(selectedAccount.isParent);
      setLinkedModule(selectedAccount.linkedModule || 'general');
      setOpeningBalance(selectedAccount.openingBalance || 0);
      setNotes(selectedAccount.notes || '');
    }
  }, [selectedAccount, isNewMode]);

  const toggleExpand = (accountCode: string) => {
    setExpandedCodes(prev => ({ ...prev, [accountCode]: !prev[accountCode] }));
  };

  const handleExpandAll = () => {
    const allExp: Record<string, boolean> = {};
    accounts.forEach(a => {
      allExp[a.code] = true;
    });
    setExpandedCodes(allExp);
  };

  const handleCollapseAll = () => {
    // Only keep level 1 roots
    const rootExp: Record<string, boolean> = {};
    accounts.filter(a => !a.parentCode).forEach(a => {
      rootExp[a.code] = false;
    });
    setExpandedCodes(rootExp);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setNatureFilter('all');
    setStructureFilter('all');
    setLinkedModuleFilter('all');
  };

  const isFiltered = useMemo(() => {
    return (
      searchQuery.trim() !== '' ||
      categoryFilter !== 'all' ||
      natureFilter !== 'all' ||
      structureFilter !== 'all' ||
      linkedModuleFilter !== 'all'
    );
  }, [searchQuery, categoryFilter, natureFilter, structureFilter, linkedModuleFilter]);

  // Group accounts in hierarchy
  const accountMap = useMemo(() => {
    const map: Record<string, AccountNode[]> = {};
    accounts.forEach(acc => {
      const p = acc.parentCode || 'ROOT';
      if (!map[p]) map[p] = [];
      map[p].push(acc);
    });
    // Sort by code
    Object.keys(map).forEach(key => {
      map[key].sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
    });
    return map;
  }, [accounts]);

  // Set of account codes that match current search & filter criteria directly
  const matchingCodes = useMemo(() => {
    const set = new Set<string>();
    const query = searchQuery.trim().toLowerCase();

    accounts.forEach(acc => {
      // 1. Search Query filter (code, nameAr, nameEn, notes)
      if (query) {
        const matchCode = acc.code.toLowerCase().includes(query);
        const matchNameAr = acc.nameAr.toLowerCase().includes(query);
        const matchNameEn = (acc.nameEn || '').toLowerCase().includes(query);
        const matchNotes = (acc.notes || '').toLowerCase().includes(query);
        if (!matchCode && !matchNameAr && !matchNameEn && !matchNotes) {
          return;
        }
      }

      // 2. Category filter (Account Type)
      if (categoryFilter !== 'all' && acc.category !== categoryFilter) {
        return;
      }

      // 3. Nature filter (Debit / Credit)
      if (natureFilter !== 'all' && acc.nature !== natureFilter) {
        return;
      }

      // 4. Structure filter (Parent vs Terminal)
      if (structureFilter === 'parent' && !acc.isParent) {
        return;
      }
      if (structureFilter === 'terminal' && acc.isParent) {
        return;
      }

      // 5. Linked Module filter
      if (linkedModuleFilter !== 'all' && (acc.linkedModule || 'general') !== linkedModuleFilter) {
        return;
      }

      set.add(acc.code);
    });

    return set;
  }, [accounts, searchQuery, categoryFilter, natureFilter, structureFilter, linkedModuleFilter]);

  // Matching accounts list for quick preview / navigation
  const matchingAccountsList = useMemo(() => {
    return accounts.filter(a => matchingCodes.has(a.code));
  }, [accounts, matchingCodes]);

  // Auto expand ancestors when filters or search query change
  useEffect(() => {
    if (isFiltered && matchingCodes.size > 0) {
      const toExp: Record<string, boolean> = {};
      matchingAccountsList.forEach(acc => {
        let p = acc.parentCode;
        while (p) {
          toExp[p] = true;
          const parentAcc = accounts.find(a => a.code === p);
          p = parentAcc?.parentCode || null;
        }
      });
      setExpandedCodes(prev => ({ ...prev, ...toExp }));
    }
  }, [isFiltered, matchingCodes, matchingAccountsList, accounts]);

  // Determine which codes should be visible in tree to preserve hierarchy paths
  const visibleTreeCodes = useMemo(() => {
    if (!isFiltered) return null; // show all
    const visible = new Set<string>();

    const checkNode = (code: string): boolean => {
      const directMatch = matchingCodes.has(code);
      const children = accountMap[code] || [];
      let childMatch = false;
      for (const child of children) {
        if (checkNode(child.code)) {
          childMatch = true;
        }
      }
      if (directMatch || childMatch) {
        visible.add(code);
        return true;
      }
      return false;
    };

    (accountMap['ROOT'] || []).forEach(root => checkNode(root.code));
    return visible;
  }, [isFiltered, matchingCodes, accountMap]);

  // Calculate Trial Balance Balances
  const trialBalanceData = useMemo(() => {
    return accounts.map(acc => {
      let debitMovements = 0;
      let creditMovements = 0;

      journalEntries.forEach(entry => {
        entry.lines.forEach(line => {
          if (line.accountCode === acc.code || line.accountCode.startsWith(acc.code)) {
            debitMovements += line.debit;
            creditMovements += line.credit;
          }
        });
      });

      // Opening balance
      const opDebit = acc.nature === 'debit' ? acc.openingBalance : 0;
      const opCredit = acc.nature === 'credit' ? acc.openingBalance : 0;

      const totalDebit = opDebit + debitMovements;
      const totalCredit = opCredit + creditMovements;

      let endingDebit = 0;
      let endingCredit = 0;

      if (totalDebit >= totalCredit) {
        endingDebit = totalDebit - totalCredit;
      } else {
        endingCredit = totalCredit - totalDebit;
      }

      return {
        ...acc,
        opDebit,
        opCredit,
        debitMovements,
        creditMovements,
        totalDebit,
        totalCredit,
        endingDebit,
        endingCredit
      };
    });
  }, [accounts, journalEntries]);

  // Filtered trial balance rows
  const filteredTrialBalanceData = useMemo(() => {
    if (!isFiltered) return trialBalanceData;
    return trialBalanceData.filter(row => matchingCodes.has(row.code));
  }, [trialBalanceData, isFiltered, matchingCodes]);

  // Totals for Trial Balance
  const trialTotals = useMemo(() => {
    // Only sum terminal accounts (not parent accounts) to avoid double counting
    const sourceRows = filteredTrialBalanceData;
    const terminalRows = sourceRows.filter(r => !r.isParent);
    const rowsToSum = terminalRows.length > 0 ? terminalRows : sourceRows;

    return {
      opDebit: rowsToSum.reduce((s, r) => s + r.opDebit, 0),
      opCredit: rowsToSum.reduce((s, r) => s + r.opCredit, 0),
      debitMovements: rowsToSum.reduce((s, r) => s + r.debitMovements, 0),
      creditMovements: rowsToSum.reduce((s, r) => s + r.creditMovements, 0),
      totalDebit: rowsToSum.reduce((s, r) => s + r.totalDebit, 0),
      totalCredit: rowsToSum.reduce((s, r) => s + r.totalCredit, 0),
      endingDebit: rowsToSum.reduce((s, r) => s + r.endingDebit, 0),
      endingCredit: rowsToSum.reduce((s, r) => s + r.endingCredit, 0),
    };
  }, [filteredTrialBalanceData]);

  // Actions
  const handleNew = () => {
    setIsNewMode(true);
    // Suggest code based on selected parent or root
    const parent = selectedAccount;
    if (parent) {
      setParentCode(parent.code);
      setCategory(parent.category);
      setNature(parent.nature);
      setStatement(parent.statement);
      setLevel(parent.level + 1);
      setLinkedModule(parent.linkedModule || 'general');

      // Auto generate next sub code
      const siblings = accounts.filter(a => a.parentCode === parent.code);
      const nextNum = siblings.length + 1;
      setCode(`${parent.code}${nextNum}`);
    } else {
      setParentCode(null);
      setCode('6');
      setLevel(1);
    }
    setNameAr('');
    setNameEn('');
    setIsParent(false);
    setOpeningBalance(0);
    setNotes('');
    setStatusMessage(null);
  };

  const handleSave = () => {
    if (!code.trim() || !nameAr.trim()) {
      setStatusMessage({ type: 'error', text: 'يرجى إدخال كود الحساب واسم الحساب باللغة العربية' });
      return;
    }

    const newAccount: AccountNode = {
      code: code.trim(),
      nameAr: nameAr.trim(),
      nameEn: nameEn.trim() || undefined,
      parentCode: parentCode || null,
      category,
      nature,
      statement,
      level,
      isParent,
      linkedModule,
      openingBalance: Number(openingBalance) || 0,
      notes: notes.trim() || undefined
    };

    if (isNewMode) {
      if (accounts.some(a => a.code === newAccount.code)) {
        setStatusMessage({ type: 'error', text: 'كود الحساب موجود بالفعل! اختر كوداً آخر' });
        return;
      }
      addAccount(newAccount);
      // Mark parent as isParent true
      if (parentCode) {
        updateAccount(parentCode, { isParent: true });
        setExpandedCodes(prev => ({ ...prev, [parentCode]: true }));
      }
      setStatusMessage({ type: 'success', text: `تمت إضافة الحساب ${newAccount.code} بنجاح` });
    } else {
      updateAccount(code, newAccount);
      setStatusMessage({ type: 'success', text: `تم تحديث الحساب ${code} بنجاح` });
    }

    setIsNewMode(false);
    setSelectedCode(newAccount.code);
  };

  const handleDelete = () => {
    if (!selectedAccount) return;
    if (selectedAccount.isParent) {
      setStatusMessage({ type: 'error', text: 'لا يمكن حذف حساب رئيسي يحتوي على حسابات فرعية' });
      return;
    }
    const hasMovements = journalEntries.some(j => j.lines.some(l => l.accountCode === selectedAccount.code));
    if (hasMovements) {
      setStatusMessage({ type: 'error', text: 'لا يمكن حذف هذا الحساب لأنه مسجل به حركات وقيود محاسبية' });
      return;
    }

    if (confirm(`هل أنت متأكد من حذف الحساب (${selectedAccount.code} - ${selectedAccount.nameAr})؟`)) {
      const ok = deleteAccount(selectedAccount.code);
      if (ok) {
        setStatusMessage({ type: 'success', text: 'تم حذف الحساب بنجاح' });
        setSelectedCode(accounts[0]?.code || '1');
      } else {
        setStatusMessage({ type: 'error', text: 'تعذر حذف الحساب' });
      }
    }
  };

  // Helper to map and enrich account rows with labels and trial balance movements
  const getEnrichedAccountRows = (sourceAccounts: AccountNode[]) => {
    const categoryLabels: Record<AccountCategory, string> = {
      asset: 'الأصول (Assets)',
      liability: 'الخصوم والالتزامات (Liabilities)',
      equity: 'حقوق الملكية (Equity)',
      revenue: 'الإيرادات (Revenues)',
      expense: 'المصروفات (Expenses)'
    };

    const linkedLabels: Record<string, string> = {
      cash_bank: 'خزائن وبنوك',
      customers: 'عملاء ومدينين',
      suppliers: 'موردين ودائنين',
      sales: 'مبيعات',
      purchases: 'مشتريات',
      inventory: 'مخازن ومخزون',
      cogs: 'تكلفة مبيعات',
      taxes: 'ضرائب',
      expenses: 'مصروفات',
      general: 'حساب عام'
    };

    return sourceAccounts.map(acc => {
      const parentAcc = accounts.find(a => a.code === acc.parentCode);
      const tb = trialBalanceData.find(t => t.code === acc.code);

      return {
        code: acc.code,
        nameAr: acc.nameAr,
        nameEn: acc.nameEn || '',
        level: acc.level,
        parentCode: acc.parentCode || '-',
        parentName: parentAcc?.nameAr || '-',
        category: acc.category,
        categoryName: categoryLabels[acc.category] || acc.category,
        nature: acc.nature,
        natureName: acc.nature === 'debit' ? 'مدين' : 'دائن',
        isParent: acc.isParent,
        structureName: acc.isParent ? 'رئيسي (تجميعي)' : 'فرعي تحليلي (يقبل القيود)',
        statementName: acc.statement === 'balance_sheet' ? 'الميزانية العمومية' : 'قائمة الدخل',
        linkedModuleName: linkedLabels[acc.linkedModule || 'general'] || 'حساب عام',
        notes: acc.notes || '',
        opDebit: tb?.opDebit || 0,
        opCredit: tb?.opCredit || 0,
        debitMovements: tb?.debitMovements || 0,
        creditMovements: tb?.creditMovements || 0,
        endingDebit: tb?.endingDebit || 0,
        endingCredit: tb?.endingCredit || 0,
        netBalance: (tb?.endingDebit || 0) - (tb?.endingCredit || 0)
      };
    });
  };

  // Export to Microsoft Excel (.xls XML/HTML format with full formatting and RTL)
  const handleExportExcel = (scope: 'all' | 'filtered' = 'all') => {
    const listToExport = scope === 'filtered' && isFiltered ? matchingAccountsList : accounts;
    if (listToExport.length === 0) {
      setStatusMessage({ type: 'error', text: 'لا توجد حسابات لتصديرها طبقاً للتصفية المحددة' });
      return;
    }

    const rows = getEnrichedAccountRows(listToExport);
    const dateStr = new Date().toLocaleDateString('ar-EG');
    const timeStr = new Date().toLocaleTimeString('ar-EG');

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>دليل الحسابات</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayRightToLeft/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; }
          table { border-collapse: collapse; width: 100%; direction: rtl; }
          th { background-color: #1e3a8a; color: #ffffff; font-weight: bold; border: 1px solid #0f172a; padding: 8px 10px; font-size: 11pt; }
          td { border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 10pt; }
          .text { mso-number-format:"\\@"; text-align: right; }
          .center { text-align: center; }
          .num { mso-number-format:"\\#,##0.00"; text-align: left; }
          .header-main { font-size: 16pt; font-weight: bold; color: #1e3a8a; text-align: center; }
          .header-sub { font-size: 11pt; color: #475569; text-align: center; }
          .parent-acc { background-color: #f1f5f9; font-weight: bold; }
          .total-row { background-color: #0f172a; color: #ffffff; font-weight: bold; }
        </style>
      </head>
      <body>
        <table>
          <tr>
            <td colspan="17" class="header-main">${company.name}</td>
          </tr>
          <tr>
            <td colspan="17" class="header-sub">
              دليل وشجرة الحسابات المالية العامة (${scope === 'filtered' ? 'الحسابات المفلترة' : 'كافة الحسابات'}) | تاريخ الإصدار: ${dateStr} ${timeStr} | إجمالي الحسابات: ${rows.length}
            </td>
          </tr>
          <tr><td colspan="17"></td></tr>
          <thead>
            <tr>
              <th>كود الحساب</th>
              <th>اسم الحساب (عربي)</th>
              <th>اسم الحساب (إنجليزي)</th>
              <th>المستوى</th>
              <th>كود الرئيسي</th>
              <th>اسم الحساب الرئيسي</th>
              <th>التصنيف</th>
              <th>طبيعة الحساب</th>
              <th>هيكل الحساب</th>
              <th>الرصيد الافتتاحي مدين</th>
              <th>الرصيد الافتتاحي دائن</th>
              <th>حركات الفترة مدين</th>
              <th>حركات الفترة دائن</th>
              <th>الرصيد الختامي مدين</th>
              <th>الرصيد الختامي دائن</th>
              <th>القائمة المالية</th>
              <th>الربط الموديولي</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(r => `
              <tr class="${r.isParent ? 'parent-acc' : ''}">
                <td class="text center">${r.code}</td>
                <td class="text">${r.nameAr}</td>
                <td class="text">${r.nameEn}</td>
                <td class="center">${r.level}</td>
                <td class="text center">${r.parentCode}</td>
                <td class="text">${r.parentName}</td>
                <td class="center">${r.categoryName}</td>
                <td class="center">${r.natureName}</td>
                <td class="center">${r.structureName}</td>
                <td class="num">${r.opDebit ? r.opDebit.toFixed(2) : '0.00'}</td>
                <td class="num">${r.opCredit ? r.opCredit.toFixed(2) : '0.00'}</td>
                <td class="num">${r.debitMovements ? r.debitMovements.toFixed(2) : '0.00'}</td>
                <td class="num">${r.creditMovements ? r.creditMovements.toFixed(2) : '0.00'}</td>
                <td class="num">${r.endingDebit ? r.endingDebit.toFixed(2) : '0.00'}</td>
                <td class="num">${r.endingCredit ? r.endingCredit.toFixed(2) : '0.00'}</td>
                <td class="center">${r.statementName}</td>
                <td class="center">${r.linkedModuleName}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanCompanyName = (company.name || 'الشركة').replace(/[^\u0621-\u064A\w]/g, '_');
    const fileName = `دليل_الحسابات_${cleanCompanyName}_${scope === 'filtered' ? 'مفلتر_' : ''}${new Date().toISOString().slice(0, 10)}.xls`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsExportMenuOpen(false);
    setStatusMessage({ type: 'success', text: `تم تصدير ${rows.length} حساب بنجاح إلى ملف إكسيل (${fileName})` });
  };

  // Export to CSV with UTF-8 BOM for Arabic support
  const handleExportCSV = (scope: 'all' | 'filtered' = 'all') => {
    const listToExport = scope === 'filtered' && isFiltered ? matchingAccountsList : accounts;
    if (listToExport.length === 0) {
      setStatusMessage({ type: 'error', text: 'لا توجد حسابات لتصديرها طبقاً للتصفية المحددة' });
      return;
    }

    const rows = getEnrichedAccountRows(listToExport);
    const headers = [
      'كود الحساب',
      'اسم الحساب (عربي)',
      'اسم الحساب (إنجليزي)',
      'المستوى',
      'كود الحساب الرئيسي',
      'اسم الحساب الرئيسي',
      'التصنيف',
      'طبيعة الحساب',
      'هيكل الحساب',
      'رصيد افتتاحي مدين',
      'رصيد افتتاحي دائن',
      'حركات مدين',
      'حركات دائن',
      'رصيد ختامي مدين',
      'رصيد ختامي دائن',
      'القائمة المالية',
      'الربط الموديولي',
      'ملاحظات'
    ];

    let csvContent = '\uFEFF';
    csvContent += headers.map(h => `"${h}"`).join(',') + '\r\n';

    rows.forEach(r => {
      const line = [
        r.code,
        r.nameAr,
        r.nameEn,
        r.level,
        r.parentCode,
        r.parentName,
        r.categoryName,
        r.natureName,
        r.structureName,
        r.opDebit,
        r.opCredit,
        r.debitMovements,
        r.creditMovements,
        r.endingDebit,
        r.endingCredit,
        r.statementName,
        r.linkedModuleName,
        r.notes
      ].map(val => `"${String(val ?? '').replace(/"/g, '""')}"`);
      csvContent += line.join(',') + '\r\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = `دليل_الحسابات_${scope === 'filtered' ? 'مفلتر_' : ''}${new Date().toISOString().slice(0, 10)}.csv`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsExportMenuOpen(false);
    setStatusMessage({ type: 'success', text: `تم تصدير ملف CSV بنجاح (${fileName})` });
  };

  // Export Trial Balance to Excel
  const handleExportTrialBalanceExcel = () => {
    const rows = filteredTrialBalanceData;
    const dateStr = new Date().toLocaleDateString('ar-EG');
    const timeStr = new Date().toLocaleTimeString('ar-EG');

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>ميزان المراجعة</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayRightToLeft/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; }
          table { border-collapse: collapse; width: 100%; direction: rtl; }
          th { background-color: #1e293b; color: #ffffff; font-weight: bold; border: 1px solid #0f172a; padding: 8px 10px; font-size: 11pt; }
          td { border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 10pt; }
          .text { mso-number-format:"\\@"; text-align: right; }
          .center { text-align: center; }
          .num { mso-number-format:"\\#,##0.00"; text-align: left; }
          .header-main { font-size: 16pt; font-weight: bold; color: #1e3a8a; text-align: center; }
          .header-sub { font-size: 11pt; color: #475569; text-align: center; }
          .parent-acc { background-color: #f8fafc; font-weight: bold; }
          .total-row { background-color: #0f172a; color: #ffffff; font-weight: bold; }
        </style>
      </head>
      <body>
        <table>
          <tr>
            <td colspan="11" class="header-main">${company.name}</td>
          </tr>
          <tr>
            <td colspan="11" class="header-sub">
              ميزان المراجعة بالمجاميع والأرصدة | تاريخ الإصدار: ${dateStr} ${timeStr} | عدد السطور: ${rows.length}
            </td>
          </tr>
          <tr><td colspan="11"></td></tr>
          <thead>
            <tr>
              <th rowspan="2">كود الحساب</th>
              <th rowspan="2">اسم الحساب</th>
              <th rowspan="2">المستوى</th>
              <th colspan="2">الأرصدة الافتتاحية</th>
              <th colspan="2">حركات الفترة</th>
              <th colspan="2">المجاميع الكلية</th>
              <th colspan="2">الأرصدة الختامية</th>
            </tr>
            <tr>
              <th>مدين</th>
              <th>دائن</th>
              <th>مدين</th>
              <th>دائن</th>
              <th>مدين</th>
              <th>دائن</th>
              <th>مدين</th>
              <th>دائن</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(r => `
              <tr class="${r.isParent ? 'parent-acc' : ''}">
                <td class="text center">${r.code}</td>
                <td class="text">${r.nameAr}</td>
                <td class="center">${r.level}</td>
                <td class="num">${r.opDebit ? r.opDebit.toFixed(2) : '0.00'}</td>
                <td class="num">${r.opCredit ? r.opCredit.toFixed(2) : '0.00'}</td>
                <td class="num">${r.debitMovements ? r.debitMovements.toFixed(2) : '0.00'}</td>
                <td class="num">${r.creditMovements ? r.creditMovements.toFixed(2) : '0.00'}</td>
                <td class="num">${r.totalDebit ? r.totalDebit.toFixed(2) : '0.00'}</td>
                <td class="num">${r.totalCredit ? r.totalCredit.toFixed(2) : '0.00'}</td>
                <td class="num">${r.endingDebit ? r.endingDebit.toFixed(2) : '0.00'}</td>
                <td class="num">${r.endingCredit ? r.endingCredit.toFixed(2) : '0.00'}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="3" class="center">الإجمالي العام (الحسابات الفرعية)</td>
              <td class="num">${trialTotals.opDebit.toFixed(2)}</td>
              <td class="num">${trialTotals.opCredit.toFixed(2)}</td>
              <td class="num">${trialTotals.debitMovements.toFixed(2)}</td>
              <td class="num">${trialTotals.creditMovements.toFixed(2)}</td>
              <td class="num">${trialTotals.totalDebit.toFixed(2)}</td>
              <td class="num">${trialTotals.totalCredit.toFixed(2)}</td>
              <td class="num">${trialTotals.endingDebit.toFixed(2)}</td>
              <td class="num">${trialTotals.endingCredit.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = `ميزان_المراجعة_${new Date().toISOString().slice(0, 10)}.xls`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setStatusMessage({ type: 'success', text: `تم تصدير ميزان المراجعة بنجاح إلى ملف إكسيل (${fileName})` });
  };

  // Download Standalone Printable PDF/HTML File
  const handleDownloadStandalonePdfHtml = (scope: 'all' | 'filtered' = 'all') => {
    const listToExport = scope === 'filtered' && isFiltered ? matchingAccountsList : accounts;
    const rows = getEnrichedAccountRows(listToExport);
    const dateStr = new Date().toLocaleDateString('ar-EG');
    const timeStr = new Date().toLocaleTimeString('ar-EG');

    const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>دليل وشجرة الحسابات المالية - ${company.name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
    body {
      font-family: 'Cairo', Arial, sans-serif;
      margin: 0;
      padding: 20px;
      color: #0f172a;
      background: #ffffff;
      direction: rtl;
    }
    @page {
      size: A4 landscape;
      margin: 10mm;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 15px;
    }
    .company-title {
      font-size: 18px;
      font-weight: 900;
      color: #0f172a;
      margin: 0;
    }
    .company-sub {
      font-size: 11px;
      color: #475569;
      margin: 3px 0 0 0;
    }
    .report-badge {
      text-align: center;
      border: 2px solid #0f172a;
      padding: 6px 16px;
      border-radius: 8px;
      background-color: #f8fafc;
    }
    .report-title {
      font-size: 16px;
      font-weight: 900;
      margin: 0;
    }
    .meta-info {
      font-size: 10px;
      color: #64748b;
      margin-top: 3px;
    }
    .stats-row {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
    }
    .stat-card {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      background: #f8fafc;
      font-size: 11px;
    }
    .stat-label { color: #64748b; font-size: 10px; }
    .stat-val { font-size: 14px; font-weight: bold; color: #0f172a; }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
      margin-bottom: 20px;
    }
    th {
      background-color: #1e293b;
      color: #ffffff;
      padding: 6px 8px;
      border: 1px solid #0f172a;
      text-align: right;
      font-weight: 700;
    }
    td {
      padding: 5px 8px;
      border: 1px solid #cbd5e1;
    }
    tr.parent-row {
      background-color: #f1f5f9;
      font-weight: bold;
    }
    tr:nth-child(even):not(.parent-row) {
      background-color: #fafafa;
    }
    .text-center { text-align: center; }
    .text-left { text-align: left; }
    .num { font-family: monospace; text-align: left; }
    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 9px;
      font-weight: bold;
    }
    .badge-debit { background-color: #d1fae5; color: #065f46; }
    .badge-credit { background-color: #ede9fe; color: #5b21b6; }
    .badge-parent { background-color: #fef3c7; color: #92400e; }
    .badge-sub { background-color: #e0f2fe; color: #0369a1; }
    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px dashed #cbd5e1;
      font-size: 11px;
      page-break-inside: avoid;
    }
    .sig-block {
      text-align: center;
      width: 25%;
    }
    .sig-line {
      margin-top: 40px;
      border-top: 1px solid #64748b;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="company-title">${company.name}</h1>
      <p class="company-sub">${company.address || ''} - هاتف: ${company.phone || ''}</p>
      <p class="company-sub">س.ت: ${company.commercialRegister || '-'} | ب.ض: ${company.taxNumber || '-'}</p>
    </div>
    <div class="report-badge">
      <h2 class="report-title">دليل وشجرة الحسابات المالية</h2>
      <div class="meta-info">تاريخ الإصدار: ${dateStr} - ${timeStr}</div>
      <div class="meta-info">${scope === 'filtered' ? 'الحسابات المفلترة طبقاً للبحث' : 'دليل الحسابات الشامل'}</div>
    </div>
    <div style="text-align: left; font-size: 10px; color: #64748b;">
      <div>طبع بواسطة: ${currentUser?.employeeName || currentUser?.username || 'مدير النظام'}</div>
      <div>نظام البيان المحاسبي المتكامل</div>
    </div>
  </div>

  <div class="stats-row">
    <div class="stat-card">
      <div class="stat-label">إجمالي الحسابات المصدرة</div>
      <div class="stat-val">${rows.length} حساب</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">الحسابات الرئيسية (التجميعية)</div>
      <div class="stat-val">${rows.filter(r => r.isParent).length}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">الحسابات الفرعية (التحليلية)</div>
      <div class="stat-val">${rows.filter(r => !r.isParent).length}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">إجمالي الأرصدة الافتتاحية</div>
      <div class="stat-val">${rows.filter(r => !r.isParent).reduce((s, r) => s + r.opDebit, 0).toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th class="text-center" style="width: 70px;">الكود</th>
        <th>اسم الحساب</th>
        <th class="text-center" style="width: 45px;">المستوى</th>
        <th>الحساب الرئيسي</th>
        <th class="text-center">التصنيف</th>
        <th class="text-center">طبيعة</th>
        <th class="text-center">الهيكل</th>
        <th class="text-left">افتتاحي مدين</th>
        <th class="text-left">افتتاحي دائن</th>
        <th class="text-left">حركات مدين</th>
        <th class="text-left">حركات دائن</th>
        <th class="text-left">ختامي مدين</th>
        <th class="text-left">ختامي دائن</th>
        <th class="text-center">القائمة</th>
        <th class="text-center">الربط</th>
      </tr>
    </thead>
    <tbody>
      ${rows.map(r => `
        <tr class="${r.isParent ? 'parent-row' : ''}">
          <td class="text-center" style="font-family: monospace; font-weight: bold;">${r.code}</td>
          <td>${r.isParent ? '📁 ' : '📄 '} ${r.nameAr}</td>
          <td class="text-center">م${r.level}</td>
          <td>${r.parentCode !== '-' ? `${r.parentCode} - ${r.parentName}` : '-'}</td>
          <td class="text-center">${r.categoryName}</td>
          <td class="text-center">
            <span class="badge ${r.nature === 'debit' ? 'badge-debit' : 'badge-credit'}">${r.natureName}</span>
          </td>
          <td class="text-center">
            <span class="badge ${r.isParent ? 'badge-parent' : 'badge-sub'}">${r.isParent ? 'رئيسي' : 'فرعي'}</span>
          </td>
          <td class="num">${r.opDebit ? r.opDebit.toLocaleString('ar-EG', { minimumFractionDigits: 2 }) : '-'}</td>
          <td class="num">${r.opCredit ? r.opCredit.toLocaleString('ar-EG', { minimumFractionDigits: 2 }) : '-'}</td>
          <td class="num">${r.debitMovements ? r.debitMovements.toLocaleString('ar-EG', { minimumFractionDigits: 2 }) : '-'}</td>
          <td class="num">${r.creditMovements ? r.creditMovements.toLocaleString('ar-EG', { minimumFractionDigits: 2 }) : '-'}</td>
          <td class="num" style="font-weight: bold; color: #047857;">${r.endingDebit ? r.endingDebit.toLocaleString('ar-EG', { minimumFractionDigits: 2 }) : '-'}</td>
          <td class="num" style="font-weight: bold; color: #6d28d9;">${r.endingCredit ? r.endingCredit.toLocaleString('ar-EG', { minimumFractionDigits: 2 }) : '-'}</td>
          <td class="text-center">${r.statementName}</td>
          <td class="text-center">${r.linkedModuleName}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="signatures">
    <div class="sig-block">
      <div>إعداد المحاسب المسؤول</div>
      <div class="sig-line">الاسم والتوقيع</div>
    </div>
    <div class="sig-block">
      <div>المراجعة الداخلية والتدقيق</div>
      <div class="sig-line">الاسم والتوقيع</div>
    </div>
    <div class="sig-block">
      <div>اعتماد المدير المالي</div>
      <div class="sig-line">الاسم والختم</div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = `تقرير_دليل_الحسابات_${scope === 'filtered' ? 'مفلتر_' : ''}${new Date().toISOString().slice(0, 10)}.html`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setStatusMessage({ type: 'success', text: `تم تنزيل تقرير HTML/PDF جاهز للطباعة والمراجعة (${fileName})` });
  };

  const handlePrint = () => {
    window.print();
  };

  // Navigation handlers
  const handleFirst = () => {
    const list = isFiltered ? matchingAccountsList : accounts;
    if (list.length > 0) setSelectedCode(list[0].code);
    setIsNewMode(false);
  };
  const handleLast = () => {
    const list = isFiltered ? matchingAccountsList : accounts;
    if (list.length > 0) setSelectedCode(list[list.length - 1].code);
    setIsNewMode(false);
  };
  const handleNext = () => {
    const list = isFiltered ? matchingAccountsList : accounts;
    const idx = list.findIndex(a => a.code === selectedCode);
    if (idx !== -1 && idx < list.length - 1) {
      setSelectedCode(list[idx + 1].code);
      setIsNewMode(false);
    }
  };
  const handlePrev = () => {
    const list = isFiltered ? matchingAccountsList : accounts;
    const idx = list.findIndex(a => a.code === selectedCode);
    if (idx > 0) {
      setSelectedCode(list[idx - 1].code);
      setIsNewMode(false);
    }
  };

  const handleSearchAccount = (searchVal: string) => {
    setSearchQuery(searchVal);
    const found = accounts.find(a => 
      a.code.toLowerCase().includes(searchVal.toLowerCase()) || 
      a.nameAr.includes(searchVal) ||
      (a.nameEn && a.nameEn.toLowerCase().includes(searchVal.toLowerCase()))
    );
    if (found) {
      setSelectedCode(found.code);
      setIsNewMode(false);
      let p = found.parentCode;
      const toExp: Record<string, boolean> = {};
      while (p) {
        toExp[p] = true;
        const parentAcc = accounts.find(a => a.code === p);
        p = parentAcc?.parentCode || null;
      }
      setExpandedCodes(prev => ({ ...prev, ...toExp }));
    }
  };

  const selectAccountAndFocus = (accCode: string) => {
    setSelectedCode(accCode);
    setIsNewMode(false);
    setStatusMessage(null);
    let p = accounts.find(a => a.code === accCode)?.parentCode;
    const toExp: Record<string, boolean> = {};
    while (p) {
      toExp[p] = true;
      const parentAcc = accounts.find(a => a.code === p);
      p = parentAcc?.parentCode || null;
    }
    setExpandedCodes(prev => ({ ...prev, ...toExp }));
  };

  // Render tree node recursive
  const renderTreeNode = (acc: AccountNode, depth: number = 0) => {
    const children = accountMap[acc.code] || [];
    const hasChildren = children.length > 0;
    const isExpanded = !!expandedCodes[acc.code];
    const isSelected = selectedCode === acc.code && !isNewMode;
    const isDirectMatch = matchingCodes.has(acc.code);

    // Tree visibility check when filtered
    if (visibleTreeCodes !== null && !visibleTreeCodes.has(acc.code)) {
      return null;
    }

    return (
      <div key={acc.code} className="select-none text-xs">
        <div
          onClick={() => selectAccountAndFocus(acc.code)}
          className={`flex items-center justify-between py-1.5 px-2 rounded-lg cursor-pointer transition ${
            isSelected
              ? 'bg-blue-600 text-white font-bold shadow-sm ring-2 ring-blue-400/50'
              : isDirectMatch && isFiltered
              ? 'bg-amber-50/80 hover:bg-amber-100 text-slate-900 border border-amber-300/80 font-medium'
              : 'hover:bg-slate-100 text-slate-700'
          }`}
          style={{ paddingRight: `${Math.min(depth * 16 + 8, 120)}px` }}
        >
          <div className="flex items-center gap-1.5 truncate">
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(acc.code);
                }}
                className={`p-0.5 rounded hover:bg-slate-200/50 ${isSelected ? 'text-white' : 'text-slate-500'}`}
                title={isExpanded ? 'طي الحساب' : 'توسيع الحساب'}
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <span className="w-3.5" />
            )}

            {acc.isParent ? (
              isExpanded ? (
                <FolderOpen className={`w-4 h-4 shrink-0 ${isSelected ? 'text-amber-200' : 'text-amber-500'}`} />
              ) : (
                <Folder className={`w-4 h-4 shrink-0 ${isSelected ? 'text-amber-200' : 'text-amber-500'}`} />
              )
            ) : (
              <FileText className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`} />
            )}

            <span className={`font-mono text-[11px] px-1 rounded ${
              isSelected 
                ? 'bg-blue-700 text-white' 
                : isDirectMatch && isFiltered 
                ? 'bg-amber-200 text-amber-900 font-bold' 
                : 'bg-slate-100 text-slate-600 font-semibold'
            }`}>
              {acc.code}
            </span>
            <span className="truncate">{acc.nameAr}</span>
            {isDirectMatch && isFiltered && (
              <span className="text-[9px] bg-amber-500 text-white px-1 rounded-sm font-bold mr-1 shrink-0">
                مطابق
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[10px] shrink-0">
            <span className={`px-1.5 py-0.5 rounded font-bold ${
              acc.nature === 'debit'
                ? isSelected ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : isSelected ? 'bg-purple-700 text-white' : 'bg-purple-50 text-purple-700 border border-purple-200'
            }`}>
              {acc.nature === 'debit' ? 'مدين' : 'دائن'}
            </span>
            <span className={`px-1.5 py-0.5 rounded ${
              isSelected ? 'bg-blue-800 text-blue-100' : 'bg-slate-100 text-slate-500'
            }`}>
              م{acc.level}
            </span>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-0.5 space-y-0.5 border-r border-slate-200/70 mr-3">
            {children.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Official Print Header */}
      <div className="print-only">
        <PrintHeader
          title={activeTab === 'tree' ? 'دليل وشجرة الحسابات العامة' : 'ميزان المراجعة بالمجاميع والأرصدة'}
          date={new Date().toLocaleDateString('ar-EG')}
        />
      </div>

      {/* Title & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 no-print">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-md shadow-amber-500/20">
            <GitBranch className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">شجرة الحسابات والدليل المحاسبي وميزان المراجعة</h1>
            <p className="text-xs text-slate-500">
              تكويد وهيكلة الحسابات الهرمية والبحث السريع المتقدم وتصفية الحسابات وربطها بالشاشات
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('tree')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'tree'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>الشجرة الهرمية والتكويد ({accounts.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('trial_balance')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'trial_balance'
                ? 'bg-white text-amber-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>ميزان المراجعة بالمجاميع والأرصدة</span>
          </button>
        </div>
      </div>

      {/* Top Standard Action Bar */}
      <ActionBar
        onFirst={handleFirst}
        onPrev={handlePrev}
        onNext={handleNext}
        onLast={handleLast}
        onNew={handleNew}
        onSave={handleSave}
        onDelete={handleDelete}
        onPrint={handlePrint}
        onReset={() => {
          setIsNewMode(false);
          setStatusMessage(null);
        }}
        isNewMode={isNewMode}
        canEdit={canAccess('accounts', 'edit')}
        canDelete={canAccess('accounts', 'delete')}
        canPrint={canAccess('accounts', 'print')}
        searchPlaceholder="استدعاء حساب بالكود أو الاسم..."
        searchValue={searchQuery}
        onSearchChange={handleSearchAccount}
      />

      {/* SEARCH BAR & FILTER DROPDOWNS PANEL */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 space-y-3.5 no-print">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <span>محرك البحث والتصفية المتقدمة للحسابات</span>
            {isFiltered && (
              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-[11px] font-black">
                {matchingCodes.size} حساب مطابق
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs">
            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 transition font-bold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إلغاء التصفية</span>
              </button>
            )}

            {activeTab === 'tree' && (
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={handleExpandAll}
                  className="px-2 py-1 hover:bg-white rounded text-[11px] font-semibold text-slate-700 transition cursor-pointer flex items-center gap-1"
                  title="توسيع كافة المستويات في الشجرة"
                >
                  <Maximize2 className="w-3 h-3 text-slate-500" />
                  <span>توسيع الكل</span>
                </button>
                <button
                  type="button"
                  onClick={handleCollapseAll}
                  className="px-2 py-1 hover:bg-white rounded text-[11px] font-semibold text-slate-700 transition cursor-pointer flex items-center gap-1"
                  title="طي كافة المستويات وإبقاء الحسابات الرئيسية فقط"
                >
                  <Minimize2 className="w-3 h-3 text-slate-500" />
                  <span>طي الكل</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Inputs and Dropdowns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 text-xs">
          {/* Main Search Bar (5 cols on large screens) */}
          <div className="lg:col-span-4">
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              البحث بالكود أو الاسم (عربي / إنجليزي):
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ابحث برقم الكود، اسم الحساب، أو الملاحظات..."
                className="w-full pr-8 pl-8 py-2 border border-slate-300 rounded-xl text-xs bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium placeholder-slate-400 transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 rounded-full hover:bg-slate-200 transition"
                  title="مسح نص البحث"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter 1: Account Type / Category */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              نوع / تصنيف الحساب:
            </label>
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className={`w-full pr-7 pl-2 py-2 border rounded-xl text-xs bg-white cursor-pointer font-medium appearance-none transition ${
                  categoryFilter !== 'all'
                    ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-bold'
                    : 'border-slate-300 text-slate-700 focus:ring-2 focus:ring-blue-500'
                }`}
              >
                <option value="all">كل التصنيفات (الكل)</option>
                <option value="asset">1- الأصول (Assets)</option>
                <option value="liability">2- الخصوم والالتزامات</option>
                <option value="equity">3- حقوق الملكية (Equity)</option>
                <option value="revenue">4- الإيرادات والمبيعات</option>
                <option value="expense">5- المصروفات والتكاليف</option>
              </select>
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Filter 2: Nature (Debit / Credit) */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              طبيعة الحساب:
            </label>
            <div className="relative">
              <select
                value={natureFilter}
                onChange={e => setNatureFilter(e.target.value as any)}
                className={`w-full pr-7 pl-2 py-2 border rounded-xl text-xs bg-white cursor-pointer font-medium appearance-none transition ${
                  natureFilter !== 'all'
                    ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-bold'
                    : 'border-slate-300 text-slate-700 focus:ring-2 focus:ring-blue-500'
                }`}
              >
                <option value="all">كل الطبائع (مدين / دائن)</option>
                <option value="debit">مدين فقط (Debit)</option>
                <option value="credit">دائن فقط (Credit)</option>
              </select>
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Filter 3: Account Structure / Level Type */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              نوع الحساب بالدليل:
            </label>
            <div className="relative">
              <select
                value={structureFilter}
                onChange={e => setStructureFilter(e.target.value as any)}
                className={`w-full pr-7 pl-2 py-2 border rounded-xl text-xs bg-white cursor-pointer font-medium appearance-none transition ${
                  structureFilter !== 'all'
                    ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-bold'
                    : 'border-slate-300 text-slate-700 focus:ring-2 focus:ring-blue-500'
                }`}
              >
                <option value="all">كل الحسابات (رئيسي وفرعي)</option>
                <option value="parent">حسابات رئيسية فقط (📁 تجميعية)</option>
                <option value="terminal">حسابات فرعية فقط (📄 تقبل القيود)</option>
              </select>
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Filter 4: Linked Module */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              ربط شاشات النظام:
            </label>
            <div className="relative">
              <select
                value={linkedModuleFilter}
                onChange={e => setLinkedModuleFilter(e.target.value)}
                className={`w-full pr-7 pl-2 py-2 border rounded-xl text-xs bg-white cursor-pointer font-medium appearance-none transition ${
                  linkedModuleFilter !== 'all'
                    ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-bold'
                    : 'border-slate-300 text-slate-700 focus:ring-2 focus:ring-blue-500'
                }`}
              >
                <option value="all">كل الروابط</option>
                <option value="cash_bank">شاشات الخزائن والبنوك</option>
                <option value="customers">شاشات العملاء والمدينين</option>
                <option value="suppliers">شاشات الموردين والدائنين</option>
                <option value="inventory">شاشات المخازن والمخزون</option>
                <option value="sales">شاشات المبيعات</option>
                <option value="purchases">شاشات المشتريات</option>
                <option value="taxes">شاشات الضرائب</option>
                <option value="expenses">شاشات المصروفات</option>
                <option value="general">حساب عام</option>
              </select>
              <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Active Filters Badges & Quick Matching Accounts Ribbon */}
        {isFiltered && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="font-bold text-slate-600">الفلاتر المطبقة:</span>

              {searchQuery.trim() && (
                <span className="bg-blue-50 border border-blue-200 text-blue-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span>بحث: "{searchQuery.trim()}"</span>
                  <button type="button" onClick={() => setSearchQuery('')} className="hover:text-blue-950 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {categoryFilter !== 'all' && (
                <span className="bg-amber-50 border border-amber-200 text-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span>
                    التصنيف:{' '}
                    {categoryFilter === 'asset'
                      ? 'الأصول'
                      : categoryFilter === 'liability'
                      ? 'الخصوم'
                      : categoryFilter === 'equity'
                      ? 'حقوق الملكية'
                      : categoryFilter === 'revenue'
                      ? 'الإيرادات'
                      : 'المصروفات'}
                  </span>
                  <button type="button" onClick={() => setCategoryFilter('all')} className="hover:text-amber-950 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {natureFilter !== 'all' && (
                <span className="bg-purple-50 border border-purple-200 text-purple-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span>طبيعة: {natureFilter === 'debit' ? 'مدين' : 'دائن'}</span>
                  <button type="button" onClick={() => setNatureFilter('all')} className="hover:text-purple-950 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {structureFilter !== 'all' && (
                <span className="bg-slate-100 border border-slate-300 text-slate-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span>الهيكل: {structureFilter === 'parent' ? 'حسابات رئيسية' : 'حسابات فرعية تحليلية'}</span>
                  <button type="button" onClick={() => setStructureFilter('all')} className="hover:text-slate-950 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {linkedModuleFilter !== 'all' && (
                <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span>الربط: {linkedModuleFilter}</span>
                  <button type="button" onClick={() => setLinkedModuleFilter('all')} className="hover:text-emerald-950 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            <div className="text-[11px] font-bold text-slate-500">
              عرض {matchingCodes.size} من أصل {accounts.length} حساب
            </div>
          </div>
        )}

        {/* Quick Clickable Account Chips when <= 15 matches */}
        {isFiltered && matchingAccountsList.length > 0 && matchingAccountsList.length <= 16 && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] text-slate-500 font-bold ml-1">الانتقال السريع للحساب:</span>
            {matchingAccountsList.map(acc => (
              <button
                key={acc.code}
                type="button"
                onClick={() => selectAccountAndFocus(acc.code)}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer flex items-center gap-1 ${
                  selectedCode === acc.code
                    ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                    : 'bg-white hover:bg-blue-50 text-slate-700 border-slate-200 hover:border-blue-300'
                }`}
              >
                <span className="font-mono text-[10px] opacity-75">{acc.code}</span>
                <span>{acc.nameAr}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {statusMessage && (
        <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
          statusMessage.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        } no-print`}>
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* TAB 1: TREE & CODING */}
      {activeTab === 'tree' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left / Tree Pane (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex flex-col h-[750px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-bold text-slate-800">
                  الهيكل الشجري للدليل
                </h2>
                <span className="bg-slate-100 text-slate-700 text-[11px] font-bold px-2 py-0.5 rounded-full border border-slate-200">
                  {isFiltered ? `${matchingCodes.size} / ${accounts.length}` : accounts.length}
                </span>
              </div>

              <button
                type="button"
                onClick={handleNew}
                className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold px-2.5 py-1 rounded-lg border border-blue-200 flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة حساب فرعي</span>
              </button>
            </div>

            {/* Tree List Scrollable */}
            <div className="flex-1 overflow-y-auto mt-2 space-y-1 pl-1">
              {(accountMap['ROOT'] || []).map(rootAcc => renderTreeNode(rootAcc, 0))}

              {isFiltered && matchingCodes.size === 0 && (
                <div className="py-12 px-4 text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">لا يوجد حساب يطابق معايير البحث والفلترة المحددة</p>
                  <p className="text-[11px] text-slate-400">يرجى تعديل مصطلح البحث أو اختيار "إلغاء التصفية"</p>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="mt-2 text-xs bg-blue-600 text-white font-bold px-3 py-1.5 rounded-lg hover:bg-blue-700 transition cursor-pointer"
                  >
                    إعادة تعيين كافة الفلاتر
                  </button>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1"><Folder className="w-3 h-3 text-amber-500" /> رئيسي</span>
              <span className="flex items-center gap-1"><FileText className="w-3 h-3 text-slate-400" /> فرعي تحليلي</span>
              <span className="text-emerald-700 font-bold">مدين</span>
              <span className="text-purple-700 font-bold">دائن</span>
            </div>
          </div>

          {/* Right / Coding Form Pane (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>{isNewMode ? 'تكويد حساب جديد في الدليل المحاسبي' : `بيانات الحساب: ${nameAr || code}`}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isNewMode ? 'حدد تصنيف الحساب والحساب الرئيسي التابع له ومستواه في الشجرة' : 'يمكنك تعديل المسمى أو الحساب الأب أو الربط بشاشات النظام'}
                </p>
              </div>

              {isNewMode ? (
                <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-bold border border-amber-300">
                  وضع إضافة جديد
                </span>
              ) : (
                <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full font-bold border border-slate-300">
                  كود: {code}
                </span>
              )}
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Account Code */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  كود الحساب *
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  disabled={!isNewMode && accounts.some(a => a.code === code && a.isParent)}
                  className="w-full text-sm font-mono font-bold border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  placeholder="مثال: 1111"
                  required
                />
              </div>

              {/* Parent Account */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الحساب الرئيسي الأب
                </label>
                <select
                  value={parentCode || ''}
                  onChange={e => {
                    const p = e.target.value || null;
                    setParentCode(p);
                    if (p) {
                      const pAcc = accounts.find(a => a.code === p);
                      if (pAcc) {
                        setCategory(pAcc.category);
                        setNature(pAcc.nature);
                        setStatement(pAcc.statement);
                        setLevel(pAcc.level + 1);
                        setLinkedModule(pAcc.linkedModule || 'general');
                      }
                    } else {
                      setLevel(1);
                    }
                  }}
                  className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">(حساب رئيسي في المستوى الأول - لا يوجد أب)</option>
                  {accounts
                    .filter(a => a.code !== code)
                    .map(a => (
                      <option key={a.code} value={a.code}>
                        {a.code} - {a.nameAr} (مستوى {a.level})
                      </option>
                    ))}
                </select>
              </div>

              {/* Name Arabic */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم الحساب بالعربية *
                </label>
                <input
                  type="text"
                  value={nameAr}
                  onChange={e => setNameAr(e.target.value)}
                  className="w-full text-sm font-semibold border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
                  placeholder="اسم الحساب المحاسبي"
                  required
                />
              </div>

              {/* Name English */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم الحساب بالإنجليزية (اختياري)
                </label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={e => setNameEn(e.target.value)}
                  dir="ltr"
                  className="w-full text-sm font-sans border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 text-left"
                  placeholder="Account English Name"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  التصنيف المحاسبي الرئيسي
                </label>
                <select
                  value={category}
                  onChange={e => {
                    const cat = e.target.value as AccountCategory;
                    setCategory(cat);
                    if (cat === 'asset' || cat === 'expense') {
                      setNature('debit');
                    } else {
                      setNature('credit');
                    }
                    if (cat === 'revenue' || cat === 'expense') {
                      setStatement('income_statement');
                    } else {
                      setStatement('balance_sheet');
                    }
                  }}
                  className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="asset">1- الأصول (Assets)</option>
                  <option value="liability">2- الخصوم والالتزامات (Liabilities)</option>
                  <option value="equity">3- حقوق الملكية (Equity)</option>
                  <option value="revenue">4- الإيرادات (Revenue)</option>
                  <option value="expense">5- المصروفات والتكاليف (Expenses)</option>
                </select>
              </div>

              {/* Nature & Statement */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">طبيعة الحساب</label>
                  <select
                    value={nature}
                    onChange={e => setNature(e.target.value as AccountNature)}
                    className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 bg-white font-bold"
                  >
                    <option value="debit">مدين (Debit)</option>
                    <option value="credit">دائن (Credit)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">القائمة المالية</label>
                  <select
                    value={statement}
                    onChange={e => setStatement(e.target.value as FinancialStatement)}
                    className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="balance_sheet">ميزانية عمومية</option>
                    <option value="income_statement">قائمة دخل (أرباح وخسائر)</option>
                  </select>
                </div>
              </div>

              {/* Linked Module */}
              <div className="md:col-span-2 bg-blue-50/60 border border-blue-200 rounded-xl p-3">
                <label className="block text-xs font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                  <ArrowRightLeft className="w-4 h-4 text-blue-600" />
                  <span>ربط الحساب بنوع الشاشات في النظام (شاشات العمليات والبطاقات)</span>
                </label>
                <p className="text-[11px] text-blue-700 mb-2">
                  يسمح بربط الحساب تلقائياً عند تكويد الخزائن، العملاء، الموردين، أو عند إنشاء قيود المبيعات والمشتريات والمخازن.
                </p>
                <select
                  value={linkedModule}
                  onChange={e => setLinkedModule(e.target.value as LinkedModuleType)}
                  className="w-full text-sm border border-blue-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 bg-white font-semibold text-slate-800"
                >
                  <option value="general">حساب عام (قيود وسجلات عامة)</option>
                  <option value="cash_bank">شاشة تكويد الخزائن والبنوك (نقدية وشيكات وحسابات بنكية)</option>
                  <option value="customers">شاشة تكويد العملاء (مدينون تجاريون ومبيعات آجلة)</option>
                  <option value="suppliers">شاشة تكويد الموردين (دائنون وتوريدات)</option>
                  <option value="inventory">شاشة تكويد المخازن والمخزون السلعي</option>
                  <option value="sales">شاشات فواتير ومردودات المبيعات</option>
                  <option value="purchases">شاشات فواتير ومردودات المشتريات</option>
                  <option value="cogs">تكلفة البضاعة المباعة</option>
                  <option value="taxes">شاشة الضرائب (قيمة مضافة 14% وخصم 1%)</option>
                  <option value="expenses">شاشات المصروفات وسندات الصرف</option>
                </select>
              </div>

              {/* Level & IsParent */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">مستوى الحساب</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={level}
                    onChange={e => setLevel(Number(e.target.value))}
                    className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نوع الحساب في الهيكل</label>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="isParentChk"
                      checked={isParent}
                      onChange={e => setIsParent(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isParentChk" className="text-xs font-semibold text-slate-800 cursor-pointer">
                      حساب رئيسي (تجميعي لا يقبل قيود مباشرة)
                    </label>
                  </div>
                </div>
              </div>

              {/* Opening Balance */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الرصيد الافتتاحي (ج.م)
                </label>
                <input
                  type="number"
                  value={openingBalance}
                  onChange={e => setOpeningBalance(Number(e.target.value))}
                  disabled={isParent}
                  className="w-full text-sm font-bold border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
                  placeholder="0.00"
                />
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات توجيهية للحساب</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="شرح طبيعة المعاملات التي تقيد على هذا الحساب..."
                  className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Bottom Action inside form */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 no-print">
              {isNewMode && (
                <button
                  type="button"
                  onClick={() => setIsNewMode(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition cursor-pointer"
                >
                  إلغاء الإضافة
                </button>
              )}
              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition shadow-md shadow-blue-500/20 cursor-pointer flex items-center gap-1.5"
              >
                <span>{isNewMode ? 'حفظ الحساب الجديد' : 'تحديث بيانات الحساب'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TRIAL BALANCE (ميزان المراجعة بالمجاميع والأرصدة) */}
      {activeTab === 'trial_balance' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-600" />
                <span>ميزان المراجعة المحاسبي بالمجاميع والأرصدة</span>
                {isFiltered && (
                  <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                    مفلتر ({filteredTrialBalanceData.length} حساب)
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                مستخرج مباشرة من قيود اليومية والحركات والأرصدة الافتتاحية طبقاً لمعايير المحاسبة
              </p>
            </div>

            <div className="flex items-center gap-2 no-print">
              {isFiltered && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl font-bold transition cursor-pointer"
                >
                  مسح فلاتر البحث
                </button>
              )}
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-1.5 bg-slate-800 hover:bg-black text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>طباعة ميزان المراجعة</span>
              </button>
            </div>
          </div>

          {/* Trial Balance Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-800 text-white text-[11px]">
                  <th rowSpan={2} className="p-2.5 border-l border-slate-700">كود الحساب</th>
                  <th rowSpan={2} className="p-2.5 border-l border-slate-700">اسم الحساب</th>
                  <th rowSpan={2} className="p-2.5 border-l border-slate-700 text-center">المستوى</th>
                  <th colSpan={2} className="p-2 text-center border-b border-l border-slate-700 bg-slate-700">الأرصدة الافتتاحية</th>
                  <th colSpan={2} className="p-2 text-center border-b border-l border-slate-700 bg-slate-600">حركات الفترة (القيود)</th>
                  <th colSpan={2} className="p-2 text-center border-b border-l border-slate-700 bg-slate-700">المجاميع الكلية</th>
                  <th colSpan={2} className="p-2 text-center bg-slate-900">الأرصدة الختامية</th>
                </tr>
                <tr className="bg-slate-700 text-slate-200 text-[10px]">
                  <th className="p-2 text-left border-l border-slate-600">مدين</th>
                  <th className="p-2 text-left border-l border-slate-600">دائن</th>
                  <th className="p-2 text-left border-l border-slate-600">مدين</th>
                  <th className="p-2 text-left border-l border-slate-600">دائن</th>
                  <th className="p-2 text-left border-l border-slate-600">مدين</th>
                  <th className="p-2 text-left border-l border-slate-600">دائن</th>
                  <th className="p-2 text-left border-l border-slate-600 text-emerald-300">مدين</th>
                  <th className="p-2 text-left text-purple-300">دائن</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredTrialBalanceData.map(row => {
                  const isTopLevel = row.level === 1;
                  const isSecondary = row.level === 2;
                  return (
                    <tr
                      key={row.code}
                      onClick={() => {
                        setSelectedCode(row.code);
                        setActiveTab('tree');
                      }}
                      className={`hover:bg-blue-50/60 cursor-pointer transition ${
                        isTopLevel
                          ? 'bg-slate-100 font-black text-slate-900'
                          : isSecondary
                          ? 'bg-slate-50/70 font-bold text-slate-800'
                          : row.isParent
                          ? 'font-semibold text-slate-700'
                          : 'text-slate-600'
                      }`}
                      title="انقر للانتقال للحساب في الشجرة"
                    >
                      <td className="p-2.5 font-mono border-l border-slate-200">{row.code}</td>
                      <td className="p-2.5 border-l border-slate-200" style={{ paddingRight: `${row.level * 10}px` }}>
                        {row.isParent ? `📁 ${row.nameAr}` : `📄 ${row.nameAr}`}
                      </td>
                      <td className="p-2 text-center border-l border-slate-200">{row.level}</td>
                      <td className="p-2 font-mono text-left border-l border-slate-200">
                        {row.opDebit ? row.opDebit.toLocaleString('ar-EG', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                      <td className="p-2 font-mono text-left border-l border-slate-200">
                        {row.opCredit ? row.opCredit.toLocaleString('ar-EG', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                      <td className="p-2 font-mono text-left border-l border-slate-200 text-blue-700 font-semibold">
                        {row.debitMovements ? row.debitMovements.toLocaleString('ar-EG', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                      <td className="p-2 font-mono text-left border-l border-slate-200 text-blue-700 font-semibold">
                        {row.creditMovements ? row.creditMovements.toLocaleString('ar-EG', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                      <td className="p-2 font-mono text-left border-l border-slate-200">
                        {row.totalDebit ? row.totalDebit.toLocaleString('ar-EG', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                      <td className="p-2 font-mono text-left border-l border-slate-200">
                        {row.totalCredit ? row.totalCredit.toLocaleString('ar-EG', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                      <td className="p-2 font-mono text-left border-l border-slate-200 font-bold text-emerald-700 bg-emerald-50/30">
                        {row.endingDebit ? row.endingDebit.toLocaleString('ar-EG', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                      <td className="p-2 font-mono text-left font-bold text-purple-700 bg-purple-50/30">
                        {row.endingCredit ? row.endingCredit.toLocaleString('ar-EG', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                    </tr>
                  );
                })}

                {filteredTrialBalanceData.length === 0 && (
                  <tr>
                    <td colSpan={11} className="p-8 text-center text-slate-500 font-bold">
                      لا توجد حسابات تطابق شروط البحث والفلترة في ميزان المراجعة
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-slate-900 text-white font-black text-xs">
                  <td colSpan={3} className="p-3 text-center border-l border-slate-800">
                    {isFiltered
                      ? `إجمالي الحسابات المعروضة في ميزان المراجعة (${filteredTrialBalanceData.filter(r => !r.isParent).length} حساب فرعي)`
                      : 'الإجمالي العام لميزان المراجعة (الحسابات الفرعية)'}
                  </td>
                  <td className="p-2 font-mono text-left border-l border-slate-800">
                    {trialTotals.opDebit.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-2 font-mono text-left border-l border-slate-800">
                    {trialTotals.opCredit.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-2 font-mono text-left border-l border-slate-800 text-amber-300">
                    {trialTotals.debitMovements.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-2 font-mono text-left border-l border-slate-800 text-amber-300">
                    {trialTotals.creditMovements.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-2 font-mono text-left border-l border-slate-800">
                    {trialTotals.totalDebit.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-2 font-mono text-left border-l border-slate-800">
                    {trialTotals.totalCredit.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-2 font-mono text-left border-l border-slate-800 text-emerald-300">
                    {trialTotals.endingDebit.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-2 font-mono text-left text-purple-300">
                    {trialTotals.endingCredit.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Balance Confirmation Indicator */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              {Math.abs(trialTotals.endingDebit - trialTotals.endingCredit) < 1 ? (
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>الميزان متوازن محاسبياً (إجمالي المدين = إجمالي الدائن)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-rose-700 font-bold">
                  <AlertCircle className="w-5 h-5" />
                  <span>
                    يوجد فارق في توازن الميزان: {Math.abs(trialTotals.endingDebit - trialTotals.endingCredit).toLocaleString('ar-EG')} ج.م
                  </span>
                </div>
              )}
            </div>

            <div className="text-slate-500 font-mono">
              صافي الميزانية: {(trialTotals.endingDebit).toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

