'use client';

import React, { useState, useMemo } from 'react';
import { useProvinces, useDeleteProvince, useCities, useDeleteCity } from '@/hooks/province.hook';
import { CityEntity, ProvinceEntity } from '@/services/province.service';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

import MotionWrapper from '@/components/motion/MotionWrapper';
import CustomButton from '@/components/CustomButton';
import DynamicTable from '@/components/DynamicTable';
import ProvinceForm from './ProvinceForm';
import DialogDelete from '@/components/DialogDelete';
import CityForm from './CityForm';

type ModalMode = 'create_province' | 'edit_province' | 'view_province' | 'delete_province' | 'create_city' | 'edit_city' | 'view_city' | 'delete_city' | null;

export default function CityPage() {
    const [activeTab, setActiveTab] = useState<'provinces' | 'cities'>('provinces');
    const [modalMode, setModalMode] = useState<ModalMode>(null);
    const [selectedId, setSelectedId] = useState<string>('');
    const [selectedProvince, setSelectedProvince] = useState<ProvinceEntity | null>(null);
    const [selectedCity, setSelectedCity] = useState<CityEntity | null>(null);

    const { data: provincesData } = useProvinces();
    const { data: citiesData } = useCities();
    const { mutate: deleteProvince } = useDeleteProvince();
    const { mutate: deleteCity } = useDeleteCity();

    const provinces = provincesData || [];
    const cities = citiesData || [];

    const openProvinceCreateModal = () => { setModalMode('create_province'); setSelectedId(''); };
    const openProvinceEditModal = (id: string) => { setModalMode('edit_province'); setSelectedId(id); };
    const openProvinceViewModal = (id: string, province: ProvinceEntity) => { setModalMode('view_province'); setSelectedId(id); setSelectedProvince(province); };
    const openProvinceDeleteModal = (id: string) => { setModalMode('delete_province'); setSelectedId(id); };
    const openCityCreateModal = () => { setModalMode('create_city'); setSelectedId(''); };
    const openCityEditModal = (id: string) => { setModalMode('edit_city'); setSelectedId(id); };
    const openCityViewModal = (id: string, city: CityEntity) => { setModalMode('view_city'); setSelectedId(id); setSelectedCity(city); };
    const openCityDeleteModal = (id: string) => { setModalMode('delete_city'); setSelectedId(id); };
    const closeModal = () => { setModalMode(null); setSelectedId(''); setSelectedProvince(null); setSelectedCity(null); };

    const provinceColumns: ColumnDef<ProvinceEntity>[] = useMemo(() => [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                    onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
                    className="border-admin-border"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(v) => row.toggleSelected(!!v)}
                    className="border-admin-border"
                />
            ),
        },
        {
            accessorKey: 'name',
            header: 'نام استان',
            cell: ({ row }) => <span className="font-medium">{row.original.name || '—'}</span>,
        },
        {
            accessorKey: 'nameEn',
            header: 'نام استان انگلیسی',
            cell: ({ row }) => <span className="font-medium">{row.original.nameEn || '—'}</span>,
        },
        {
            id: 'actions',
            header: 'عملیات',
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openProvinceViewModal(row.original.id, row.original)} className="cursor-pointer h-8 w-8 p-0 hover:bg-admin-primary/20">
                        <Eye className="w-4 h-4 text-admin-primary" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openProvinceEditModal(row.original.id)} className="cursor-pointer h-8 w-8 p-0 hover:bg-admin-accent/20">
                        <Pencil className="w-4 h-4 text-admin-accent" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openProvinceDeleteModal(row.original.id)} className="cursor-pointer h-8 w-8 p-0 hover:bg-admin-destructive/20">
                        <Trash2 className="w-4 h-4 text-admin-destructive" />
                    </Button>
                </div>
            ),
        },
    ], []);

    const cityColumns: ColumnDef<CityEntity>[] = useMemo(() => [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                    onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
                    className="border-admin-border"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(v) => row.toggleSelected(!!v)}
                    className="border-admin-border"
                />
            ),
        },
        {
            accessorKey: 'name',
            header: 'نام شهر',
            cell: ({ row }) => <span className="font-medium">{row.original.name || '—'}</span>,
        },
        {
            accessorKey: 'nameEn',
            header: 'نام شهر انگلیسی',
            cell: ({ row }) => <span className="font-medium">{row.original.nameEn || '—'}</span>,
        },
        {
            accessorKey: 'province',
            header: 'استان',
            cell: ({ row }) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-admin-primary/20 text-admin-primary">
                    {row.original.province?.name || '—'}
                </span>
            ),
        },
        {
            id: 'actions',
            header: 'عملیات',
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openCityViewModal(row.original.id, row.original)} className="cursor-pointer h-8 w-8 p-0 hover:bg-admin-primary/20">
                        <Eye className="w-4 h-4 text-admin-primary" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openCityEditModal(row.original.id)} className="cursor-pointer h-8 w-8 p-0 hover:bg-admin-accent/20">
                        <Pencil className="w-4 h-4 text-admin-accent" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openCityDeleteModal(row.original.id)} className="cursor-pointer h-8 w-8 p-0 hover:bg-admin-destructive/20">
                        <Trash2 className="w-4 h-4 text-admin-destructive" />
                    </Button>
                </div>
            ),
        },
    ], []);

    return (
        <div className="space-y-6">
            <MotionWrapper preset="fadeUp" duration={0.5}>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-admin-text-primary">مدیریت استان و شهر</h1>
                            <p className="text-sm text-admin-text-muted mt-1">مدیریت استان‌ها و شهرهای سایت</p>
                        </div>
                    </div>
                    {activeTab === 'provinces' && (
                        <div className='flex flex-col gap-5'>
                            <div className="flex justify-between mb-4">
                                <div className='flex gap-2'>
                                    <CustomButton
                                        onClick={() => setActiveTab('provinces')}
                                        name='استان‌ها'
                                        color={activeTab === 'provinces' ? 'white' : 'gray'}
                                        disabled={activeTab === 'provinces'}
                                    />
                                    <CustomButton
                                        onClick={() => setActiveTab('cities')}
                                        name='شهرها'
                                        disabled={false}
                                    />
                                </div>
                                <CustomButton onClick={openProvinceCreateModal} color='white' iconStart={<Plus />} name='افزودن' />
                            </div>
                            <DynamicTable
                                limitPage={provinces.length}
                                data={provinces}
                                columns={provinceColumns}
                                totalRows={provinces.length}
                                isLoading={false}
                            />
                        </div>
                    )}

                    {activeTab === 'cities' && (
                        <div className='flex flex-col gap-5'>
                            <div className="flex justify-between mb-4">
                                <div className='flex gap-2'>
                                    <CustomButton
                                        onClick={() => setActiveTab('provinces')}
                                        name='استان‌ها'
                                        disabled={false}
                                    />
                                    <CustomButton
                                        onClick={() => setActiveTab('cities')}
                                        name='شهرها'
                                        color={activeTab === 'cities' ? 'white' : 'gray'}
                                        disabled={activeTab === 'cities'}
                                    />
                                </div>
                                <CustomButton onClick={openCityCreateModal} color='white' iconStart={<Plus />} name='افزودن' />
                            </div>
                            <DynamicTable
                                limitPage={cities.length}
                                data={cities}
                                columns={cityColumns}
                                totalRows={cities.length}
                                isLoading={false}
                            />
                        </div>
                    )}
                </div>
            </MotionWrapper>

            {/* Province Modals */}
            <Dialog open={modalMode === 'create_province' || modalMode === 'edit_province'} onOpenChange={(open) => !open && closeModal()}>
                <DialogContent className="min-w-4xl bg-bg-admin-dark/40 backdrop-blur-xl">
                    <DialogHeader>
                        <DialogTitle className="text-admin-text-primary">{modalMode === 'create_province' ? 'ایجاد استان جدید' : 'ویرایش استان'}</DialogTitle>
                        <DialogDescription className="text-admin-text-muted">
                            {modalMode === 'create_province' ? 'اطلاعات استان جدید را وارد کنید' : 'اطلاعات استان را ویرایش کنید'}
                        </DialogDescription>
                    </DialogHeader>
                    <ProvinceForm provinceId={modalMode === 'edit_province' ? selectedId : undefined} onSuccess={closeModal} onCancel={closeModal} />
                </DialogContent>
            </Dialog>

            <Dialog open={modalMode === 'view_province'} onOpenChange={(open) => !open && closeModal()}>
                <DialogContent className="min-w-lg bg-admin-bg-sidebar backdrop-blur-xl border-admin-border">
                    <DialogHeader>
                        <DialogTitle className="text-admin-text-primary">مشاهده جزئیات استان</DialogTitle>
                        <DialogDescription className="text-admin-text-muted">اطلاعات کامل استان انتخاب شده</DialogDescription>
                    </DialogHeader>
                    {selectedProvince && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><p className="text-sm text-admin-text-muted mb-2">شناسه</p><p className="font-medium text-admin-text-primary font-mono">{selectedProvince.id}</p></div>
                                <div><p className="text-sm text-admin-text-muted mb-2">نام استان</p><p className="font-medium text-admin-text-primary">{selectedProvince.name}</p></div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <DialogDelete
                open={modalMode === 'delete_province'}
                closeModal={closeModal}
                onDelete={() => { deleteProvince(selectedId); closeModal(); }}
            />

            {/* City Modals */}
            <Dialog open={modalMode === 'create_city' || modalMode === 'edit_city'} onOpenChange={(open) => !open && closeModal()}>
                <DialogContent className="min-w-4xl bg-bg-admin-dark/40 backdrop-blur-xl">
                    <DialogHeader>
                        <DialogTitle className="text-admin-text-primary">{modalMode === 'create_city' ? 'ایجاد شهر جدید' : 'ویرایش شهر'}</DialogTitle>
                        <DialogDescription className="text-admin-text-muted">
                            {modalMode === 'create_city' ? 'اطلاعات شهر جدید را وارد کنید' : 'اطلاعات شهر را ویرایش کنید'}
                        </DialogDescription>
                    </DialogHeader>
                    <CityForm cityId={modalMode === 'edit_city' ? selectedId : undefined} onSuccess={closeModal} onCancel={closeModal} />
                </DialogContent>
            </Dialog>

            <Dialog open={modalMode === 'view_city'} onOpenChange={(open) => !open && closeModal()}>
                <DialogContent className="min-w-lg bg-admin-bg-sidebar backdrop-blur-xl border-admin-border">
                    <DialogHeader>
                        <DialogTitle className="text-admin-text-primary">مشاهده جزئیات شهر</DialogTitle>
                        <DialogDescription className="text-admin-text-muted">اطلاعات کامل شهر انتخاب شده</DialogDescription>
                    </DialogHeader>
                    {selectedCity && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><p className="text-sm text-admin-text-muted mb-2">شناسه</p><p className="font-medium text-admin-text-primary font-mono">{selectedCity.id}</p></div>
                                <div><p className="text-sm text-admin-text-muted mb-2">نام شهر</p><p className="font-medium text-admin-text-primary">{selectedCity.name}</p></div>
                                <div><p className="text-sm text-admin-text-muted mb-2">استان</p><p className="font-medium text-admin-text-primary">{selectedCity.province?.name || '—'}</p></div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <DialogDelete
                open={modalMode === 'delete_city'}
                closeModal={closeModal}
                onDelete={() => { deleteCity(selectedId); closeModal(); }}
            />
        </div>
    );
}