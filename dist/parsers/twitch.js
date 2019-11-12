"use strict";

/* eslint-disable no-unused-vars */

/* eslint-disable no-undef */
const twitch = require('twitch-js');

const options = {
  connection: {
    cluster: 'aws',
    reconnect: true
  },
  identity: {
    username: 'bot_rchiem',
    password: 'oauth:3ydg9ojjthbb135lgpurekwdr8wu9f'
  },
  channels: ['rchiem']
};
const client = new twitch.client(options);
client.connect();
/*
client.on('connected', function(adress, port) {
    client.action('rchiem', 'Поихали!');
});
*/

client.on('chat', function (channel, user, message, self) {
  let participants = require('fs');
  /*if (message === 'привет') {
        participants.appendFileSync(
            './participants.txt',
            user['display-name'] + ' / '
        );
    
    }
    */

});
//# sourceMappingURL=twitch.js.map