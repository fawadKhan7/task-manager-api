const express = require("express")
const User = require("../models/User")
const auth = require("../middlewares/auth")
const multer = require('multer')
const { goodByeEmail, welcomeEmail } = require("../email/email")
const router = express.Router()

router.get("/me", auth, async (req, res) => {
    res.send(req.user)
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error("Please Upload an image"))
        }
        cb(undefined, true)
    }
})

router.post("/me/avatar", auth, upload.single('avatar'), async (req, res) => {
    req.user.avatar = req.file.buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete("/me/avatar", auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.post("/add", async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        welcomeEmail(user.email, user.name)
        const token = await user.genAuthToken()
        res.status(200).send({ user, token })

    } catch (err) {
        res.status(400).send(err)
    }
})


router.patch("/update/me", auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ["name", "email", "password", "age"]
    const isValid = updates.every((update) => allowedUpdates.includes(update))
    if (!isValid) {
        return res.status(400).send({ "error": "Invalid Updates" })
    }
    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)

    } catch (err) {
        res.status(400).send(err)
    }
})

router.delete("/delete/me", auth, async (req, res) => {
    try {
        await req.user.remove()
        goodByeEmail(req.user.email, req.user.name)
        res.status(200).send(req.user)
    } catch (err) {
        res.status(400).send(err)
    }
})

router.post("/login", async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.genAuthToken()
        res.status(200).send({ user, token })
    } catch (err) {
        res.status(400).send(err)
    }
})

router.post("/logout", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch (err) {
        res.status(500).send()
    }
})

router.post("/logoutall", auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        req.send()

    } catch (error) {
        res.status(500).send()
    }
})

router.get("/:id/avatar", async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            throw new Error()
        }
        res.set("Content-Type", "image/jpg")
        res.send(user.avatar)
    } catch (error) {
        res.status(400).send()
    }
})

module.exports = router