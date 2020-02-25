const express = require("express");
const app = express();
const { getImages, insertImage } = require("./db");

const multer = require('multer');
const uidSafe = require('uid-safe');
const path = require('path');
const s3 = require("./s3");
const config = require("./config")

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
        .then(result => {
            console.log(result);
            const images = result.rows;
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
            .then(result => {
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
            })
    } else {
        res.json({
            success: false
        });
    }
});


app.listen(8080, () => console.log("server up and running.."));
