'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Upload, FileUp, Download, FileSpreadsheet, CheckCircle,
  AlertTriangle, ArrowRight, Loader2, Trash2, Info,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import toast from 'react-hot-toast';
import { productsApi } from '@/lib/api';

interface ImportRow {
  title: string;
  price: string;
  quantity: string;
  category: string;
  brand: string;
  description: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

const CATEGORIES = [
  'electronics', 'clothing', 'home', 'sports', 'beauty',
  'books', 'toys', 'food', 'jewelry', 'art', 'cars', 'tools', 'medical', 'other',
];

export default function BulkImportPage() {
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());

      if (lines.length < 2) {
        toast.error('فایل CSV خالی است یا فرمت نامعتبر دارد');
        return;
      }

      // Parse header
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const titleIdx = headers.indexOf('title');
      const priceIdx = headers.indexOf('price');
      const qtyIdx = headers.indexOf('quantity');
      const catIdx = headers.indexOf('category');
      const brandIdx = headers.indexOf('brand');
      const descIdx = headers.indexOf('description');

      if (titleIdx === -1 || priceIdx === -1) {
        toast.error('فایل CSV باید حداقل ستون‌های title و price را داشته باشد');
        return;
      }

      const parsedRows: ImportRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim());
        const row: ImportRow = {
          title: cols[titleIdx] || '',
          price: cols[priceIdx] || '',
          quantity: qtyIdx >= 0 ? cols[qtyIdx] : '0',
          category: catIdx >= 0 ? cols[catIdx] : 'other',
          brand: brandIdx >= 0 ? cols[brandIdx] : '',
          description: descIdx >= 0 ? cols[descIdx] : '',
          status: 'pending',
        };

        if (!row.title || !row.price || isNaN(Number(row.price))) {
          row.status = 'error';
          row.error = 'عنوان یا قیمت نامعتبر';
        }

        parsedRows.push(row);
      }

      setRows(parsedRows);
      toast.success(`${parsedRows.length} محصول از فایل CSV بارگذاری شد`);
    } catch {
      toast.error('خطا در خواندن فایل CSV');
    }
  };

  const handleImport = async () => {
    const validRows = rows.filter(r => r.status !== 'error');
    if (validRows.length === 0) {
      toast.error('هیچ ردیف معتبری برای وارد کردن وجود ندارد');
      return;
    }

    setImporting(true);
    let done = 0;

    for (const row of validRows) {
      try {
        await productsApi.create({
          title: row.title,
          price: Number(row.price),
          quantity: Number(row.quantity) || 0,
          categoryId: CATEGORIES.includes(row.category) ? row.category : 'other',
          brand: row.brand,
          description: row.description,
        } as any);
        row.status = 'success';
      } catch (err: any) {
        row.status = 'error';
        row.error = err?.message || 'خطا در ذخیره';
      }
      done++;
      setProgress(Math.round((done / validRows.length) * 100));
      setRows([...rows]);
    }

    const successCount = rows.filter(r => r.status === 'success').length;
    toast.success(`${successCount} محصول با موفقیت وارد شد`);
    setImporting(false);
  };

  const downloadTemplate = () => {
    const csv = 'title,price,quantity,category,brand,description\nمحصول نمونه,1000000,50,electronics,برند,\nمحصول دوم,2000000,30,clothing,,\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/seller/products" className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-accent transition-colors">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl font-black">وارد کردن انبوه محصولات</h2>
          <p className="text-sm text-muted-foreground mt-1">محصولات را از فایل CSV وارد کنید</p>
        </div>
      </div>

      {/* Template Download */}
      <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Info className="w-5 h-5 text-blue-600" />
          <div>
            <p className="font-bold text-sm">قالب فایل CSV را دانلود کنید</p>
            <p className="text-xs text-muted-foreground mt-0.5">ستون‌های الزامی: title, price</p>
          </div>
        </div>
        <button onClick={downloadTemplate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors">
          <Download className="w-4 h-4" /> دانلود قالب
        </button>
      </div>

      {/* File Upload */}
      {rows.length === 0 && (
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-border rounded-2xl p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-accent/50 transition-colors"
        >
          <FileSpreadsheet className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
          <p className="font-bold text-lg mb-1">فایل CSV را اینجا بکشید یا کلیک کنید</p>
          <p className="text-sm text-muted-foreground">فرمت csv • حداکثر ۵۰۰ محصول</p>
          <input ref={fileRef} type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />
        </div>
      )}

      {/* Preview Table */}
      {rows.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="font-bold">{rows.length} محصول برای وارد کردن</p>
            {!importing && (
              <button onClick={() => { setRows([]); setProgress(0); }}
                className="text-sm text-muted-foreground hover:text-red-500 transition-colors">
                پاک کردن همه
              </button>
            )}
          </div>

          {importing && (
            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
            </div>
          )}

          <div className="bg-card border border-border rounded-2xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-accent/50">
                <tr>
                  <th className="text-right py-3 px-4 font-bold">#</th>
                  <th className="text-right py-3 px-4 font-bold">عنوان</th>
                  <th className="text-right py-3 px-4 font-bold">قیمت</th>
                  <th className="text-right py-3 px-4 font-bold">موجودی</th>
                  <th className="text-right py-3 px-4 font-bold">دسته</th>
                  <th className="text-right py-3 px-4 font-bold">وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="py-2 px-4 text-muted-foreground text-xs">{i + 1}</td>
                    <td className="py-2 px-4 font-medium max-w-[200px] truncate">{row.title}</td>
                    <td className="py-2 px-4">{Number(row.price).toLocaleString()}</td>
                    <td className="py-2 px-4">{row.quantity}</td>
                    <td className="py-2 px-4 text-muted-foreground">{row.category}</td>
                    <td className="py-2 px-4">
                      {row.status === 'pending' && <span className="text-xs text-muted-foreground">آماده</span>}
                      {row.status === 'success' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                      {row.status === 'error' && (
                        <span className="text-xs text-red-500" title={row.error}>
                          <AlertTriangle className="w-4 h-4" />
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!importing && (
            <button onClick={handleImport}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold hover:shadow-lg transition-all">
              <Upload className="w-5 h-5" />
              شروع وارد کردن {rows.filter(r => r.status !== 'error').length} محصول
            </button>
          )}

          {importing && (
            <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              در حال وارد کردن... {progress}%
            </div>
          )}
        </>
      )}
    </div>
  );
}
