const { text } = require('express');
const db = require('./config');

function createComment(email, post_id, comment, callback) { 
    let userIdRef;

    db.any(`
        SELECT user_id FROM users WHERE email = $1`, [email])
        .then(userData => {
            userIdRef = userData[0].user_id; 
            return db.any(`
            WITH inserted_comment AS (
                INSERT INTO comments (post_id, user_id, comment)
                VALUES ($1, $2, $3)
            RETURNING *
            )   
            SELECT
                ic.comment_id,
                ic.comment AS text,
                u.first_name AS username,
                u.user_id,
                u.avatar
            FROM inserted_comment ic
            JOIN users u
                ON ic.user_id = u.user_id;
            `, [post_id, userIdRef, comment]);
        })
        .then(data => callback(null, data[0]))
        .catch(error => {
            console.log('ERROR', error);
            callback(error, null);
        });
}

module.exports = { 
    createComment,
}