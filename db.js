const spicedPg = require('spiced-pg');

const db = spicedPg(
    `postgres://postgres:postgres@localhost:5432/imageboard`
);

exports.getImages = () => {
    return db.query(
        `SELECT * FROM images
        ORDER BY created_at DESC`
    );
};

exports.insertImage = (url, username, title, description) => {
    return db.query(
        `
        INSERT INTO images (url, username, title, description)
        VALUES ($1, $2, $3, $4)
        `,
        [url, username, title, description]
    );
};

exports.deleteImage = (url) => {
    return db.query(
        `
        DELETE FROM images
        WHERE url = $1
        `,
        [url]
    );
};

exports.getImage = (imageId) => {
    return db.query(
        `
        SELECT * FROM images
        WHERE id = $1
        `,
        [imageId]
    );
};

exports.getComments = (imageId) => {
    return db.query(
        `
        SELECT * FROM comments
        WHERE image_id = $1
        `,
        [imageId]
    );
};

exports.insertComment = (comment, username, imageId) => {
    return db.query(
        `
        INSERT INTO comments (comment, username, image_id)
        VALUES ($1, $2, $3)
        `,
        [username, comment, imageId]
    );
};
