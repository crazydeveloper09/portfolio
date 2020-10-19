const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  
    title: String,
    titleEn: String,
    description: String,
    descriptionEn: String,
    link: String,
    links: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Links"
        }
    ]
})

module.exports = mongoose.model("Category", categorySchema);