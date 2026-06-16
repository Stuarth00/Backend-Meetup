const { post } = require('../routes');
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

function updatePost(post_id, description, mediaUrls, callback) {
    db.any(`UPDATE posts SET description = $1 WHERE post_id = $2 RETURNING *`, [description, post_id])
    .then(postData => {
        return db.any(`DELETE FROM post_media WHERE post_id = $1`, [post_id])
            .then(() => postData);
    })
    .then(postData => {
        const mediaInserts = mediaUrls.map(url => 
            db.any(`INSERT INTO post_media (post_id, content_url) VALUES ($1, $2)`, [post_id, url])
        );
        return Promise.all(mediaInserts).then(() => postData);
    })
    .then(() => {
        return db.any(`
            SELECT 
                p.post_id, 
                p.author_id,
                u_author.first_name AS author_first_name,
                u_author.last_name AS author_last_name,
                u_author.avatar AS author_avatar,
                p.description,
                p.created_at,
                COALESCE(media.media, '[]') AS media,
                COALESCE(likes.likes, '[]') AS likes,
                COALESCE(comments.comments, '[]') AS comments
            FROM posts p
            LEFT JOIN users u_author ON p.author_id = u_author.user_id
            LEFT JOIN (
                SELECT post_id, JSON_AGG(JSON_BUILD_OBJECT(
                    'media_id', media_id,
                    'content_url', content_url
                )) AS media
                FROM post_media GROUP BY post_id
            ) media ON p.post_id = media.post_id
            LEFT JOIN (
                SELECT l.post_id, JSON_AGG(JSON_BUILD_OBJECT(
                    'user_id', u.user_id,
                    'first_name', u.first_name
                )) AS likes
                FROM likes l
                LEFT JOIN users u ON l.user_id = u.user_id
                GROUP BY l.post_id
            ) likes ON p.post_id = likes.post_id
            LEFT JOIN (
                SELECT c.post_id, JSONB_AGG(JSONB_BUILD_OBJECT(
                    'comment_id', c.comment_id,
                    'username', u.first_name,
                    'text', c.comment,
                    'avatar', u.avatar,
                    'created_at', c.created_at
                )) AS comments
                FROM comments c
                LEFT JOIN users u ON c.user_id = u.user_id
                GROUP BY c.post_id
            ) comments ON p.post_id = comments.post_id
            WHERE p.post_id = $1
        `, [post_id]);
    })
    .then(data => callback(null, data[0])) 
    .catch(error => {
        console.log('ERROR', error);
        callback(error, null);
    });
}

//Getting posts by user email
function getMyPost(email, callback) { 
    db.any(`SELECT user_id FROM users WHERE email = $1`, [email])
    .then(userData => {
        const user_id = userData[0].user_id;

        return db.any(`
            SELECT 
                p.post_id, 
                p.author_id, 
                u_author.first_name AS author_first_name, 
                u_author.last_name AS author_last_name,
                u_author.avatar AS author_avatar,
                p.description, 
                p.created_at,
                COALESCE(media.media, '[]') AS media,
                COALESCE(likes.likes, '[]') AS likes,
                COALESCE(comments.comments, '[]') AS comments

        FROM posts p
        LEFT JOIN users u_author ON p.author_id = u_author.user_id

        LEFT JOIN (
            SELECT post_id, JSON_AGG(JSON_BUILD_OBJECT(
                'media_id', media_id,
                'content_url', content_url
            )) AS media
            FROM post_media
            GROUP BY post_id
        ) media ON p.post_id = media.post_id

        LEFT JOIN (
            SELECT l.post_id, JSON_AGG(JSON_BUILD_OBJECT(
                'user_id', u.user_id,
                'first_name', u.first_name
            )) AS likes
            FROM likes l
            LEFT JOIN users u ON l.user_id = u.user_id
            GROUP BY l.post_id
        ) likes ON p.post_id = likes.post_id

        LEFT JOIN (
            SELECT c.post_id, JSONB_AGG(JSONB_BUILD_OBJECT(
                'comment_id', c.comment_id,
                'username', u.first_name,
                'user_id', u.user_id,
                'text', c.comment,
                'avatar', u.avatar,
                'created_at', c.created_at
            )) AS comments
             
            FROM comments c
            LEFT JOIN users u ON c.user_id = u.user_id
            GROUP BY c.post_id
        ) comments ON p.post_id = comments.post_id
         
        WHERE p.author_id = $1
        ORDER BY p.created_at DESC
        `, [user_id]);
    })
    .then(data => callback(null, data))
    .catch(error => {
        callback(error, null);
    });
}

