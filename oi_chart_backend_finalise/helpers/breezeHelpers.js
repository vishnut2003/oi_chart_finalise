const fsPromise = require('fs/promises')
const path = require('path')
const BreezeConnect = require('breezeconnect').BreezeConnect

module.exports = {
    getApiSessionKey: async () => {
        const sessionKey = await fsPromise.readFile(path.join(__dirname, '..', 'routes', 'credentials', 'access_token.txt'), { encoding: 'utf8' })
        return sessionKey
    },
    getOiData: (access_token, symbol, expiry, intervel, startDate, endDate, strikeRange) => {
        return new Promise(async (resolve, reject) => {
            const apiKey = process.env.API_KEY
            const secretKey = process.env.SECRET_KEY

            let callOi = []
            let putOi = []
            let futures = []

            const breeze = new BreezeConnect({ "appKey": apiKey })
            await breeze.generateSession(secretKey, access_token)
                .then(async () => {
                    for (let i = 0; i < strikeRange.length; i++) {
                        await breeze.getHistoricalDatav2({
                            interval: intervel,
                            fromDate: startDate,
                            toDate: endDate,
                            stockCode: symbol,
                            exchangeCode: "NFO",
                            productType: "options",
                            expiryDate: expiry,
                            right: "call",
                            strikePrice: `${strikeRange[i].strike_price}`
                        })
                            .then((res) => {
                                const callOiArr = res.Success || []
                                for (let i = 0; i < callOiArr.length; i++) {
                                    if (callOi[i] === undefined) {
                                        let prevOi = callOi[i - 1] !== undefined ? callOi[i - 1].call_Oi : callOiArr[i].open_interest
                                        let prevOiChange = i !== 0 ? callOi[i - 1].call_oi_change : 0
                                        let callOiObject = {
                                            call_Oi: parseInt(callOiArr[i].open_interest),
                                            call_date_time: callOiArr[i].datetime,
                                            call_oi_change: (parseInt(callOiArr[i].open_interest) - prevOi) + prevOiChange
                                        }
                                        callOi.push(callOiObject)
                                    } else {
                                        let prevOi = callOi[i - 1] !== undefined ? callOi[i - 1].call_Oi : callOi[i].call_Oi
                                        let prevOiChange = i !== 0 ? callOi[i - 1].call_oi_change : 0
                                        let call_Oi = parseInt(callOiArr[i].open_interest)
                                        callOi[i].call_Oi = callOi[i].call_Oi + call_Oi
                                        callOi[i].call_oi_change = callOi[i].call_Oi - prevOi == 0 ? 0 + prevOiChange : (callOi[i].call_Oi - prevOi) + prevOiChange
                                    }
                                }
                            })
                            .catch((err) => {
                                console.log(err)
                            })

                        await breeze.getHistoricalDatav2({
                            interval: intervel,
                            fromDate: startDate,
                            toDate: endDate,
                            stockCode: symbol,
                            exchangeCode: "NFO",
                            productType: "options",
                            expiryDate: expiry,
                            right: "put",
                            strikePrice: `${strikeRange[i].strike_price}`
                        })
                            .then((res) => {
                                const putOiArr = res.Success || []
                                for (let i = 0; i < putOiArr.length; i++) {
                                    if (putOi[i] === undefined) {
                                        let prevOi = putOi[i - 1] !== undefined ? putOi[i - 1].put_Oi : putOiArr[i].open_interest
                                        let prevOiChange = i !== 0 ? putOi[i - 1].put_oi_change : 0
                                        let putOiObject = {
                                            put_Oi: parseInt(putOiArr[i].open_interest),
                                            put_date_time: putOiArr[i].datetime,
                                            put_oi_change: (parseInt(putOiArr[i].open_interest) - prevOi) + prevOiChange
                                        }

                                        putOi.push(putOiObject)
                                    } else {
                                        let prevOi = putOi[i - 1] !== undefined ? putOi[i - 1].put_Oi : putOi[i].open_interest
                                        let prevOiChange = i != 0 ? putOi[i - 1].put_oi_change : 0
                                        if (isNaN(prevOiChange)) prevOiChange = 0
                                        let put_Oi = parseInt(putOiArr[i].open_interest)
                                        putOi[i].put_Oi = putOi[i].put_Oi + put_Oi
                                        putOi[i].put_oi_change = putOi[i].put_Oi - prevOi == 0 ? 0 + prevOiChange : (putOi[i].put_Oi - prevOi) + prevOiChange
                                    }
                                }
                            })
                            .catch((err) => {
                                console.log(err)
                            })
                    }

                    // await breeze.getHistoricalDatav2({
                    //     interval: intervel,
                    //     fromDate: startDate,
                    //     toDate: endDate,
                    //     stockCode: symbol,
                    //     exchangeCode: "NFO",
                    //     productType: "futures",
                    //     expiryDate: expiry,
                    //     right: "others",
                    //     strikePrice: "0"
                    // })
                    //     .then((res) => {
                    //         for (let i = 0; i < res.Success.length; i++) {
                    //             if (futures[i] === undefined) {
                    //                 const { open_interest, datetime } = res.Success[i]
                    //                 prevOi = futures[i - 1] !== undefined ? futures[i - 1].future_oi : open_interest
                    //                 let futuresOiObject = {
                    //                     future_oi: open_interest,
                    //                     futures_date_time: datetime,
                    //                     futures_oi_change: parseInt(open_interest) - prevOi
                    //                 }
                    //                 futures.push(futuresOiObject)
                    //             } else {
                    //                 const { open_interest, datetime } = res.Success[i]
                    //                 let prevOi = futures[i - 1] !== undefined ? futures[i - 1].future_oi : futures[i].open_interest
                    //                 let futures_oi = parseInt(open_interest)
                    //                 futures[i].future_oi = futures[i].future_oi + futures_oi
                    //                 futures[i].futures_oi_change = futures[i].future_oi - prevOi == 0 ? 0 : futures[i].future_oi - prevOi
                    //             }
                    //         }
                    //     })
                    //     .catch((err) => {
                    //         console.log(err)
                    //     })
                })
                .catch((err) => {
                    console.log(err)
                })

            const fullOiDate = []

            for (let i = 0; i < callOi.length || i < putOi.length || i < futures.length; i++) {
                try {
                    var { call_Oi, call_oi_change, call_date_time } = callOi[i]
                    var { put_Oi, put_oi_change } = putOi[i]
                } catch (err) {
                    console.log(err)
                    reject()
                }

                if (isNaN(put_oi_change)) put_oi_change = 0

                if (call_date_time) {
                    call_date_time = call_date_time.split(' ')[1].substring(0, 5)
                }

                // let future_oi
                // let futures_oi_change

                // if (futures[i] === undefined) {
                //     future_oi = 0
                //     futures_oi_change = 0
                // } else {
                //     future_oi = futures[i].future_oi
                //     futures_oi_change = futures[i].futures_oi_change
                // }

                fullOiDate.push({
                    call_date_time,
                    call_Oi,
                    call_oi_change,
                    put_Oi,
                    put_oi_change,
                    // future_oi,
                    // futures_oi_change,
                    ce_pe_diff: put_Oi - call_Oi
                })
            }

            const barChartTotal = [
                {
                    name: 'CALL',
                    oi: 0,
                    change_in_oi: 0
                },
                {
                    name: 'PUT',
                    oi: 0,
                    change_in_oi: 0
                }
            ]

            for (let i = 0; i < callOi.length; i++) {
                barChartTotal[0].oi += callOi[i].call_Oi
                barChartTotal[0].change_in_oi += callOi[i].call_oi_change
            }

            for (let i = 0; i < putOi.length; i++) {
                barChartTotal[1].oi += putOi[i].put_Oi
                if (isNaN(putOi[i].put_oi_change)) {
                    barChartTotal[1].change_in_oi += 0
                } else {
                    barChartTotal[1].change_in_oi += putOi[i].put_oi_change
                }
            }

            try {
                fullOiDate[0].call_oi_change = 0
            } catch (err) {
                console.log(err)
            }

            resolve({ lineData: fullOiDate, barData: barChartTotal })
        })
    },
    getOiLiveData: (access_token, symbol, expiryDate, intervel, historical, strikeRange) => {
        return new Promise((resolve, reject) => {
            const apiKey = process.env.API_KEY
            const secretKey = process.env.SECRET_KEY

            const breeze = new BreezeConnect({ "appKey": apiKey })
            breeze.generateSession(secretKey, access_token)
                .then((res) => {
                    const latestOi = {
                        call_date_time: '',
                        call_Oi: 0,
                        call_oi_change: 0,
                        put_Oi: 0,
                        put_oi_change: 0,
                        ce_pe_diff: 0
                    }

                    const expiryDateArray = expiryDate.split('-')
                    const expiryIsoDate = `${expiryDateArray[2]}-${expiryDateArray[1]}-${expiryDateArray[0]}T07:00:00.000Z`

                    // Get Call Type Data
                    breeze.getOptionChainQuotes({
                        stockCode: symbol,
                        exchangeCode: "NFO",
                        productType: "options",
                        expiryDate: expiryIsoDate,
                        right: "call",
                        strikePrice: strikeRange[0].stike_price
                    })
                        .then((res) => {
                            if (res.Status !== 200) return reject()
                            res.Success.map((quoteDate) => {
                                latestOi.call_Oi += quoteDate.open_interest
                                latestOi.call_oi_change += quoteDate.chnge_oi
                                if(quoteDate.ltt.length > 1) {
                                    latestOi.call_date_time = quoteDate.ltt
                                }
                            })

                            // Put Type data
                            breeze.getOptionChainQuotes({
                                stockCode: symbol,
                                exchangeCode: "NFO",
                                productType: "options",
                                expiryDate: expiryIsoDate,
                                right: "put",
                                strikePrice: strikeRange[0].stike_price
                            })
                                .then((res) => {
                                    if (res.Status !== 200) return reject()
                                    res.Success.map((quoteDate) => {
                                        latestOi.put_Oi += quoteDate.open_interest
                                        latestOi.put_oi_change += quoteDate.chnge_oi
                                    })
                                    latestOi.ce_pe_diff = latestOi.put_Oi - latestOi.call_Oi
                                    latestOi.call_date_time = latestOi.call_date_time.split(' ')[1].substring(0, 5)
                                    resolve(latestOi)
                                })
                                .catch((err) => {
                                    console.log(err)
                                })

                        })
                        .catch((err) => {
                            console.log(err)
                        })

                })
                .catch((err) => {
                    reject(err)
                })
        })
    }
}