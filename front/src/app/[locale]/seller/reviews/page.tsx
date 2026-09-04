'use client'
import { useAuth } from '@/lib/auth-context'
import AdminReviewsPage from '../../admin/reviews/page'

export default function page() {
  const { storeId } = useAuth()
  return (
    <AdminReviewsPage storeId={storeId} isStore={true} />
  )
}