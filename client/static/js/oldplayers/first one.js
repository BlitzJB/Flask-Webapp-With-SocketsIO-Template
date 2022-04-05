

export class Player {
    constructor () {
        this.baseurl = "https://ytmusic-interactions.blitzsite.repl.co/";
        window.BUC = new BlobUrlCache();

    }

    search(query, callback) {
        var url = this.baseurl + "search?query=" + encodeURIComponent(query);
        fetch(url).then(function(response) {
            return response.json();
        }).then(function(json) {
            callback(json);
        });
    }

    recommendations(videoId, callback) {
        var url = this.baseurl + "recommendations?video_id=" + encodeURIComponent(videoId);
        fetch(url).then(function(response) {
            return response.json();
        }).then(function(json) {
            callback(json);
        });
    }

    mount(player_container, videoId = null) {

        const audio = document.createElement('audio');
        audio.setAttribute('controls', 'controls');
        player_container.appendChild(audio);

        if (!this.BUC.isSetup()) {
            
            this.downloadAndCache(videoId);

        }


        this.loadCurrent(audio);



    }

    downloadAndCache(videoID) {

        const xhr = new XMLHttpRequest();
        xhr.open('GET', encodeURI("https://ytmusic-interactions.blitzsite.repl.co" 
                                    + "/download?video_id=" 
                                    + encodeURIComponent(videoID)), true); 
        
        xhr.responseType = 'blob';                     
        xhr.onload = () => {
            
            const blob = new Blob([xhr.response], {type: 'audio/mp3'});        
            window.BUC.handle(window.URL.createObjectURL(blob));   

          };
        xhr.send();

    }

    loadCurrent(audio) {
        const url = window.BUC.current;
        if (url) {
            audio.src = url;
        }
        audio.load();
    }

    play(audio) {
        audio.play();
    }

    /* Low level methods */





}


class BlobUrlCache {
    constructor () {
        this.previous = false;
        this.current = false;
        this.next = false;
    }

    isSetup() {
        return (this.current !== false);
    }

    handle(url, _new = false) {
        if (_new) {
            this.update_now(url); return
        }
        
        if (this.current) {
            this.move_next_with_cache(url); 
        } else {
            this.update_now(url); 
        }
    }

    update_now(url) {

        if (this.previous) {
            window.URL.revokeObjectURL(this.previous);
        }

        this.previous = this.current;
        this.current = url;
        this.next = false;
    }

    cache_next(url) {

        if (this.next) {
            window.URL.revokeObjectURL(this.next);
        }

        this.next = url;
    }

    move_next() {
        this.update_now(this.next);
    }

    move_next_with_cache(url) {
        this.move_next();
        this.cache_next(url);
    }
    
}