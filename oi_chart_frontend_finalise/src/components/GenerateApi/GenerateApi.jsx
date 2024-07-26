import React, { useEffect, useState } from 'react'
import serverName from '@/serverName'
import axios from 'axios'

const GenerateApi = () => {
    const [strikeFilter, setStrikeFilter] = useState()
    const server = serverName()
    useEffect(() => {
        const server = serverName()
        axios.get(`${server}/settings/get/strike-range-filter`)
            .then((res) => {
                if (!res.data) {
                    setStrikeFilter(false)
                } else {
                    setStrikeFilter(res.data)
                }
            })
    }, [])
    return (
        <div className='flex flex-col gap-2'>
            <div className='p-3 border border-slate-300 rounded-md md:w-max flex flex-col gap-2 items-start'>
                <p className='text-sm'>Generate Refresh Token for Fyers API generate Every 15 days</p>
                <a href={server + '/fyers/generate-auth'}>
                    <button
                        className='text-sm bg-green-600 text-white rounded py-1 px-3'
                    >Generate</button>
                </a>
            </div>
            <div className='p-3 border border-slate-300 rounded-md md:w-max flex flex-col gap-2 items-start'>
                <p className='text-sm'>Generate Session Key for Breeze API generate Every days</p>
                <a href={server + '/breeze/genetate-session-key'}>
                    <button
                        className='text-sm bg-green-600 text-white rounded py-1 px-3'
                    >Generate</button>
                </a>
            </div>

            <div className='p-3 border border-slate-300 rounded-md md:w-max flex flex-col gap-2 items-start'>
                <p className='text-sm'>Strike price range filter</p>
                {
                    strikeFilter ?
                        <button
                            onClick={() => {
                                axios.get(`${server}/settings/strike-range-filter/${!strikeFilter}`)
                                    .then(() => {
                                        axios.get(`${server}/settings/get/strike-range-filter`)
                                            .then((res) => {
                                                if (!res.data) {
                                                    setStrikeFilter(false)
                                                } else {
                                                    setStrikeFilter(res.data)
                                                }
                                            })
                                    })
                            }}
                            className='text-sm bg-red-600 text-white rounded py-1 px-3'
                        >Disable</button>
                        :
                        <button
                            onClick={() => {
                                axios.get(`${server}/settings/strike-range-filter/${!strikeFilter}`)
                                    .then(() => {
                                        axios.get(`${server}/settings/get/strike-range-filter`)
                                            .then((res) => {
                                                if (!res.data) {
                                                    setStrikeFilter(false)
                                                } else {
                                                    setStrikeFilter(res.data)
                                                }
                                            })
                                    })
                            }}
                            className='text-sm bg-green-600 text-white rounded py-1 px-3'
                        >Enable</button>
                }
            </div>

        </div>
    )
}

export default GenerateApi