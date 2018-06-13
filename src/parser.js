function _parseBeatmap(data) {
    var notes = [];
    var timing = [];

    var inSlide = {
        A: false,
        B: false
    };

    var slides = {
        A: [],
        B: []
    };

    timing.push(new TimingPoint("BPM", 0, 0, data.metadata.bpm));

    var chart = data.objects;

    chart.forEach((object, index) => {
        if (object.type === "Object") {
            if (object.property === "Single") {
                switch(object.effect) {
                    case "Single":
                    case "FeverSingle": {
                        notes.push(new Note(object.lane, object.timing, object.beat));
                        break;
                    }
                    case "Flick":
                    case "FlickSingle": {
                        notes.push(new NoteFlick(object.lane, object.timing, object.beat));
                        break;
                    }
                    case "Skill": {
                        notes.push(new NoteSkill(object.lane, object.timing, object.beat));
                        break;
                    }
                }
            }
            else if (object.property === "Slide") {
                switch(object.effect) {
                    case "SlideStart_A":
                    case "Slide_A": {
                        if (!inSlide.A)
                            inSlide.A = true;
                        var type = (object.effect === "Skill") ? "NOTE_SKILL" : "NOTE_SINGLE";
                        slides.A.push({lane: object.lane, time: object.timing, type: type, beat: object.beat});
                        break;
                    }
                    case "SlideStart_B":
                    case "Slide_B": {
                        if (!inSlide.B)
                            inSlide.B = true;
                        var type = (object.effect === "Skill") ? "NOTE_SKILL" : "NOTE_SINGLE";
                        slides.B.push({lane: object.lane, time: object.timing, type: type, beat: object.beat});
                        break;
                    }
                    case "SlideEnd_A": {
                        if (inSlide.A) {
                            slides.A.push({lane: object.lane, time: object.timing, type: "NOTE_SINGLE", beat: object.beat});
                            notes.push(new NoteLong(slides.A));
                            slides.A = [];
                            inSlide.A = false;
                        }
                        break;
                    }
                    case "SlideEnd_B": {
                        if (inSlide.B) {
                            slides.B.push({lane: object.lane, time: object.timing, type: "NOTE_SINGLE", beat: object.beat});
                            notes.push(new NoteLong(slides.B));
                            slides.B = [];
                            inSlide.B = false;
                        }
                        break;
                    }
                    case "SlideEndFlick_A": {
                        if (inSlide.A) {
                            slides.A.push({lane: object.lane, time: object.timing, type: "NOTE_FLICK", beat: object.beat});
                            notes.push(new NoteLong(slides.A));
                            slides.A = [];
                            inSlide.A = false;
                        }
                        break;
                    }
                    case "SlideEndFlick_B": {
                        if (inSlide.B) {
                            slides.B.push({lane: object.lane, time: object.timing, type: "NOTE_FLICK", beat: object.beat});
                            notes.push(new NoteLong(slides.B));
                            slides.B = [];
                            inSlide.B = false;
                        }
                        break;
                    }
                }
            }
            else if (object.property === "LongStart") {
                var headObject = object;
                var tailObject, head, tail;
                for (var i = index; i < chart.length; i++) {
                    tailObject = chart[i];
                    if (tailObject.property === "LongEnd" && tailObject.lane === object.lane)
                        break;
                }
                head = {lane: headObject.lane, time: headObject.timing, beat: headObject.beat};
                tail = {lane: tailObject.lane, time: tailObject.timing, beat: tailObject.beat};
                head.type = (headObject.effect === "Skill") ? "NOTE_SKILL" : "NOTE_SINGLE";
                tail.type = (tailObject.effect === "Flick") ? "NOTE_FLICK" : "NOTE_SINGLE";
                notes.push(new NoteLong([head, tail]));
            }
        }
        else if (object.type === "System") {
            switch(object.effect) {
                case "BPMChange": {
                    timing.push(new TimingPoint("BPM", object.beat, object.timing, object.value));
                    break;
                }
                case "CmdFeverReady": {
                    timing.push(new TimingPoint("FEVER_READY", object.beat, object.timing));
                    break;
                }
                case "CmdFeverStart": {
                    timing.push(new TimingPoint("FEVER_START", object.beat, object.timing));
                    break;
                }
                case "CmdFeverCheckpoint": {
                    timing.push(new TimingPoint("FEVER_POINT", object.beat, object.timing));
                    break;
                }
                case "CmdFeverEnd": {
                    timing.push(new TimingPoint("FEVER_END", object.beat, object.timing));
                    break;
                }
            }
        }
    });

    return [timing, notes];
}