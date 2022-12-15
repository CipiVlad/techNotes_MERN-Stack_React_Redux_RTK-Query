require('dotenv').config()
const cookieParser = require('cookie-parser')
const express = require('express')
const app = express()
const path = require('path')
const { logger, logEvents } = require('./middleware/logger')
const errorHanlder = require('./middleware/errorHandler')
const cors = require('cors')
const corsOptions = require('./config/corsOptions')
const connectDB = require('./config/dbConn')
const mongoose = require("mongoose");
mongoose.set('strictQuery', false);
const PORT = process.env.PORT || 3500

console.log(process.env.NODE_ENV);

connectDB()
///////////////////////////////////////////////////////
//? CUSTOM MIDDLEWARE
///////////////////////////////////////////////////////
app.use(logger)
app.use(cors(corsOptions))
/*--> type in google.com --> console : 

fetch('http://localhost:3500)
Response = Promise {<pending>} --> our API is now public
*/
///////////////////////////////////////////////////////
//? BUILD IN MIDDLEWARE
///////////////////////////////////////////////////////
//!recieve and parse json data
app.use(express.json())

///////////////////////////////////////////////////////
//? 3rd Party MIDDLEWARE
///////////////////////////////////////////////////////
app.use(cookieParser())


//! before cors() it was rejected with error: CORS Policy
//! where to grab '/'
app.use('/', express.static(path.join(__dirname, 'public')))

app.use('/', require('./routes/root'))
app.use('/auth', require('./routes/authRoutes'))
app.use('/users', require('./routes/userRoutes'))
app.use('/notes', require('./routes/notesRoutes'))

app.all('*', (req, res) => {
    res.status(404)
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, ('views/404.html')))
    } else if (req.accepts('json')) {
        res.json({ message: '404 Not Fond' })
    } else {
        res.type('txt').send('404 Not Found!')
    }
})

app.use(errorHanlder)

console.log('Connected to MongoDB')
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))



