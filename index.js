<<<<<<< HEAD
import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';
import chalk from 'chalk';
import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: 'debug',
  format: format.simple(),
  transports: [new transports.Console()]
});
=======
const fs = require("fs"),
    http = require("http"),
    path = require("path"),
    methods = require("methods"),
    express = require("express"),
    bodyParser = require("body-parser"),
    session = require("express-session"),
    cors = require("cors"),
    passport = require("passport"),
    errorhandler = require("errorhandler"),
    mongoose = require("mongoose");
    import dotenv from 'dotenv';

dotenv.config();
>>>>>>> chore:Setup express server and Babel

dotenv.config();

const port = process.env.PORT || process.env.LOCAL_PORT;
// Create global app object
const app = express();

app.use(cors());

// Normal express config defaults
app.use(require('morgan')('dev'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(require('method-override')());

app.use(express.static(`${__dirname}/public`));

app.use(
  session({
    secret: 'authorshaven',
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: false
  })
);

<<<<<<< HEAD
app.get('/', (req, res) => res.status(200).send({
  status: 'connection successful',
  message: 'Welcome to Author Haven!',
}));

app.listen(port, () => {
  logger.debug(`Server running on port ${chalk.blue(port)}`);
});

export default app;
=======
// if (!isProduction) {
//     app.use(errorhandler());
// }

// if (isProduction) {
//     mongoose.connect(process.env.MONGODB_URI);
// } else {
//     mongoose.connect("mongodb://localhost/conduit");
//     mongoose.set("debug", true);
// }


require("./models/User");

app.use(require("./routes"));

app.get('/', (req, res) => res.status(200).send({
    status: 'connection successful',
    message: 'Welcome to Author Haven!',
  }));
  
/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    console.log('yea');
    const err = new Error("Not Found");
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
// if (!isProduction) {
//     app.use(function(err, req, res, next) {
//         console.log(err.stack);

//         res.status(err.status || 500);

//         res.json({
//             errors: {
//                 message: err.message,
//                 error: err
//             }
//         });
//     });
// }

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    console.log('yeah naby');
    res.status(err.status || 500);
    res.json({
        errors: {
            message: err.message,
            error: {}
        }
    });
});

// finally, let's start our server...
const server = app.listen(process.env.PORT || 3000, function() {
    console.log("Listening on port " + server.address().port);
});
>>>>>>> chore:Setup express server and Babel
