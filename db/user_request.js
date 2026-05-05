const db = require('./config');

function getUsers(table, callback) {
    db.any(`SELECT * FROM ${table}`)
    .then(data => {
        callback(null, data);
    })
    .catch(error => {
        callback(error, null);
        console.log('ERROR:', error);
    });
}

function getOne(table, id, callback) { 
    db.any(`SELECT * FROM ${table} WHERE user_id = $1`, id)
    .then(data => {
        callback(null, data);
    })
    .catch(error => {
        callback(error, null);
        console.log('ERROR:', error);
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
function getAccount(user, callback) { 
    db.any(`SELECT * FROM users WHERE email = '${user}'`)
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
    getOne,
    create,
    getAccount,
    editAccount
};