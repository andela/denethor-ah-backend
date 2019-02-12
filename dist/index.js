"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _cors = _interopRequireDefault(require("cors"));

var _dotenv = _interopRequireDefault(require("dotenv"));

var _chalk = _interopRequireDefault(require("chalk"));

var _winston = require("winston");

var _session = _interopRequireDefault(require("./server/config/session"));

var _authenticate = _interopRequireDefault(require("./server/api/middlewares/authentication/authenticate"));

var _user = _interopRequireDefault(require("./server/api/routes/user"));

var _article = _interopRequireDefault(require("./server/api/routes/article"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_dotenv.default.config();

const logger = (0, _winston.createLogger)({
  level: 'debug',
  format: _winston.format.simple(),
  transports: [new _winston.transports.Console()]
});
const port = process.env.PORT || process.env.LOCAL_PORT; // Create global app object

const app = (0, _express.default)();
app.use((0, _cors.default)()); // Normal express config defaults

app.use(require('morgan')('dev'));
app.use(_express.default.urlencoded({
  extended: true
}));
app.use(_express.default.json());
(0, _session.default)(app);
app.use(_express.default.static(`${__dirname}/public`));
app.use(_authenticate.default.initialize());
app.use('/api/users', _user.default);
app.use('/api/articles', _article.default);
app.get('/', (req, res) => res.status(200).send({
  status: 'connection successful',
  message: 'Welcome to Author Haven!'
}));
app.get('*', (req, res) => res.status(200).send({
  status: 'fail',
  message: 'Route not found'
}));
app.listen(5000, function serverListner() {
  logger.debug(`Server running on port ${_chalk.default.blue(port)}`);
});
var _default = app;
exports.default = _default;