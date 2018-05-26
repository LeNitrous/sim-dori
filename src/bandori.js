const store = new AssetStore();

var beatmap, game, beat;
var curTime, lastTime, jacket;

var PLAYFIELD_BASE_X;
var PLAYFIELD_BASE_Y;
var PLAYFIELD_LANE_WIDTH;
var PLAYFIELD_LANE_HEIGHT;
var PLAYFIELD_LANE_JUDGEMENT;

var CHART_MIRROR = (getURLParameter("mirror") === "true") || false;
var CHART_RHYTHM = (getURLParameter("rhythm") === "true") || true;
var CHART_DIFF = getURLParameter("diff");
var CHART_ID = getURLParameter("id");

var MOUSE_X = 0;
var MOUSE_Y = 0;
var MOUSE_isDown = false;

var approachTime = 1.5;
var gridLevel = 1;
var hitTime = 0.05;
var maxCombo = 0;

$(document).ready(function() {
    game = new Game();

    PLAYFIELD_BASE_X = game.width / 2;
    PLAYFIELD_BASE_Y = 0;
    PLAYFIELD_LANE_WIDTH = 55;
    PLAYFIELD_LANE_HEIGHT = game.height;
    PLAYFIELD_LANE_JUDGEMENT = 840;

    var check = game.addState("check");
    check.load = () => {
        if (CHART_DIFF && CHART_ID) {
            CHART_DIFF = CHART_DIFF.toLowerCase();
            CHART_ID = CHART_ID.toString().padStart(2, "0");
            game.setState("load");
        }
    }

    check.update = (dt) => {

    }

    check.draw = (ctx) => {
        if (!CHART_DIFF || !CHART_ID) {
            ctx.fillStyle = "#FFFFFF";
            ctx.font = "bold 16px Arial";
            ctx.fillText("Invalid URL Parameter.", game.width - 300, game.height - 50);
            ctx.fill();
        }
    }

    var loading = game.addState("load");
    loading.load = () => {
        store.addQueue("assets/textures/live.png");
        store.addQueue("assets/textures/diff_easy.png");
        store.addQueue("assets/textures/diff_normal.png");
        store.addQueue("assets/textures/diff_hard.png");
        store.addQueue("assets/textures/diff_expert.png");
        store.addQueue("assets/textures/note_normal.png");
        store.addQueue("assets/textures/note_normal_alt.png");
        store.addQueue("assets/textures/note_skill.png");
        store.addQueue("assets/textures/note_flick.png");
        store.addQueue("assets/textures/note_long_head.png");
        store.addQueue("assets/textures/note_long_body.png");
        store.addQueue("assets/textures/note_long_mid.png");
        store.addQueue("assets/sounds/note_hit.wav");
        store.addQueue("assets/sounds/note_swipe.wav");
        store.addQueue("assets/sounds/note_hold.wav");
        store.downloadAll();

        $.when(
            $.getJSON(`https://api.bangdream.ga/v1/jp/music/chart/${CHART_ID}/${CHART_DIFF}`),
            $.getJSON(`https://api.bangdream.ga/v1/jp/music/${CHART_ID}`)
        ).done(function(chart, meta) {
            beatmap = new Beatmap(meta[0], chart[0]);

            beat = (60000 / beatmap.bpm) / 1000;

            document.title += `: ${beatmap.artist} - ${beatmap.title}`;

            beatmap.objects.forEach(note => {
                if (note.type != "NOTE_LONG") {
                    maxCombo++;
                }
                else {
                    note.children.forEach(child => {
                        maxCombo++;
                    });
                }
            });
            

            if (!CHART_RHYTHM) {
                beatmap.objects.forEach(note => {
                    if (note.type == "NOTE_SINGLE") {
                        note.texture = "note_normal";
                    }
                });
            }

            if (CHART_MIRROR) {
                beatmap.objects.forEach(note => {
                    if (note.type != "NOTE_LONG") {
                        note.lane = Math.abs(6 - note.lane);
                    }
                    else {
                        note.children.forEach(child => {
                            child.lane = Math.abs(6 - child.lane);
                        });
                    }
                });
            }

            beatmap.music.addEventListener("canplaythrough", function() {
                jacket = new Image(60, 60);
                jacket.onload = function() {
                    game.setState("live");
                }
            jacket.src = beatmap.jacket;
            }, false);
        });
    }

    loading.update = (dt) => {

    }

    loading.draw = (ctx) => {
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 16px Arial";
        ctx.fillText("Loading...", game.width - 150, game.height - 50);
        ctx.fill();
    }

    var live = game.addState("live");
    live.load = () => {

    }

    live.update = (dt) => {
        curTime = beatmap.music.currentTime;
        if (!beatmap.music.paused) {
            // Hit Detection
            for (var i = 0; i < beatmap.objects.length; i++) {
                var note = beatmap.objects[i];
                if (note.type == "NOTE_LONG") {
                    for (var j = 0; j < note.children.length; j++) {
                        var child = note.children[j];
                        if (child.time >= curTime - hitTime && child.time <= curTime + hitTime) {
                            if (!child.isHit) {
                                child.hit();
                                Events.onNoteHit(child);
                            }
                        }
                    }
                }
                else {
                    if (note.time >= curTime - hitTime && note.time <= curTime + hitTime) {
                        if (!note.isHit) {
                            note.hit();
                            Events.onNoteHit(note);
                        }
                    }
                }
            }
        }
        // Rewind Support
        if (lastTime >= curTime && !beatmap.music.paused && curTime > 0) {
            Events.onSeekRewind();
        }
        else if (lastTime <= curTime && !beatmap.music.paused && curTime > 0) {
            Events.onSeekForward();
        }
        lastTime = curTime;
    }

    live.draw = (ctx) => {
        // Background
        ctx.drawImage(store.cache.live, 0, 0, store.cache.live.width, store.cache.live.height,
            0, 0, game.width, game.height);

        Playfield.drawObjectPlayArea(ctx);

        // Playfield Notes
        ctx.save();
        for (var i = 0; i < beatmap.objects.length; i++) {  
            var note = beatmap.objects[i];
            if (note.isVisible(curTime, approachTime) && note.type != "NOTE_LONG") {
                var image = store.cache[note.texture];
                var X = PLAYFIELD_BASE_X + (PLAYFIELD_LANE_WIDTH * note.lane);
                var Y = (PLAYFIELD_BASE_Y + (PLAYFIELD_LANE_JUDGEMENT - (PLAYFIELD_LANE_WIDTH / 4))) * (1 - (note.time - curTime) / approachTime);
                ctx.drawImage(image, X, Y, PLAYFIELD_LANE_WIDTH, PLAYFIELD_LANE_WIDTH / 2);
            }
            else if (note.isVisible(curTime, approachTime) && note.type == "NOTE_LONG") {
                for (var j = 0; j < note.children.length; j++) {
                    var head = note.children[j];
                    var tail = note.children[j + 1];
                    var X = PLAYFIELD_BASE_X + (PLAYFIELD_LANE_WIDTH * head.lane);
                    var Y = (PLAYFIELD_BASE_Y + (PLAYFIELD_LANE_JUDGEMENT - (PLAYFIELD_LANE_WIDTH / 4))) * (1 - (head.time - curTime) / approachTime);
                    if (tail) {
                        var X2 = PLAYFIELD_BASE_X + (PLAYFIELD_LANE_WIDTH * tail.lane);
                        var Y2 = (PLAYFIELD_BASE_Y + (PLAYFIELD_LANE_JUDGEMENT - (PLAYFIELD_LANE_WIDTH / 4))) * (1 - (tail.time - curTime) / approachTime);
                        if (head.time <= curTime) {
                            if (tail.time >= curTime) {
                                var image = store.cache.note_long_head;
                                X = X + (X2 - X) * (curTime - head.time) / (tail.time - head.time);
                                Y = PLAYFIELD_LANE_JUDGEMENT - (PLAYFIELD_LANE_WIDTH / 4);
                                ctx.fillStyle="#008000";
                                ctx.globalAlpha = 0.8;
                                ctx.beginPath();
                                ctx.moveTo(X + 7, Y + (PLAYFIELD_LANE_WIDTH / 4));
                                ctx.lineTo(X2 + 7, Y2 + (PLAYFIELD_LANE_WIDTH / 4));
                                ctx.lineTo((X2 - 7) + PLAYFIELD_LANE_WIDTH, Y2 + (PLAYFIELD_LANE_WIDTH / 4));
                                ctx.lineTo((X - 7) + PLAYFIELD_LANE_WIDTH, Y + (PLAYFIELD_LANE_WIDTH / 4));
                                ctx.fill();
                                ctx.globalAlpha = 1;
                                ctx.drawImage(image, X, Y, PLAYFIELD_LANE_WIDTH, PLAYFIELD_LANE_WIDTH / 2);
                            }
                        }
                        if (head.isVisible(curTime, approachTime)) {
                            ctx.fillStyle="#008000";
                            ctx.globalAlpha = 0.8;
                            ctx.beginPath();
                            ctx.moveTo(X + 7, Y + (PLAYFIELD_LANE_WIDTH / 4));
                            ctx.lineTo(X2 + 7, Y2 + (PLAYFIELD_LANE_WIDTH / 4));
                            ctx.lineTo((X2 - 7) + PLAYFIELD_LANE_WIDTH, Y2 + (PLAYFIELD_LANE_WIDTH / 4));
                            ctx.lineTo((X - 7) + PLAYFIELD_LANE_WIDTH, Y + (PLAYFIELD_LANE_WIDTH / 4));
                            ctx.fill();
                            ctx.globalAlpha = 1;
                        }
                    }
                    if (head.isVisible(curTime, approachTime)) {
                        var image = store.cache[head.texture];
                        ctx.drawImage(image, X, Y, PLAYFIELD_LANE_WIDTH, PLAYFIELD_LANE_WIDTH / 2);
                    }
                }
            }
        }
        ctx.restore();

        // UI Debug
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 16px Arial";
        ctx.fillText(`Controls:`, 60, 420);
        ctx.fillText(`Mouse Wheel Up: Increase Note Speed`, 80, 440);
        ctx.fillText(`Mouse Wheel Down: Decrease Note Speed`, 80, 460);
        ctx.fillText(`Left Arrow Key: Seek Back`, 80, 480);
        ctx.fillText(`Right Arrow Key: Seek Forward`, 80, 500);
        ctx.fillText(`Spacebar: Pause/Play`, 80, 520);

        Playfield.drawUIMusicInfo(ctx);
        Playfield.drawUIMusicController(ctx);
    }
});

