require('dotenv').config()


const express = require('express')
const app = express()
const path = require('path');
const port = 3000
const mongoose = require('mongoose')
const User = require('./APP/model/user-config')


// Connecting Mongo-DB 
const connection = mongoose
.connect(
    `${process.env.MONGO_DB_URI}`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
    )
    .then(() => console.log("Connected to MongoDB"))
    .catch(error => console.log(error));
// Mongoose Ends
// console.log(connection,"hiiii")



app.use(express.json());                            // for json 
app.use(express.urlencoded({ extended: true }));    // x-www-form-urlencoded header requests    

// Seting View Engine
app.set('views', path.join(__dirname, '/APP/views/'))
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))

module.exports = {
  app:app,

}

// importing routes
const routes = require('./APP/routes/index')
const Post = require('./APP/routes/post')


// setting routes
app.use('/',routes)
app.use('/post',Post)


app.listen(process.env.PORT, () => console.log(`Blog app listening on port port! ${process.env.PORT}`))

