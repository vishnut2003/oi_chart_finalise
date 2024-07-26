const express = require('express');
const app = express();
const cors = require('cors')
const morgan = require('morgan')
const dbConnect = require('./database/dbConn');
const session = require('express-session');
const { WebSocketServer } = require('ws');

require('dotenv').config();

// import Router
const authRouter = require('./routes/auth');
const userRoute = require('./routes/users');
const fyersRoute = require('./routes/fyers');
const breezeRouter = require('./routes/breeze');
const settingsRouter = require('./routes/settings');
const breezeHelpers = require('./helpers/breezeHelpers');


// Configure port
const PORT = process.env.PORT || 3500;

// middlewares
app.use(cors({
    credentials: true
}))
app.use(morgan('common'))
app.use(express.json())
app.use(session({
    secret: 'JKFIKLJSDG%^KJG^5JHkv',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 300000
    }
}))

// use Routes
app.use('/auth', authRouter);
app.use('/users', userRoute);
app.use('/fyers/', fyersRoute);
app.use('/breeze', breezeRouter);
app.use('/settings', settingsRouter);

// Connect to database
dbConnect(() => {
    const server = app.listen(PORT, '127.0.0.1', () => {
        console.log(`Server is running on ${PORT}`);
    })

    const wss = new WebSocketServer({ server: server })
    wss.on('listening', () => {
        console.log("WebSocket Connected")
    })

    wss.on('connection', (ws) => {
        console.log('Client side connected')

        ws.on('message', async (msg) => {
            const reqData = JSON.parse(msg)

            // Stock datas
            const symbol = reqData.symbol
            const expiryDate = reqData.expiryDate
            const intervel = reqData.intervel
            const historical = reqData.historical
            const strikeRange = reqData.strikeRange

            const access_token = await breezeHelpers.getApiSessionKey()
            breezeHelpers.getOiLiveData(access_token, symbol, expiryDate, intervel, historical, strikeRange)
                .then((latestOi) => {
                    ws.send(JSON.stringify(latestOi))
                })
                .catch((err) => {
                    console.log(err)
                })
        })

        ws.on('close', () => {
            console.log('Connection closed')
        })
    })
})