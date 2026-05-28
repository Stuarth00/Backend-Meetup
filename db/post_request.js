const db = require('./config');

function createPost(email, description, mediaUrls, callback) {
    db.any(`SELECT user_id FROM users WHERE email = $1`, [email])
    .then(userData => {
        const user_id = userData[0].user_id;

        return db.any(`
            INSERT INTO posts (author_id, description) 
            VALUES ($1, $2) 
            RETURNING *
        `, [user_id, description]);
    })
    .then(postData => {
        const post_id = postData[0].post_id;

        const mediaInserts = mediaUrls.map(url => 
            db.any(`
                INSERT INTO post_media (post_id, content_url) 
                VALUES ($1, $2)
            `, [post_id, url])
        );
        return Promise.all(mediaInserts).then(() => postData);
    })
    .then(data => callback(null, data))
    .catch(error => {
        console.log('ERROR', error);
        callback(error, null);
    });
}

function getPost(email, callback) { 
    db.any(`SELECT user_id FROM users WHERE email = $1`, [email])
    .then(userData => {
        const user_id = userData[0].user_id;

        return db.any(`
            SELECT p.*, 
            JSON_AGG( JSON_BUILD_OBJECT(
                'media_id', pm.media_id,
                'content_url', pm.content_url
                )) 
            FILTER (WHERE pm.content_url IS NOT NULL) AS media
            FROM posts p
            LEFT JOIN post_media pm ON p.post_id = pm.post_id
            WHERE p.author_id = $1
            GROUP BY p.post_id
        `, [user_id]);
    })
    .then(data => callback(null, data))
    .catch(error => {
        callback(error, null);
    });
}

function getAllPosts( callback) { 
    db.any(`
    SELECT 
        p.post_id, 
        p.author_id, 
        u_author.first_name AS author_first_name, 
        u_author.last_name AS author_last_name,
        u_author.avatar AS author_avatar,
        p.description, 
        p.created_at,
        JSON_AGG(JSON_BUILD_OBJECT(
            'media_id', pm.media_id,
            'content_url', pm.content_url
        )) FILTER (WHERE pm.content_url IS NOT NULL) AS media,

         COALESCE(JSON_AGG(JSON_BUILD_OBJECT(
            'user_id', u_likes.user_id,
            'first_name', u_likes.first_name
        )) FILTER (WHERE u_likes.first_name IS NOT NULL), '[]'ç) AS likes,

        JSONB_AGG(DISTINCT JSONB_BUILD_OBJECT('username', u_comments.first_name, 'text', c.comment)) AS comments
    FROM posts p
    LEFT JOIN users u_author ON p.author_id = u_author.user_id 
    LEFT JOIN post_media pm ON p.post_id = pm.post_id
    LEFT JOIN likes l ON p.post_id = l.post_id
    LEFT JOIN users u_likes ON l.user_id = u_likes.user_id
    LEFT JOIN comments c ON p.post_id = c.post_id
    LEFT JOIN users u_comments ON c.user_id = u_comments.user_id
    GROUP BY p.post_id, u_author.first_name, u_author.last_name, u_author.avatar 
    ORDER BY p.created_at DESC
    `)
    .then(data => { callback(null, data); 
    })
    .catch(error => {
        callback(error, null);
        console.log('ERROR: ', error); 
    });
}

//Public getting posts by id
function getPostById(user, callback){ 
    db.any(`SELECT * FROM posts WHERE author_id = $1`, [user])
    .then(data => callback(null, data))
    .catch(error => { callback(error, null);
    });
}

module.exports = {
    createPost,
    getPost,
    getAllPosts,
    getPostById,
}