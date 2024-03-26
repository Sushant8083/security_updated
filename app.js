require('dotenv').config({path:"./.env"})
const express = require('express');
const path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const expressSession = require('express-session');
const flash = require('connect-flash');
// require('./models/adminModel').connectDB();
const indexRouter = require('./routes/index.js');
const usersRouter = require('./routes/users.js');
const fileUpload = require('express-fileupload');


const app = express()

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(fileUpload({
  useTempFiles: true
}))

app.use(flash());
app.use(expressSession({
  resave:false,
  saveUninitialized:false,
  secret: process.env.EXPRESS_SESSION_SECRET
}));


//logger
app.use(logger('dev'));
// body parser
app.use(express.json())
app.use(cookieParser());

app.use(express.urlencoded({extended:true}));


app.use('/',indexRouter);
app.all("*",function(req,res,next){
    res.status(404).json({success:false,message:`${req.url} route not found`});
})


app.listen(process.env.PORT,()=>{
    console.log( `Server running on PORT ${process.env.PORT}`);
})