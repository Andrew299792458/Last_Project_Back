const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const messageSchema = new Schema({

    from: { type: String, default: null },
    to: { type: String, default: null },
    description: { type: String, default: null },
    createAt: { type: String, default: null },

})

module.exports = mongoose.model("Message", messageSchema)