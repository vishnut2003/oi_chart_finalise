const router = require('express').Router()
const Settings = require('../models/settingsModel')
const Nofifications = require('../models/notificationsModel')
const Notifications = require('../models/notificationsModel')
const Contact = require('../models/contactModel')

router.get('/get/strike-range-filter', (req, res) => {
    Settings.findOne({ name: 'strike_range_filter' })
        .then((strike_filter) => {
            res.status(200).send(strike_filter.status)
        })
})

router.get('/strike-range-filter/:status', async (req, res) => {
    const status = req.params.status
    await Settings.findOne({ name: 'strike_range_filter' })
        .then(async (res) => {
            if (!res) {
                const settings = new Settings({ name: 'strike_range_filter', status: true })
                await settings.save()
            }
        })

    Settings.updateOne({ name: 'strike_range_filter' }, { status: status })
        .then((updated) => {
            res.status(200).send('updated')
        })
})

router.post('/notifications/add', async (req, res) => {
    try {
        const notifications = new Nofifications(req.body)
        await notifications.save()
    } catch (err) {
        return console.log(err)
    }

    res.status(200).send('Notification added')

})

router.get('/notifications/get', (req, res) => {
    Nofifications.find()
        .then((notifications) => {
            res.status(200).send(notifications)
        })
        .catch((err) => {
            console.log(err)
        })
})

router.get('/notifications/delete/:id', (req, res) => {
    Notifications.findByIdAndDelete(req.params.id)
        .then((deletedRes) => {
            res.status(200).send('Deleted')
        })
})

router.post('/contacts/edit', async (req, res) => {
    try {
        await Contact.deleteMany()
        const contactInfo = new Contact(req.body)
        contactInfo.save()
    } catch(err) {
        return res.status(400).send('server error')
    }

    res.status(200).send('saved')
})

router.get('/contacts/get', (req, res) => {
    Contact.find()
        .then((contactInfo) => {
            if(!contactInfo) {
                return res.status(400).send('server error')
            }
            res.status(200).send(contactInfo);
        })
})

module.exports = router;