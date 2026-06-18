var express = require('express');
const { toggleLike, getLikesList } = require('../db/like_request');
var router = express.Router();

router.post('/:id/toggle-like', function(req, res, next){
    const email = req.auth.email;
    const post_id = req.params.id;

    toggleLike(email, post_id, (err, result) => {
        if(err) { 
            console.log('ERROR', err);
            return next(err); }
        res.json(result);
    });
});

// router.get('/:id/likes', function(req, res, next){
//     const post_id = req.params.id;

//     getLikesList(post_id, (err, data) => {
//         if(err) { 
//             return next(err); }
//         res.json(data);
//     });
// });

module.exports = router; 