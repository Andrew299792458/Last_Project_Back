require("dotenv").config()
const User = require("../models/user.jsx")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
const { validationResult } = require("express-validator");
const fs = require('fs');
const path = require('path');


exports.SignUp = (req, res) => {

    const data = req.body;

    const imageFile = req.file
    console.log(imageFile)

    const ImageName = "avatar" + Date.now() + imageFile.originalname

    const imagePath = path.join("images", ImageName);

    const newImagePath = path.join("public", imagePath);

    console.log(req.file)

    fs.copyFileSync(imageFile.path, newImagePath);

    User.findOne({ email: data.email })
        .then(async (user) => {
            if (user) {
                return res.status(403).json({ message: "Email already exists" });
            } else {
                const encryptedPassword = await bcrypt.hash(data.password, 10)
                const userData = {
                    ...data,
                    password: encryptedPassword,
                    image: imagePath,
                }
                const user = new User(userData);
                user
                    .save()
                    .then((result) => {
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

    try {

        User.findOne({ email: req.user.email })
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


exports.AllUsers = (req, res) => {

    try {

        User.find()
            .then((users) => {
                res.status(200).json({ users })
            })
            .catch(() => {
                res.status(500).json({ message: "Error finding user" })
            })
    } catch (error) {
        return res.status(401).send("invalid Token")
    }
}