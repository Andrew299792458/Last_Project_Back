const { check } = require("express-validator")

const updateUserValidation = [
    check("firstName")
        .notEmpty()
        .withMessage("First Name is required")
        .isLength({ min: 2 })
        .withMessage("First Name must be min 2 Symbol"),

    check("lastName")
        .notEmpty()
        .withMessage("Last Name is required")
        .isLength({ min: 3 })
        .withMessage("Last Name must be min 3 Symbol"),

    check("age")
        .notEmpty()
        .withMessage("Age is required")
]

module.exports = updateUserValidation