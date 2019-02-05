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

app.get('/', (req, res) => res.status(200).send({
  status: 'connection successful',
  message: 'Welcome to Author Haven!',
}));

app.listen(port, () => {
  logger.debug(`Server running on port ${chalk.blue(port)}`);
});

export default app;
