var express = require('express');
const { createPost, getPost, getAllPosts } = require('../db/post_request');
var router = express.Router();

/* GET users listing. */
router.post('/create-post', function(req, res, next) { 
  const email = req.auth.email;
  const allowFields = ['description'];
  const newPost = Object.keys(req.body)
    .filter(key=> allowFields.includes(key))
    .reduce((obj, key) => {
      obj[key] = req.body[key];
      return obj;
    }, {} );
    console.log(newPost);
  createPost(email, newPost, (err, email) => { 
    if(err) { return next(err); }
    res.send(email);
  } )
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