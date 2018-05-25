var column = {
    "SC": 0,
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6
};

function parseData(data) {
    var chart = [];
    data.shift();
    data.forEach((note, index) => {
        switch(note.type) {
            case undefined:
            case "Single": {
                var offBeat = Number(note.beat.toString().split(".")[1]);
                offBeat = (!offBeat || offBeat == 5);
                chart.push(new Note(column[note.column], note.timing, !offBeat));
                break;
            }
            case "FeverSingle": {
                chart.push(new Note(column[note.column], note.timing));
                break;
            }
            case "Skill": {
                if (note.endTiming) {
                    chart.push(new NoteLong([
                        {lane: column[note.column], time: note.timing, type: "NOTE_SKILL"},
                        {lane: column[note.column], time: note.endTiming, type: "NOTE_SINGLE"},
                    ]));
                }
                else {
                    chart.push(new NoteSkill(column[note.column], note.timing));
                }
                break;
            }
            case "Flick": {
                chart.push(new NoteFlick(column[note.column], note.timing));
                break;
            }
            case "FeverFlick": {
                chart.push(new NoteFlick(column[note.column], note.timing));
                break;
            }
            case "Long": {
                chart.push(new NoteLong([
                    {lane: column[note.column], time: note.timing, type: "NOTE_SINGLE"},
                    {lane: column[note.column], time: note.endTiming, type: "NOTE_SINGLE"},
                ]));
                break;
            }
            case "Slide_Start_A":
            case "Slide_A": {
                var body = getSlide(data, note.index, "A");
                var bodyIndex = body.map(part => part.index);
                data = data.filter(note => !bodyIndex.includes(note.index));
                if (body.length > 0)
                    chart.push(buildSlide(body, "A"));
                break;
            }
            case "Slide_Start_B":
            case "Slide_B": {
                var body = getSlide(data, note.index, "B");
                var bodyIndex = body.map(part => part.index);
                data = data.filter(note => !bodyIndex.includes(note.index));
                if (body.length > 0)
                    chart.push(buildSlide(body, "B"));
                break;
            }
        }
    });
    return chart;
}

function getSlide(data, startIndex, group) {
    var nodes = [];
    for (var index = 0; index < data.length; index++) {
        var note = data[index];
        if (note.index >= startIndex) {
            if (note.type == "Slide_Start_" + group)
                nodes.push(note);
            if (note.type == "Slide_Start_Skill_" + group)
                nodes.push(note);
            if (note.type == "Slide_" + group)
                nodes.push(note);
            if (note.type == "Slide_End_" + group) {
                nodes.push(note);
                break;
            }  
            if (note.type == "Slide_End_Flick_" + group) {
                nodes.push(note);
                break;
            }
        }
    }
    return nodes;
}

function buildSlide(data, group) {
    var nodes = [];
    for (var index = 0; index < data.length; index++) {
        var note = data[index];
        if (note.type == "Slide_Start_" + group)
        nodes.push({lane: column[note.column], time: note.timing, type: "NOTE_SINGLE"});
        if (note.type == "Slide_Start_Skill_" + group)
            nodes.push({lane: column[note.column], time: note.timing, type: "NOTE_SKILL"});
        if (note.type == "Slide_" + group)
            nodes.push({lane: column[note.column], time: note.timing});
        if (note.type == "Slide_End_" + group) {
            nodes.push({lane: column[note.column], time: note.timing, type: "NOTE_SINGLE"});
            break;
        }  
        if (note.type == "Slide_End_Flick_" + group) {
            nodes.push({lane: column[note.column], time: note.timing, type: "NOTE_FLICK"});
            break;
        }
    }
    return new NoteLong(nodes);
}