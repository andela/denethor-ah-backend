import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

// const PORT = process.env.PORT || process.env.LOCAL_PORT;
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
// app.use(require('./routes'));

app.get('/', (req, res) => res.status(200).send({
  status: 'connection successful',
  message: 'Welcome to Author Haven!',
}));

app.use('*', (req, res) => res.status(404).send({
  status: 'error',
  error: '404',
  message: 'Route does not exist.',
}));

// finally, let's start our server...
// app.listen(PORT, () => {
//   console.log(`server running on port ${PORT}`);
// });
app.listen(process.env.PORT || 3000);
