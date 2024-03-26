const mongoose = require('mongoose');
require('dotenv').config({path:"./.env"})

const contactSchema = new mongoose.Schema({
    cName:{
        type:String,
        trim:true,
        required:[true,"courseName is required"],
        minLength:[3,"courseName must be at least 3 characters long"],
    },
    cEmail:{
        type:String,
        trim:true,
        // unique:true,
        lowercase:true,
        required:[true,"email is required"],
        match:[/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,"invalid email"]
    },
    subject:{
        type:String,
        required:[true,"subject is required"],
    },
    message:{
        type:String,
        required:[true,"massage is required"],
    }
    
},{timestamps:true})

module.exports = mongoose.model('contact',contactSchema);
