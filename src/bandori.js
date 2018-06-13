const store = new AssetStore();

var controls;

var beatmap, game, beat;
var curTime, lastTime;
var offset = 0;

var PLAYFIELD_BASE_X;
var PLAYFIELD_BASE_Y;
var PLAYFIELD_LANE_WIDTH;
var PLAYFIELD_LANE_HEIGHT;
var PLAYFIELD_LANE_JUDGEMENT;

var PLAYER_BASE_X = 150;
var PLAYER_BASE_Y = 810;
var PLAYER_LENGTH = 625;
var PLAYER_POS = 0;
var PLAYER_FEVER_READY = 0;
var PLAYER_FEVER_START = 0;
var PLAYER_FEVER_LENGTH = 0;

var BUTTONS = {};

var CHART_MIRROR = (_getURLParameter("mirror") === "true") || false;
var CHART_RHYTHM = (_getURLParameter("rhythm") === "true") || true;
var CHART_CUSTOM = _getURLParameter("custom");
var CHART_TIME = _getURLParameter("time");
var CHART_DIFF = _getURLParameter("diff");
var CHART_ID = _getURLParameter("id");

var approachTime = 1.5;
var gridLevel = 1;
var hitTime = 0.05;
var maxCombo = 0;

$(document).ready(function() {
    game = new Game();
    controls = new Hammer(document.getElementById("canvas"));
    controls.get("pan").set({ direction: Hammer.DIRECTION_ALL });
    controls.get("pinch").set({ enable: true });

    controls.add(new Hammer.Tap({ event: "doubletap", taps: 2 }));
    controls.get("doubletap").recognizeWith("tap");

    PLAYFIELD_LANE_WIDTH = 45;
    PLAYFIELD_LANE_HEIGHT = game.height;
    PLAYFIELD_LANE_JUDGEMENT = game.height * 0.8;
    PLAYFIELD_BASE_X = (game.width / 2) - ((PLAYFIELD_LANE_WIDTH * 7) / 2);
    PLAYFIELD_BASE_Y = 0;

    if (CHART_DIFF && CHART_ID) {
        CHART_DIFF = CHART_DIFF.toLowerCase();
        CHART_ID = CHART_ID.toString().padStart(2, "0");
    }

    var loading = game.addState("load");
    loading.load = () => {
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

            beatmap.music.addEventListener("canplaythrough", function() {
                game.setState("live");
            }, false);
        });

        /*
        if (!CHART_ID && !CHART_DIFF) {
            $.when(
                $.getJSON(`https://api.bangdream.ga/v1/jp/music/chart/${CHART_ID}/${CHART_DIFF}`),
                $.getJSON(`https://api.bangdream.ga/v1/jp/music/${CHART_ID}`)
            ).done(function(chart, meta) {
                beatmap = new Beatmap(meta[0], chart[0]);

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

                beatmap.music.addEventListener("canplaythrough", function() {
                    jacket = new Image(60, 60);
                    jacket.onload = function() {
                        //game.setState("live");
                    }
                jacket.src = beatmap.jacket;
                }, false);
            });
        }
        */
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

        if (CHART_TIME) {
            beatmap.music.currentTime = _timeFormatToSeconds(CHART_TIME);
            curTime = beatmap.music.currentTime;
        }

        document.title += `: ${beatmap.artist} - ${beatmap.title} [${CHART_DIFF}]`;
    }

    live.update = (dt) => {
        curTime = offset + beatmap.music.currentTime;
        if (!beatmap.music.paused) {
            // Player
            $(".player.time").text(_playerFormatTime(curTime));
            $(".player.seek").val(Math.floor((100 / beatmap.music.duration) * curTime));
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
        // Multi BPM
        beat = (60000 / beatmap.getTimingPoint(curTime).value) / 1000;       
    }

    live.draw = (ctx) => {
        Playfield.drawObjectPlayArea(ctx);

        // Playfield Notes
        ctx.save();
        for (var i = 0; i < beatmap.objects.length; i++) {  
            var note = beatmap.objects[i];
            if (note.isVisible(curTime, approachTime) && note.type != "NOTE_LONG") {
                Playfield.drawObjectNote(ctx, note);
            }
            else if (note.isVisible(curTime, approachTime) && note.type == "NOTE_LONG") {
                Playfield.drawObjectNoteLong(ctx, note);
            }
        }
        ctx.restore();
    }

    controls.on("panup pandown pinchin pinchout doubletap", function(e) {
        if (e.type === "panup") {
            beatmap.music.currentTime -= 0.1;
            curTime -= 0.1;
        }
        else if (e.type === "pandown") {
            beatmap.music.currentTime += 0.1;
            curTime += 0.1;
        }
        else if (e.type === "pinchin") {
            approachTime += 0.1;
        }
        else if (e.type === "pinchout") {
            approachTime -= 0.1;
        }
        else if (e.type === "doubletap") {
            playerPlayPause();
        }
    });
});

$(document).keydown(function(e) {
    var key = e.keyCode;
    var isCtrlCmdDown = false;
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
            playerPlayPause();
        }
    }
});

$(document).bind("mousewheel", function(e) {
    e.preventDefault();
    if (e.originalEvent.wheelDelta / 120 > 0) {
        beatmap.music.currentTime += 0.1;
        curTime += 0.1;
    }
    else {
        beatmap.music.currentTime -= 0.1;
        curTime -= 0.1;
    }
});

$(document).on("copy", function(e) {
    e.stopPropagation();
    e.preventDefault();

    var clipboard = e.originalEvent.clipboardData;
    clipboard.setData("text/plain", _playerFormatTime(beatmap.music.currentTime));
});

function playerPlayPause() {
    if (beatmap.music.paused)
        beatmap.music.play();
    else
        beatmap.music.pause();
}