const mongoose = require('mongoose');

//Define thr mongoDb connection URl
const mongoURL = 'mongodb://localhost:27017/Election'

//Set up mongoDB connection
mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;


//Event listner for databse connection
db.on('connected', () => {
    console.log("Connected to mongoDB server");
});

db.on('error', (err) => {
    console.log(" mongoDB connection error", err);
});

db.on('disconnected', () => {
    console.log("Disconnected to mongoDB server");
});

//Export the database connection
module.exports = db;