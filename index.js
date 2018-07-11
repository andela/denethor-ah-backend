import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import chalk from 'chalk';
import { createLogger, format, transports } from 'winston';
import session from './config/session';

import auth from './server/api/middlewares/authentication/authenticate';
import userRoute from './server/api/routes/user';

dotenv.config();

const logger = createLogger({
  level: 'debug',
  format: format.simple(),
  transports: [new transports.Console()]
});

const port = process.env.PORT || process.env.LOCAL_PORT;
// Create global app object
const app = express();

app.use(session);
app.use(cors());

// Normal express config defaults
app.use(require('morgan')('dev'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(`${__dirname}/public`));
app.use(auth.initialize());
app.use('/api/user', userRoute);

app.get('/', (req, res) => res.status(200).send({
  status: 'connection successful',
  message: 'Welcome to Author Haven!',
}));

app.listen(port, function serverListner() {
  logger.debug(`Server running on port ${chalk.blue(port)}`);
});

export default app;
