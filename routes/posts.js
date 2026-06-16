require('dotenv').config();
var express = require('express');
const cloudinary = require('cloudinary').v2;
const { createPost, updatePost, getMyPost, deletePost } = require('../db/post_request');
var router = express.Router();

//Cloudinary configuration 
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

//Creating a post
router.post('/create-post', function(req, res, next) { 
  const email = req.auth.email;
  const { description, media } = req.body; 

  const uploadPromises = media.map(base64 => 
    cloudinary.uploader.upload(base64).then(result => result.secure_url)
  );

  Promise.all(uploadPromises)
  .then(mediaUrls => {
    createPost(email, description, mediaUrls, (err, data) => {
      if(err) return next(err);
      res.json(data);
    });
  })
  .catch(err => next(err));
});

//Editing a post
router.put('/:id/edit-post', function(req, res, next) {
  const post_id = req.params.id;
  const { description, media } = req.body; 

  const uploadPromises = media.map(item => {
    if(item.startsWith('data:image')) {
      return cloudinary.uploader.upload(item).then(result => result.secure_url);
    } else {
      return Promise.resolve(item);
    }
  });

  Promise.all(uploadPromises)
  .then(finalUrls => {
    updatePost(post_id, description, finalUrls, (err, data) => {
      if(err) { return next(err); }
      res.json(data);
    });
  })
  .catch(err => next(err));
});

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