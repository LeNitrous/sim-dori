var Playfield = {};

Playfield.drawUIMusicInfo = (ctx) => {
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 60, (game.width / 2) - 20, 150);
    ctx.globalAlpha = 1;

    switch(CHART_DIFF) {
        case "easy": {
            ctx.fillStyle = "#3076f9";
            break;
        }
        case "normal": {
            ctx.fillStyle = "#5bf039";
            break;
        }
        case "hard": {
            ctx.fillStyle = "#fac32f";
            break;
        }
        case "expert": {
            ctx.fillStyle = "#ff2a2e";
            break;
        }
    }

    ctx.fillRect(70, 50, 150, 150);
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.rect(58, 58, 153, 153);
    ctx.stroke();
    ctx.drawImage(beatmap.jacket, 60, 60, 150, 150);
    ctx.moveTo(135, 135);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(202, 202, 28, 0, 2*Math.PI, false);
    ctx.stroke();
    ctx.drawImage(store.cache[`diff_${CHART_DIFF}`], 175, 175, 55, 55);
    ctx.font = "bold 24px Arial";
    ctx.fillText(beatmap.title, 235, 90);
    ctx.font = "bold 16px Arial";
    ctx.fillText(beatmap.artist, 235, 115);
    ctx.fillText(`BPM: ${beatmap.bpm}`, 235, 140);
    ctx.fillText(`Difficulty: ${beatmap.difficulty[CHART_DIFF].level}`, 235, 165);
    ctx.fillText(`Max Combo: ${maxCombo}`, 235, 190);
}

Playfield.drawUIMusicController = (ctx) => {
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 790, (game.width / 2) - 20, 40);
    ctx.globalAlpha = 1;

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 20px Arial";
    ctx.fillText(`${_playerFormatTime(curTime)}`, 10, 818);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PLAYER_BASE_X, PLAYER_BASE_Y);
    ctx.lineTo(PLAYER_LENGTH, PLAYER_BASE_Y);
    ctx.stroke();

    PLAYER_FEVER_START = (PLAYER_BASE_X - 3) + (((PLAYER_LENGTH - PLAYER_BASE_X) / beatmap.music.duration) * beatmap.fever.start);
    PLAYER_FEVER_LENGTH = (PLAYER_BASE_X - 3) + (((PLAYER_LENGTH - PLAYER_BASE_X) / beatmap.music.duration) * beatmap.fever.end) - PLAYER_FEVER_START;
    ctx.fillStyle = "#f48042";
    ctx.fillRect(PLAYER_FEVER_START, PLAYER_BASE_Y - 5, PLAYER_FEVER_LENGTH, 10);

    ctx.fillStyle = "#FFFFFF";
    PLAYER_POS = (PLAYER_BASE_X - 3) + (((PLAYER_LENGTH - PLAYER_BASE_X) / beatmap.music.duration) * curTime);
    ctx.fillRect(PLAYER_POS, PLAYER_BASE_Y - 15, 3, 30);
}

Playfield.drawObjectPlayArea = (ctx) => {
    // Playfield
    ctx.fillStyle = "#000000"
    for (var i = 0; i <= 6; i++) {
        ctx.fillRect(PLAYFIELD_BASE_X + (PLAYFIELD_LANE_WIDTH * i), PLAYFIELD_BASE_Y,
            PLAYFIELD_LANE_WIDTH, PLAYFIELD_LANE_HEIGHT);
    }
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 1;
    for (var i = 1; i <= 6; i++) {
        ctx.beginPath();
        ctx.moveTo(PLAYFIELD_BASE_X + (PLAYFIELD_LANE_WIDTH * i), PLAYFIELD_BASE_Y);
        ctx.lineTo(PLAYFIELD_BASE_X + (PLAYFIELD_LANE_WIDTH * i), PLAYFIELD_LANE_HEIGHT);
        ctx.stroke();
    }

    ctx.fillStyle = "#446765";
    ctx.fillRect(PLAYFIELD_BASE_X - 20, PLAYFIELD_BASE_Y,
            20, PLAYFIELD_LANE_HEIGHT);
    ctx.fillRect(PLAYFIELD_BASE_X + (PLAYFIELD_LANE_WIDTH * 7), PLAYFIELD_BASE_Y,
        20, PLAYFIELD_LANE_HEIGHT);
    ctx.fillStyle = "#509da2";
    ctx.fillRect(PLAYFIELD_BASE_X - 5, PLAYFIELD_BASE_Y,
        5, PLAYFIELD_LANE_HEIGHT);
    ctx.fillRect(PLAYFIELD_BASE_X + (PLAYFIELD_LANE_WIDTH * 7), PLAYFIELD_BASE_Y,
        5, PLAYFIELD_LANE_HEIGHT);

    // Playfield Crochet
    for (var i = 0; i * (beat / gridLevel) < beatmap.music.duration; i++) {
        var bar = (i * (beat / gridLevel)) + beatmap.getTimingPoint(curTime).time
        var Y = (PLAYFIELD_BASE_Y + (PLAYFIELD_LANE_JUDGEMENT - (PLAYFIELD_LANE_WIDTH / 4))) * (1 - (bar - curTime) / approachTime);
        Y += PLAYFIELD_LANE_WIDTH / 4;
        if (!(i % (4 * gridLevel))) {
            ctx.strokeStyle = "#FFFFFF";
        }
        else if (!((i + (gridLevel / 2)) % gridLevel)) {
            ctx.strokeStyle = "#f44242";
        }
        else if (!((i + (gridLevel / 3)) % gridLevel) || !((i - (gridLevel / 3)) % gridLevel)) {
            ctx.strokeStyle = "#be41f4";
        }
        else if (!((i + (gridLevel / 4)) % gridLevel) || !((i - (gridLevel / 4)) % gridLevel)) {
            ctx.strokeStyle = "#4195f4";
        }
        else if (!((i + (gridLevel / 6)) % gridLevel) || !((i - (gridLevel / 6)) % gridLevel)) {
            ctx.strokeStyle = "#be41f4";
        }
        else if (!((i + (gridLevel / 8)) % gridLevel) || !((i - (gridLevel / 8)) % gridLevel)) {
            ctx.strokeStyle = "#f4ca41";
        }
        else if (!((i + (gridLevel / 16)) % gridLevel) || !((i - (gridLevel / 16)) % gridLevel)) {
            ctx.strokeStyle = "#444444";
        }
        else {
            ctx.strokeStyle = "#FFFFFF";
        }
        if (Y < PLAYFIELD_LANE_HEIGHT) {
            ctx.beginPath();
            ctx.moveTo(PLAYFIELD_BASE_X, Y);
            ctx.lineTo(PLAYFIELD_BASE_X + PLAYFIELD_LANE_WIDTH * 7, Y);
            ctx.stroke();
        }
    }

    // Playfield Judgement Bar
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.moveTo(PLAYFIELD_BASE_X - 30, PLAYFIELD_LANE_JUDGEMENT);
    ctx.lineTo(PLAYFIELD_BASE_X + (PLAYFIELD_LANE_WIDTH * 7) + 30, PLAYFIELD_LANE_JUDGEMENT);
    ctx.stroke();
    ctx.lineWidth = 1;
}

