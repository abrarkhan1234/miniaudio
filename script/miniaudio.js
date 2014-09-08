/*global define, require*/
define('script/miniaudio', function () {
    'use strict';

    var currentLink = null;
    var errorNumber = 1;
    var playAudio = false;
    var errorContainer = document.querySelector('#error-container');
    var playerElement = document.querySelector('#media-player');
    require(['bump-3'], function ($) {
        var settings = {
            product: 'iplayer',
            playerProfile: 'smp',
            disable3GWarning: true,
            mediator: {
                'host': 'open.live.bbc.co.uk'
            },
            responsive: true
        };

        var mediaPlayer = $(playerElement).player(settings);
        mediaPlayer.load('http://www.bbc.co.uk/iplayer/playlist/p01nbk3q');
        playerElement.style.width = '1px';
        playerElement.style.height = '1px';
        
        mediaPlayer.bind('initialised', function () {
                printToConsole('player initialised');
            }
        );

        mediaPlayer.bind('playing', function () {
                if (playAudio === false ) {
                    printToConsole('play not allowed');
                    mediaPlayer.stop();
                } else {
                    printToConsole('player playing');
                    currentLink.innerHTML = 'Playing';
                    currentLink.className = 'playing';
                }
            }
        );
        
        mediaPlayer.bind('ended', function () {
                printToConsole('player stopped');
                currentLink.innerHTML = 'Stopped';
                currentLink.className = 'stopped';
            }
        );

        mediaPlayer.bind('playlistLoaded', function () {
                printToConsole('player playlistLoaded');
            }
        );

        mediaPlayer.bind('error', function (e) {
                var span = document.createElement('span');
                span.className = 'error-message';
                span.innerHTML = errorNumber + ') Error Code = ' + e.code +
                    '<br /> Playlist URL = ' + e.detail;
                errorContainer.appendChild(span);
                errorNumber++;
            }
        );
        
        var clearButton = document.querySelector('#error-console .reset a');
        clearButton.addEventListener('click', function (e) {
			e.preventDefault();
            clearConsole();
        });

        var links = document.querySelectorAll('.links-container a');
        for (var i = 0; i < links.length; i++) {
                var link = links[i]; 
                link.removeEventListener("click", clickHandler);
                link.addEventListener('click', clickHandler);
        }

        function clickHandler(e) {
            e.preventDefault();
            e.stopPropagation();
            printToConsole('link clicked');
            currentLink = this;

            if (this.innerHTML === 'Playing') {
                mediaPlayer.stop();
                this.innerHTML = 'Play';
            } else if (this.innerHTML === 'Loading') {
                printToConsole('play cancelled');
                playAudio = false;
                this.innerHTML = 'Cancelled';
            } else {
                for (var j = 0; j < links.length; j++) {
                    links[j].innerHTML = 'Play';
                    links[j].className = '';
                }
                var datapid = this.getAttribute('data-pid');
                this.innerHTML = 'Loading';
                this.className = 'loading';
                mediaPlayer.loadPlaylist('http://www.bbc.co.uk/iplayer/playlist/' + datapid, true);
                playAudio = true;
            }
        }
        
        function printToConsole(string) {
            var span = document.createElement('span');
            span.className = 'error-message';
            span.innerHTML = errorNumber + ') ' + string + '<br />';
            errorContainer.appendChild(span);
            errorNumber++;
        }
        
        function clearConsole() {
            errorContainer.innerHTML = '';
        }
    });
});