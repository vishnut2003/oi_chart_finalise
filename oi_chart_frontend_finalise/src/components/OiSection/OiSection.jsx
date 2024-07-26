'use client';

import React, { useEffect, useState } from 'react';
import style from './OiSection.module.css';
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import axios from 'axios';
import moment from 'moment'
import serverName, { wsServerName } from '@/serverName'

const OiSection = ({ oneScript, symbolSpecify }) => {

    const server = serverName()
    const wsServer = wsServerName()

    const [symbols, setSymbols] = useState(['Loading...'])
    const [expiry, setExpiry] = useState(['Loading...'])
    const [liveData, setLiveData] = useState(true)
    const [range, setRange] = useState(false)
    const [startRange, setStartRange] = useState(['Loading...'])
    const [endRange, setEndRange] = useState(['Loading...'])

    // Fields data
    const [symbolValue, setSymbolValue] = useState('Loading...')
    const [expiryValue, setExpiryValue] = useState({ date: '', expiry: '' })
    const [intervalValue, setIntervelValue] = useState('5minute')
    const [historical, setHistorical] = useState('')
    const [startRangeValue, setStartRangeValue] = useState({ strike_price: '' })
    const [endRangeValue, setEndRangeValue] = useState({ strike_price: '' })

    const [oiLoading, setOiLoading] = useState(false)

    const [oiData, setOiData] = useState([])
    const [barChartData, setBarChartData] = useState([])

    // custom visiblity for strike filter
    const [strikeRangeVisiblity, setStrikeRangeVisiblity] = useState()

    // Fetch live data through intervel
    const [fetchingLiveId, setFetchingLiveId] = useState(0)
    const [wsStateForClear, setWsStateForClear] = useState()

    // set XAxis limit
    let xAxisDataPoints = 6;
    let xAxisInterval = Math.round(oiData.length / xAxisDataPoints);

    // ToolTip formatter
    const DataFormater = (number) => {
        if (number > 1000 || number < - 1000) {
            return parseFloat(number / 100000).toFixed(2).toString() + 'L';
        } else {
            return number.toString();
        }
    }

    useEffect(() => {
        // Fetch symbols for filter
        axios.get(`${server}/breeze/nfo-symbols`)
            .then((response) => {
                setSymbols(response.data)

                // set nifty expiry in date
                axios.get(`${server}/fyers/expiry/${symbolSpecify}`)
                    .then((response) => {
                        setExpiry(response.data)

                        // Set Historical Date
                        let curr = new Date();
                        curr.setDate(curr.getDate());
                        let date = curr.toISOString().substring(0, 10);
                        setHistorical(date)

                        // set strike price
                        axios.get(`${server}/fyers/strike-price/${symbolSpecify}`)
                            .then((res) => {
                                if (res.data && res.data.length > 0) {
                                    setStartRange(res.data)
                                    setEndRange(res.data)
                                }

                                // set Strike filter visibility
                                axios.get(`${server}/settings/get/strike-range-filter`)
                                    .then((res) => {
                                        if (!res.data) {
                                            setStrikeRangeVisiblity(false)
                                        } else {
                                            setStrikeRangeVisiblity(res.data)
                                        }
                                    })
                            })
                    })
                    .catch((err) => {
                        console.log(err)
                    })

            })
            .catch((err) => {
                console.log(err);
            })

    }, [])

    const clearPrevFetch = () => {
        console.log('cleared prevfetch and closs socket')
        clearInterval(fetchingLiveId)
        // close websocket
        if(wsStateForClear) {
            wsStateForClear.close()
        }
    }

    const runWebSocket = (formData) => {
        
        // Connect to websocket
        let ws = new WebSocket(wsServer)
        setWsStateForClear(ws)

        ws.onopen = () => {
            console.log('websocket connected');
        }

        ws.onclose = () => {
            console.log('websocket closed')
        }

        ws.onmessage = (res) => {
            const latestData = JSON.parse(res.data)
            setOiData(prevOiData => [...prevOiData, latestData])
        }

        const intervelId = setInterval(() => {
            ws.send(JSON.stringify(formData))
        }, 5000)

        setFetchingLiveId(intervelId)
    }

    const getOiData = async () => {

        setOiLoading(true)

        let historicalDate;
        let strikeRange;

        // set live date or historic
        if (liveData) {
            let curr = new Date();
            curr.setDate(curr.getDate());
            historicalDate = curr.toISOString().substring(0, 10);
        } else {
            historicalDate = historical
        }

        // set strike range
        const rangeCheckbox = range
        if (!rangeCheckbox) {
            strikeRange = startRange
        } else if (rangeCheckbox) {
            const startStrike = startRangeValue.strike_price
            const endStrike = endRangeValue.strike_price

            let started = false;
            let ended = false
            strikeRange = []
            for (let i = 0; i < startRange.length; i++) {
                if (startRange[i].strike_price == startStrike) {
                    started = true
                } else if (startRange[i].strike_price == endStrike) {
                    strikeRange.push(startRange[i])
                    ended = true
                }

                if (started && !ended) {
                    strikeRange.push(startRange[i])
                }
            }
        }

        const formData = {
            symbol: symbolValue == 'Loading...' ? symbols[0].name : symbolValue,
            expiryDate: expiryValue.date || expiry[0].date,
            intervel: intervalValue,
            historical: historicalDate,
            strikeRange: strikeRange
        }

        axios.post(`${server}/breeze/oi-data`, formData)
            .then((res) => {
                console.log(res.data)
                setOiLoading(false)
                setOiData(res.data.lineData)
                setBarChartData(res.data.barData)

                // set live fetching
                runWebSocket(formData)
            })
            .catch((err) => {
                console.log(err)
                setOiLoading(false)
            })
    }

    const refreshExpiry = (e) => {
        let index = e.nativeEvent.target.selectedIndex;
        const symbol = e.nativeEvent.target[index].text

        axios.get(`${server}/fyers/expiry/${symbol}`)
            .then((response) => {
                const expiry = response.data ? response.data : []
                setExpiry(expiry)
            })
            .catch((err) => {
                console.log(err)
            })
    }

    const refreshStrikePrice = (e) => {
        let index = e.nativeEvent.target.selectedIndex;
        const symbol = e.nativeEvent.target[index].text

        axios.get(`${server}/fyers/strike-price/${symbol}`)
            .then((res) => {
                if (res.data && res.data.length > 0) {
                    setStartRange(res.data)
                    setEndRange(res.data)
                }
            })
    }

    const barchartColor = {
        redGreen: ["#22B16C", "#EF2421"],
    };

    return (
        <div className={oneScript ? 'flex flex-col md:flex-row justify-center gap-4 items-start' : 'flex flex-col justify-center gap-4 items-start'}>
            <div className={oneScript ? 'flex flex-col gap-5 w-full md:w-3/4' : 'flex flex-col gap-5 w-full'}>

                {/* Filter Section */}
                <div className='bg-white p-5 rounded-md'>
                    <h2
                        className='text-xl font-bold mb-6'
                    >Call Vs Put Open Interest</h2>
                    <form onSubmit={(e) => {
                        e.preventDefault()
                        clearPrevFetch()
                        getOiData(true)
                    }}>
                        <div className='md:flex md:gap-5 mb-5'>
                            <div className='mb-3 md:mb-0'>
                                <p
                                    className='font-semibold text-base mb-1'
                                >Symbol</p>
                                <select
                                    value={symbolValue}
                                    onChange={(e) => {
                                        setSymbolValue(e.target.value)
                                        refreshStrikePrice(e)
                                        refreshExpiry(e)
                                    }}
                                    id='symbol'
                                    className="bg-white shadow-md border-0 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                >
                                    {
                                        symbols.map((symbol, index) => (
                                            <option
                                                key={index}
                                                value={symbol.symbol}
                                            >{symbol.name}</option>
                                        ))
                                    }
                                </select>
                            </div>
                            <div className='mb-3 md:mb-0'>
                                <p
                                    className='font-semibold text-base mb-1'
                                >Expiry</p>
                                <select
                                    id='expiry'
                                    value={expiryValue.date}
                                    onChange={(e) => {
                                        setExpiryValue({ date: e.target.value, expiry: '' })
                                    }}
                                    className="bg-white shadow-md border-0 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">

                                    {
                                        expiry.map((data, index) => (
                                            <option key={index} value={data.date ? data.date : data}>{!data.date ? data : data.date}</option>
                                        ))
                                    }
                                </select>
                            </div>

                            <div className='mb-3 md:mb-0'>
                                <p
                                    className='font-semibold text-base mb-1'
                                >Interval</p>
                                <select
                                    id='intervel'
                                    value={intervalValue}
                                    onChange={(e) => {
                                        setIntervelValue(e.target.value)
                                    }}
                                    className="bg-white shadow-md border-0 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">

                                    <option value='1minute'>1 min</option>
                                    <option value='5minute'>5 min</option>
                                    <option value='30minute'>30 min</option>

                                </select>
                            </div>

                            <div className='flex justify-between items-start gap-5'>
                                <div className='mb-3 md:mb-0'>
                                    <p
                                        className='font-semibold text-base mb-1'
                                    >Live</p>
                                    <input
                                        type="checkbox"
                                        defaultChecked
                                        className={style.custom_checkbox_style}
                                        onChange={(e) => {
                                            setLiveData(!liveData)
                                        }}
                                    />
                                </div>
                                <div className='mb-3 md:mb-0'>
                                    <p
                                        className='font-semibold text-base mb-1'
                                    >Historical Date</p>
                                    <input
                                        type="date"
                                        disabled={liveData}
                                        value={historical}
                                        onChange={(e) => {
                                            setHistorical(e.target.value)
                                        }}
                                        max={moment().format("YYYY-MM-DD")}
                                        id='historical'
                                        className='w-full border-0 px-2.5 py-2 text-sm bg-white shadow-md rounded-lg disabled:text-slate-400' />
                                </div>

                            </div>

                        </div>

                        <div className='md:flex md:gap-5'>

                            {
                                strikeRangeVisiblity &&
                                <div className='flex justify-between items-start gap-5'>
                                    <div className='mb-3 md:mb-0'>
                                        <p
                                            className='font-semibold text-base mb-1'
                                        >Range</p>
                                        <input
                                            type="checkbox"
                                            onChange={(e) => {
                                                setRange(!range)
                                                setStartRangeValue({ strike_price: startRange[0].strike_price })
                                                setEndRangeValue({ strike_price: endRange[0].strike_price })
                                            }}
                                            defaultChecked={range}
                                            id='range-check-box'
                                            className={style.custom_checkbox_style}
                                        />
                                    </div>
                                    <div className='mb-3 md:mb-0'>
                                        <p
                                            className='font-semibold text-base mb-1'
                                        >Range Start</p>
                                        <select
                                            disabled={!range}
                                            value={startRangeValue.strike_price}
                                            onChange={(e) => {
                                                setStartRangeValue({ strike_price: e.target.value })
                                            }}
                                            id='start-range'
                                            className="bg-white shadow-md border-0 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                            {
                                                startRange.map((range, index) => (
                                                    <option
                                                        key={index}
                                                        value={range.strike_price}
                                                    >{range.strike_price ? range.strike_price : range}</option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                    <div className='mb-3 md:mb-0'>
                                        <p
                                            className='font-semibold text-base mb-1'
                                        >Range End</p>
                                        <select
                                            disabled={!range}
                                            id='end-range'
                                            value={endRangeValue.strike_price}
                                            onChange={(e) => {
                                                setEndRangeValue({ strike_price: e.target.value })
                                            }}
                                            className="bg-white shadow-md border-0 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                            {
                                                endRange.map((range, index, arr) => (
                                                    <option
                                                        key={index}
                                                        value={range.strike_price}
                                                        onChange={(e) => {
                                                            setEndStrike(e.target.value)
                                                            getOiData()
                                                        }}
                                                    >{range.strike_price ? range.strike_price : range}</option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                </div>
                            }

                            <div className='h-full flex flex-col items-start gap-2'>
                                <p>As of {historical}. - Expiry {expiryValue.date || expiry.length != 0 && expiry[0].date}</p>
                            </div>

                        </div>
                        <button
                            className='py-2 px-3 bg-blue-600 text-white rounded-md shadow-md shadow-blue-600 text-sm mt-3 flex gap-2 items-center'
                            type='submit'>
                            {
                                oiLoading &&
                                <div
                                    className='w-3 h-3 border border-white rounded-full border-b-0 border-l-0 animate-spin'
                                ></div>
                            }
                            Get OI</button>
                    </form>
                </div>

                {/* Change in OI Chart */}
                <div className='bg-white p-5 rounded-md'>
                    <h2
                        className='text-xl font-bold mb-6'
                    >Change in OI</h2>
                    <div className='flex flex-col'>
                        <div className='flex justify-between text-sm font-semibold mb-2'>
                            <p>OI</p>
                            <p>Future</p>
                        </div>
                        <ResponsiveContainer width={'100%'} aspect={6.0 / 2.5}>
                            <LineChart data={oiData}>

                                <XAxis dataKey='call_date_time' stroke='#A7A7A7' strokeWidth={'0.5px'} className='text-xs' interval={xAxisInterval} />

                                <YAxis domain={['auto', 'auto']} tickFormatter={DataFormater} fill='black' orientation='left' yAxisId='left-axis' stroke='#A7A7A7' strokeWidth={'0.5px'} className='text-xs' />
                                {/* <YAxis domain={['auto', 'auto']} tickFormatter={DataFormater} orientation='right' yAxisId='right-axis' stroke='#A7A7A7' strokeWidth={'0.5px'} className='text-xs' /> */}

                                <Tooltip
                                    formatter={DataFormater}
                                />

                                <CartesianGrid stroke="#cecece" strokeDasharray="3 3" strokeWidth={'0.5px'} />
                                <Line type="monotone" name='CE' dot={false} dataKey="call_oi_change" stroke="#459962" yAxisId='left-axis' strokeWidth={'1px'} />
                                <Line type="monotone" name='PE' dot={false} dataKey="put_oi_change" stroke="#C13F3F" yAxisId='left-axis' strokeWidth={'1px'} />
                                {/* <Line type="monotone" name='Futures' dot={false} dataKey="future_oi" stroke="#6A6A6A" yAxisId='right-axis' strokeWidth={'1px'} strokeDasharray={'4'} /> */}
                            </LineChart>
                        </ResponsiveContainer>

                    </div>
                </div>

                {/* Total OI Chart */}
                <div className='bg-white p-5 rounded-md'>
                    <h2
                        className='text-xl font-bold mb-6'
                    >Total OI</h2>
                    <div className='flex flex-col'>
                        <div className='flex justify-between text-sm font-semibold mb-2'>
                            <p>OI</p>
                            <p>Future</p>
                        </div>
                        <ResponsiveContainer width={'100%'} aspect={6.0 / 2.0}>
                            <LineChart data={oiData}>

                                <XAxis dataKey='call_date_time' stroke='#A7A7A7' strokeWidth={'0.5px'} className='text-xs' interval={xAxisInterval} />

                                <YAxis domain={['auto', 'auto']} tickFormatter={DataFormater} name='OI' fill='black' orientation='left' yAxisId='left-axis' stroke='#A7A7A7' strokeWidth={'0.5px'} className='text-xs' />
                                {/* <YAxis domain={['auto', 'auto']} tickFormatter={DataFormater} orientation='right' yAxisId='right-axis' stroke='#A7A7A7' strokeWidth={'0.5px'} className='text-xs' /> */}

                                <Tooltip formatter={DataFormater} />
                                <CartesianGrid stroke="#cecece" strokeDasharray="3 3" strokeWidth={'0.5px'} />
                                <Line type="monotone" name='CE' dot={false} dataKey="call_Oi" stroke="#459962" yAxisId='left-axis' strokeWidth={'1px'} />
                                <Line type="monotone" name='PE' dot={false} dataKey="put_Oi" stroke="#C13F3F" yAxisId='left-axis' strokeWidth={'1px'} />
                                {/* <Line type="monotone" name='Futures' dot={false} dataKey="future_oi" stroke="#6A6A6A" yAxisId='right-axis' strokeWidth={'1px'} strokeDasharray={'4'} /> */}
                            </LineChart>
                        </ResponsiveContainer>

                    </div>
                </div>

                {/* Difference of Put Call OI Change Chart */}
                <div className='bg-white p-5 rounded-md'>
                    <h2
                        className='text-xl font-bold mb-6'
                    >Difference of Put Call OI Change</h2>
                    <div className='flex flex-col'>
                        <div className='flex justify-between text-sm font-semibold mb-2'>
                            <p>OI</p>
                            <p>Future</p>
                        </div>
                        <ResponsiveContainer width={'100%'} aspect={6.0 / 2.0}>
                            <LineChart data={oiData}>

                                <XAxis dataKey='call_date_time' stroke='#A7A7A7' strokeWidth={'0.5px'} className='text-xs' interval={xAxisInterval} />

                                <YAxis domain={['auto', 'auto']} tickFormatter={DataFormater} name='OI' fill='black' orientation='left' yAxisId='left-axis' stroke='#A7A7A7' strokeWidth={'0.5px'} className='text-xs' />
                                {/* <YAxis domain={['auto', 'auto']} tickFormatter={DataFormater} orientation='right' yAxisId='right-axis' stroke='#A7A7A7' strokeWidth={'0.5px'} className='text-xs' /> */}

                                <Tooltip formatter={DataFormater} />
                                <CartesianGrid stroke="#cecece" strokeDasharray="3 3" strokeWidth={'0.5px'} />
                                <Line type="monotone" name='PE CE DIFF' dot={false} dataKey="ce_pe_diff" stroke="#2977DB" yAxisId='left-axis' strokeWidth={'1px'} />
                                {/* <Line type="monotone" name='Futures' dot={false} dataKey="future_oi" stroke="#6A6A6A" yAxisId='right-axis' strokeWidth={'1px'} /> */}
                            </LineChart>
                        </ResponsiveContainer>

                    </div>
                </div>
            </div>
            <div className={oneScript ? 'w-full md:w-1/4 sticky top-5 flex flex-col gap-5' : 'w-full flex flex-row gap-5'}>
                {/* Change in OI Bar Chart */}
                <div className='bg-white p-5 rounded-md w-full'>
                    <h2 className='font-bold text-sm'>Change in OI</h2>
                    <div className='w-full h-56'>
                        <ResponsiveContainer>
                            <BarChart data={barChartData} width='100' height='100%'>
                                <Bar dataKey='change_in_oi' name='Oi' fill='green' barSize={60}>
                                    <LabelList
                                        dataKey="change_in_oi"
                                        position="center"
                                        fill='white'
                                        fontSize={'13px'}
                                        angle={270}
                                        offset={25}
                                    />

                                    {
                                        barchartColor.redGreen.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry} />
                                        ))
                                    }


                                </Bar>
                                <Tooltip formatter={DataFormater} cursor={{ fill: 'transparent' }} />
                                <CartesianGrid stroke="#cecece" strokeDasharray="3 3" strokeWidth={'0.5px'} />
                                <XAxis dataKey='name' stroke='#A7A7A7' strokeWidth={'0.5px'} className='text-xs' />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Total OI */}
                <div className='bg-white p-5 rounded-md w-full'>
                    <h2 className='font-bold text-sm'>Total OI</h2>
                    <div className='w-full h-56'>
                        <ResponsiveContainer>
                            <BarChart data={barChartData} width='100' height='100%'>
                                <Bar dataKey='oi' name='Oi' fill='green' barSize={60}>
                                    <LabelList
                                        dataKey="oi"
                                        position="center"
                                        fill='white'
                                        fontSize={'13px'}
                                        angle={270}
                                        offset={25}
                                    />

                                    {
                                        barchartColor.redGreen.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry} />
                                        ))
                                    }


                                </Bar>
                                <Tooltip formatter={DataFormater} cursor={{ fill: 'transparent' }} />
                                <CartesianGrid stroke="#cecece" strokeDasharray="3 3" strokeWidth={'0.5px'} />
                                <XAxis dataKey='name' stroke='#A7A7A7' strokeWidth={'0.5px'} className='text-xs' />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OiSection