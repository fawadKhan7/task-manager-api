const express = require("express")
const Task = require("../models/Task")
const auth = require("../middlewares/auth")
const router = express.Router()

router.get("/", auth, async (req, res) => {
    try {
        await req.user.populate("task")
        res.status(200).send(req.user.task)
    } catch (err) {
        res.status(400).send(err)
    }
})

router.post("/add", auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save()
        res.status(200).send(task)
    } catch (err) {
        res.status(400).send(err)
    }
})

router.post("/update/:id", auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ["description", "completed"]
    const isValid = updates.every((update) => allowedUpdates.includes(update))
    if (!isValid) {
        return res.status(404).send({ error: "Invalid Updates" })
    }
    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
        if (!task) {
            return res.status(404).send("No Task Found")
        }
        updates.forEach((update) => { task[update] = req.body[update] })
        await task.save()
        res.status(200).send(task)

    } catch (err) {
        res.status(400).send(err)
    }
})

router.delete("/delete/:id", auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        if (!task) {
            return res.status(404).send("No Task Found")
        }
        res.status(200).send(task)

    } catch (err) {
        res.status(400).send(err)
    }
})


module.exports = router