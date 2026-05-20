var express = require('express');
const { getUserById, getFollowersList, getFollowingList } = require('../db/user_request');
const { getPostById } = require('../db/post_request');
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

router.get('/posts/:id', function(req, res, next) {
    const user_id = req.params.id;
    getPostById(user_id, (err, posts) => {
        if(err) { return next(err); }
        if(!posts.length) { return res.send(posts); }
        res.send(posts);
    })
})

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
})


module.exports = router;