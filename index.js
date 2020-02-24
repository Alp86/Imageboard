const express = require("express");
const app = express();
const { getImages } = require("./db");

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

app.get("/cities", (req, res) => {
    console.log("I am the GET route for /cities");
    const cities = [
        {
            name: "Berlin",
            country: "Germany"
        },
        {
            name: "Guayaquil",
            country: "Ecuador"
        },
        {
            name: "Kinross",
            country: "Scotland"
        }
    ];
    // we will be using res.json ALOT!!!
    res.json(cities);
});

app.listen(8080, () => console.log("server up and running.."));
