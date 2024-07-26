'use client';

import { faAt, faLock, faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import axios from 'axios';
import Link from 'next/link'
import React, { useState } from 'react'

import serverName from '@/serverName';
import { useRouter } from 'next/navigation';

const RegisterForm = () => {

    const server = serverName();
    const router = useRouter()

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    })
    const [errMessage, setErrMessage] = useState('')

    const registerFormSubmit = (e) => {
        e.preventDefault()
        axios.post(`${server}/auth/register`, formData)
            .then(async (res) => {
                router.push('/login')
            })
            .catch(({ response }) => {
                if(response) setErrMessage(response.data);
            })
    }

    return (
        <div className='p-6 bg-white rounded-lg shadow-md shadow-slate-300 max-w-xs w-full'>
            <form onSubmit={registerFormSubmit}>
                <div>
                    <h2 className='font-bold text-black text-2xl mb-4'>Register</h2>
                </div>
                <div className='flex flex-col gap-7'>

                    <div className='flex gap-3 '>
                        <FontAwesomeIcon
                            icon={faUser}
                            width={10}
                            className='text-blue-600'
                        />
                        <input
                            type="text"
                            name="username"
                            required
                            value={formData.username}
                            onChange={(e) => {
                                setFormData({
                                    ...formData,
                                    username: e.target.value
                                })
                            }}
                            id="username"
                            placeholder='Username'
                            className='outline-none border-b border-blue-600 text-sm p-1 placeholder:text-slate-300 font-normal flex grow'
                        />
                    </div>

                    <div className='flex gap-3 '>
                        <FontAwesomeIcon
                            icon={faAt}
                            width={10}
                            className='text-blue-600'
                        />
                        <input
                            type="text"
                            name="email"
                            required
                            value={formData.email}
                            onChange={(e) => {
                                setFormData({
                                    ...formData,
                                    email: e.target.value
                                })
                            }}
                            id="email"
                            placeholder='Email Address'
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
                    <button className='px-10 py-2 text-center w-full mt-7 bg-blue-600 text-white rounded-md shadow-md shadow-blue-300'>Create Account</button>
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
            >Already have Account?
                <Link href="/login" className='text-blue-600'> Login</Link>
            </p>
        </div>
    )
}

export default RegisterForm