//Getting posts by user ID
function getPostByUserId(user_id, callback) {
    db.any(`
            SELECT 
                p.post_id, 
                p.author_id, 
                u_author.first_name AS author_first_name, 
                u_author.last_name AS author_last_name,
                u_author.avatar AS author_avatar,
                p.description, 
                p.created_at,
                COALESCE(media.media, '[]') AS media,
                COALESCE(likes.likes, '[]') AS likes,
                COALESCE(comments.comments, '[]') AS comments

        FROM posts p
        LEFT JOIN users u_author ON p.author_id = u_author.user_id

        LEFT JOIN (
            SELECT post_id, JSON_AGG(JSON_BUILD_OBJECT(
                'media_id', media_id,
                'content_url', content_url
            )) AS media
            FROM post_media
            GROUP BY post_id
        ) media ON p.post_id = media.post_id

        LEFT JOIN (
            SELECT l.post_id, JSON_AGG(JSON_BUILD_OBJECT(
                'user_id', u.user_id,
                'first_name', u.first_name
            )) AS likes
            FROM likes l
            LEFT JOIN users u ON l.user_id = u.user_id
            GROUP BY l.post_id
        ) likes ON p.post_id = likes.post_id

        LEFT JOIN (
            SELECT c.post_id, JSONB_AGG(JSONB_BUILD_OBJECT(
                'comment_id', c.comment_id,
                'username', u.first_name,
                'user_id', u.user_id,
                'text', c.comment,
                'avatar', u.avatar,
                'created_at', c.created_at
            )) AS comments
             
            FROM comments c
            LEFT JOIN users u ON c.user_id = u.user_id
            GROUP BY c.post_id
        ) comments ON p.post_id = comments.post_id
         
        WHERE p.author_id = $1
        ORDER BY p.created_at DESC
    `, [user_id])
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
        COALESCE(media.media, '[]') AS media,
        COALESCE(likes.likes, '[]') AS likes,
        COALESCE(comments.comments, '[]') AS comments
    FROM posts p
    LEFT JOIN users u_author ON p.author_id = u_author.user_id

-- media 
    LEFT JOIN (
        SELECT post_id, JSON_AGG(JSON_BUILD_OBJECT(
            'media_id', media_id,
            'content_url', content_url
        )) AS media
    FROM post_media
    GROUP BY post_id
    ) media ON p.post_id = media.post_id

-- likes 
    LEFT JOIN (
        SELECT l.post_id, JSON_AGG(JSON_BUILD_OBJECT(
            'user_id', u.user_id,
            'first_name', u.first_name
        )) AS likes
        FROM likes l
    LEFT JOIN users u ON l.user_id = u.user_id
    GROUP BY l.post_id
) likes ON p.post_id = likes.post_id

-- comments 
    LEFT JOIN (
        SELECT c.post_id, JSONB_AGG(JSONB_BUILD_OBJECT(
            'comment_id', c.comment_id,
            'username', u.first_name,
            'user_id', u.user_id,
            'text', c.comment,
            'avatar', u.avatar,
            'created_at', c.created_at
        )) AS comments
        FROM comments c
    LEFT JOIN users u ON c.user_id = u.user_id
    GROUP BY c.post_id
    ) comments ON p.post_id = comments.post_id

    ORDER BY p.created_at DESC
    `)
    .then(data => { callback(null, data); 
    })
    .catch(error => {
        callback(error, null);
        console.log('ERROR: ', error); 
    });
}

//Public getting posts by post id
function getPostById(post_id, callback){ 
    db.any(`
        SELECT
            p.post_id,
            p.author_id,
            u_author.first_name AS author_first_name,
            u_author.last_name AS author_last_name,
            u_author.avatar AS author_avatar,
            p.description,
            p.created_at,
            COALESCE(media.media, '[]') AS media,
            COALESCE(likes.likes, '[]') AS likes,
            COALESCE(comments.comments, '[]') AS comments

        FROM posts p
        LEFT JOIN users u_author ON p.author_id = u_author.user_id

        -- media subquery
        LEFT JOIN (
            SELECT post_id, JSON_AGG(JSON_BUILD_OBJECT(
                'media_id', media_id,
                'content_url', content_url
            )) AS media
        FROM post_media
        GROUP BY post_id
        ) media ON p.post_id = media.post_id

        -- likes subquery
        LEFT JOIN (
            SELECT l.post_id, JSON_AGG(JSON_BUILD_OBJECT(
                'user_id', u.user_id,
              'first_name', u.first_name
            )) AS likes
         FROM likes l
        LEFT JOIN users u ON l.user_id = u.user_id
        GROUP BY l.post_id
        ) likes ON p.post_id = likes.post_id

        -- comments subquery
        LEFT JOIN (
            SELECT c.post_id, JSONB_AGG(JSONB_BUILD_OBJECT(
                'comment_id', c.comment_id,
                'username', u.first_name,
                'text', c.comment,
                'avatar', u.avatar,
                'created_at', c.created_at
            )) AS comments
            FROM comments c
        LEFT JOIN users u ON c.user_id = u.user_id
        GROUP BY c.post_id
        ) comments ON p.post_id = comments.post_id

    WHERE p.post_id = $1
        `, [post_id])
    .then(data => callback(null, data))
    .catch(error => { callback(error, null);
    });
}

function deletePost(email, post_id, callback) { 
    db.any(`
        DELETE FROM posts
        WHERE post_id = $1
        AND author_id = (
            SELECT user_id
            FROM users
            WHERE email = $2
        )
        `, [post_id, email])
    .then(data => callback(null, data))
    .catch(error => { 
        callback(error, null)
    });
}

module.exports = {
    createPost,
    updatePost,
    getMyPost,
    getAllPosts,
    getPostById,
    getPostByUserId,
    deletePost,
}