require("dotenv").config()
const User = require("../models/user.jsx")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
const { validationResult } = require("express-validator");


exports.SignUp = (req, res) => {

    const data = req.body;

    User.findOne({ email: data.email })
        .then(async (user) => {
            if (user) {
                return res.status(403).json({ message: "Email already exists" });
            } else {
                const encryptedPassword = await bcrypt.hash(data.password, 10)
                const userData = {
                    ...data,
                    password: encryptedPassword
                }
                const user = new User(userData);
                user
                    .save()
                    .then((result) => {
                        console.log(result);
                        res.status(201).json(result);
                    })
                    .catch((error) => {
                        console.log(error);
                        res.status(500).json({ message: "Error creating user" });
                    });
            }
        })
        .catch((error) => {
            console.log(error);
            res.status(500).json({ message: "Error finding user" });
        });
}

exports.SignIn = (req, res) => {
    const { email, password } = req.body;
    User.findOne({ email })
        .then(async (user) => {
            if (!user) {
                return res.status(402).json({ message: "Wrong email or password" })
            }
            const isPasswordCorrect = await bcrypt.compare(password, user.password)
            if (isPasswordCorrect) {
                const token = jwt.sign({
                    id: user._id,
                    email: user.email
                }, process.env.TOKEN_KEY,
                    {
                        expiresIn: "30d"
                    })
                return res.status(200).json({ user, token })
            } else { res.status(402).json({ message: "Wrong email or password" }) }
        })
        .catch((error) => {
            console.log(error)
            res.status(500).json({ message: "Error finding user" })
        })
}

exports.me = (req, res) => {
    const token = req.headers["x-access-token"]
    if (!token) {
        return res.status(403).send("A token required for authentication")
    }
    try {
        const decodedUser = jwt.verify(token, process.env.TOKEN_KEY)
        User.findOne({ email: decodedUser.email })
            .then((user) => {
                res.status(200).json({ user })
            })
            .catch(() => {
                res.status(500).json({ message: "Error finding user" })
            })
    } catch (error) {
        return res.status(401).send("invalid Token")
    }
}

exports.updateUser = (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    console.log(req.user)
    User.findByIdAndUpdate(req.user.id, {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        age: req.body.age
    }, { new: true })
        .then((user) => {
            res.status(200).json({ user })
        })
        .catch(() => {
            res.status(500).json({ message: "error updating user" })
        })
}

exports.changePassword = async (req, res) => {
    const { password, lastPassword } = req.body
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    User.findOne({ email: req.user.email })
        .then(async (user) => {
            if (!user) {
                return res.status(402).json({ message: "Wrong email or password" })
            }
            const isPasswordCorrect = await bcrypt.compare(lastPassword, user.password)
            if (!isPasswordCorrect) {
                res.status(402).json({ message: "Wrong password" })
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            User.findByIdAndUpdate(user._id, {
                password: hashedPassword
            }, { new: true })
                .then((user) => {
                    res.status(200).json({ user })
                })
                .catch((err) => {
                    console.log(err)
                    res.status(500).json({ message: "Error Updating User" })
                })
        })
        .catch((err) => {
            console.log(err)
            res.status(500).json({ message: "Password changing failed" })
        })

}


