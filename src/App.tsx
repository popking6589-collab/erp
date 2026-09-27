/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LoginModal } from './components/auth/LoginModal';
import { YearCloseModal } from './components/screens/YearCloseModal';
import { SystemResetModal } from './components/screens/SystemResetModal';

// Screens
import { DashboardScreen } from './components/screens/DashboardScreen';
import { SystemAdminScreen } from './components/screens/SystemAdminScreen';
import { OperationsHubScreen } from './components/screens/OperationsHubScreen';
import { CompanyScreen } from './components/screens/CompanyScreen';
import { UsersScreen } from './components/screens/UsersScreen';
import { AccountsScreen } from './components/screens/AccountsScreen';
import { JobsScreen } from './components/screens/JobsScreen';
import { DepartmentsScreen } from './components/screens/DepartmentsScreen';
import { EmployeesScreen } from './components/screens/EmployeesScreen';
import { WarehousesScreen } from './components/screens/WarehousesScreen';
import { ItemsScreen } from './components/screens/ItemsScreen';
import { CustomersScreen } from './components/screens/CustomersScreen';
import { SuppliersScreen } from './components/screens/SuppliersScreen';
import { SalesInvoiceScreen } from './components/screens/SalesInvoiceScreen';
import { SalesReturnScreen } from './components/screens/SalesReturnScreen';
import { PurchaseInvoiceScreen } from './components/screens/PurchaseInvoiceScreen';
import { PurchaseReturnScreen } from './components/screens/PurchaseReturnScreen';
import { StockAdjustmentsScreen } from './components/screens/StockAdjustmentsScreen';
import { WarehouseTransferScreen } from './components/screens/WarehouseTransferScreen';
import { CashBankScreen } from './components/screens/CashBankScreen';
import { ReceiptVoucherScreen } from './components/screens/ReceiptVoucherScreen';
import { PaymentVoucherScreen } from './components/screens/PaymentVoucherScreen';
import { JournalEntriesScreen } from './components/screens/JournalEntriesScreen';
import { ReportsScreen } from './components/screens/ReportsScreen';

const MainAppContent: React.FC = () => {
  const {
    currentScreen,
    canAccess,
    isResetModalOpen,
    closeResetModal,
    openResetModal,
    isYearCloseModalOpen,
    closeYearCloseModal,
    openYearCloseModal
  } = useApp();

  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Check view permission
  const hasAccess = canAccess(currentScreen, 'view');

  const renderScreen = () => {
    if (!hasAccess) {
      return (
        <div className="bg-white border border-rose-200 rounded-3xl p-12 text-center max-w-lg mx-auto my-12 space-y-3">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
            🚫
          </div>
          <h2 className="text-lg font-bold text-slate-900">غير مصرح لك بالوصول</h2>
          <p className="text-xs text-slate-500">
            ليس لديك صلاحية عرض هذه الشاشة. يرجى مراجعة مدير النظام لمنحك الصلاحيات اللازمة.
          </p>
        </div>
      );
    }

    switch (currentScreen) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'system_admin':
        return <SystemAdminScreen />;
      case 'operations_hub':
        return <OperationsHubScreen />;
      case 'company':
        return <CompanyScreen />;
      case 'users':
        return <UsersScreen />;
      case 'accounts':
        return <AccountsScreen />;
      case 'jobs':
        return <JobsScreen />;
      case 'departments':
        return <DepartmentsScreen />;
      case 'employees':
        return <EmployeesScreen />;
      case 'warehouses':
        return <WarehousesScreen />;
      case 'items':
        return <ItemsScreen />;
      case 'customers':
        return <CustomersScreen />;
      case 'suppliers':
        return <SuppliersScreen />;
      case 'sales_invoice':
        return <SalesInvoiceScreen />;
      case 'sales_return':
        return <SalesReturnScreen />;
      case 'purchase_invoice':
        return <PurchaseInvoiceScreen />;
      case 'purchase_return':
        return <PurchaseReturnScreen />;
      case 'stock_adjustments':
        return <StockAdjustmentsScreen />;
      case 'warehouse_transfer':
        return <WarehouseTransferScreen />;
      case 'cash_bank':
        return <CashBankScreen />;
      case 'receipt_voucher':
        return <ReceiptVoucherScreen />;
      case 'payment_voucher':
        return <PaymentVoucherScreen />;
      case 'journal_entries':
        return <JournalEntriesScreen />;
      case 'reports':
        return <ReportsScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800 font-['Cairo',sans-serif]">
      {/* Top Navigation */}
      <Navbar
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenYearClose={openYearCloseModal}
        onOpenReset={openResetModal}
      />

      {/* Main Body Area: Sidebar + Content */}
      <div className="flex-1 flex max-w-[1920px] w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-h-[calc(100vh-80px)]">
          {renderScreen()}
        </main>
      </div>

      {/* Login & Switch User Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />

      {/* Year Close Modal */}
      <YearCloseModal
        isOpen={isYearCloseModalOpen}
        onClose={closeYearCloseModal}
      />

      {/* System Reset & Data Wipe Modal */}
      <SystemResetModal
        isOpen={isResetModalOpen}
        onClose={closeResetModal}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
