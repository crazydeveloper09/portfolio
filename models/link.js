const mongoose = require("mongoose");

const linksSchema = new mongoose.Schema({
    title: String,
    titleEn: String,
    link: String,
    linkEn: String,
    description: String,
    descriptionEn: String,
    click: {
        type: Number,
        default: 0
    }
})

module.exports = mongoose.model("Links", linksSchema)