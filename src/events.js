var Events = {};

Events.onNoteHit = (note) => {

}

Events.onSeekForward = () => {

}

Events.onSeekRewind = () => {
    beatmap.objects.forEach(note => {
        if (note.type != "NOTE_LONG" && note.time >= curTime) {
            note.isHit = false;
        }
        else if (note.type == "NOTE_LONG") {
            note.children.forEach(child => {
                if (child.time >= curTime) {
                    child.isHit = false;
                }
            })
        }
    });
}

Events.onMusicPlay = () => {

}

Events.onMusicPause = () => {

}

Events.onMusicEnd = () => {

}