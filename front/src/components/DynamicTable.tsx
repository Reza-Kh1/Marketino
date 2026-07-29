'use client';
import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SlidersHorizontal } from 'lucide-react';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getExpandedRowModel,
    getFilteredRowModel, // 🟢 اضافه شد برای فیلتر کلاینت
    flexRender,
    ColumnDef,
    SortingState,
    ExpandedState
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import MotionWrapper from '@/components/motion/MotionWrapper';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import Link from 'next/link';
import InputForm from './inputs/InputForm';
import CustomButton from './CustomButton';

interface DynamicTableProps<TData> {
    data: TData[];
    columns: ColumnDef<TData, any>[];
    totalRows: number;
    isLoading?: boolean;
    searchPlaceholder?: string;
    subRowsKey?: keyof TData;
    onBulkDelete?: (selectedIds: string[]) => void;
    nextPage?: number;
    prevPage?: number;
    limitPage?: number
}

export default function DynamicTable<TData>({
    data,
    columns,
    nextPage = 0,
    limitPage,
    prevPage = 0,
    totalRows,
    isLoading,
    searchPlaceholder = "جستجو در جدول ...",
    subRowsKey,
    onBulkDelete
}: DynamicTableProps<TData>) {
    const searchParams = useSearchParams();
    const page = searchParams.get('page') || 1;
    const limit = limitPage || searchParams.get('limit') || 10;
    const [sorting, setSorting] = useState<SortingState>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [expanded, setExpanded] = useState<ExpandedState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [columnVisibility, setColumnVisibility] = useState({});
    const table = useReactTable({
        onColumnVisibilityChange: setColumnVisibility,
        data,
        columns,
        state: {
            sorting,
            globalFilter: searchTerm, // 🟢 مقدار سرچ محلی به اِلمان اصلی متصل شد
            pagination,
            expanded,
            rowSelection,
            columnVisibility
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setSearchTerm, // 🟢 تغییر مستقیم ستیت لوکال
        onPaginationChange: setPagination,
        onExpandedChange: setExpanded,
        onRowSelectionChange: setRowSelection,
        pageCount: Math.ceil(Number(totalRows) / pagination.pageSize) || -1,
        getSubRows: (row) => (subRowsKey ? (row[subRowsKey] as any) : undefined),

        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getFilteredRowModel: getFilteredRowModel(), // 🟢 فعال‌سازی موتور فیلتر داخلی TanStack

        manualPagination: true, // پجینیشن همچنان با URL و سمت سرور کنترل می‌شود
        manualFiltering: false, // 🟢 تغییر به false تا فیلترینگ سمت کلاینت انجام شود
    });

    const selectedFlatRows = table.getSelectedRowModel().flatRows;
    return (
        <div className="custom-box mb-20">
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                    <div className="relative flex-1 max-w-sm">
                        <InputForm
                            name='search'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={searchPlaceholder}
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute left-3 top-1/2 -translate-y-1/2">
                                <X className="w-4 h-4 text-admin-text-muted" />
                            </button>
                        )}
                    </div>

                    {/* منوی مدیریت نمایش ستون‌ها */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-10 border-admin-border gap-2 flex items-center cursor-pointer">
                                <span>مدیریت ستون‌ها</span>
                                <SlidersHorizontal className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-sidebar-bg border-admin-border min-w-40 p-1 bg-white dark:bg-[#0a0a0a]">
                            {table
                                .getAllLeafColumns()
                                .filter(col => col.id !== 'select' && col.id !== 'actions')
                                .map(column => (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize cursor-pointer justify-end text-right text-sm"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                    >
                                        {column.id === 'name' ? 'نام' : column.id === 'slug' ? 'اسلاگ' : column.id}
                                    </DropdownMenuCheckboxItem>
                                ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {selectedFlatRows.length > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-admin-text-muted">{selectedFlatRows.length} مورد انتخاب شده</span>
                            {onBulkDelete && (
                                <CustomButton
                                    colorHover='red'
                                    color='gray'
                                    size='sm'
                                    onClick={() => {
                                        if (window.confirm('آیا از حذف گروهی اطمینان دارید؟')) {
                                            const ids = selectedFlatRows.map((row: any) => row.original.id);
                                            onBulkDelete(ids as any);
                                            table.resetRowSelection();
                                        }
                                    }}
                                >
                                    <span className='text-xs'>حذف گروهی</span>
                                </CustomButton>
                            )}
                        </div>
                    )}
                </div>

                {/* بدنه جدول */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12"><div className='spinner w-14! h-14!'></div></div>
                ) : (
                    <div className="rounded-xl border border-admin-border overflow-hidden p-2">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map(hg => (
                                    <TableRow key={hg.id}>
                                        {hg.headers.map(h => (
                                            <TableHead key={h.id} className="text-right">
                                                {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map(row => (
                                        <TableRow key={row.id} data-state={row.getIsSelected() ? 'selected' : ''}>
                                            {row.getVisibleCells().map(cell => (
                                                <TableCell key={cell.id} className="text-right">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-32 text-center">
                                            <div className="flex flex-col items-center gap-2 text-admin-text-muted">
                                                <Search className="w-8 h-8 opacity-50" />
                                                <p>نتیجه‌ای یافت نشد</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {/* پجینیشن */}
                <MotionWrapper duration={1} preset='fadeUp'>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-admin-text-muted">
                            {totalRows > 0 ? (`نمایش ${((Number(page) - 1) * Number(limit)) + 1} تا ${Math.min(Number(page) * Number(limit), totalRows)} از ${totalRows} مورد`) : ('موردی موجود نیست')}                        </div>
                        <div className="flex items-center gap-2" style={{ direction: 'ltr' }}>
                            {prevPage ? (
                                <Tooltip >
                                    <TooltipTrigger>
                                        <Link
                                            href={{ query: { ...Object.fromEntries(searchParams.entries()), page: prevPage } }}
                                            className="h-8 px-3 cursor-pointer border border-admin-primary hover:bg-admin-border flex items-center justify-center rounded-3xl"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        صفحه قبل
                                    </TooltipContent>
                                </Tooltip>
                            ) :
                                <Button variant="outline" size="sm" disabled className="h-8 px-3 border-admin-border">
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                            }
                            {totalRows > 0 ?
                                <span className="text-sm text-admin-text-muted px-2" style={{ direction: 'rtl' }}> صفحه {Number(page) || 1} از {Math.ceil(totalRows / Number(limit)) || 1}</span>
                                : <span className='text-xs text-admin-text-muted'>! موردی یافت نشد</span>}
                            {nextPage ? (
                                <Tooltip >
                                    <TooltipTrigger>
                                        <Link
                                            href={{ query: { ...Object.fromEntries(searchParams.entries()), page: nextPage } }}
                                            className="h-8 px-3 cursor-pointer border border-admin-primary hover:bg-admin-border flex items-center justify-center rounded-3xl"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        صفحه بعد
                                    </TooltipContent>
                                </Tooltip>
                            ) :
                                <Button variant="outline" size="sm" disabled className="h-8 px-3 border-admin-border">
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            }
                        </div>
                    </div>
                </MotionWrapper>
            </div>
        </div>
    );
}