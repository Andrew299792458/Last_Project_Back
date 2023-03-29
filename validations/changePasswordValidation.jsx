const { check } = require("express-validator")

const changePasswordValidation = [
    check("lastPassword")
        .notEmpty()
        .withMessage("Last Password is required"),
    check("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 3 })
        .withMessage("Password must be min 9 Symbol")
]

module.exports = changePasswordValidation