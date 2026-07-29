import React from "react";

export type TableData = {
  headers: string[];
  rows: string[][];
};

interface ProductSpecsSEOProps {
  data: TableData | string;
  productName?: string; // نام محصول برای بهتر شدن اسکیما
}

export default function ProductTableSeo({
  data,
  productName = "محصول",
}: ProductSpecsSEOProps) {
  // ۱. پارس کردن ایمن داده‌ها در سرور
  let parsedData: TableData | null = null;

  if (typeof data === "string") {
    try {
      parsedData = JSON.parse(data);
    } catch {
      parsedData = null;
    }
  } else {
    parsedData = data;
  }

  // اگر دیتا معتبر نبود یا خالی بود چیزی رندر نشود
  if (!parsedData || !parsedData.headers || parsedData.rows.length === 0) {
    return null;
  }

  // ۲. تولید Schema.org استاندارد برای سئو (Rich Snippets)
  // تبدیل ردیف‌ها به فرمت additionalProperty مورد تایید گوگل
  const schemaProperties = parsedData.rows.map((row) => ({
    "@type": "PropertyValue",
    "name": row[0] || "ویژگی",
    "value": row.slice(1).join(" - ") || "-",
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": productName,
    "additionalProperty": schemaProperties,
  };

  return (
    <section className="w-full my-8 dir-rtl">
      {/* اسکیما مخفی برای ربات‌های گوگل */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
        {/* استفاده از Semantic HTML کاملاً استاندارد */}
        <table className="w-full text-right text-sm border-collapse">
          {/* عنوان جدول برای Accessibility و موتورهای جستجو */}
          <caption className="sr-only">مشخصات و ویژگی‌های {productName}</caption>
          
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800/90 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">
              {parsedData.headers.map((header, idx) => (
                <th
                  key={idx}
                  scope="col"
                  className="px-4 py-3.5 font-bold whitespace-nowrap min-w-[120px]"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {parsedData.rows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors"
              >
                {row.map((cell, colIdx) => {
                  // ستون اول به عنوان Header ردیف (Row Header) برای سئوی بهتر شناسایی می‌شود
                  const isFirstCol = colIdx === 0;
                  return isFirstCol ? (
                    <th
                      key={colIdx}
                      scope="row"
                      className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap"
                    >
                      {cell || "-"}
                    </th>
                  ) : (
                    <td
                      key={colIdx}
                      className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed"
                    >
                      {cell || "-"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}