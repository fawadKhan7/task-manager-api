const express = require('express')
const mongoose = require('mongoose')
const Task = require("./models/Task")
const User = require("./models/User")
const taskRoutes = require("./routes/taskRoutes")
const userRoutes = require("./routes/userRoutes")
mongoose.set("strictQuery", true)
const app = express()
app.use(express.json())
app.use("/task", taskRoutes)
app.use("/user", userRoutes)
const port = process.env.PORT
console.log(process.env.PORT, process.env.SENDGRID_API_KEY, process.env.MONGODB_URL)
mongoose.connect(process.env.MONGODB_URL).then(
    app.listen(port, () => {
        console.log(`running on ${port}`)
    })).catch(
        err => res.send(err)
    )
// const main = async () => {
//     // const task = await Task.findById("63958d6c97646d42b9d96ac0")
//     // await task.populate("owner")
//     // console.log(task.owner)
//     const user = await User.findById("639226c3a4fa9de50d8b8a73")
//     await user.populate("task")
//     console.log(user.task)
// }
// main()