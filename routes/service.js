const mongoose = require('mongoose');
require('dotenv').config({path:"./.env"})

const serviceSchema = new mongoose.Schema({
    seviceName:{
        type:String,
        trim:true,
        required:[true,"serviceName is required"],
        minLength:[3,"serviceName must be at least 3 characters long"],
    },
    serviceImage:{
        type:String,
        trim:true,
    },
    
},{timestamps:true})

module.exports = mongoose.model('service',serviceSchema);
