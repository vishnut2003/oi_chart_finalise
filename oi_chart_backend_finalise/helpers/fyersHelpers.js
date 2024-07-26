const fyersModel = require('fyers-api-v3').fyersModel
const { default: axios } = require('axios')
const fsPromise = require('fs/promises')
const path = require('path')
const crypto = require('crypto')
const symbolCsv = require('../additional_process/forcsv');

module.exports = {
    generateNewAccess: async () => {

        const concatenatedString = process.env.FYERS_API_ID + process.env.FYERS_API_SECRET;
        const hash = crypto.createHash('sha256').update(concatenatedString).digest('hex');

        const pin = process.env.FYERS_PIN
        const refreshToken = await fsPromise.readFile(path.join(__dirname, '..', 'routes', 'credentials', 'fyers_refresh_token.txt'), { encoding: 'utf8' })

        const response = await axios.post('https://api.fyers.in/api/v2/validate-refresh-token', {
            grant_type: 'refresh_token',
            appIdHash: hash,
            refresh_token: refreshToken,
            pin: pin
        })

        return response.data.access_token

    },
    getAllSymbols: async () => {
        const symbolsSet = await symbolCsv()
        const symbols = [...symbolsSet[0]]
        return symbols
    },
    getSymbolExpiry: (redirectUrl, access_token, rawSymbol) => {
        return new Promise((resolve, reject) => {
            let symbol;
            const appId = process.env.FYERS_API_ID

            const fyers = new fyersModel();
            fyers.setAppId(appId);
            fyers.setRedirectUrl(redirectUrl);
            fyers.setAccessToken(access_token);

            rawSymbol = rawSymbol.toUpperCase();

            if (rawSymbol == 'NIFTY')
                symbol = `NSE:NIFTY50-INDEX`;
            else if (rawSymbol.includes('BANKNIFTY'))
                symbol = `NSE:NIFTYBANK-INDEX`;
            else if (rawSymbol.includes('NIFTY'))
                symbol = `NSE:${rawSymbol}-INDEX`
            else symbol = `NSE:${rawSymbol}-EQ`;

            fyers.getOptionChain({
                symbol: symbol,
            })
                .then((res) => {
                    let rawExpiryObject = []
                    rawExpiryObject = res.data.expiryData || [];

                    const currentMonth = new Date().getMonth() + 1;
                    const currentYear = new Date().getFullYear();
                    const monthDate = currentMonth + '-' + currentYear;

                    let expiryObject = rawExpiryObject.filter((expiry, index) => {
                        if (expiry.date.includes(monthDate)) {
                            return expiry
                        }
                    })

                    if (expiryObject.length === 0) {
                        const nextMonth = new Date().getMonth() + 2;
                        const currentYear = new Date().getFullYear();
                        const monthDate = nextMonth + '-' + currentYear;

                        expiryObject = rawExpiryObject.filter((expiry, index) => {
                            if (expiry.date.includes(monthDate)) {
                                return expiry
                            }
                        })
                    }

                    resolve(expiryObject)
                })
                .catch((err) => {
                    console.log(err)
                })
        })
    },
    getStrikePrice: (redirectUrl, access_token, rawSymbol) => {
        return new Promise((resolve, reject) => {
            const appId = process.env.FYERS_API_ID;
            let symbol;

            const fyers = new fyersModel();
            fyers.setAppId(appId);
            fyers.setRedirectUrl(redirectUrl);
            fyers.setAccessToken(access_token)

            rawSymbol = rawSymbol.toUpperCase();

            if (rawSymbol == 'NIFTY')
                symbol = `NSE:NIFTY50-INDEX`;
            else if (rawSymbol.includes('BANKNIFTY'))
                symbol = `NSE:NIFTYBANK-INDEX`;
            else if (rawSymbol.includes('NIFTY'))
                symbol = `NSE:${rawSymbol}-INDEX`
            else symbol = `NSE:${rawSymbol}-EQ`;

            fyers.getOptionChain({ symbol })
                .then((res) => {
                    const optionChain = res.data.optionsChain || []
                    const strikePriceObject = [];

                    for (let i = 0; i < optionChain.length; i++) {
                        let { strike_price, symbol } = optionChain[i]

                        if (symbol) {
                            symbol = symbol.slice(0, -2);
                        }

                        if (optionChain[i].option_type == 'CE') {
                            strikePriceObject.push({
                                strike_price: strike_price,
                                symbol: symbol
                            })
                        }

                    }

                    resolve(strikePriceObject)
                })
        })
    },
    getOiDataForIndex: (symbol, expiry, strikePriceRange, intervel, startDate, endDate, access_token, redirectURL) => {
        return new Promise((resolve, reject) => {
            const appId = process.env.FYERS_API_ID;

            const fyers = new fyersModel();
            fyers.setAppId(appId);
            fyers.setRedirectUrl(redirectURL);
            fyers.setAccessToken(access_token)

            let fullSymbol;

            fullSymbol = `NSE:${symbol}${expiry}${strikePriceRange[0].strike_price}CE`;

            const input = {
                "symbol": fullSymbol,
                "resolution": intervel,
                "date_format": "1",
                "range_from": startDate,
                "range_to": endDate,
                "cont_fclag": "1",
                "oi_flag": "1"
            }

            fyers.getHistory(input)
                .then((res) => {
                    console.log(res)
                })
                .catch((err) => {
                    console.log(err)
                    // console.log(strikePriceRange)
                })
        })
    }
}