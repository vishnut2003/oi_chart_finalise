const router = require('express').Router();
const userHelpers = require('../helpers/userHelpers')
const jwt = require('jsonwebtoken');

router.post('/login', (req, res) => {
    userHelpers.loginUser(req.body)
        .then((token) => {
            res.status(200).send(token)
        })
        .catch((err) => {
            res.status(400).send(err)
        })
})

router.post('/register', async (req, res) => {
    await userHelpers.registerUser(req.body)
        .then((message) => {
            res.status(200).send(message)
        })
        .catch((err) => {
            res.status(400).send(err)
        })
})

router.post('/reset-password', (req, res) => {
    userHelpers.resetPassword(req.body.email)
        .then(() => {
            res.status(200).send('reset token generated')
        })
        .catch((err) => {
            res.status(400).send(err)
        })
})

router.post('/change-password', (req, res) => {
    userHelpers.changePassword(req.body.resetKey, req.body.password)
        .then((user) => {
            res.status(200).send('password changed')
        })
        .catch((err) => {
            res.status(400).send(err)
        })
})

module.exports = router;