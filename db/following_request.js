const db = require('./config');

function toggleFollow(emailA, userB_id, callback) {
    db.any(`SELECT user_id FROM users WHERE email = $1`, [emailA])
    .then(userData => {
        const userA_id = userData[0].user_id;
        
        return db.any(
            `SELECT * FROM follows WHERE follower_id = $1 AND following_id = $2`,
            [userA_id, userB_id]
        ).then(existing => {
            if(existing.length > 0) {
                return db.any(
                    `DELETE FROM follows WHERE follower_id = $1 AND following_id = $2 RETURNING *`,
                    [userA_id, userB_id]
                );
            } else {
                return db.any(
                    `INSERT INTO follows (follower_id, following_id) VALUES ($1, $2) RETURNING *`,
                    [userA_id, userB_id]
                );
            }
        });
    })
    .then(data => callback(null, data))
    .catch(error => {
        callback(error, null);
        console.log('ERROR:', error);
    });
}

module.exports = {
    toggleFollow,
}