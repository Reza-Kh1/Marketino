import React from 'react'
import AdminQnAPage from '../../admin/qna/page'
import { useAuth } from '@/lib/auth-context'

export default function page() {
    const { storeId } = useAuth()
    return (
        <AdminQnAPage />
    )
}
