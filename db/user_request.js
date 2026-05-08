const db = require('./config');

//Getting all users
function getUsers(callback) {
    db.any(`SELECT * FROM users`)
    .then(data => {
        callback(null, data);
    })
    .catch(error => {
        callback(error, null);
        console.log('ERROR:', error);
    });
}

//Get one account by id
function getUserById(user, callback){ 
    db.any(`SELECT * FROM users WHERE user_id = $1`, [user])
    .then(data => callback(null, data))
    .catch(error => { callback(error, null);
    });
}

//Creating user
function create(table, item, callback) {
    const keys = Object.keys(item);
    const properties = keys.join(', ');
    const placehorders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const values = keys.map(key => item[key]);

    db.any(`INSERT INTO ${table} (${properties}) VALUES(${placehorders}) returning *`, values)
    .then(data => {
        callback(null, data);
    })
    .catch(error => {
        callback(error, null);
        console.log('ERROR:', error);
    });
}
//Login user
function getAccount(email, callback) { 
    db.any(`SELECT * FROM users WHERE email = $1`, [email])
    .then(data => {
        callback(null, data);
    })
    .catch(error => {
        callback(error, null);
        console.log('ERROR:', error);
    });
}

//Edit profile for user
function editAccount(email, cols, callback) { 
    const keys = Object.keys(cols);
    const set = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const values = keys.map(key => cols[key]);

    db.any(`UPDATE users SET ${set} WHERE email = $${keys.length + 1} RETURNING *`,
    [...values, email])
    .then(data => callback(null, data))
    .catch(error => {
        console.log('ERROR: ', error); 
        callback(error, null);
    })
}

module.exports = {
    getUsers,
    getUserById,
    create,
    getAccount,
    editAccount
};