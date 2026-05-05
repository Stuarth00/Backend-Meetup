var express = require('express');
const { getAccount, getOne, editAccount } = require('../db/user_request');
var router = express.Router();

/* GET users listing. */
router.get('/me', function(req, res, next) {
  const email = req.auth.email;

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

  console.log('req.auth:', req.auth); // ← add this first
  console.log('req.body:', req.body);
  const allowedFields = ['first_name', 'last_name', 'about_me', 'location', 'avatar', 'gender', 'interests'];
  const updates = Object.keys(req.body)
    .filter(key => allowedFields.includes(key))
    .reduce((obj, key) => { 
      obj[key] =  req.body[key];
      return obj;
    }, {} );

  if(Object.keys(updates).length === 0) { 
    return res.status(400).json({ message: 'No valid fields to update' });
  }

  const email = req.auth.email; 
  console.log('email:', email);
console.log('updates:', updates);

  editAccount(email, updates, (err, user) => {
    console.log(err);
    if(err) { return next(err); }
    res.send(user);
  })
});

router.get('/:id', function (req, res, next) {
  const user_id = req.params.id;
  getOne('users', user_id, (err, user) => {
    if(err) { return next(err);}
    if(!user.length){ return res.sendStatus(404);}
    res.send(user);
  });
});

module.exports = router;
