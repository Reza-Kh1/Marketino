'use client'
import AdminProductsPage from '../../admin/products/page'
import { useAuth } from '@/lib/auth-context'
import { Link } from '@/i18n/navigation';
import { Loader2 } from 'lucide-react';
import IsStore from '@/components/store/IsStore';

export default function page() {
  const { storeId } = useAuth()

  return (
    <>
      <AdminProductsPage isStore={true} storeId={storeId} />
    </>
  )
}
