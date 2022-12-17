const mongoose = require("mongoose")
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")
const Task = require("../models/Task")
const Schema = mongoose.Schema
const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        validate(value) {
            if (value < 0) {
                throw new Error("Age should be a positive number")
            }
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid Email")
            }
        }
    },
    password: {
        type: String,
        validate(value) {
            if (value.length < 5) {
                throw new Error("Password must contain more than 5 characters")
            }
        }
    },
    tokens: [{
        token: {
            type: String
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

userSchema.methods.toJSON = function () {
    const user = this
    const userObj = user.toObject()
    delete userObj.password
    delete userObj.tokens
    return userObj
}

userSchema.methods.genAuthToken = async function () {
    const user = this
    const token = await jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRETKEY)
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

userSchema.virtual("task", {
    ref: "Task",
    localField: '_id',
    foreignField: "owner"
})

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error("No user with provided email")
    }
    const isMatched = await bcrypt.compare(password, user.password)
    if (!isMatched) {
        throw new Error("Invalid Credentials")
    }
    return user
}

userSchema.pre("save", async function (next) {
    const user = this
    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

userSchema.pre("remove", async function (next) {
    const user = this
    await Task.deleteMany({ owner: user._id })
    next()

})

const User = mongoose.model("User", userSchema)
module.exports = User