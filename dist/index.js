"use strict";

var _express = _interopRequireDefault(require("express"));

var _dotenv = _interopRequireDefault(require("dotenv"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _cookieParser = _interopRequireDefault(require("cookie-parser"));

var _fs = _interopRequireDefault(require("fs"));

var _socket = _interopRequireDefault(require("socket.io"));

var _http = _interopRequireDefault(require("http"));

var _request = _interopRequireDefault(require("request"));

var _twitchJs = _interopRequireDefault(require("twitch-js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-unused-vars */
_dotenv.default.config();

const myApiKey = 'AIzaSyARsNN4cTNsHicQ8JpZGTAuJP877w4YY7g';
const app = (0, _express.default)();
app.use((0, _cookieParser.default)());
app.use(_bodyParser.default.json());
app.use(_express.default.static('web/'));

const server = _http.default.createServer(app);

const io = (0, _socket.default)(server);
app.get('/', function (req, res) {
  res.sendFile('index.htm', {
    root: 'web/'
  });
});
app.post('/login', function (req, res) {
  let name = req.body.username;
  let pass = req.body.password;

  if (name == process.env.LOGIN && pass == process.env.PASSWORD) {
    let cookie_name = make_cookie(15);

    _fs.default.writeFileSync('place.txt', cookie_name);

    setTimeout(clear_place, 3600000);
    res.cookie('Rchiem', cookie_name, {
      maxAge: 3600000
    });
    res.status(200).send('true');
  } else {
    res.status(404).send('false');
  }
});
app.get('/user', function (req, res) {
  let cookie = _fs.default.readFileSync('place.txt', 'utf8');

  if (req.cookies['Rchiem'] == cookie) {
    res.sendFile('roll.htm', {
      root: 'web/html'
    });
    let connections = [];
    io.once('connection', function (socket) {
      connections.push(socket);
      console.log('connected');
      socket.on('disconnect', function (socket) {
        connections.splice(connections.indexOf(socket), 1);
        console.log('disconnected');
      });
    });
  } else {
    res.status(404).send('Перезайдите пожалуйста');
  }
});
app.post('/src', function (req, res) {
  let src = req.body.srccc;

  _fs.default.writeFileSync('src.txt', src);

  res.status(200);
});
app.post('/key', function (req, res) {
  let key = req.body.keyyy;

  _fs.default.writeFileSync('key.txt', key);

  res.status(200);
});
const options = {
  connection: {
    cluster: 'aws',
    reconnect: true
  },
  identity: {
    username: 'bot_rchiem',
    password: 'oauth:3ydg9ojjthbb135lgpurekwdr8wu9f'
  },
  channels: ['dota2mc_ru']
};
const client = new _twitchJs.default.client(options);
let fsWait = false;
let flag = 0;

_fs.default.watch('signal.txt', function (event, filename) {
  if (filename) {
    if (fsWait) return;
    fsWait = setTimeout(() => {
      fsWait = false;
    }, 100);

    const main = function () {
      let src = _fs.default.readFileSync('src.txt', 'utf8');

      getLiveChatId(src, function (liveChatId) {
        console.log('liveChatId = ' + liveChatId);

        if (liveChatId) {
          requestChatMessages('', liveChatId);
        }
      });
    };

    const chatMessageUrl = 'https://www.googleapis.com/youtube/v3/liveChat/messages';

    const requestChatMessages = function (nextPageToken, liveChatId) {
      const requestProperties = {
        liveChatId: liveChatId,
        part: 'snippet, id, authorDetails',
        key: myApiKey,
        maxResults: 200,
        pageToken: nextPageToken
      };
      (0, _request.default)({
        url: chatMessageUrl,
        qs: requestProperties
      }, function (error, response, body) {
        body = JSON.parse(body);

        if (body.items) {
          if (flag != 0) {
            for (body.items.item of body.items) {
              if (_fs.default.readFileSync('listen.txt', 'utf8') != 0) {
                if (_fs.default.readFileSync('listen.txt', 'utf8') == body.items.item.authorDetails.displayName) {
                  io.sockets.emit('send mess', {
                    msg: body.items.item.snippet.displayMessage,
                    name: body.items.item.authorDetails.displayName
                  });
                }
              } else {
                io.sockets.emit('send mess', {
                  msg: body.items.item.snippet.displayMessage,
                  name: body.items.item.authorDetails.displayName
                });

                if (body.items.item.snippet.displayMessage == _fs.default.readFileSync('key.txt', 'utf8')) {
                  io.sockets.emit('add user', {
                    name: body.items.item.authorDetails.displayName
                  });
                }
              }
            }
          }
        }

        flag = 1;
        setTimeout(function () {
          if (_fs.default.readFileSync('signal.txt', 'utf8') == 0) {
            console.log('stop');
            flag = 0;
            return;
          }

          requestChatMessages(body.nextPageToken, liveChatId);
        }, body.pollingIntervalMillis);
      });
    };

    const getLiveChatId = function (videoId, callback) {
      const url = 'https://www.googleapis.com/youtube/v3/videos?id=' + videoId + '&key=' + myApiKey + '&part=liveStreamingDetails,snippet';
      (0, _request.default)(url, function (error, response, body) {
        const bodyObj = JSON.parse(body);
        callback(bodyObj.items[0].liveStreamingDetails.activeLiveChatId);
      });
    };

    if (_fs.default.readFileSync('signal.txt', 'utf8') == 1) {
      main();
    }

    if (_fs.default.readFileSync('signal.txt', 'utf8') == 0) {
      client.disconnect();
    }

    if (_fs.default.readFileSync('signal.txt', 'utf8') == 1) {
      client.connect();
    }
  }
});

client.on('chat', function (channel, user, message, self) {
  if (_fs.default.readFileSync('listen.txt', 'utf8') != 0) {
    if (user['display-name'] == _fs.default.readFileSync('listen.txt', 'utf8')) {
      io.sockets.emit('send mess', {
        msg: message,
        name: user['display-name']
      });
    }
  } else {
    io.sockets.emit('send mess', {
      msg: message,
      name: user['display-name']
    });

    if (message == _fs.default.readFileSync('key.txt', 'utf8')) {
      io.sockets.emit('add user', {
        name: user['display-name']
      });
    }
  }
});
app.post('/start', function (req, res) {
  let signal = req.body.sign;

  _fs.default.writeFileSync('signal.txt', signal);

  _fs.default.writeFileSync('listen.txt', 0);

  res.status(200);
});
app.post('/choose', function (req, res) {
  let winer = req.body.win;

  _fs.default.writeFileSync('listen.txt', winer);

  res.status(200);
});
app.post('/stop', function (req, res) {
  let signal = req.body.sign;

  _fs.default.writeFileSync('signal.txt', signal);

  _fs.default.writeFileSync('listen.txt', 0);

  res.status(200);
});

function make_cookie(length) {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  let i;

  for (i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

function clear_place() {
  let fs = require('fs');

  fs.writeFileSync('place.txt', '');
}

server.listen(3000);
console.log('Сервер стартовал!');
//# sourceMappingURL=index.js.map