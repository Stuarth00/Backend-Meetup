var express = require('express');
const { getUserById, getFollowersList, getFollowingList, getUsers } = require('../db/user_request');
const { getPostById, getAllPosts, getPostByUserId } = require('../db/post_request');
const { getLikesList } = require('../db/like_request');
var router = express.Router();

router.get('/users/:id', function(req, res, next) {
  const user_id = req.params.id;
  getUserById(user_id, (err, user) => {
    if(err) { return next(err); }
    if(!user.length) { console.log(err) 
      return res.sendStatus(404); }
    const [userData] = user;
    const { password, ...safeUser } = userData; 

    res.send(safeUser);
  })
});

//Get data from a post by post_id
router.get('/posts/:post_id', function(req, res, next) {
    const post_id = req.params.post_id;  
    
    getPostById(post_id, (err, post) => {
        if(err) { return next(err); }

        if(!post.length) { return res.json([]); }

        res.json(post[0])
        console.log(post[0]);
    })
})

//Get posts by user_id
router.get('/users/:id/posts', function(req, res, next) {
  const user_id = req.params.id;
  
  getPostByUserId(user_id, (err, posts) => {
    if(err) { return next(err); }
    if(!posts.length) { return res.json([]); }
    res.json(posts);
    console.log(posts);
  })
});

//Get list of follow
router.get('/:id/follows', function(req, res, next) {
  const user_id = req.params.id;
  const type = req.query.type; 


  if (type === 'followers') {
    getFollowersList(user_id, (err, followers) => {
      if (err) { return next(err); }
      return res.json(followers); 
    });
  } else if (type === 'following') {
    getFollowingList(user_id, (err, following) => {
      if (err) { return next(err); }
      return res.json(following); 
    });
   } else {

    return res.status(400).send("Invalid or missing type query parameter");
  }
});

//Get list of all userse
router.get('/get-all-users', function (req, res, next) {
  getUsers( (err, user) => {
    if(err) { return next(err);}
    if(!user.length){ return res.json(user);}
    res.send(user);
  });
});


//Get all psots for HomeFeed
router.get('/all-posts', function(req, res, next) { 
  getAllPosts((err, posts) => {
    if(err) { return next(err); }
    if(!posts.length) { return res.sendStatus(404); }
    res.json(posts);
  });
});

//Get list of likes for a post
router.get('/:id/likes', function(req, res, next){
    const post_id = req.params.id;

    getLikesList(post_id, (err, data) => {
        if(err) { 
            return next(err); }
        res.json(data);
    });
});

module.exports = router;