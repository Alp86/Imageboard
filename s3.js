const aws = require('aws-sdk');
const fs = require('fs');

let secrets;
if (process.env.NODE_ENV == 'production') {
    secrets = process.env; // in prod the secrets are environment variables
} else {
    secrets = require('./secrets'); // in dev they are in secrets.json which is listed in .gitignore
}

const s3 = new aws.S3({
    accessKeyId: secrets.AWS_KEY,
    secretAccessKey: secrets.AWS_SECRET
});

exports.upload = (req, res, next) => {

    if (!req.file) {
        console.log("no file :(");
        return res.sendStatus(500);
    }

    const {filename, mimetype, size, path} = req.file;

    const promise = s3.putObject({
        Bucket: "spicedling",
        ACL: 'public-read',
        Key: filename,
        Body: fs.createReadStream(path),
        ContentType: mimetype,
        ContentLength: size
    }).promise();

    promise
        .then(() => {
            console.log("image uploaded to amazon");
            next();
            fs.unlink(path, () => {});
        })
        .catch(err => {
            console.log("error in putObject of s3.js:", err);
            res.sendStatus(500);
        });
};

exports.deleteImageAWS = (req, res, next) => {

    const filename = req.body.url.split("https://s3.amazonaws.com/spicedling/")[1];
    console.log("filename:", filename);
    
    const promise = s3.deleteObject({
        Bucket: "spicedling",
        Key: filename
    }).promise();

    promise
        .then(() => {
            console.log("s3.deleteObject successfull");
            next();
        })
        .catch(error => {
            console.log("error in s3.deleteObject:", error);
            res.sendStatus(500);
        });
};
