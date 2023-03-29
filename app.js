require("dotenv").config()
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose")
const { PORT, HOST, DB } = require("./constants/index");
const { SignUp, SignIn, me, updateUser, changePassword } = require("./controllers/TestController")
const app = express()
const updateUserValidation = require("./validations/updateUserValidation.jsx")
const changePasswordValidation = require("./validations/changePasswordValidation.jsx")
const tokenMiddleware = require("./middleware/TokenMiddleware.jsx")

mongoose
    .connect(DB, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("conected to DB"))
    .catch((error) => console.log(error))

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({
    origin: '*',
}));

app.post("/sign-up", SignUp)
app.post("/sign-in", SignIn)
app.get("/me", tokenMiddleware, me)
app.put("/user-update", updateUserValidation, tokenMiddleware, updateUser);
app.put("/change-password", changePasswordValidation, tokenMiddleware, changePassword)

app.listen(PORT, HOST, (error) => {
    if (error) {
        console.log(error)
    }
    console.log(`http://${HOST}:${PORT}`)
})