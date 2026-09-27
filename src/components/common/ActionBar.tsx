import React from 'react';
import {
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
  ChevronsLeft,
  Plus,
  Save,
  Edit3,
  Trash2,
  Printer,
  FileDown,
  Search,
  RotateCcw
} from 'lucide-react';

interface ActionBarProps {
  onFirst?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onLast?: () => void;
  onNew: () => void;
  onSave?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onPrint?: () => void;
  onExportPdf?: () => void;
  onSearch?: () => void;
  onReset?: () => void;
  isNewMode?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canPrint?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  title?: string;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  onFirst,
  onPrev,
  onNext,
  onLast,
  onNew,
  onSave,
  onEdit,
  onDelete,
  onPrint,
  onExportPdf,
  onSearch,
  onReset,
  isNewMode = false,
  canEdit = true,
  canDelete = true,
  canPrint = true,
  searchPlaceholder = 'بحث بالرقم أو الكود...',
  searchValue,
  onSearchChange,
  title
}) => {
  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-3 mb-5 flex flex-wrap items-center justify-between gap-3 no-print">
      {/* Navigation Buttons */}
      <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
        <span className="text-xs font-semibold text-slate-500 px-2">تنقل:</span>
        <button
          type="button"
          onClick={onFirst}
          disabled={!onFirst}
          title="السجل الأول"
          className="p-1.5 rounded hover:bg-white text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onPrev}
          disabled={!onPrev}
          title="السجل السابق"
          className="p-1.5 rounded hover:bg-white text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!onNext}
          title="السجل التالي"
          className="p-1.5 rounded hover:bg-white text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onLast}
          disabled={!onLast}
          title="السجل الأخير"
          className="p-1.5 rounded hover:bg-white text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Main Operations */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onNew}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
            isNewMode
              ? 'bg-amber-600 text-white hover:bg-amber-700'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>{isNewMode ? 'جديد (مفتوح)' : 'جديد (F2)'}</span>
        </button>

        {onSave && (
          <button
            type="button"
            onClick={onSave}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition cursor-pointer shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>حفظ (F10)</span>
          </button>
        )}

        {onEdit && canEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-sm font-semibold transition cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>تعديل</span>
          </button>
        )}

        {onDelete && canDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-sm font-semibold transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>حذف</span>
          </button>
        )}

        {onPrint && canPrint && (
          <button
            type="button"
            onClick={onPrint}
            title="طباعة المستند ورقة / طابعة"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-sm font-semibold transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>طباعة (Ctrl+P)</span>
          </button>
        )}

        {(onExportPdf || onPrint) && canPrint && (
          <button
            type="button"
            onClick={() => {
              if (onExportPdf) {
                onExportPdf();
              } else if (onPrint) {
                const prevTitle = document.title;
                if (title) document.title = `${title}_${new Date().toISOString().slice(0, 10)}`;
                onPrint();
                setTimeout(() => { document.title = prevTitle; }, 1500);
              }
            }}
            title="طباعة وتصدير كملف PDF"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-sm font-semibold transition cursor-pointer shadow-xs"
          >
            <FileDown className="w-4 h-4 text-rose-600" />
            <span>طباعة PDF</span>
          </button>
        )}

        {onReset && (
          <button
            type="button"
            onClick={onReset}
            title="تفريغ الحقول"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Recall / Search */}
      {onSearchChange !== undefined && (
        <div className="flex items-center gap-1.5 relative min-w-[200px]">
          <input
            type="text"
            value={searchValue || ''}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full text-xs py-1.5 pr-8 pl-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-2.5 pointer-events-none" />
          {onSearch && (
            <button
              type="button"
              onClick={onSearch}
              className="text-xs bg-slate-800 text-white px-2.5 py-1.5 rounded-lg hover:bg-black transition whitespace-nowrap cursor-pointer"
            >
              استدعاء
            </button>
          )}
        </div>
      )}
    </div>
  );
};
