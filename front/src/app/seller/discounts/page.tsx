'use client'
import { useAuth } from '@/lib/auth-context'
import AdminDiscountsPage from '../../admin/discounts/page'

export default function page() {
  const { user,storeId} = useAuth()  
  return (
    <AdminDiscountsPage isStore={true} storeIdMe={storeId} userIdMe={user?.id}/>
  )
}