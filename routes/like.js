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
        res.json({ success: result.success,
            action: result.action,
            is_liked: result.is_liked,
            likesCount: result.likesCount
         });
        console.log('Like toggled successfully:', { success: result.success, likesCount: result.likesCount, is_liked: result.is_liked });
    });
});

router.get('/:id/likes', function(req, res, next){
    const post_id = req.params.id;

    getLikesList(post_id, (err, data) => {
        if(err) { 
            console.log('ERROR', err);
            return next(err); }
        res.json(data);
    });
});

module.exports = router; 