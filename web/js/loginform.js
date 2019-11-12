/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

login = function() {
    document.getElementById('hide').style.display = 'block';
    document.getElementById('window').style.display = 'block';
    document.getElementById('enter').style.display = 'none';
};

close_window = function() {
    document.getElementById('hide').style.display = 'none';
    document.getElementById('window').style.display = 'none';
    document.getElementById('enter').style.display = 'block';
};

$(document).ready(function() {
    if (document.cookie != '') {
        document.getElementById('roll').style.display = 'block';
        document.getElementById('out').style.display = 'block';
        document.getElementById('enter').style.display = 'none';
    } else {
        document.getElementById('roll').style.display = 'none';
        document.getElementById('out').style.display = 'none';
    }
});
logout = function() {
    let elements = document.cookie.split('=');
    let name = elements[0];
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.href = '/';
};
mySubmit = function(form) {
    let btn = document.getElementById('btn');
    let login = document.getElementById('login_name');
    let pass = document.getElementById('login_pass');
    let xhr = new XMLHttpRequest();
    xhr.open('POST', '/login');
    let userData = {
        username: login.value,
        password: pass.value,
    };
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.send(JSON.stringify(userData));
    xhr.onload = function() {
        if (this.responseText == 'true') {
            window.location.href = '/user';
        } else {
            alert('Неверный логин или пароль');
            window.location.href = '/';
        }
    };
};