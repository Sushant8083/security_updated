const express = require('express');
const router= express.Router();
const userModel = require("./users");
const serviceModel = require("./service");
const contactModel = require("./contact");

require('dotenv').config();
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
require('dotenv').config({path:"./.env"})



cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

router.get('/', async function (req, res, next) {
  var service = await serviceModel.find({});
  res.render('index', {service});
});


router.get('/dashboard',isLoggedIn, async function(req,res,next){
  var contact = await contactModel.find({})
  res.render("dashboard", {contact})
});



router.post('/contactform' ,async (req, res) => {
  const newcontact = new contactModel({
    cName: req.body.cname,
    cEmail: req.body.cemail,
    subject: req.body.csubject,
    message: req.body.cmessage
  });

  await newcontact.save();
  req.flash('success', 'form submitted successfully');
  res.redirect('/');
});

router.post('/createservice', isLoggedIn,async (req, res) => {
    const service = req.files.sImage;
    cloudinary.uploader.upload(service.tempFilePath, async function (err, result) {
      if (err) return next(err);
      const newService = new serviceModel({
        seviceName: req.body.serName,
        serviceImage: result.secure_url,
      });
      await newService.save();
      req.flash('success', 'Service created successfully');
      res.redirect('/dashboard');
    })
});
router.get('/createservice', isLoggedIn,(req, res) => {
  res.render('createservice');
});

router.get('/manageservice', isLoggedIn, async function (req, res, next) {
  try {
    const service = await serviceModel.find({});

    // Pass flash messages to the template
    const successMessage = req.flash('success');
    const errorMessage = req.flash('error');

    res.render('manageservice', { service, successMessage, errorMessage });
  } catch (error) {
    console.error("Error fetching course:", error);
    req.flash('error', 'Failed to fetch course data');
    res.redirect('/dashboard'); // Redirect to a suitable page in case of error
  }
});

router.get('/editservice/:id', isLoggedIn, async function (req, res, next) {
  const service= await serviceModel.findById(req.params.id);
  res.render('editservice', { service });
});

router.post('/editservice/:id', isLoggedIn, async function (req, res, next) {
  try {
    const service = await serviceModel.findByIdAndUpdate(req.params.id, {
      seviceName: req.body.serName,
    }, { new: true });
    await service.save();

    // Set flash message
    req.flash('success', 'Service details updated successfully');

    res.redirect('/manageservice');
  } catch (error) {
    // Handle error appropriately
    console.error("Error updating service:", error);
    req.flash('error', 'Failed to update service details');
    res.redirect('/manageservice');
  }
});

router.get('/deleteservice/:id', isLoggedIn, async function (req, res, next) {
  try {
    const service = await serviceModel.findById(req.params.id);

    // Delete the image from Cloudinary
    const imageURL = service.serviceImage;
    const publicID = imageURL.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(publicID);

    // Delete the course from the database
    await serviceModel.findByIdAndDelete(req.params.id);

    // Set flash message
    req.flash('success', 'service deleted successfully');

    res.redirect('/manageservice');
} catch (error) {
    console.error("Error deleting course:", error);
    req.flash('error', 'Failed to delete service');
    res.redirect('/manageservice');
}
});

// auth routes 
router.get('/login', async function (req, res, next) {
  try {
    res.render('login', {error: req.flash('error') });
  } catch (error) {
    console.error('Error occurred while fetching data:', error);
    next(error);
  }
});

router.post('/login', async function (req, res, next) {
  try {
    const { email, password } = req.body;
    const userExist = await userModel.findOne({ email });
    if (!userExist) {
      req.flash('error', 'Invalid credentials');
      return res.redirect('/login');
    }

    const user = await userExist.comparePassword(password);

    if (user) {
        // Check if the user's role is 'admin'
        if (userExist.role === 'admin') {
          const token = await userExist.generateToken();
          res.cookie('token', token, { httpOnly: true }); // Set token as a cookie
          res.redirect('/dashboard');
        } else {
          // If the user's role is not 'admin', redirect to the '/' page
          res.redirect('/');
        }
    } else {
      req.flash('error', 'Invalid credentials');
      return res.redirect('/login');
    }
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while login' });
  };

});
  
router.get('/register', function (req, res, next) {
  res.render('register', { error: req.flash('error') });
});
  
router.post('/register',async function(req,res,next){
    try{
      if ( !req.body.username || !req.body.email || !req.body.password) {
        req.flash('error', 'All fields are required');
        return res.redirect('/login');
      }

      const { username,password, email } = req.body;
      const existingUserEmail = await userModel.findOne({ email });
      if (existingUserEmail) {
        req.flash('error', 'This Email already exists');
        return res.redirect('/register');
      }
      const data = await userModel.create({ username,email, password })
      const token = await data.generateToken();
      res.cookie('token', token, { httpOnly: true }); // Set token as a cookie
      res.redirect('/dashboard'); // Redirect to / page
    }
    catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while registering the user' });
    };
  
  });

  router.get('/logout', (req, res) => {
    try {
      res.clearCookie('token');
      res.redirect('/login');
    } catch (err) {
      console.error("Error during logout:", err);
      res.status(500).send('Internal Server Error');
    }
  });
  
  
  function isLoggedIn(req, res, next) {
    const token = req.cookies.token;
  
    if (token == null) return res.redirect('/login');
  
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, user) => {
      if (err) {
        return res.redirect('/login');
      }
      const userRole = await userModel.findById(user._id);
      if (userRole.role != 'admin') {
        return res.redirect('/login');
    } else {
      req.user = user;
      next();
    }
    });
  }


module.exports = router;
