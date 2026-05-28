const db = require('./config');

function toggleLike(email, post_id, callback) {
    let userIdRef;
    let is_liked; 

    db.any(`SELECT user_id FROM users WHERE email = $1`, [email])
    .then(userData => {
        userIdRef = userData[0].user_id;

        return db.any(`SELECT * FROM likes WHERE user_id = $1 AND post_id = $2`, [userIdRef, post_id]);
    })
    .then(likeData => {
        is_liked = likeData.length > 0;
        if (is_liked) {
            return db.any(`DELETE FROM likes WHERE user_id = $1 AND post_id = $2`, [userIdRef, likeData[0].post_id]);
        } else {
            return db.any(`INSERT INTO likes (user_id, post_id) VALUES ($1, $2)`, [userIdRef, post_id]);
        }
    })
    .then(() => {
        return db.any(`SELECT COUNT(*) FROM likes WHERE post_id = $1`, [post_id]);
    })
    .then(countData => { 
        const totalLikes = parseInt(countData[0].count, 10);

        callback(null, {
            success: true, 
            action: is_liked ? 'unliked' : 'liked', 
            is_liked: !is_liked, 
            likesCount: totalLikes
        })
    })
    .catch(error => {
        console.log('ERROR', error);
        callback(error, null);
    });
}

function getLikesList(post_id, callback) {
    db.any(`
        SELECT u.first_name, u.last_name, u.avatar, u.user_id
        FROM likes l 
        JOIN users u ON l.user_id = u.user_id WHERE l.post_id = $1`, [post_id])
    .then(data => callback(null, data))
    .catch(error => {
        console.log('ERROR', error);
        callback(error, null);
    });
}

module.exports = {
    toggleLike,
    getLikesList
}