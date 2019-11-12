/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import { read, readFileSync } from 'fs';
const request = require('request');
const express = require('express');
const myApiKey = 'AIzaSyARsNN4cTNsHicQ8JpZGTAuJP877w4YY7g';
const app = express();

app.listen(4000, function() {
    main();
});
const main = function() {
    let src = readFileSync('src.txt', 'utf8');
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
        let key = readFileSync('key.txt', 'utf8');
        body = JSON.parse(body);
        if (body.items) {
            let participants = require('fs');
            for (body.items.item of body.items) {
                //if (body.items.item.snippet.displayMessage === key) {
                participants.appendFileSync(
                    './participants.txt',
                    body.items.item.authorDetails.displayName +
                    ' : ' +
                    body.items.item.snippet.displayMessage +
                    '\n'
                );
                // console.log(
                //     item.authorDetails.displayName + ':' + item.snippet.displayMessage
                // );
                // }
            }
        }
        setTimeout(function() {
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