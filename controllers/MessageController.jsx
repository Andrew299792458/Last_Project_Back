const Message = require("../models/message.jsx")
const express = require("express");
const app = express()
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000"
    }
});

exports.SaveMessage = (message) => {
    const newMessage = new Message({
        from: message.from,
        to: message.to,
        createAt: message.createAt,
        description: message.description
    });
    newMessage
        .save()
        .then((result) => {
            console.log(result)
        })
        .catch((error) => {
            console.log(error);
        });
}

exports.GetMessages = (req, res) => {
    const userId = req.user.id
    const to = req.headers.to
    Message.find({
        $or: [
            { from: userId, to: to },
            { from: to, to: userId }
        ]
    })
        .then((messages) => {
            console.log("get messages")
            return res.status(200).json({ messages })
        })
        .catch((err) => {
            console.log(err)
            return res.status(501).json({ message: "ups!" })
        })
}
exports.DeleteMessages = async (req, res) => {
    const userId = req.user.id
    const to = req.headers.to

    Message.deleteMany({
        $or: [
            { from: userId, to: to },
            { from: to, to: userId }
        ]
    })
        .then((response) => {
            console.log(response);
            res.status(200).send('Collection deleted successfully');
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Internal server error');
        })
}