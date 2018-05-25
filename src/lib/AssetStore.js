class AssetStore {
    constructor() {
        this.queue = [];
        this.cache = {};
        this.successCount = 0;
        this.failedCount = 0;
    }

    addQueue(path) {
        this.queue.push(path);
    }

    downloadAll() {
        var imageTypes = ["png", "jpg", "jpeg"];
        var soundTypes = ["wav", "mp3"];
        for (var i = 0; i < this.queue.length; i++) {
            var path = this.queue[i];
            var type = path.split('.').pop();
            var self = this;
            if (this.queue.length === 0) {
                callback();
            }

            if (imageTypes.includes(type)) {
                var img = new Image();
                img.addEventListener("load", () => {
                    self.successCount += 1;
                }, false);
                img.addEventListener("error", () => {
                    self.failedCount += 1;
                }, false);
                img.src = path;
                this.cache[path.replace(/^.*[\\\/]/, '')
                    .replace(/\.[^/.]+$/, "")] = img;
            }
            else if (soundTypes.includes(type)) {
                var snd = new Audio();
                snd.addEventListener("load", () => {
                    self.successCount += 1;
                }, false);
                snd.addEventListener("error", () => {
                    self.failedCount += 1;
                }, false);
                snd.src = path;
                this.cache[path.replace(/^.*[\\\/]/, '')
                    .replace(/\.[^/.]+$/, "")] = snd;
            }
            else {
                console.error("Found unknown filetype: " + path);
            }
        }
    }

    hasFinished() {
        return ((this.queue.length - 1) == (this.successCount + this.failedCount));
    }

    getAsset(path) {
        return this.cache[path];
    }
}