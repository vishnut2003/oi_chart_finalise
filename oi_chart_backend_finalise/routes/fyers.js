const router = require('express').Router()
const fyersAPI = require('fyers-api-v3').fyersModel
const fs = require('fs')
const fsPromise = require('fs/promises')
const path = require('path')
const fyersHelpers = require('../helpers/fyersHelpers')

// Credentials for fyers
const appId = process.env.FYERS_API_ID
const secretId = process.env.FYERS_API_SECRET

router.get('/generate-auth', (req, res) => {

    const redirectURL = req.protocol + '://' + req.get('host') + '/fyers/generate-refresh-token'

    const fyers = new fyersAPI()
    fyers.setAppId(appId)
    fyers.setRedirectUrl(redirectURL)

    const authCodeURL = fyers.generateAuthCode()

    res.redirect(authCodeURL)

})

router.get('/generate-refresh-token', (req, res) => {

    const redirectURL = req.protocol + '://' + req.get('host') + '/fyers/generate-refresh-token'

    const fyers = new fyersAPI()
    fyers.setAppId(appId)
    fyers.setRedirectUrl(redirectURL)

    const authCode = req.query.auth_code;
    const secretKey = secretId;

    fyers.generate_access_token({
        secret_key: secretKey,
        auth_code: authCode
    })
        .then(async (response) => {

            try {
                if (!fs.existsSync(path.join(__dirname, 'credentials'))) {
                    await fs.mkdirSync(path.join(__dirname, 'credentials'))
                }
                await fsPromise.writeFile(path.join(__dirname, 'credentials', 'fyers_refresh_token.txt'), response.refresh_token)
                res.send('Refresh token generated successfully')
            } catch (err) {
                res.send(err);
            }
        })

})

router.get('/nfo-symbols', async (req, res) => {
    const symbols = await fyersHelpers.getAllSymbols()
    res.send(symbols)
})

router.get('/expiry/:symbol', async (req, res) => {
    const symbol = req.params.symbol
    const redirectURL = req.protocol + '://' + req.get('host') + '/fyers/generate-refresh-token';
    const access_token = await fyersHelpers.generateNewAccess()

    fyersHelpers.getSymbolExpiry(redirectURL, access_token, symbol)
        .then((expiryObject) => {
            res.send(expiryObject)
        })
})

router.get('/strike-price/:symbol', async (req, res) => {
    const symbol = req.params.symbol;

    const redirectURL = req.protocol + '://' + req.get('host') + '/fyers/generate-refresh-token';
    const access_token = await fyersHelpers.generateNewAccess()

    fyersHelpers.getStrikePrice(redirectURL, access_token, symbol)
        .then((strikeObject) => {
            res.send(strikeObject)
        })
})

router.post('/oi-data', async (req, res) => {
    let symbol = req.body.symbol || '';
    let expiry = req.body.expiryDate;
    let intervel = req.body.intervel;
    let date = req.body.historical;
    let strikeRange = req.body.strikeRange;

    if (expiry) expiry = expiry.split('-')
    if (date) date = date.split('-')

    // expiry date
    let expiryDay = parseInt(expiry[0]).toString()
    let expiryMonth = parseInt(expiry[1]).toString()
    let expiryYear = parseInt(expiry[2]).toString().substring(2, 4)

    if (symbol.includes('NIFTY')) {
        let fullExpiry = expiryYear + expiryMonth + expiryDay

        // date and next date
        const currentDate = new Date(`${date[0]}-${date[1]}-${date[2]}`).toISOString().substring(0, 10)
        let nextDate = new Date(`${date[0]}-${date[1]}-${date[2]}`).toISOString().substring(0, 10)

        const access_token = await fyersHelpers.generateNewAccess();
        const redirectURL = req.protocol + '://' + req.get('host') + '/fyers/generate-refresh-token';

        fyersHelpers.getOiDataForIndex(symbol, fullExpiry, strikeRange, intervel, currentDate, nextDate, access_token, redirectURL)
    } else {
        console.log('Equity')
    }

})

module.exports = router;