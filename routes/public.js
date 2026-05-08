var express = require('express');
const { getUserById } = require('../db/user_request');
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


module.exports = router;