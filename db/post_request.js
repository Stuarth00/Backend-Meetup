const db = require('./config');

function createPost(email, item, callback) {
    db.any(`SELECT user_id FROM users WHERE email = $1`, [email])
    .then(userData => {
        const user_id = userData[0].user_id;
        const keys = Object.keys(item);
        const properties = ['author_id', ...keys].join(', ');
        const placeholders = ['$1', ...keys.map((_, i) => `$${i + 2}`)].join(', ');
        const values = [user_id, ...keys.map(key => item[key])];


        return db.any(
            `INSERT INTO posts (${properties}) VALUES(${placeholders}) RETURNING *`, 
            values
        );
    })
    .then(data => callback(null, data))
    .catch(error => {
        console.log('ERROR', error); 
        callback(error, null);
    });
}

module.exports = {
    createPost
}