const db = require('./config');

function createComment(email, post_id, comment, callback) { 
    let userIdRef;

    db.any(`
        SELECT user_id FROM users WHERE email = $1`, [email])
        .then(userData => {
            userIdRef = userData[0].user_id; 
            return db.any(`
                INSERT INTO comments (post_id, user_id, comment) 
                VALUES ($1, $2, $3) 
                RETURNING *
            `, [post_id, userIdRef, comment]);
        })
        .then(data => callback(null, data))
        .catch(error => {
            console.log('ERROR', error);
            callback(error, null);
        });
}

module.exports = { 
    createComment,
}