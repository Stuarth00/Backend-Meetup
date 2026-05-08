var express = require('express');
const { toggleFollow } = require('../db/following_request');
var router = express.Router();

router.post('/:id/toggle-follow', function(req, res, next){
    const emailA = req.auth.email;
    const userB_id = req.params.id;

    toggleFollow(emailA, userB_id, (err, result) => {
        if(err) { return next(err); }
        res.json(result);
    });
});

module.exports = router;