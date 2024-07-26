'use client';

import Header from '@/components/Header/Header'
import serverName from '@/serverName';
import { faAt, faPen, faPhone } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import axios from 'axios'
import React, { useEffect, useState } from 'react'

const Contact = () => {

    const server = serverName()
    const [contactInfo, setContactInfo] = useState({})

    useEffect(() => {
        const server = serverName()
        axios.get(`${server}/settings/contacts/get`)
            .then((res) => {
                setContactInfo(res.data[0])
            })
    }, [])
  return (
    <div className="flex flex-col w-full">
        <Header/>
        <div className='flex justify-center items-start py-5 px-3'>
            <div className='flex max-w-2xl w-full justify-center items-center gap-5 flex-col md:flex-row'>
                <div className='flex-1 flex flex-col items-center gap-3'>
                    <FontAwesomeIcon 
                    className='bg-white p-4 rounded-full shadow-md shadow-blue-200 text-blue-600'
                    icon={faPhone} 
                    width={20}/>
                    <div className='text-sm'>
                        <p>{contactInfo.phone}</p>
                    </div>
                </div>
                <div className='flex-1 flex flex-col items-center gap-3'>
                    <FontAwesomeIcon 
                    className='bg-white p-4 rounded-full shadow-md shadow-blue-200 text-blue-600'
                    icon={faAt} 
                    width={20}/>
                    <div className='text-sm'>
                        <p>{contactInfo.email}</p>
                    </div>
                </div>
                <div className='flex-1 flex flex-col items-center gap-3'>
                    <FontAwesomeIcon 
                    className='bg-white p-4 rounded-full shadow-md shadow-blue-200 text-blue-600'
                    icon={faPen} 
                    width={20}/>
                    <div className='text-sm'>
                        <p>{contactInfo.note}</p>
                    </div>
                </div>
                
            </div>
        </div>
    </div>
  )
}

export default Contact