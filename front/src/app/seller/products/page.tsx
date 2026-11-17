'use client'
import AdminProductsPage from '../../admin/products/page'
import { useAuth } from '@/lib/auth-context'

export default function page() {
  const { storeId } = useAuth()

  return (
    <>
      <AdminProductsPage isStore={true} storeId={storeId} />
    </>
  )
}
