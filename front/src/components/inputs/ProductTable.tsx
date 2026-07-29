"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, X, Check, Save, Eraser } from "lucide-react";
export type TableData = {
  headers: string[];
  rows: string[][];
};

interface ProductTableProps {
  value?: TableData | string | null;
  onChange: (newValue: TableData | null) => void;
  english?: boolean;
}


const DEFAULT_DATA: TableData = {
  headers: ["عنوان ۱", "عنوان ۲"],
  rows: [["", ""]],
};

const DEFAULT_DATA_En: TableData = {
  headers: ["Title 1", "Title 2"],
  rows: [["", ""]],
};

export default function ProductTable({ value, onChange, english }: ProductTableProps) {
  const parseValue = (val?: TableData | string): TableData => {
    if (!val) return DEFAULT_DATA;

    let dataObj: TableData | null = null;
    if (typeof val === "string") {
      try {
        dataObj = JSON.parse(val);
      } catch {
        return DEFAULT_DATA;
      }
    } else {
      dataObj = val;
    }
    if (!dataObj || !dataObj.headers || dataObj.headers.length === 0) {
      return DEFAULT_DATA;
    }
    return dataObj;
  };

  const isDefaultOrEmpty = (data: TableData): boolean => {
    // چک کردن با مقادیر دیفالت فارسی و انگلیسی
    const isDefaultFa = JSON.stringify(data) === JSON.stringify(DEFAULT_DATA);
    const isDefaultEn = JSON.stringify(data) === JSON.stringify(DEFAULT_DATA_En);

    if (isDefaultFa || isDefaultEn) return true;

    // اگر همه سلول‌های ردیف‌ها خالی باشند هم می‌توان آن را خالی (null) در نظر گرفت
    const isAllCellsEmpty = data.rows.every(row => row.every(cell => cell.trim() === ""));

    return isAllCellsEmpty;
  };
  const [localData, setLocalData] = useState<TableData>(() => {
    if (value) {
      return parseValue(value)
    }
    return english ? DEFAULT_DATA_En : DEFAULT_DATA
  });
  const [isSaved, setIsSaved] = useState(false);

  // همگام‌سازی استیت داخلی در صورتی که value از بیرون (مثلا API) تغییر کند
  useEffect(() => {
    if (value) {
      setLocalData(parseValue(value));
    }
  }, [value]);

  // ۳. ثبت تغییرات در کامپوننت پدر فقط با زدن دکمه
  const handleApplyChanges = () => {
    const finalData = isDefaultOrEmpty(localData) ? null : localData;
    onChange(finalData);

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // پاک کردن کامل جدول
  const clearTable = () => {
    if (confirm(english ? "Are you sure you want to clear the table?" : "آیا از پاک کردن کامل جدول اطمینان دارید؟")) {
      const emptyData = english ? DEFAULT_DATA_En : DEFAULT_DATA;
      setLocalData(emptyData);
      onChange(null); // بلافاصله مقدار null به کامپوننت پدر ارسال می‌شود
    }
  };

  // --- مدیریت ستون‌ها (در استیت داخلی) ---
  const addColumn = () => {
    setLocalData((prev) => ({
      headers: [...prev.headers, `عنوان ${prev.headers.length + 1}`],
      rows: prev.rows.map((row) => [...row, ""]),
    }));
  };

  const removeColumn = (colIndex: number) => {
    if (localData.headers.length <= 1) return;
    setLocalData((prev) => ({
      headers: prev.headers.filter((_, idx) => idx !== colIndex),
      rows: prev.rows.map((row) => row.filter((_, idx) => idx !== colIndex)),
    }));
  };

  const updateHeader = (colIndex: number, text: string) => {
    setLocalData((prev) => {
      const newHeaders = [...prev.headers];
      newHeaders[colIndex] = text;
      return { ...prev, headers: newHeaders };
    });
  };

  // --- مدیریت ردیف‌ها (در استیت داخلی) ---
  const addRow = () => {
    setLocalData((prev) => ({
      ...prev,
      rows: [...prev.rows, new Array(prev.headers.length).fill("")],
    }));
  };

  const removeRow = (rowIndex: number) => {
    setLocalData((prev) => ({
      ...prev,
      rows: prev.rows.filter((_, idx) => idx !== rowIndex),
    }));
  };

  const updateCell = (rowIndex: number, colIndex: number, text: string) => {
    setLocalData((prev) => {
      const newRows = prev.rows.map((row, rIdx) => {
        if (rIdx === rowIndex) {
          const updatedRow = [...row];
          updatedRow[colIndex] = text;
          return updatedRow;
        }
        return row;
      });
      return { ...prev, rows: newRows };
    });
  };

  return (
    <div className="w-full card p-4">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          {english ? 'Product Specifications Table' : 'جدول مشخصات محصول'}
        </h3>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={clearTable}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 rounded-lg hover:bg-red-100 transition"
            title="خالی کردن جدول"
          >
            <Eraser className="w-3.5 h-3.5" />
            {english ? 'Clear Table' : ' خالی کردن'}
          </button>
          <button
            type="button"
            onClick={addColumn}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            {english ? 'Add column' : 'افزودن ستون'}
          </button>

          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            {english ? 'Add row' : 'افزودن ردیف'}
          </button>

          <button
            type="button"
            onClick={handleApplyChanges}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg text-white font-medium transition-all ${isSaved
              ? "bg-emerald-600 hover:bg-emerald-700"
              : "bg-blue-600 hover:bg-blue-700 shadow-sm"
              }`}
          >
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5" />
                {english ? 'It was applied.' : ' اعمال شد'}
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                {english ? 'Save table changes' : ' ثبت تغییرات جدول'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto border border-gray-100 dark:border-gray-800 rounded-lg">
        <table className="w-full text-right text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
              {localData.headers.map((header, colIdx) => (
                <th key={colIdx} className="p-2 min-w-[140px]">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={header}
                      onChange={(e) => updateHeader(colIdx, e.target.value)}
                      placeholder={english ? 'Title Column' : "عنوان ستون"}
                      className="w-full bg-transparent font-medium text-gray-700 dark:text-gray-200 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-1 py-0.5 text-xs transition"
                    />
                    {localData.headers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeColumn(colIdx)}
                        title={english ? 'Delete column' : "حذف ستون"}
                        className="text-gray-400 hover:text-red-500 transition p-1 rounded"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
              <th className="w-10 p-2 text-center"></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {localData.rows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition"
              >
                {row.map((cell, colIdx) => (
                  <td key={colIdx} className="p-2">
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => updateCell(rowIdx, colIdx, e.target.value)}
                      placeholder={english ? 'subject' : "مقدار..."}
                      className="w-full bg-transparent text-gray-600 dark:text-gray-300 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 rounded px-2 py-1 text-xs focus:outline-none transition"
                    />
                  </td>
                ))}
                <td className="p-2 text-center">
                  <button
                    type="button"
                    onClick={() => removeRow(rowIdx)}
                    title={english ? "Delete row" : "حذف ردیف"}
                    className="text-gray-400 hover:text-red-500 transition p-1"
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
  );
}