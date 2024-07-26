'use client';

import { faBell } from '@fortawesome/free-regular-svg-icons'
import { faAngleDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

import style from './Header.module.css';
import axios from 'axios';

import serverName from '@/serverName'

const Header = () => {

    const server = serverName();

    const [currentUser, setCurrentUser] = useState('')
    const [notificationData, setNotificationData] = useState([])

    useEffect(() => {
        const server = serverName();
        const session = localStorage.getItem('session')
        axios.post(`${server}/users/verify`, { session })
            .then((res) => {
                setCurrentUser(res.data);

                // get all notifications
                axios.get(`${server}/settings/notifications/get`)
                    .then((res) => {
                        setNotificationData(res.data)
                    })
            })
            .catch(() => {
                setCurrentUser('')
                // get all notifications
                axios.get(`${server}/settings/notifications/get`)
                    .then((res) => {
                        setNotificationData(res.data)
                    })
            })
    }, [])

    const [userDropDown, setUserDropDown] = useState(false)
    const [notificationDropDown, setNotificationDropDown] = useState(false)

    return (
        <header className='px-8 py-4 shadow-md shadow-slate-200 bg-white w-full z-10'>
            <div className='flex justify-between items-center gap-5'>
                <div className='min-w-24 md:w-36 '>
                    <Link href='/'>
                        <img src="/logo.png" alt="Logo" width="100%" />
                    </Link>
                </div>
                <div
                    className='flex gap-3 items-center'
                >
                    <div className='text-sm'>
                        <Link href='/contact'>Contact</Link>
                    </div>
                    {
                        !currentUser ?
                            <div className='flex'>
                                <Link
                                    href='/login'
                                    className='py-1 px-5 bg-blue-600 rounded-md text-white shadow-sm shadow-blue-600'
                                >Login</Link>
                            </div>
                            :
                            ''
                    }
                    <div className='flex justify-end items-center gap-1'>
                        <div
                            className='md:relative'
                        >
                            <FontAwesomeIcon
                                icon={faBell}
                                width={15}
                                className='cursor-pointer'
                                onClick={() => {
                                    setNotificationDropDown(!notificationDropDown)
                                }}
                            />

                            {
                                notificationDropDown &&

                                <div className='absolute right-0 top-14 md:top-9 bg-white shadow-md w-72'>
                                    <h2
                                        className='py-2 px-5 font-bold'
                                    >What is New</h2>
                                    <div
                                        className={style.notificationFeed}
                                    >
                                        {
                                            notificationData.map((notification, index) => (
                                                <div
                                                    key={index}
                                                    className='py-2 px-5 hover:bg-slate-100'
                                                >
                                                    <h3
                                                        className='font-semibold text-sm'
                                                    >{notification.title}</h3>
                                                    <p
                                                        className='font-light text-sm'
                                                    >{notification.description}</p>
                                                </div>
                                            ))
                                        }

                                    </div>
                                </div>
                            }
                        </div>

                        {
                            currentUser &&
                            <div className='flex w-16 gap-2 cursor-pointer items-center justify-end'>
                                <FontAwesomeIcon icon={faAngleDown} width={10} />
                                <img
                                    src="/user-avatar.png"
                                    alt="User Avatar"
                                    width='50%'
                                    onClick={() => {
                                        setUserDropDown(!userDropDown);
                                    }}
                                />

                                {
                                    userDropDown &&

                                    <div
                                        className='absolute right-3 top-16 bg-white p-5 shadow-md'
                                    >
                                        <div>
                                            <p
                                                className='font-semibold text-base'
                                            >{currentUser.username}</p>
                                            <p
                                                className='font-normal text-xs'
                                            >{currentUser.email}</p>
                                        </div>
                                        <div
                                            className='mt-4'
                                        >
                                            <Link
                                                href='#'
                                                onClick={() => {
                                                    localStorage.clear()
                                                    setCurrentUser('')
                                                }}
                                                className='bg-red-600 py-1 px-5 rounded-md text-white'
                                            >Logout</Link>
                                        </div>
                                    </div>
                                }
                            </div>
                        }


                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header