$(document).keydown(function(e) {
    var key = e.keyCode;
    if (beatmap) {
        var curTime = beatmap.music.currentTime.toFixed(3);
        var divisor = (beat / gridLevel).toFixed(3);
        if (key == 39) {
            if (curTime % divisor)
                beatmap.music.currentTime -= (curTime % divisor);
            beatmap.music.currentTime += beat / gridLevel;
        }
        if (key == 37) {
            if (curTime % divisor)
                beatmap.music.currentTime -= (curTime % divisor);
            beatmap.music.currentTime -= beat / gridLevel;
        }
        if (key == 32) {
            if (beatmap.music.paused)
                beatmap.music.play();
            else
                beatmap.music.pause();
        }
    }
});

$(document).bind("mousewheel", function(e) {
    if (e.originalEvent.wheelDelta / 120 > 0) {
        approachTime -= 0.1;
    }
    else {
        approachTime += 0.1;
    }
});

function _getMousePos(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

function _playerFormatTime(time) {
    var minutes, seconds, millis;
    minutes = Math.floor(time / 60);
    minutes = (minutes >= 10) ? minutes : "0" + minutes;
    seconds = Math.floor(time % 60);
    seconds = (seconds >= 10) ? seconds : "0" + seconds;
    millis = time + '';
    millis = millis.split(".").pop().slice(0, 3).padEnd(3, "0");
    return `${minutes}:${seconds}:${millis}`;
}