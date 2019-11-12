/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
$(document).ready(function() {
    var videobackground = new $.backgroundVideo($('body'), {
        align: 'centerXY',
        width: 1280,
        height: 720,
        path: 'video/',
        filename: 'Back',
        types: ['mp4', 'ogg', 'webm'],
        preload: true,
        autoplay: true,
        loop: true,
    });
});