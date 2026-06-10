require('dotenv').config();
var express = require('express');
const cloudinary = require('cloudinary').v2;
const { createPost, getMyPost, deletePost } = require('../db/post_request');
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
})

router.get('/me-posts', function(req, res, next) { 
  const email = req.auth.email; 

  getMyPost(email, (err, posts) => {
    if(err) { return next(err); }
    if(!posts.length) { return res.json(posts); }

    res.json(posts);
  });
});

router.delete('/delete/:id/post', function(req, res, next) {
  const email = req.auth.email;
  const post_id = req.params.id;

  deletePost(email, post_id, (err, data) => {
    if(err) { 
      return next(err);
    }

    res.json(data);
  })
});



module.exports = router;