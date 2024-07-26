const express = require('express')
const router = express.Router()
const fsPromise = require('fs/promises')
const fs = require('fs')
const path = require('path')
const breezeHelpers = require('../helpers/breezeHelpers')
const getBreezeSymbols = require('../additional_process/breezeCsv')

router.get('/', (req, res) => {
    res.send('Working')
})

router.get('/genetate-session-key', (req, res) => {
    const API_KEY = process.env.API_KEY;
    const generateURL = `https://api.icicidirect.com/apiuser/login?api_key=${API_KEY}`
    res.redirect(generateURL)
})

router.post('/save-session-key', async (req, res) => {
    const session_key = req.query.apisession;

    try {
        if (!fs.existsSync(path.join(__dirname, 'credentials'))) {
            await fs.mkdirSync(path.join(__dirname, 'credentials'))
        }
        await fsPromise.writeFile(path.join(__dirname, 'credentials', 'access_token.txt'), session_key)
        res.send('SESSION_KEY generated successfully')
    } catch (err) {
        res.send(err);
    }
})

router.get('/nfo-symbols', (req, res) => {
    getBreezeSymbols()
        .then((symbols) => {
            res.send(symbols)
        })
})

router.get('/expiry/:symbol', async (req, res) => {
    const access_token = await breezeHelpers.getApiSessionKey()
    breezeHelpers.getExpiry(req.params.symbol, access_token)
    res.send(req.params.symbol)
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
    let expiryDay = expiry[0]
    let expiryMonth = expiry[1]
    let expiryYear = expiry[2]
    const fullExpiry = `${expiryYear}-${expiryMonth}-${expiryDay}T07:00:00.000Z`

    // date and next date
    let specDateYear = date[0]
    let specDateMonth = date[1]
    let specDateDay = date[2]
    const specStartDate = `${specDateYear}-${specDateMonth}-${specDateDay}T07:00:00.000Z`
    let specEndDate = new Date(`${specDateYear}-${specDateMonth}-${specDateDay} 12:30`)
    specEndDate.setDate(specEndDate.getDate() + 1)
    specEndDate = specEndDate.toISOString()

    const access_token = await breezeHelpers.getApiSessionKey()
    breezeHelpers.getOiData(access_token, symbol, fullExpiry, intervel, specStartDate, specEndDate, strikeRange)
        .then((oi) => {
            res.send(oi);
        })
        .catch((err) => {
            console.log(err)
        })
    
})

module.exports = router