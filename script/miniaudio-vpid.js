/*global define, require*/
define('script/miniaudio-vpid', function () {
    'use strict';

    var currentLink = null;
    var errorNumber = 1;
    var playAudio = false;
    var errorContainer = document.querySelector('#error-container');
    var playerElement = document.querySelector('#media-player');
    var eventListnersArray = [];
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
        });

        mediaPlayer.bind('ended', function () {
            printToConsole('player stopped');
            currentLink.innerHTML = 'Stopped';
            currentLink.className = 'stopped';
        });

        mediaPlayer.bind('playlistLoaded', function () {
            printToConsole('player playlistLoaded');
        });

        mediaPlayer.bind('error', function (e) {
            currentLink.innerHTML = 'Error '+ e.code + ' Detail '+e.detail + ' Description' + e.description + '<br />';
            var span = document.createElement('span');
            span.className = 'error-message';
            span.innerHTML = errorNumber + ') Error Code = ' + e.code +
                '<br /> Playlist URL = ' + e.detail;
            errorContainer.appendChild(span);
            errorNumber++;
        });

        var clearButton = document.querySelector('#error-console .reset a');
        clearButton.addEventListener('click', function (e) {
            e.preventDefault();
            clearConsole();
        });

        var links = document.querySelectorAll('.links-container a');
        for (var i = 0; i < links.length; i++) {
                var link = links[i];
                link.addEventListener('click', clickHandler);
        }

        function clickHandler(e) {
            e.preventDefault();
            e.stopPropagation();
            printToConsole('link clicked');
            currentLink = this;

            if (this.innerHTML === 'Playing') {
                mediaPlayer.stop();
                currentLink.innerHTML = 'Stopped';
            } else if (this.innerHTML === 'Loading') {
                printToConsole('play cancelled');
                playAudio = false;
                this.innerHTML = 'Cancelled';
            } else {
                for (var j = 0; j < links.length; j++) {
                    links[j].innerHTML = 'Play';
                    links[j].className = '';
                }
                this.innerHTML = 'Loading';
                this.className = 'loading';

                var playlistObject = getPlaylistObject(currentLink);
                if ('items' in playlistObject){
                    mediaPlayer.loadPlaylist(playlistObject, true);
                    printToConsole('playing using vpid');
                } else if ('legacyPlaylist' in playlistObject){
                    mediaPlayer.loadPlaylist(playlistObject.legacyPlaylist, true);
                    printToConsole('playing using data-pid');
                }
                playAudio = true;
            }
        }

        function getPlaylistObject(div) {
            var obj = {};
            // different player sources depending on the data
            if (div.hasAttribute('data-pid') && 
                div.getAttribute('data-pid') !== '') {
                 obj.legacyPlaylist =
                     'http://www.bbc.co.uk/iplayer/playlist/' +
                         div.getAttribute('data-pid');
            } else if (div.hasAttribute('data-playlist') && 
                    div.getAttribute('data-playlist') !== '') {
                 obj.legacyPlaylist = div.getAttribute('data-playlist');
            }

            // VPID can be empty so check it exists.
            if (div.hasAttribute('data-vpid') && 
                div.getAttribute('data-vpid') !== '') {
                obj.items = [{vpid:div.getAttribute('data-vpid')}];
            }

            return obj;
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