/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const socket = io();
let user = [];
let i;
let flag;
let winer;
socket.on('connect', () => {
    $(document).ready(function() {
        let src = getCookie('src');
        let key = getCookie('key');
        let but = getCookie('but');
        let winer = getCookie('winer');
        $('#src').val(src);
        $('#key').val(key);
        if (winer != 'undefined') {
            $('#user').val(winer);
        } else {
            $('#user').val('победитель не выбран');
        }
        if (but == 0 || but == null) {
            document.getElementById('btn_stop').style.display = 'none';
            document.getElementById('btn_str').style.display = 'none';
            document.getElementById('btn_choose').style.display = 'none';
            document.getElementById('participants').style.display = 'block';
            document.getElementById('winer').style.display = 'none';
        }
        if (but == 1) {
            document.getElementById('btn_str').style.display = 'none';
            document.getElementById('btn_stop').style.display = 'none';
            document.getElementById('btn_choose').style.display = 'block';
            document.getElementById('participants').style.display = 'block';
            document.getElementById('winer').style.display = 'none';
        }
        if (but == 2) {
            document.getElementById('btn_stop').style.display = 'block';
            document.getElementById('btn_str').style.display = 'none';
            document.getElementById('btn_choose').style.display = 'none';
            document.getElementById('participants').style.display = 'none';
            document.getElementById('winer').style.display = 'block';
        }
    });
    if (getCookie('but') == 0 || getCookie('but') == null) {
        setTimeout(function() {
            document.getElementById('btn_str').style.display = 'block';
        }, 4500);
    }
    mySrc = function(src) {
        let srcc = document.getElementById('src');
        document.cookie = 'src=' + srcc.value + ';' + 'path=/user';
        let xhr = new XMLHttpRequest();
        xhr.open('POST', '/src');
        let value = {
            srccc: srcc.value,
        };
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xhr.send(JSON.stringify(value));
    };
    myKey = function(key) {
        let keyy = document.getElementById('key');
        document.cookie = 'key=' + keyy.value + ';' + 'path=/user';
        let xhr = new XMLHttpRequest();
        xhr.open('POST', '/key');
        let value = {
            keyyy: keyy.value,
        };
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xhr.send(JSON.stringify(value));
    };
    Start = function() {
        winer = getCookie('winer');
        document.cookie =
            'winer=' +
            winer +
            ';' +
            'expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/user';
        let signal = {
            sign: 1,
        };
        let xhr = new XMLHttpRequest();
        xhr.open('POST', '/start');
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xhr.send(JSON.stringify(signal));
        document.cookie = 'but=1 ; max-age=600; path=/user'; // in second
    };
    Choose = function() {
        if (user.length != 0) {
            winer = user[Math.floor(Math.random() * user.length)];
            document.cookie = 'but=2 ; max-age=600; path=/user'; // in second
            let xhr = new XMLHttpRequest();
            xhr.open('POST', '/choose');
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            let listen = {
                win: winer,
            };
            document.cookie = 'winer=' + winer + ';' + 'path=/user';
            xhr.send(JSON.stringify(listen));
        } else {
            winer = undefined;
            document.cookie = 'winer=' + winer + ';' + 'path=/user';
            document.cookie = 'but=2 ; max-age=600; path=/user'; // in second
        }
    };
    Stop = function() {
        winer = getCookie('winer');
        document.cookie =
            'winer=' +
            winer +
            ';' +
            'expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/user';
        let xhr = new XMLHttpRequest();
        xhr.open('POST', '/stop');
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        let signal = {
            sign: 0,
        };
        document.cookie = 'but=0 ; max-age=600; path=/user'; // in second
        xhr.send(JSON.stringify(signal));
    };
});
socket.on('send mess', function(date) {
    $('#chat').val(
        $.trim($('#chat').val() + '\n\n' + date.name + ' : ' + date.msg)
    );
    scrollDown('chat');
});
socket.on('add user', function(date) {
    for (i = 0; i < user.length; i++) {
        if (user[i] == date.name) {
            flag = 1;
            break;
        }
    }
    if (flag == 1) {
        flag = 0;
    } else {
        user.push(date.name);
        $('#user').val($.trim($('#user').val() + '\n\n' + date.name));
    }
});

function getCookie(name) {
    let value = '; ' + document.cookie;
    let parts = value.split('; ' + name + '=');
    if (parts.length == 2) return parts.pop().split(';').shift();
}

function scrollDown(elementId) {
    'use strict';
    let element = document.getElementById(elementId);
    element.scrollTop = element.scrollHeight;
}