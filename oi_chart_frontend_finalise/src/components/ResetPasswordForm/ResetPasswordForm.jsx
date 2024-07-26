'use client';

import serverName from '@/serverName';
import { faKey, faLock, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import Link from 'next/link';
import React, { useState } from 'react'

const ResetPasswordForm = () => {

    const server = serverName()
    const [email, setEmail] = useState('')
    const [passwordForm, setPasswordForm] = useState(false)

    // Reset password form
    const [resetForm, setResetForm] = useState({
        resetKey: '',
        password: '',
        rePassword: ''
    })

    const [errMessage, setErrMessage] = useState('');
    const [changeSuccess, setChangeSuccess] = useState(false)
    const [loading, setLoading] = useState(false);

    const submitResetForm = (e) => {
        setLoading(true)
        e.preventDefault()
        axios.post(`${server}/auth/reset-password`, { email })
            .then((res) => {
                setPasswordForm(true)
                setLoading(false)
            })
            .catch((err) => {
                setLoading(false)
                setErrMessage(err.response.data)
                setTimeout(() => {
                    setErrMessage('')
                }, 5000)
            })
    }

    const resetPasswordLastStep = (e) => {
        e.preventDefault()
        setLoading(true)
        if (resetForm.password === resetForm.rePassword) {
            const { rePassword, ...other } = resetForm
            axios.post(`${server}/auth/change-password`, other)
                .then((res) => {
                    setChangeSuccess(true)
                    setLoading(false)
                })
                .catch((err) => {
                    setErrMessage(err.response.data)
                    setLoading(true)
                    setTimeout(() => {
                        setErrMessage('')
                    }, 4000)
                })
        } else {
            setErrMessage('Password is not matching')
            setTimeout(() => {
                setErrMessage('')
            }, 4000)
        }
    }

    return (
        <div>
            <div className='p-6 bg-white rounded-lg shadow-md shadow-slate-300 max-w-xs w-full'>
                {
                    passwordForm ?
                        <form onSubmit={resetPasswordLastStep}>
                            <div>
                                <h2 className='font-bold text-black text-2xl mb-1'>Set password</h2>
                                <p className='text-sm mb-2'>You will receive an email with reset token. Please enter below</p>
                            </div>
                            <div className='flex flex-col gap-7'>

                                <div className='flex gap-3 '>
                                    <FontAwesomeIcon
                                        icon={faKey}
                                        width={10}
                                        className='text-blue-600'
                                    />
                                    <input
                                        type="text"
                                        name="resetKey"
                                        required
                                        value={resetForm.resetKey}
                                        onChange={(e) => {
                                            setResetForm({
                                                ...resetForm,
                                                resetKey: e.target.value
                                            })
                                        }}
                                        placeholder='Enter reset key'
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
                                        value={resetForm.password}
                                        onChange={(e) => {
                                            setResetForm({
                                                ...resetForm,
                                                password: e.target.value
                                            })
                                        }}
                                        placeholder='Enter new password'
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
                                        name="rpassword"
                                        required
                                        value={resetForm.rePassword}
                                        onChange={(e) => {
                                            setResetForm({
                                                ...resetForm,
                                                rePassword: e.target.value
                                            })
                                        }}
                                        placeholder='Enter password again'
                                        className='outline-none border-b border-blue-600 text-sm p-1 placeholder:text-slate-300 font-normal flex grow'
                                    />
                                </div>

                            </div>

                            <div>
                                <button className='px-10 py-2 text-center w-full mt-7 bg-blue-600 text-white rounded-md shadow-md shadow-blue-300 flex items-center gap-3 justify-center'>
                                    {
                                        loading && <div className='w-3 h-3 rounded-full border border-white border-b-0 border-r-0 animate-spin'></div>
                                    }
                                    Reset Password</button>
                            </div>
                        </form>
                        :
                        <form onSubmit={submitResetForm}>
                            <div>
                                <h2 className='font-bold text-black text-2xl mb-4'>Reset Password</h2>
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
                                        value={email}
                                        required
                                        onChange={(e) => {
                                            setEmail(e.target.value)
                                        }}
                                        id="email"
                                        placeholder='Email address'
                                        className='outline-none border-b border-blue-600 text-sm p-1 placeholder:text-slate-300 font-normal flex grow'
                                    />
                                </div>

                            </div>
                            <div>
                                <button className='px-10 py-2 text-center w-full mt-7 bg-blue-600 text-white rounded-md shadow-md shadow-blue-300 flex items-center gap-3 justify-center'>
                                    {
                                        loading && <div className='w-3 h-3 rounded-full border border-white border-b-0 border-r-0 animate-spin'></div>
                                    }
                                    Get Reset Token</button>
                            </div>
                        </form>
                }
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

                {
                    changeSuccess &&
                    (
                        <div className='mt-3 bg-green-200 border border-green-600 rounded-md py-2 px-4'>
                            <p
                                className='text-sm text-center text-green-600 font-medium'
                            >Password changed! <Link href='/login' className='font-bold text-blue-600'>Login</Link></p>
                        </div>
                    )
                }
                <p
                    className='mt-3 text-sm text-center font-medium'
                >Do not have an Account?
                    <Link href="/register" className='text-blue-600'> Register</Link>
                </p>
            </div>
        </div>
    )
}

export default ResetPasswordForm