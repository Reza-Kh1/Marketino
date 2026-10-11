'use client'
import { useAuth } from '@/lib/auth-context'
import AdminOrdersPage from '../../admin/orders/page'
import LoadingPage from '@/components/LoadingPage'
import AdminWalletTransactionsPage from '../../admin/finance/page'

export default function page() {
  const { storeId, user } = useAuth()
  if (!user?.id) {
    return <LoadingPage />
  }
  return (
    <AdminWalletTransactionsPage isAdmin={false} userId={user?.id} />
  )
}