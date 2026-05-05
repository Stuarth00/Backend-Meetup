var express = require('express');
var bcrypt = require('bcrypt');
var router = express.Router();
var jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { create, getAccount } = require('../db/user_request');
const e = require('express');

/* POST create a new user. */
router.post('/signup',
  body('first_name').isString().notEmpty(),
  body('last_name').isString().notEmpty(),
  body('email').isEmail().notEmpty(),
  body('password').isString().notEmpty().isLength({ min: 6 }),
  function(req, res, next) {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    } 
    console.log(req.body);
    const newUser = req.body;
    bcrypt.hash(newUser.password, 12, (err, hash) => {
      if(err) { return next(err); }
      create('users', {...newUser, password: hash}, (err, user) => {
        if(err) { return next(err); }
        res.send(user);
      })
    })
});

router.post('/login', 
  body('email').isEmail().notEmpty(),
  body('password').isString().notEmpty(),
  function (req, res, next) { 
    const errors = validationResult(req); 
    if(!errors.isEmpty()) { return res.status(400).json({errors: errors.array() });}

    const login = req.body;
    
    getAccount( login.email, (err, [account]) => {
      if(err) { return next(err); }
      if(!account) { return res.sendStatus(404); }

      bcrypt.compare(login.password, account.password, (err, result) => {
        if(err) { return next(err); }
        if(!result) { return res.status(401).json({ message: 'Invalid credentials' }); }

        let token = jwt.sign({
          exp: Math.floor(Date.now() / 1000) + (60 * 60), 
          email: account.email
        }, process.env.JWT_SECRET);

        res.send({token});
      }); 
    });
  });

module.exports = router;