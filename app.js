require("dotenv").config()
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const { PORT, HOST, DB } = require("./constants/index");
const { SignUp, SignIn, me, updateUser, changePassword, AllUsers } = require("./controllers/TestController")
const app = express()
const updateUserValidation = require("./validations/updateUserValidation.jsx")
const changePasswordValidation = require("./validations/changePasswordValidation.jsx")
const tokenMiddleware = require("./middleware/TokenMiddleware.jsx")
const { CreatePost, GetPosts, UpdatePost, DeletePost, AllPosts, LikePost } = require("./controllers/PostsController.jsx")
const { SaveMessage, GetMessages, DeleteMessages } = require("./controllers/MessageController.jsx")
const multer = require('multer');
app.use(express.static('public'));
app.use(express.json());
const Message = require("./models/message.jsx")
const upload = multer({ dest: 'public/images' });
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000"
    }
});

mongoose
    .connect(DB, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("conected to DB"))
    .catch((error) => console.log(error))

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({
    origin: '*',
}));

//chat

io.on("connection", (socket) => {
    console.log("a user connected");
    socket.on("message", (message) => {
        SaveMessage(message)
        io.emit("message", message);
    });
    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
});


app.delete('/collection', tokenMiddleware, DeleteMessages);

//chat

app.post("/sign-up", upload.single('image'), SignUp)
app.post("/sign-in", SignIn)
app.get("/me", tokenMiddleware, me)
app.put("/user-update", updateUserValidation, tokenMiddleware, updateUser);
app.put("/change-password", changePasswordValidation, tokenMiddleware, changePassword)

app.post("/create-post", tokenMiddleware, upload.single('image'), CreatePost)

app.get("/posts", tokenMiddleware, GetPosts);
app.get("/feed", tokenMiddleware, AllPosts);

app.get("/users", tokenMiddleware, AllUsers);

app.put("/update-post", UpdatePost)

app.put("/like-post", tokenMiddleware, LikePost)

app.delete("/delete-post", DeletePost)

app.get("/get-messages", tokenMiddleware, GetMessages);


server.listen(PORT, HOST, (error) => {
    if (error) {
        console.log(error)
    }
    console.log(`http://${HOST}:${PORT}`)
})