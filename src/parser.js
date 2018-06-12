function _parseBeatmap(data) {
    var notes = [];
    var timing = [];

    timing.push(new TimingPoint("BPM", 0, 0, data.metadata.bpm));

    var chart = data.objects;

    chart.forEach((object, index) => {
        if (object.type === "Object") {
            object.index = index;
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
                        // TODO: Slide Group A
                        break;
                    }
                    case "SlideStart_B":
                    case "Slide_B": {
                        // TODO: Slide Group B
                        break;
                    }
                }
            }
            else {
                // TODO: Long Notes
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