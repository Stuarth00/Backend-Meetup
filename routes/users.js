require('dotenv').config();
var express = require('express');
const cloudinary = require('cloudinary').v2;
const { getAccount, editAccount, deleteUser } = require('../db/user_request');
var router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/* GET users listing. */
router.get('/me', function(req, res, next) {
  const email = req.auth.email;
    console.log('REQ.AUTH:', req.auth);
  getAccount(email, (err, [account]) => {
    if(err) { return next(err); }
    if(!account) { return res.sendStatus(404); }

    const { password, ...safeUser } = account; 
    res.json(safeUser)
  });
});

//.PUT edit profile
router.put('/edit', function(req, res, next) { 
  if(!req.auth) { return res.sendStatus(401); }

  const allowedFields = ['first_name', 'last_name', 'about_me', 'location', 'avatar', 'genre', 'interests'];
  
  const processUpdate = () => {
    const updates = Object.keys(req.body)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => { 
        obj[key] = req.body[key];
        return obj;
      }, {});

    if(Object.keys(updates).length === 0) { 
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    const email = req.auth.email;
    editAccount(email, updates, (err, user) => {
      if(err) { return next(err); }
      res.send(user);
    });
  };

  if(req.body.avatar) {
    cloudinary.uploader.upload(req.body.avatar)
    .then(upload_result => {
      req.body.avatar = upload_result.secure_url; 
      processUpdate();
    })
    .catch(err => next(err));
  } else {
    processUpdate();
  }
});

router.delete('/delete/me', function(req, res, next) {
  const email = req.auth.email;

  deleteUser(email, (err, data) => {
    if(err) { return next(err); }

    res.json(data);
  })
});

module.exports = router;
