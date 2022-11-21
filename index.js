require('dotenv').config()

var express = require("express")
var bodyParser = require('body-parser')
var cors = require("cors")

var app = express();

var morgan = require("morgan")
var router = require("./application/router")
var path = require("path")
const port = process.env.port || 5000;

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors({
    origin: ["http://localhost:3000", "https://project-ii-front.netlify.app"],
    credentials: true
}
))

app.use(morgan("dev"))
require("./config/passport")
app.use(router)


// app.use(express.static("static"));
app.use("/static", express.static(path.join(__dirname + '/static')));

app.listen(port, () => console.log(`app is running at ${port}`))