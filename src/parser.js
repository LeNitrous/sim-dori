function _parseBeatmap(data) {
    var notes = [];
    var timing = [];

    timing.push(new TimingPoint("BPM", 0, 0, data.metadata.bpm));

    var chart = data.objects;
    chart.forEach((object, index) => {
        object.index = index;
    });

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
                        var nodes = _makeSlide(chart, object, "A");
                        //var parts = nodes.map(part => part.index);
                        //chart = chart.filter(items => !parts.includes(items.index));
                        notes.push(new NoteLong(nodes));
                        break;
                    }
                    case "SlideStart_B":
                    case "Slide_B": {
                        var nodes = _makeSlide(chart, object, "B");
                        //var parts = nodes.map(part => part.index);
                        //chart = chart.filter(items => !parts.includes(items.index));
                        notes.push(new NoteLong(nodes));
                        break;
                    }
                }
            }
            else if (object.property === "LongStart") {
                notes.push(new NoteLong(_makeLong(chart, object)));
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

function _makeLong(chart, head) {
    for (var i = head.index; i < chart.length; i++) {
        var tail = chart[i];
        if (tail.property === "LongEnd" && tail.lane === head.lane)
            break;  
    }
    var nodes = [
        {lane: head.lane, time: head.timing},
        {lane: tail.lane, time: tail.timing}
    ];
    switch(head.effect) {
        case "Single": {
            nodes[0].type = "NOTE_SINGLE";
            break;
        }
        case "Skill": {
            nodes[0].type = "NOTE_SKILL";
            break;
        }
    };
    switch(tail.effect) {
        case "Single": {
            nodes[1].type = "NOTE_SINGLE";
            break;
        }
        case "Flick": {
            nodes[1].type = "NOTE_FLICK";
            break;
        }
    };
    return nodes;
}

function _makeSlide(chart, head, group) {
    var nodes = [];
    for (var i = head.index; i < chart.length; i++) {
        var node = chart[i];
        if (node.effect == "Slide_" + group || node.effect == "SlideEnd_" + group || node.effect == "SlideStart_" + group)
            nodes.push({lane: node.lane, time: node.time, type: "NOTE_SINGLE"});
        if (node.effect == "SlideEndFlick_" + group)
            nodes.push({lane: node.lane, time: node.time, type: "NOTE_FLICK"});
        if (node.effect == "SlideEnd_" + group || node.effect == "SlideEndFlick_" + group)
            break;
    }
    return nodes;
}