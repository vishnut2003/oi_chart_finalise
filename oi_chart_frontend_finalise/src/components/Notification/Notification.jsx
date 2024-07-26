'use client';

import serverName from '@/serverName'
import axios from 'axios'
import React, { useEffect, useState } from 'react'

const Notification = () => {

    const server = serverName()

    const [notificationForm, setNotificationForm] = useState({
        title: '',
        description: ''
    })
    let [notificationData, setNotificationData] = useState([])

    useEffect(() => {
        axios.get(`${server}/settings/notifications/get`)
            .then((res) => {
                setNotificationData(res.data)
            })
    }, [])

    const submitNotification = (e) => {
        e.preventDefault()
        axios.post(`${server}/settings/notifications/add`, notificationForm)
            .then((res) => {
                console.log(res)
                axios.get(`${server}/settings/notifications/get`)
                    .then((res) => {
                        setNotificationData(res.data)
                    })
            })
    }

    return (
        <div>
            <form className='flex flex-col gap-2 w-72 items-start' onSubmit={submitNotification}>
                <h2 className='font-bold text-base'>Add Notification</h2>

                <input
                    type="text"
                    name="title"
                    placeholder='Title'
                    required
                    value={notificationForm.title}
                    onChange={(e) => {
                        setNotificationForm({
                            ...notificationForm,
                            title: e.target.value
                        })
                    }}
                    className='py-2 px-3 rounded-md text-sm w-full' />

                <textarea
                    name="desc"
                    rows="3"
                    required
                    placeholder='Description'
                    value={notificationForm.description}
                    onChange={(e) => {
                        setNotificationForm({
                            ...notificationForm,
                            description: e.target.value
                        })
                    }}
                    className='py-2 px-3 rounded-md text-sm w-full'></textarea>
                <button
                    type='submit'
                    className='py-2 px-4 bg-green-600 text-white text-sm font-semibold rounded-md'
                >Add</button>
            </form>
            <div className='flex flex-col gap-2 my-3'>

                {
                    notificationData.map((notification, index) => (
                        <div className='border rounded-md border-slate-300 w-max min-w-80 p-3' key={index}>
                            <h2 className='text-sm text-black font-semibold'>{notification.title}</h2>
                            <p className='text-sm text-slate-600'>{notification.description}</p>
                            <button
                                onClick={() => {
                                    axios.get(`${server}/settings/notifications/delete/${notification._id}`)
                                        .then(() => {
                                            axios.get(`${server}/settings/notifications/get`)
                                                .then((res) => {
                                                    setNotificationData(res.data)
                                                })
                                        })
                                }}
                                className='bg-red-600 text-white py-1 text-sm px-4 mt-2 rounded-md'
                            >delete</button>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default Notification