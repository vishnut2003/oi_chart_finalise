'use client';

import { faLock, faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import axios from 'axios';
import Link from 'next/link'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation';
import serverName from '@/serverName'

const LoginForm = () => {

    const router = useRouter()

    const server = serverName();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })

    const [errMessage, setErrMessage] = useState('')

    const loginFormSubmit = (e) => {
        e.preventDefault()
        axios.post(`${server}/auth/login`, formData)
            .then((res) => {
                localStorage.setItem('session', res.data)
                router.push('/')
            })
            .catch(({response}) => {
                console.log(response)
                if(response.status == 400) setErrMessage(response.data);
            })
    }

    return (
        <div className='p-6 bg-white rounded-lg shadow-md shadow-slate-300 max-w-xs w-full'>
            <form onSubmit={loginFormSubmit}>
                <div>
                    <h2 className='font-bold text-black text-2xl mb-4'>Login</h2>
                </div>
                <div className='flex flex-col gap-7'>

                    <div className='flex gap-3 '>
                        <FontAwesomeIcon
                            icon={faUser}
                            width={10}
                            className='text-blue-600'
                        />
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            required
                            onChange={(e) => {
                                setFormData({
                                    ...formData,
                                    email: e.target.value
                                })
                            }}
                            id="email"
                            placeholder='Email address'
                            className='outline-none border-b border-blue-600 text-sm p-1 placeholder:text-slate-300 font-normal flex grow'
                        />
                    </div>

                    <div className='flex gap-3 '>
                        <FontAwesomeIcon
                            icon={faLock}
                            width={10}
                            className='text-blue-600'
                        />
                        <input
                            type="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={(e) => {
                                setFormData({
                                    ...formData,
                                    password: e.target.value
                                })
                            }}
                            id="password"
                            placeholder='Password'
                            className='outline-none border-b border-blue-600 text-sm p-1 placeholder:text-slate-300 font-normal flex grow'
                        />
                    </div>

                </div>
                <div>
                    <button className='px-10 py-2 text-center w-full mt-7 bg-blue-600 text-white rounded-md shadow-md shadow-blue-300'>Login</button>
                </div>
            </form>
            {
                errMessage &&
                (
                    <div className='mt-3 bg-red-200 border border-red-600 rounded-md py-2 px-4'>
                        <p
                        className='text-sm text-center text-red-600 font-medium'
                        >{errMessage}</p>
                    </div>
                )
            }
            <p
            className='mt-3 text-sm text-center font-medium'
            >Do not have an Account? 
                <Link href="/register" className='text-blue-600'> Register</Link>
            </p>
            
            <p
            className='mt-2 text-sm text-center font-medium'
            >Forget password? 
                <Link href="/reset-password" className='text-blue-600'> Reset</Link>
            </p>
        </div>
    )
}

export default LoginForm