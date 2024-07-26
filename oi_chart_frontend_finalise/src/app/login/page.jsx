'use client';

import React, { useEffect } from 'react';
import LoginForm from "@/components/LoginForm/LoginForm";
import { useRouter } from 'next/navigation';
import serverName from '@/serverName';
import axios from 'axios';

const Login = () => {

  const server = serverName()

  const router = useRouter()

  useEffect(() => {
    const session = localStorage.getItem('session')
    axios.post(`${server}/users/verify`, {session})
      .then((res) => {
        router.push('/')
      })
      .catch((err) => {
        console.log(err)
      })
  }, [router])

  return (
    <div className='w-full h-screen flex justify-center items-center bg-slate-200'>
      <LoginForm />
    </div>
  )
}

export default Login