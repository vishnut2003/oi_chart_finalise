const router = require('express').Router();
const userHelpers = require('../helpers/userHelpers')

router.post('/verify', (req, res) => {
    userHelpers.getOneUser(req.body.session)
        .then((user) => {
            res.status(200).send(user)
        })
        .catch(() => {
            res.status(400).send('user not found')
        })
})

router.post('/search-users', (req, res) => {
    const email = req.body.email
    userHelpers.searchUsers(email)
        .then((users) => {
            if (users === null) return res.status(404).send('User not found')
            res.status(200).send(users)
        })
})

router.get('/get-all-users', (req, res) => {
    userHelpers.getAllUsers()
        .then((users) => {
            res.status(200).send(users)
        })
})

router.post('/update-expiry', (req, res) => {
    const newExpiryDate = new Date(req.body.newExpiryDate)
    const userId = req.body.userId
    userHelpers.updateUserExpiry(userId, newExpiryDate)
        .then((user) => {
            res.send(user)
        })
})

router.post('/get-expiry-left', (req, res) => {
    const userId = req.body.userId
    userHelpers.checkUserExpiryLeft(userId)
        .then((diffObj) => {
            res.send(diffObj)
        }) 
})

module.exports = router;