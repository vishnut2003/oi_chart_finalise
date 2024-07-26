const User = require('../models/userModel')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const sendMail = require('./mailSender')

module.exports = {
    registerUser: (newUser) => {
        return new Promise(async (resolve, reject) => {

            // hash password
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(newUser.password, salt)

            newUser.password = hashPassword;

            // set expiry date
            const expiryDate = new Date()
            expiryDate.setDate(expiryDate.getDate() + 2)

            newUser.expiryDate = expiryDate

            // write to database
            const user = new User(newUser)
            await user.save()
                .then((res) => {
                    resolve('User Created Successfully')
                })
                .catch((err) => {
                    reject('Email or Username already exist!')
                })
        })
    },
    loginUser: (user) => {
        return new Promise(async (resolve, reject) => {
            const existUser = await User.findOne({ email: user.email })
            if (!existUser) reject("User doesn't exist!");
            else {
                // varyfy password
                const valid = await bcrypt.compare(user.password, existUser.password)
                if (valid) {
                    const userId = existUser._id
                    const existUserId = userId.toString()

                    const buffer = crypto.randomBytes(10)
                    const token = buffer.toString('hex');

                    User.findByIdAndUpdate(existUserId, { loggedIn: token })
                        .then((res) => {
                            resolve(token);
                        })

                } else {
                    reject('Password is incorrect');
                }

            }
        })
    },
    getOneUser: (session) => {
        return new Promise(async (resolve, reject) => {
            User.findOne({ loggedIn: session })
                .then((user) => {
                    if (!user) reject()
                    else resolve(user)
                })

        })
    },
    searchUsers: (email) => {
        return new Promise((resolve, reject) => {
            User.findOne({ email })
                .then((res) => {
                    resolve(res)
                })
        })
    },
    logoutUser: (userId) => {
        return new Promise((resolve, reject) => {
            User.findByIdAndUpdate(userId, { loggedIn: false })
                .then((res) => {
                    resolve()
                })
        })
    },
    getAllUsers: () => {
        return new Promise((resolve, reject) => {
            User.find().then((res) => {
                resolve(res)
            })
                .catch((err) => {
                    console.log(err)
                })
        })
    },
    updateUserExpiry: (id, expiry) => {
        return new Promise((resolve, reject) => {
            User.findByIdAndUpdate(id, { expiryDate: expiry })
                .then(() => {
                    User.findById(id)
                        .then((user) => {
                            resolve(user)
                        })
                })
                .catch((err) => {
                    console.log(err)
                })
        })
    },
    checkUserExpiryLeft: (id) => {
        return new Promise((resolve, reject) => {
            const currDate = new Date()
            try {
                User.findById(id).then((user) => {
                    const userExpiry = user.expiryDate
                    let daysDiff = userExpiry - currDate
                    daysDiff /= 100000000
                    daysDiff = Math.ceil(daysDiff)
                    const diffObj = {}
                    if (daysDiff < 0) {
                        diffObj.expired = true;
                        diffObj.days = daysDiff
                    } else {
                        diffObj.expired = false;
                        diffObj.days = daysDiff
                    }
                    resolve(diffObj)
                })
            } catch (err) {
                console.log(err)
            }
        })
    },
    resetPassword: (email) => {
        return new Promise((resolve, reject) => {
            User.findOne({ email }).then(async (user) => {
                if (!user) reject('Email does not exist');
                const buffer = crypto.randomBytes(10)
                const token = buffer.toString('hex');

                User.findOneAndUpdate({ email: email }, { resetToken: token })
                    .then((res) => {
                        const subject = 'Reset password token'
                        const message = `<p>Your token for reset password</p><br><h1>${token}</h1>`

                        sendMail(email, subject, message)
                            .then(() => {
                                resolve()
                            })
                    })
            })
        })
    },
    changePassword: (resetKey, password) => {
        return new Promise((resolve, reject) => {
            User.findOne({ resetToken: resetKey })
                .then(async (user) => {
                    if (!user) {
                        reject('Token is invalid')
                    } else {
                        const salt = await bcrypt.genSalt(10);
                        const hashPassword = await bcrypt.hash(password, salt)
                        User.findOneAndUpdate({ resetToken: resetKey }, { password: hashPassword, resetToken: 'nothing' })
                            .then((res) => {
                                resolve(res)
                            })
                    }
                })
        })
    }
}