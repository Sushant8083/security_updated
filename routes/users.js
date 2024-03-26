const mongoose = require('mongoose');
require('dotenv').config({path:"./.env"})
var bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({path:"./.env"})



const connectDB = async () => {
    try {
        mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}

connectDB();

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        trim:true,
        unique:true,
        required:[true,"username is required"],
        minLength:[3,"username must be at least 3 characters long"],
    },
    name:{
        type:String,
        trim:true,
      },
    email:{
        type:String,
        trim:true,
        unique:true,
        lowercase:true,
        required:[true,"email is required"],
        match:[/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,"invalid email"]
    },
    password:{
        type:String,
        required:[true,"password is required"],
        minLength:[3,"password must be at least 3 characters long"]
    },
    role:{
      type:String,
      enum:["admin","user"],
      default:"user",
  },
},{timestamps:true})


  
  // bcryptjs
  
  userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
      return next();
    }
    try {
      const hashedPassword = await bcrypt.hash(this.password, 10);
      this.password = hashedPassword;
      next();
    } catch (error) {
      console.error('Error hashing the password', error);
    }
  });
  
  // jsonwebtoken
  userSchema.methods.generateToken = async function () {
    try {
      return jwt.sign({ _id: this._id }, process.env.JWT_SECRET_KEY, { expiresIn: "30d" });
    } catch (error) {
      console.error('Error generating token', error);
    }
  };
  
  // Method to compare passwords
  userSchema.methods.comparePassword = async function (password) {
    try {
      return bcrypt.compare(password, this.password);
    } catch (error) {
      throw error;
    }
  };
  
  module.exports = mongoose.model("user",userSchema);