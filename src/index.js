/* eslint-disable no-unused-vars */
import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import io_r from 'socket.io';
import http from 'http';
import request from 'request';
import twitch from 'twitch-js';

dotenv.config();

const myApiKey = 'AIzaSyARsNN4cTNsHicQ8JpZGTAuJP877w4YY7g';

const app = express();
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.static('web/'));

const server = http.createServer(app);
const io = io_r(server);
app.get('/', function(req, res) {
    res.sendFile('index.htm', { root: 'web/' });
});

app.post('/login', function(req, res) {
    let name = req.body.username;
    let pass = req.body.password;
    if (name == process.env.LOGIN && pass == process.env.PASSWORD) {
        let cookie_name = make_cookie(15);
        fs.writeFileSync('place.txt', cookie_name);
        setTimeout(clear_place, 3600000);
        res.cookie('Rchiem', cookie_name, {
            maxAge: 3600000,
        });
        res.status(200).send('true');
    } else {
        res.status(404).send('false');
    }
});
app.get('/user', function(req, res) {
    let cookie = fs.readFileSync('place.txt', 'utf8');
    if (req.cookies['Rchiem'] == cookie) {
        res.sendFile('roll.htm', { root: 'web/html' });
        let connections = [];
        io.once('connection', function(socket) {
            connections.push(socket);
            console.log('connected');
            socket.on('disconnect', function(socket) {
                connections.splice(connections.indexOf(socket), 1);
                console.log('disconnected');
            });
        });
    } else {
        res.status(404).send('Перезайдите пожалуйста');
    }
});

app.post('/src', function(req, res) {
    let src = req.body.srccc;
    fs.writeFileSync('src.txt', src);
    res.status(200);
});

app.post('/key', function(req, res) {
    let key = req.body.keyyy;
    fs.writeFileSync('key.txt', key);
    res.status(200);
});

const options = {
    connection: {
        cluster: 'aws',
        reconnect: true,
    },
    identity: {
        username: 'bot_rchiem',
        password: 'oauth:3ydg9ojjthbb135lgpurekwdr8wu9f',
    },
    channels: ['dota2mc_ru'],
};
const client = new twitch.client(options);
let fsWait = false;
let flag = 0;
fs.watch('signal.txt', function(event, filename) {
    if (filename) {
        if (fsWait) return;
        fsWait = setTimeout(() => {
            fsWait = false;
        }, 100);
        const main = function() {
            let src = fs.readFileSync('src.txt', 'utf8');
            getLiveChatId(src, function(liveChatId) {
                console.log('liveChatId = ' + liveChatId);
                if (liveChatId) {
                    requestChatMessages('', liveChatId);
                }
            });
        };
        const chatMessageUrl =
            'https://www.googleapis.com/youtube/v3/liveChat/messages';

        const requestChatMessages = function(nextPageToken, liveChatId) {
            const requestProperties = {
                liveChatId: liveChatId,
                part: 'snippet, id, authorDetails',
                key: myApiKey,
                maxResults: 200,
                pageToken: nextPageToken,
            };
            request({ url: chatMessageUrl, qs: requestProperties }, function(
                error,
                response,
                body
            ) {
                body = JSON.parse(body);
                if (body.items) {
                    if (flag != 0) {
                        for (body.items.item of body.items) {
                            if (fs.readFileSync('listen.txt', 'utf8') != 0) {
                                if (
                                    fs.readFileSync('listen.txt', 'utf8') ==
                                    body.items.item.authorDetails.displayName
                                ) {
                                    io.sockets.emit('send mess', {
                                        msg: body.items.item.snippet.displayMessage,
                                        name: body.items.item.authorDetails.displayName,
                                    });
                                }
                            } else {
                                io.sockets.emit('send mess', {
                                    msg: body.items.item.snippet.displayMessage,
                                    name: body.items.item.authorDetails.displayName,
                                });
                                if (
                                    body.items.item.snippet.displayMessage ==
                                    fs.readFileSync('key.txt', 'utf8')
                                ) {
                                    io.sockets.emit('add user', {
                                        name: body.items.item.authorDetails.displayName,
                                    });
                                }
                            }
                        }
                    }
                }
                flag = 1;
                setTimeout(function() {
                    if (fs.readFileSync('signal.txt', 'utf8') == 0) {
                        console.log('stop');
                        flag = 0;
                        return;
                    }
                    requestChatMessages(body.nextPageToken, liveChatId);
                }, body.pollingIntervalMillis);
            });
        };
        const getLiveChatId = function(videoId, callback) {
            const url =
                'https://www.googleapis.com/youtube/v3/videos?id=' +
                videoId +
                '&key=' +
                myApiKey +
                '&part=liveStreamingDetails,snippet';

            request(url, function(error, response, body) {
                const bodyObj = JSON.parse(body);
                callback(bodyObj.items[0].liveStreamingDetails.activeLiveChatId);
            });
        };
        if (fs.readFileSync('signal.txt', 'utf8') == 1) {
            main();
        }
        if (fs.readFileSync('signal.txt', 'utf8') == 0) {
            client.disconnect();
        }
        if (fs.readFileSync('signal.txt', 'utf8') == 1) {
            client.connect();
        }
    }
});
client.on('chat', function(channel, user, message, self) {
    if (fs.readFileSync('listen.txt', 'utf8') != 0) {
        if (user['display-name'] == fs.readFileSync('listen.txt', 'utf8')) {
            io.sockets.emit('send mess', {
                msg: message,
                name: user['display-name'],
            });
        }
    } else {
        io.sockets.emit('send mess', {
            msg: message,
            name: user['display-name'],
        });
        if (message == fs.readFileSync('key.txt', 'utf8')) {
            io.sockets.emit('add user', {
                name: user['display-name'],
            });
        }
    }
});

app.post('/start', function(req, res) {
    let signal = req.body.sign;
    fs.writeFileSync('signal.txt', signal);
    fs.writeFileSync('listen.txt', 0);
    res.status(200);
});
app.post('/choose', function(req, res) {
    let winer = req.body.win;
    fs.writeFileSync('listen.txt', winer);
    res.status(200);
});

app.post('/stop', function(req, res) {
    let signal = req.body.sign;
    fs.writeFileSync('signal.txt', signal);
    fs.writeFileSync('listen.txt', 0);
    res.status(200);
});

function make_cookie(length) {
    let result = '';
    let characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    let i;
    for (i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
    }
    return result;
}

function clear_place() {
    let fs = require('fs');
    fs.writeFileSync('place.txt', '');
}

server.listen(3000);
console.log('Сервер стартовал!');