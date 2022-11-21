var mongoose = require("mongoose")

const localURL = 'mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass%20Community&ssl=false'
const cloudURL = `mongodb+srv://quocthai200x:${process.env.DB_PASS}@cluster0.1orzimu.mongodb.net/?retryWrites=true&w=majority`

const db = {
    url :cloudURL,
    options : {
        useNewUrlParser :true
    }

};

mongoose.connect(db.url,db.options);


module.exports = mongoose;