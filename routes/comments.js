var express = require('express');
const { createComment } = require('../db/comment_request');
var router = express.Router();

router.post('/:id/comments', function(req, res, next) {
    const email = req.auth.email;
    const post_id = req.params.id;
    const { comment } = req.body;

    createComment(email, post_id, comment, (err, data) => {
        if(err) { 
            console.log('ERROR', err);
            return next(err); 
        }
        res.json(data);
    });
});

module.exports = router;