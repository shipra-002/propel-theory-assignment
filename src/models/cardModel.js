const mongoose = require('mongoose');


const cardSchema = new mongoose.Schema({
    cardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    companyName: {
        type: String,
        trim: true,
        required: true
    },
    websiteURL: {
        type: String,
        trim: true,
        unique: true,
        required: true
    },
    socialURLs: {
        type: String,
        required:true,
        trim:true,
        enum: ["facebook", "twitter", "instagram"]
    },
    companyLogo :{
        type:String,
        required:true,
    },
    isCardDeleted:{
        type:Boolean,
        default:false,
    },

}, { timestamps: true });

module.exports = mongoose.model('card', cardSchema)