Playfield.drawObjectNote = (ctx, note) => {
    var image = store.cache[note.texture];
    var divisor = note.beat.toString().split(".")[1];
    if (!(!divisor || divisor == "5") && note.type == "NOTE_SINGLE" && CHART_RHYTHM)
        image = store.cache["note_normal_alt"];
    var X = PLAYFIELD_BASE_X + (PLAYFIELD_LANE_WIDTH * (note.lane - 1));
    var Y = (PLAYFIELD_BASE_Y + (PLAYFIELD_LANE_JUDGEMENT - (PLAYFIELD_LANE_WIDTH / 4))) * (1 - (note.time - curTime) / approachTime);
    ctx.drawImage(image, X, Y, PLAYFIELD_LANE_WIDTH, PLAYFIELD_LANE_WIDTH / 2);
}

Playfield.drawObjectNoteLong = (ctx, note) => {
    for (var j = 0; j < note.children.length; j++) {
        var head = note.children[j];
        var tail = note.children[j + 1];
        var X = PLAYFIELD_BASE_X + (PLAYFIELD_LANE_WIDTH * (head.lane - 1));
        var Y = (PLAYFIELD_BASE_Y + (PLAYFIELD_LANE_JUDGEMENT - (PLAYFIELD_LANE_WIDTH / 4))) * (1 - (head.time - curTime) / approachTime);
        if (tail) {
            var X2 = PLAYFIELD_BASE_X + (PLAYFIELD_LANE_WIDTH * (tail.lane - 1));
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

var PLAYFIELD_3D_BEGINWIDTH = 0.14;
var PLAYFIELD_3D_ENDWIDTH = 1.54;
var PLAYFIELD_3D_TRACKTOP = 0.06;
var PLAYFIELD_3D_SPAWNPOS = 0.08;
var PLAYFIELD_3D_JUDGEPOS = 0.86;
var PLAYFIELD_3D_SKEWING = (PLAYFIELD_3D_ENDWIDTH - PLAYFIELD_3D_BEGINWIDTH) / 7 / (PLAYFIELD_3D_JUDGEPOS - PLAYFIELD_3D_TRACKTOP);
var PLAYFIELD_3D_SPAWNWIDTH = PLAYFIELD_3D_BEGINWIDTH + (PLAYFIELD_3D_SPAWNPOS - PLAYFIELD_3D_TRACKTOP) / (PLAYFIELD_3D_JUDGEPOS - PLAYFIELD_3D_TRACKTOP) * (PLAYFIELD_3D_ENDWIDTH - PLAYFIELD_3D_BEGINWIDTH);
var PLAYFIELD_3D_LANEWIDTH = PLAYFIELD_3D_ENDWIDTH / 7;

Playfield.drawObjectPlayArea3D = (game, ctx) => {

}

Playfield.drawObjectNote3D = (ctx, note) => {
    var X = 0.8 * game.height + (PLAYFIELD_3D_LANEWIDTH - PLAYFIELD_3D_SKEWING * PLAYFIELD_3D_JUDGEPOS) * game.height * (note.lane - 6 / 2);
    var Y = (PLAYFIELD_3D_SPAWNPOS + (PLAYFIELD_3D_JUDGEPOS - PLAYFIELD_3D_SPAWNPOS) * (1 - (note.time - curTime) / approachTime)) / PLAYFIELD_3D_ENDWIDTH;
    var SCALE = PLAYFIELD_3D_SKEWING * (note.lane - 6 / 2);

    var image = store.cache[note.texture];
    var divisor = note.beat.toString().split(".")[1];
    if (!(!divisor || divisor == "5") && note.type == "NOTE_SINGLE" && CHART_RHYTHM)
        image = store.cache["note_normal_alt"];
    ctx.drawImage(image, X, Y, SCALE, SCALE / 2);
}

Playfield.drawObjectNoteLong3D = (ctx, note) => {

}