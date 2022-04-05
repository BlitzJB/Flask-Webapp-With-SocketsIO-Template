import { getQueryVariable } from "./utils.js";

export class Player {

    constructor (parent) {

        this.baseurl = "https://ytmusic-interactions.blitzsite.repl.co/"

        this.currentId = null;
        this.recom = null;
        this.ispaused = true;
        this.getAudioElement();
        this.initialLoad();

        this.UI = {
            songTitle: document.querySelector('.track__title'),
            songArtist: document.querySelector('.track__artist'),
            thumbnail: document.querySelector('.track__thumbnail'),
            prev: document.querySelector('#prev'),
            next: document.querySelector('#next'),
            play: document.querySelector('#play'),
            loop: document.querySelector('#loop'),
            recommendations: document.querySelector('#recommendations')
        }

        this.UI.prev.addEventListener('click', () => {
            this.handlePrev();
        })

        this.UI.next.addEventListener('click', () => {
            this.handleNext();
        })

        this.UI.play.addEventListener('click', () => {
            if (this.ispaused) {
                this.play();
                this.UI.play.innerHTML = '⏸';
            } else {
                this.pause();
                this.UI.play.innerHTML = '▶️';
            }
        })

        this.cache = {
            last: {
                index: null,
                blobUrl: null
            },
            current: {
                index: 0,
                blobUrl: null
            },
            next: {
                index: null,
                blobUrl: null
            }
        }

        parent.appendChild(this.audio);


    }

    initialLoad() {
        

        this.currentId = getQueryVariable('id');

        // get recommendations from the api
        fetch(`${this.baseurl}recommendations?video_id=${this.currentId}`)
            .then(response => response.json())
            .then(data => {
                this.recom = data;
                this.cache.current.index = 0;
                this.loadRecommendationsIntoUI();
                this.downloadIndex(this.cache.current.index, (blobUrl) => {
                    this.cache.current.blobUrl = blobUrl;
                    this.audio.src = this.cache.current.blobUrl;
                    this.audio.load();
                    console.log(this.recom[this.cache.current.index].title);
                    this.updateUI(this.recom[this.cache.current.index]);
                });
                this.cache.next.index = 1;
                this.downloadIndex(this.cache.next.index, (blobUrl) => {
                    this.cache.next.blobUrl = blobUrl;
                })
            })
    }

    downloadIndex(index, cb) {
        fetch(`${this.baseurl}download?video_id=${this.recom[index].id}`)
            .then(response => response.blob())
            .then(blob => {
                cb(window.URL.createObjectURL(blob));
            })
    }


    getAudioElement() {
        this.audio = document.createElement('audio');
        this.audio.setAttribute('controls', 'controls');
        this.audio.autoplay = true;
        
        this.audio.addEventListener('pause', () => {
            this.ispaused = true;
            this.pause();
        })

        this.audio.addEventListener('play', () => {
            this.ispaused = false;
            this.play();
        })

        this.audio.addEventListener('ended', () => {
            this.handleEnd();
        })
    }


    pause() {
        this.audio.pause();
        this.ispaused = true;
    }

    play() {
        this.audio.play();
        this.ispaused = false;
    }

    handleEnd() {
        if (this.cache.last.blobUrl) {
            URL.revokeObjectURL(this.cache.last.blobUrl);
        }

        this.cache.last = this.cache.current;
        this.cache.current = this.cache.next;
        this.cache.next = {
            index: this.cache.current.index + 1,
            blobUrl: null
        }
        
        if (!this.cache.current.blobUrl) {
            this.downloadIndex(this.cache.current.index, (blobUrl) => {
                this.cache.current.blobUrl = blobUrl;
                this.audio.src = this.cache.current.blobUrl;
                this.audio.load();
            })
        } else {
            this.audio.src = this.cache.current.blobUrl;
            this.audio.load();
        }
        this.updateUI(this.recom[this.cache.current.index]);
        
        this.downloadIndex(this.cache.next.index, (blobUrl) => {
            this.cache.next.blobUrl = blobUrl;  
        })

    }

    handleNext() {
        this.handleEnd();
    }

    handlePrev() {
        if (this.cache.next.blobUrl) {
            URL.revokeObjectURL(this.cache.next.blobUrl);
        }

        this.cache.next = this.cache.current;
        this.cache.current = this.cache.last;
        
        if (this.cache.current.blobUrl) {
            this.audio.src = this.cache.current.blobUrl;
            this.audio.load();
        } else {
            this.downloadIndex(this.cache.current.index, (blobUrl) => {
                this.cache.current.blobUrl = blobUrl;
                this.audio.src = this.cache.current.blobUrl;
                this.audio.load();
            })
        }
        this.updateUI(this.recom[this.cache.current.index]);

        this.cache.last = {
            index: this.cache.current.index - 1,
            blobUrl: null
        }
        this.downloadIndex(this.cache.last.index, (blobUrl) => {
            this.cache.last.blobUrl = blobUrl;
        })

    }

    handlePlayFromList(index) {
        if (this.cache.current.blobUrl) {
            URL.revokeObjectURL(this.cache.current.blobUrl);
        }
        if (this.cache.next.blobUrl) {
            URL.revokeObjectURL(this.cache.current.blobUrl);
        }

        this.cache.current = {
            index: index,
            blobUrl: null
        }
        this.cache.next = {
            index: index + 1,
            blobUrl: null
        }

        this.downloadIndex(this.cache.current.index, (blobUrl) => {
            this.cache.current.blobUrl = blobUrl;
            this.audio.src = this.cache.current.blobUrl;
            this.audio.load();
            this.updateUI(this.recom[index]);
        })
        this.downloadIndex(this.cache.next.index, (blobUrl) => {
            this.cache.next.blobUrl = blobUrl;
        })
    }

    updateUI(songData) {
        this.UI.songTitle.innerHTML = songData.title;
        this.UI.songArtist.innerHTML = songData.artists.join(', ');
        this.UI.thumbnail.src = songData.thumbnail.large;
    }

    trimString(string) {
        if (string.length > 25) {
            return `${string.substring(0, 25)}...`
        } else {
            return string
        }
    }

    loadRecommendationsIntoUI() {
        this.UI.recommendations.innerHTML = '';
        this.recom.forEach((song, index) => {
            let li = document.createElement('li');
            li.innerHTML = `<img src="${song.thumbnail.mini}" class="recom_thumbnail">
                            <div class="song-info">
                                <h3>${this.trimString(song.title)}</h3>
                                <h4>${this.trimString(song.artists.join(', '))}</h4>
                            </div>`;
            li.classList.add('recommendation');
            li.addEventListener('click', () => {
                this.handlePlayFromList(index);
            })
            this.UI.recommendations.appendChild(li);
        })
    }

}