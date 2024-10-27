const mongoose = require("mongoose")

const Schema = mongoose.Schema;

const myarticles = new Schema({
    addressOfArticle : String,
    bodyOfArticle : String
}, { timestamps: true })


const Article = mongoose.model("article", myarticles);

// export the model
module.exports = Article;

