import { getQueryVariable } from "./utils.js";


export class Player {

    constructor () {
        this.baseurl = "https://ytmusic-interactions.blitzsite.repl.co/";
        this.cache = {
            last: false,
            current: false,
            next: false
        }
        this.currentUrlVideoId = getQueryVariable('id');
        this.currentSongId = null;
        this.ispaused = true;

        this.__isRecommendationsLoading = false;
    }

    download(videoID) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', encodeURI(this.baseurl + "download?video_id=" + encodeURIComponent(videoID)), true);
        xhr.responseType = 'blob';
        xhr.onload = () => {
            const blob = new Blob([xhr.response], { type: 'audio/mp3' });
            this.handleCache(window.URL.createObjectURL(blob), videoID);
        };
        xhr.send();
    }

    handleCache(url, videoId, forceNew = false) {
        if (forceNew) {
            this.cache.current = url;
            this.currentSongId = videoId;
            this.cache.next = false
            return;
        }

        if (this.cache.current) {
            this.cache.next = url;
        } else {
            this.cache.current = url;
            this.currentSongId = videoId;
        }
    }

    firstMount(container) {
        const audio = document.createElement('audio');
        audio.setAttribute('controls', 'controls');
        audio.autoplay = true;
        if (this.cache.current) {
            audio.setAttribute('src', this.cache.current);
        } else {
            const loadfunc = () => {
                if (this.cache.current) {
                    audio.setAttribute('src', this.cache.current);
                } else {
                    setTimeout(loadfunc, 100);
                }
            }
            loadfunc();
        }
        this.audio = audio;
        this.setupNextSong();


        this.audio.addEventListener('pause', () => {
            this.ispaused = true;
        })

        this.audio.addEventListener('play', () => {
            this.ispaused = false;
        })

        this.audio.addEventListener('ended', () => {
            this.next();
            this.setupNextSong();
        })


        container.appendChild(audio);
    }

    next() {
        this.last = this.cache.current;
        this.cache.current = this.cache.next;
        this.cache.next = false;
        this.audio.src = this.cache.current;
        this.audio.load();
    }

    prev() {
        this.cache.next = this.cache.current;
        this.cache.current = this.last;
        this.audio.src = this.cache.current;
        this.audio.load();
    }

    play() {
        this.audio.play();
        this.ispaused = false;
    }

    pause() {
        this.audio.pause();
        this.ispaused = true;
    }

    loadRecommendations(_videoId = null) {
        this.__isRecommendationsLoading = true;

        let video_id;
        if (_videoId) {
            video_id = _videoId;
        } else if (this.currentUrlVideoId) {
            video_id = this.currentUrlVideoId;
        } else {
            throw new Error("No video id found");
        }
        const xhr = new XMLHttpRequest();
        xhr.open('GET', encodeURI(this.baseurl + `recommendations?video_id=${video_id}`), true);
        xhr.responseType = 'json';
        xhr.onload = () => {
            const data = xhr.response;
            this.recommendations = data;
        };
        xhr.send();
    }

    currentSongIndexInRecommendations() {
        if (!this.recommendations) {
            console.log("no recommendations");
            return -1;
        }
        for (let i = 0; i < this.recommendations.length; i++) {
            if (this.recommendations[i].id === this.currentSongId) {
                console.log("found current song at index", i);
                return i;
            }
        }
        return -1;
    }

    setupNextSong() {
        console.log("setup next song");
        const setup = () => {
            const index = this.currentSongIndexInRecommendations();
            if (index === -1) {
                console.log("no next song found");
                return;
            }
            const nextSong = this.recommendations[index + 1];
            if (nextSong) {
                this.download(nextSong.id);
            }
        }
        if (this.recommendations) {
            console.log("recommendations already loaded");
            setup();
        } else {
            if (!this.__isRecommendationsLoading) {
                this.loadRecommendations();
            }
            console.log("recommendations not loaded yet");
            const loadfunc = () => {
                console.log("checking recommendations");
                if (this.recommendations) {
                    setup();
                } else {
                    setTimeout(loadfunc, 100);
                }
            }
            loadfunc();
        }
    }

}