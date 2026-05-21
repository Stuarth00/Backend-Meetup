require('dotenv').config();
var express = require('express');
const cloudinary = require('cloudinary').v2;
const { createPost, getPost, getAllPosts } = require('../db/post_request');
var router = express.Router();

//Cloudinary configuration 
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/* GET users listing. */
router.post('/create-post', function(req, res, next) { 
  const email = req.auth.email;
  const { description, image_base64 } = req.body;

  cloudinary.uploader.upload(image_base64)
  .then(upload_result => {
    const post_data = {
      description, 
    };
  createPost(
    email,
    description,
    [upload_result.secure_url],
    (err, data) => {
    if (err) return next(err);
    res.json(data);
  });
  })
  .catch(err => next(err));
  // const allowFields = ['description'];
  // const newPost = Object.keys(req.body)
  //   .filter(key=> allowFields.includes(key))
  //   .reduce((obj, key) => {
  //     obj[key] = req.body[key];
  //     return obj;
  //   }, {} );
  //   console.log(newPost);
  // createPost(email, newPost, (err, email) => { 
  //   if(err) { return next(err); }
  //   res.send(email);
  // } )
})

router.get('/me-posts', function(req, res, next) { 
  const email = req.auth.email; 

  getPost(email, (err, posts) => {
    if(err) { return next(err); }
    if(!posts.length) { return res.json(posts); }

    res.json(posts);
  });
});

router.get('/all-posts', function(req, res, next) { 
  getAllPosts((err, posts) => {
    if(err) { return next(err); }
    if(!posts.length) { return res.sendStatus(404); }
    res.json(posts);
  });
});

module.exports = router;