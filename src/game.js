class Game {
    constructor(data) {
        this.canvas = document.getElementById("canvas");
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.ctx = this.canvas.getContext("2d");

        this.fps = 240;
        this.frameCount = 0;
        this.lastFrame = 0;
        this.fpsInterval = 1;
        this.rawTime = 0;
        this.currentFPS = 0;
        this.start = null;

        this.gameInterval;

        this.states = {};
        this.currentState;

        this._init.bind(this)();
    }

    addState(name) {
        if (this.currentState === undefined) {
            this.currentState = name;
        }
        this.states[name] = {
            loaded: false,
            load: () => {},
            draw: (ctx) => {},
            update: (dt) => {}
        }
        return this.states[name];
    }

    setState(name) {
        if (this.currentState == name) {
            return;
        }
        this.states[this.currentState].loaded = false;
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.currentState = name;
    }

    _init() {
        window.requestAnimationFrame(this._loop.bind(this));
    }

    _loop() {
        this.frameCount++;
        this.rawTime = (+(new Date().getTime()) - Date.now()) / 1000;
        var dt = this.rawTime - this.lastFrame;

        var state = this.states[this.currentState];
        if (state) {
            if (!state.loaded) {
                state.loaded = true;
                state.load.bind(this)();
            }
            state.draw.bind(this)(this.ctx);
            state.update.bind(this)(dt);
        }

        window.requestAnimationFrame(this._loop.bind(this));
    }
}

if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = ( () => {
        return window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            function(callback, element) {
                window.setTimeout(callback, 1000 / 60);
            };
    })();
}