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
    db.any(`
        SELECT u.*, 
        ARRAY_AGG(DISTINCT f.following_id) FILTER (WHERE f.following_id IS NOT NULL) AS following,
        ARRAY_AGG(DISTINCT f2.follower_id) FILTER (WHERE f2.follower_id IS NOT NULL) AS followers
        FROM users u
        LEFT JOIN follows f ON u.user_id = f.follower_id
        LEFT JOIN follows f2 ON u.user_id = f2.following_id
        WHERE u.user_id = $1
        GROUP BY u.user_id
        `, [user])
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
    db.any(`
        SELECT u.*, 
        ARRAY_AGG(DISTINCT f.following_id) FILTER (WHERE f.following_id IS NOT NULL) AS following,
        ARRAY_AGG(DISTINCT f2.follower_id) FILTER (WHERE f2.follower_id IS NOT NULL) AS followers
        FROM users u
        LEFT JOIN follows f ON u.user_id = f.follower_id
        LEFT JOIN follows f2 ON u.user_id = f2.following_id
        WHERE u.email = $1
        GROUP BY u.user_id
    `, [email])
    .then(data => callback(null, data))
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