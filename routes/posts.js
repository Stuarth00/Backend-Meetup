var express = require('express');
const { createPost } = require('../db/post_request');
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

module.exports = router;