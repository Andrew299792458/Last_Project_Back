const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const postSchema = new Schema({

    userId: { type: String, default: null },
    title: { type: String, default: null },
    description: { type: String, default: null },
    createAt: { type: String, default: null },
    updateAt: { type: String, default: null },
    image: { type: String, default: null },
    likes: [String]

})

module.exports = mongoose.model("Post", postSchema)