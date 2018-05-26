function _getURLParameter(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
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

function _timeFormatToSeconds(timestamp) {
    var seconds = 0;
    timestamp = timestamp.split(":");
    seconds += Number(timestamp[0]) * 60;
    seconds += Number(timestamp[1]);
    seconds += Number(timestamp[2]) / 1000;
    return seconds;
}