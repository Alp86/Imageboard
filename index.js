const express = require("express");
const app = express();
const {
    getImages, insertImage, deleteImage, getImage, getComments,
    insertComment, getMoreImages
} = require("./db");

const multer = require('multer');
const uidSafe = require('uid-safe');
const path = require('path');
const s3 = require("./s3");
const config = require("./config");

app.use(express.json());
exports.app = app;

const diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + '/uploads');
    },
    filename: function (req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});

// this serves all html/css/front end js requests!
app.use(express.static("public"));

app.get("/images", (req, res) => {
    console.log("GET request for /images received");
    getImages()
        .then(results => {
            console.log("GET /images results:", results);
            const images = results.rows;
            res.json(images);
        })
        .catch(err => {
            console.log("error in getImages:", err);
        });
});

app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    console.log("input:", req.body);
    console.log("file:", req.file);

    if (req.file) {
        const { username, title, description } = req.body;
        const filename = req.file.filename;
        const url = config.s3Url + filename;
        insertImage(url, username, title, description)
            .then(() => {
                console.log("image insertion successfull");
                res.json({
                    success: true,
                    url: url,
                    username: username,
                    title: title,
                    description: description
                });
            })
            .catch(error => {
                console.log("error in insertImage:", error);
            });
    } else {
        res.json({
            success: false
        });
    }
});

app.post("/data", (req, res) => {

    const imageId = req.body.id;
    console.log("imageId:", imageId);
    Promise.all([
        getImage(imageId),
        getComments(imageId)
    ])
        .then(results => {
            const image = results[0].rows[0];
            const comments = results[1].rows;
            res.json([image, comments]);
        })
        .catch(error => {
            console.log("error in Promise.all:", error);
        });
});

app.post("/comment", (req, res) => {
    // console.log(req.body);
    // res.sendStatus(200);
    const { comment, username, imageId } = req.body;
    insertComment(comment, username, imageId)
        .then(() => {
            console.log("insertComment successfull");

            res.json({
                comment: comment,
                username: username,
                imageId: imageId
            });
        })
        .catch(error => {
            console.log("error in insertComment:", error);
        });
});

app.post("/moreimages", (req, res) => {
    console.log("POST /moreimages request received");
    console.log(req.body);
    const { lastId } = req.body;

    getMoreImages(lastId)
        .then( ({ rows }) => {
            console.log("getMoreImages results:", rows);
            res.json(rows);
        })
        .catch(error => {
            console.log("error in getMoreImages:", error);
        });
});

app.post("/delete", s3.deleteImage, (req, res) => {

    const { imageId } = req.body;
    
    deleteImage(imageId)
        .then(() => {
            console.log("deleteImage psql successfull");
            res.json({
                imageId: imageId
            });
        })
        .catch(error => {
            console.log("error in deleteImage", error);
        });
});


app.listen(8080, () => console.log("server up and running.."));
