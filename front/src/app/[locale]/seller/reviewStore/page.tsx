'use client'
import { useAuth } from '@/lib/auth-context'
import AdminStoreReviewsPage from '../../admin/store-reviews/page'

export default function page() {
  const { storeId } = useAuth()
  return (
    <AdminStoreReviewsPage storeId={storeId} isStore={true} />
  )
}