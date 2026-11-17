'use client'
import { useAuth } from '@/lib/auth-context'
import AdminOrdersPage from '../../admin/orders/page'
import LoadingPage from '@/components/LoadingPage'

export default function page() {
  const { storeId } = useAuth()
  if (!storeId) {
    return <LoadingPage />
  }
  return (
    <AdminOrdersPage isAdmin={false} storeId={storeId} />
  )
}
