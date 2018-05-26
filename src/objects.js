class Note {
    constructor(lane, time, offBeat) {
        this.lane = lane;
        this.time = time;
        this.type = "NOTE_SINGLE";
        this.isHit = false;
        this.hitSound = store.cache.note_hit.cloneNode(false);

        if (!offBeat) {
            this.texture = "note_normal";
        }
        else {
            this.texture = "note_normal_alt";
        }

        this.hitSound.volume = 0.25;
    }

    isVisible(curTime, apprTime) {
        return (this.time >= curTime && this.time <= curTime + apprTime);
    }

    hit() {
        this.isHit = true;
        this.hitSound.play();
    }
}

class NoteLong {
    constructor(objects) {
        this.children = [];
        this.type = "NOTE_LONG";
        this.onHold = false;
        this.holdSound = store.cache.note_hold.cloneNode(false);

        var head = objects.shift();
        var tail = objects.pop();
        switch(head.type) {
            case "NOTE_SKILL": {
                this.children.push(new NoteSkill(head.lane, head.time));
                break;
            }
            default: {
                this.children.push(new NoteLongHead(head.lane, head.time));
                break;
            }
        }
        objects.forEach(note => {
            this.children.push(new NoteNode(note.lane, note.time));
        });
        switch(tail.type) {
            case "NOTE_SKILL": {
                this.children.push(new NoteSkill(tail.lane, tail.time));
                break;
            }
            case "NOTE_FLICK": {
                this.children.push(new NoteFlick(tail.lane, tail.time));
                break;
            }
            default: {
                this.children.push(new NoteLongHead(tail.lane, tail.time));
                break;
            }
        }

        this.startTime = head.time;
        this.endTime = tail.time;
    }

    isVisible(curTime, apprTime) {
        if ((this.endTime >= curTime) && (this.startTime <= curTime + apprTime))
            return true
        else
            return false;
    }
}

class NoteLongHead extends Note {
    constructor(lane, time) {
        super(lane, time);
        this.type = "NOTE_LONG_HEAD";
        this.texture = "note_long_head";
    }
}

class NoteNode extends Note {
    constructor(lane, time) {
        super(lane, time);
        this.type = "NOTE_LONG_NODE";
        this.texture = "note_long_mid";
    }
}

class NoteFlick extends Note {
    constructor(lane, time) {
        super(lane, time);
        this.type = "NOTE_FLICK";
        this.texture = "note_flick";
        this.hitSound = store.cache.note_swipe.cloneNode(false);
    }
}

class NoteSkill extends Note {
    constructor(lane, time) {
        super(lane, time);
        this.type = "NOTE_SKILL";
        this.texture = "note_skill";
    }
}

class NoteAlt extends Note {
    constructor(lane, time) {
        super(lane, time);
        this.type = "NOTE_SINGLE";
        this.texture = "note_normal_alt";
    }
}

class Beatmap {
    constructor(meta, chart) {
        this.id = meta.musicId,

        this.jacket = `https://res.bangdream.ga/assets/musicjacket/` + meta.jacketImage + '_jacket.png';
        this.music = new Audio(`https://res.bangdream.ga/assets/sound/` + meta.bgmId + '.mp3');

        this.description = meta.description,
        this.arranger = meta.arranger,
        this.lyricist = meta.lyricist,
        this.composer = meta.composer,
        this.artist = meta.bandName,
        this.title = meta.title,
        this.tag = meta.tag,

        this.difficulty = _mapMetaDifficulty(meta.difficulty);

        this.bpm = chart.bpm;
        this.fever = {
            ready: chart.fever.ready.timing,
            start: chart.fever.start.timing,
            end: chart.fever.end.timing
        }
        this.objects = parseData(chart.notes);
    }

    isFever(curTime) {
        return (curTime >= this.fever.start && curTime <= this.fever.end);
    }

    toString() {
        return `${this.band} - ${this.title}`;
    }
}

function _mapMetaDifficulty(meta) {
    var difficulty = {};
    meta.forEach(diff => {
        difficulty[diff.difficulty] = {
            level: diff.level,
            maxCombo: diff.notesQuantity,
        }
    });
    return difficulty;
}

class BoxModel {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    isHit(x, y) {
        return x > this.x && x < this.x + this.width &&
            y > this.y && y < this.y + this.height;
    }
}