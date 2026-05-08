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

function getPost(email, callback) { 
    db.any(`SELECT user_id FROM users WHERE email = $1`, [email])
    .then(userData => {
        const user_id = userData[0].user_id;

        return db.any(
            `SELECT * FROM posts WHERE author_id = $1`, [user_id]
        );
    })
    .then(data => callback(null, data))
    .catch(error => {
        callback(error, null);
        // console.log('ERROR: ', error);
    });
}

function getAllPosts( callback) { 
    db.any(`
        SELECT 
            p.post_id, 
            p.author_id, 
            u_author.first_name AS author_first_name, 
            u_author.last_name AS author_last_name,
            p.description, 
            p.created_at,
            ARRAY_AGG(DISTINCT pm.content_url) AS content_urls, 
            ARRAY_AGG(DISTINCT u_likes.first_name) AS likes,
            JSONB_AGG(DISTINCT JSONB_BUILD_OBJECT('username', u_comments.first_name, 'text', c.comment)) AS comments
        FROM posts p
        LEFT JOIN users u_author ON p.author_id = u_author.user_id 
        LEFT JOIN post_media pm ON p.post_id = pm.post_id
        LEFT JOIN likes l ON p.post_id = l.post_id
        LEFT JOIN users u_likes ON l.user_id = u_likes.user_id
        LEFT JOIN comments c ON p.post_id = c.post_id
        LEFT JOIN users u_comments ON c.user_id = u_comments.user_id
        GROUP BY p.post_id, u_author.first_name, u_author.last_name 
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