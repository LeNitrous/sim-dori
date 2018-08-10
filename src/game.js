class Game {
    constructor(id) {
        this.id = id;
        this.canvas = $(id)[0];
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.aspectRatio = [16, 9];
        this.ctx = this.canvas.getContext("2d");

        this.lastLoopTime;
        this.fps;
        this.gameInterval;

        this.states = new Object();
        this.currentState;

        this.debug = false;

        this._init.bind(this)();

        this.cursor = {
            x: null,
            y: null,
            sx: null,
            sy: null,
            ex: null,
            ey: null,
            distX: null,
            distY: null,
            timer: undefined,
            isDown: false,
            isDragging: false
        }

        this.keyboard = new Object();

        var self = this;
        $(document).ready(() => {
            self.setAspectRatio(...self.aspectRatio);

            $(id).on("click", (e) => {
                e.preventDefault();
                var x = e.clientX - $(id).offset().left;
                var y = e.clientY - $(id).offset().top;
                var b = e.which;
                self.getCurrentState().onCursorClick(x, y, b);

                var objects = self.getCurrentState().objects;
                for (var ent in objects) {
                    if (typeof objects[ent]._cursorClick !== "undefined") {
                        objects[ent]._cursorClick(x, y, b);
                    }
                }
            });
    
            $(id).on("mousedown", (e) => {
                e.preventDefault();
                self.cursor.isDown = true;
                self.cursor.sx = e.clientX - $(id).offset().left;
                self.cursor.sy = e.clientY - $(id).offset().top;
                self.getCurrentState().onCursorDown(self.cursor.sx, self.cursor.sy, e.which);

                var objects = self.getCurrentState().objects;
                for (var ent in objects) {
                    if (typeof objects[ent]._cursorDown !== "undefined") {
                        objects[ent]._cursorDown(x, y, b);
                    }
                }
            });
    
            $(id).on("mousemove", (e) => {
                e.preventDefault();
                self.cursor.x = e.clientX - $(id).offset().left;
                self.cursor.y = e.clientY - $(id).offset().top;
                var b = e.which;
                self.getCurrentState().onCursorMove(self.cursor.x, self.cursor.y);
                if (self.cursor.isDown) {
                    self.cursor.isDragging = true;
                    self.getCurrentState().onCursorDrag(self.cursor.sx, self.cursor.sy, self.cursor.x, self.cursor.y, b);
                }

                var objects = self.getCurrentState().objects;
                for (var ent in objects) {
                    if (typeof objects[ent]._cursorMove !== "undefined") {
                        objects[ent]._cursorMove(self.cursor.x, self.cursor.y);
                    }
                }
            });
    
            $(id).on("mouseup", (e) => {
                e.preventDefault();
                self.cursor.isDown = false;
                var x = e.clientX - $(id).offset().left;
                var y = e.clientY - $(id).offset().top;
                var b = e.which;
                self.getCurrentState().onCursorUp(x, y, b);
                if (self.cursor.isDragging) {
                    self.getCurrentState().onCursorDragUp(self.cursor.sx, self.cursor.sy, x, y, b);
                }

                var objects = self.getCurrentState().objects;
                for (var ent in objects) {
                    if (typeof objects[ent]._cursorUp !== "undefined") {
                        objects[ent]._cursorUp(x, y, b);
                    }
                }
            });
    
            $(id).on("touchstart", (e) => {
                e.preventDefault();
                self.cursor.sx = e.touches[0].clientX;
                self.cursor.sy = e.touches[0].clientY;
                self.cursor.timer = setTimeout(() => {
                    self.getCurrentState().onTouchHold(self.cursor.sx, self.cursor.sy);
                    var objects = self.getCurrentState().objects;
                    for (var ent in objects) {
                        if (typeof objects[ent]._touchHold !== "undefined") {
                            objects[ent]._touchHold(self.cursor.sx, self.cursor.sy, e.which);
                        }
                    }
                }, 800);
            });

            $(id).on("touchmove", (e) => {
                e.preventDefault();
                self.cursor.ex = e.touches[0].clientX;
                self.cursor.ey = e.touches[0].clientY;
                var xDiff = self.cursor.sx - self.cursor.ex;
                var yDiff = self.cursor.sy - self.cursor.ey;
                var direction;

                if (self.cursor.timer) {
                    clearTimeout(self.cursor.timer);
                }

                if (Math.abs(xDiff) > Math.abs(yDiff)) {
                    if (xDiff > 0) {
                        direction = "left";
                    }
                    else {
                        direction = "right";
                    }
                }
                else {
                    if (yDiff > 0) {
                        direction = "up";
                    }
                    else {
                        direction = "down";
                    }
                }

                if (direction) {
                    self.getCurrentState().onTouchSwipe(self.cursor.sx, self.cursor.sy, direction);

                    var objects = self.getCurrentState().objects;
                    for (var ent in objects) {
                        if (typeof objects[ent]._touchSwipe !== "undefined") {
                            objects[ent]._touchSwipe(self.cursor.sx, self.cursor.sy, direction);
                        }
                    }

                    self.cursor.sx = null;
                    self.cursor.sy = null;
                }
            });

            $(id).on("touchend touchcancel", (e) => {
                e.preventDefault();
                self.cursor.ex = e.changedTouches[0].clientX;
                self.cursor.ey = e.changedTouches[0].clientY;
                var xDiff = self.cursor.sx - self.cursor.ex;
                var yDiff = self.cursor.sy - self.cursor.ey;

                if (self.cursor.timer) {
                    if (xDiff == 0 && yDiff == 0) {
                        self.getCurrentState().onCursorClick(self.cursor.sx, self.cursor.sy, 1);
                        var objects = self.getCurrentState().objects;
                        for (var ent in objects) {
                            if (typeof objects[ent]._cursorClick !== "undefined") {
                                objects[ent]._cursorClick(self.cursor.sx, self.cursor.sy, 1);
                            }
                        }
                    }
                    clearTimeout(self.cursor.timer);
                }
            });

            $(id).on("keydown", (e) => {
                e.preventDefault();
                var key = e.keyCode || e.charChode;
                self.keyboard[key] = true;
                self.getCurrentState().onKeyDown(key);
            });

            $(id).on("keypress", (e) => {
                e.preventDefault();
                var key = e.keyCode || e.charChode;
                self.getCurrentState().onKeyPress(key);
            });

            $(id).on("keyup", (e) => {
                e.preventDefault();
                var key = e.keyCode || e.charChode;
                delete self.keyboard[key];
                self.getCurrentState().onKeyUp(key);
            });

            $(window).on("resize orientationchange", (e) => {
                e.preventDefault();
                self.setAspectRatio(...self.aspectRatio);
            });
        });
    }

    addState(name) {
        if (this.currentState === undefined) {
            this.currentState = name;
        }
        this.states[name] = {
            loaded: false,
            objects: new Object(),
            load: () => {},
            draw: (ctx) => {},
            update: (dt) => {},
            onCursorClick: (x, y, b) => {},
            onCursorMove: (x, y) => {},
            onCursorUp: (x, y, b) => {},
            onCursorDown: (x, y, b) => {},
            onCursorDrag: (sx, sy, ex, ey, b) => {},
            onCursorDragUp: (sx, sy, ex, ey, b) => {},
            onTouchSwipe: (x, y, d) => {},
            onTouchHold: (x, y) => {},
            onKeyPress: (key) => {},
            onKeyDown: (key) => {},
            onKeyUp: (key) => {}
        }
        return this.states[name];
    }

    setAspectRatio(w, h) {
        this.aspectRatio = [w, h];

        var widthToHeight = this.aspectRatio[0] / this.aspectRatio[1];
        var newWidth = window.innerWidth;
        var newHeight = window.innerHeight;
        var newWidthToHeight = newWidth / newHeight;
    
        if (newWidthToHeight > widthToHeight) {
            newWidth = newHeight * widthToHeight;
        }
        else {
            newHeight = newWidth / widthToHeight;
        }

        this.canvas.width = newWidth;
        this.canvas.height = newHeight;
        this.width = newWidth;
        this.height = newHeight;
    }

    setState(name) {
        if (this.currentState == name) {
            return;
        }
        this.states[this.currentState].loaded = false;
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.currentState = name;
    }

    setDebugMode(bool) {
        this.debug = bool;
    }

    getCurrentState() {
        return this.states[this.currentState];
    }

    getCurrentStateName() {
        return this.currentState;
    }

    getEntityById(id) {
        return this.getCurrentState().objects[id];
    }

    getFPS() {
        return this.fps;
    }

    getCursorPos() {
        return { x: this.cursor.x, y: this.cursor.y };
    }

    isCursorDown() {
        return this.cursor.isDown;
    }

    isKeyDown(key) {
        if (key in this.keyboard) {
            return this.keyboard[key];
        }
        else {
            return false;
        }
    }

    hasFocus() {
        return $(this.id).is(":focus");
    }

    _init() {
        window.requestAnimationFrame(this._loop.bind(this));
    }

    _loop() {
        var state = this.states[this.currentState];
        
        if (!this.lastLoopTime) {
            this.lastLoopTime = Date.now();
            this.fps = 0;
        }

        var dt = (Date.now() - this.lastLoopTime) / 1000;
        this.lastLoopTime = Date.now();
        this.fps = 1 / dt;

        if (state) {
            if (!state.loaded) {
                state.loaded = true;
                state.load.bind(this)();
            }
            this.ctx.clearRect(0, 0, this.width, this.height);
            state.draw.bind(this)(this.ctx);
            state.update.bind(this)(dt);
            var objects = Object.values(this.getCurrentState().objects);
            objects.sort((a, b) => {
                if (a.priority < b.priority)
                    return -1;
                if (a.priority > b.priority)
                    return 1;
                return 0;
            });
            objects.forEach(object => {
                if (typeof object._draw !== "undefined") {
                    object._draw(this.ctx);
                }
                if (typeof object._drawBoundingBox !== "undefined" && this.debug) {
                    object._drawBoundingBox(this.ctx);
                }
                if (typeof object._update !== "undefined") {
                    object._update(dt);
                }
            });
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
                window.setTimeout(callback, 1000 / 240);
            };
    })();
}