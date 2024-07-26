'use client';

import ResetPasswordForm from '@/components/ResetPasswordForm/ResetPasswordForm';
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

const ResetPassword = () => {

    const router = useRouter()

    useEffect(() => {
        const userExist = localStorage.getItem('user_id')
        if (userExist) router.push('/')
    }, [router])

    return (
        <div className='w-full h-screen flex justify-center items-center bg-slate-200'>
            <ResetPasswordForm />
        </div>
    )
}

export default ResetPassword