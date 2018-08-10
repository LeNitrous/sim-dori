var data = {};
var region =  _getURLParameter("region") || "jp";
var preview = {};
var nowPlaying = {
    id: undefined,
    audio: undefined,
    overlay: undefined
};

$(document).ready(function() {
    $.when(
        $.getJSON("https://api.bandori.ga/v1/jp/music"),
        $.getJSON("https://api.bandori.ga/v1/en/music"),
        $.getJSON("https://api.bandori.ga/v1/kr/music"),
        $.getJSON("https://api.bandori.ga/v1/tw/music")
    ).done(function(jp, en, kr, tw) {
        data.jp = jp[0].data,
        data.en = en[0].data,
        data.kr = kr[0].data,
        data.tw = tw[0].data
        generate(data[region]);
    });
    
    $(".select.server").change(function() {
        region = this.value;
        applySortAndFilter(data[region]);
    });
    $(".select.tag").change(function() {
        applySortAndFilter(data[region]);
    });
    $(".select.band").change(function() {
        applySortAndFilter(data[region]);
    });
    $(".select.sort").change(function() {
        applySortAndFilter(data[region]);
    });
    $(".select.reverse").change(function() {
        applySortAndFilter(data[region]);
    });
    $(".songs").on("click", ".songSelect.jacket.overlay", function() {
        var id = $(this).parents()[2].id.padStart(3, "0");
        if (preview[id] == undefined) {
            preview[id] = new Audio(`https://res.bandori.ga/assets/sound/bgm${id}_chorus.mp3`);
        }
        if (nowPlaying.id) {
            if (nowPlaying.audio.paused) {
                nowPlaying.id = id;
                nowPlaying.button = this;
                $(nowPlaying.button).addClass("nowPlaying");
                $(nowPlaying.button).children().attr("class", "fa fa-stop");
                nowPlaying.audio = preview[id];
                nowPlaying.audio.play();
            }
            else if (nowPlaying.id != id && !nowPlaying.audio.paused) {
                nowPlaying.audio.pause();
                nowPlaying.audio.currentTime = 0;
                $(nowPlaying.button).removeClass("nowPlaying");
                $(nowPlaying.button).children().attr("class", "fa fa-play");
                nowPlaying.id = id;
                nowPlaying.button = this;
                $(nowPlaying.button).addClass("nowPlaying");
                $(nowPlaying.button).children().attr("class", "fa fa-stop");
                nowPlaying.audio = preview[id];
                nowPlaying.audio.play();
            }
            else if (nowPlaying.id == id && !nowPlaying.audio.paused) {
                nowPlaying.audio.pause();
                nowPlaying.audio.currentTime = 0;
                $(nowPlaying.button).removeClass("nowPlaying");
                $(nowPlaying.button).children().attr("class", "fa fa-play");
            }
        }
        else {
            nowPlaying.id = id;
            nowPlaying.button = this;
            $(nowPlaying.button).addClass("nowPlaying");
            $(nowPlaying.button).children().attr("class", "fa fa-stop");
            nowPlaying.audio = preview[id];
            nowPlaying.audio.play();
            nowPlaying.audio.addEventListener("loadstart", function() {
                $(nowPlaying.button).children().attr("class", "fa fa-spinner fa-spin");
            });
            nowPlaying.audio.addEventListener("canplaythrough", function() {
                $(nowPlaying.button).children().attr("class", "fa fa-stop");
            });
            nowPlaying.audio.addEventListener("ended", function() {
                nowPlaying.audio.pause();
                nowPlaying.audio.currentTime = 0;
                $(nowPlaying.button).removeClass("nowPlaying");
                $(nowPlaying.button).children().attr("class", "fa fa-play");
            });
        }
    });
    $(".songs").on("click", ".songSelect.diff", function() {
        var id = $(this).parents()[5].id;
        var diff = $(this).text();
        var newTab = window.open(`player.html?id=${id}&diff=${diff.toLowerCase()}`);
        if (newTab) {
            newTab.focus();
        }
        else {
            alert("Please allow popups for this website.");
        }
    });
});

function applySortAndFilter(data) {
    if (nowPlaying.audio) {
        nowPlaying.audio.pause();
        nowPlaying.audio.currentTime = 0;
    }
    var tag = $(".select.tag").val();
    var sort = $(".select.sort").val();
    var band = $(".select.band").val();
    var returns = ($(".select.reverse").is(":checked")) ? [-1, 1] : [1, -1];
    var sortFunction = {
        id: function(a, b) {
            if (a.musicId < b.musicId)
                return returns[0];
            else if (a.musicId > b.musicId)
                return returns[1];
        },
        diff: function(a, b) {
            if (a.difficulty[1] < b.difficulty[1])
                return returns[0];
            else if (a.difficulty[1] > b.difficulty[1])
                return returns[1];
            else
                return 0;
        },
        date: function(a, b) {
            if (a.publishedAt < b.publishedAt)
                return returns[0];
            else if (a.publishedAt > b.publishedAt)
                return returns[1];
            else
                return 0;
        }
    }
    data.sort(sortFunction[sort]);
    if (!isNaN(band)) {
        data = data.filter(music => music.bandId == band);
    }
    else if (band == "other") {
        data = data.filter(music => music.bandId > 5);
    }
    if (tag != "all") {
        data = data.filter(music => music.tag == tag);
    }
    generate(data);
}

function generate(data) {
    var now = new Date();
    $(".songs").empty();
    data.forEach(music => {
        var desc = (music.description != undefined) ? music.description : "";
        var tag = (music.tag == "normal") ? "Original" : "Cover";
        var data = `
            <div class="row">
                <div class="col-xs-12">
                    <div class="songSelect box" id="${music.musicId}">
                        <div class="row start-xs">
                            <div class="songSelect jacket">
                                <div class="songSelect jacket image" style="background-image: url('https://res.bandori.ga/assets/musicjacket/${music.jacketImage}_jacket.png');"></div>
                                <div class="songSelect jacket overlay">
                                    <i class="fa fa-play"></i>
                                </div>
                            </div>
                            <div class="col-xs">
                                <div class="songSelect metadata">
                                    <div class="row">
                                        <div class="col-xs">
                                            <div class="songSelect title">${music.title}</div>
                                        </div>
                                        <div class="col-xs end-xs" id="icon-tray${music.musicId}"">     
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-xs">
                                            <div class="songSelect artist">${music.bandName}</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="songSelect metadata">
                                    <div class="row">
                                        <div class="col-xs">
                                            <div class="songSelect desc">${desc}</div>
                                        </div>
                                        <div class="col-xs-3">
                                            <div class="songSelect tag">${tag}</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="songSelect metadata" id="diffs${music.musicId}">
                                    <div class="row">
                                        <div class="col-xs">
                                            <div class="songSelect diff easy">EASY</div>
                                        </div>
                                        <div class="col-xs">
                                            <div class="songSelect diff normal">NORMAL</div>
                                        </div>
                                        <div class="col-xs">
                                            <div class="songSelect diff hard">HARD</div>
                                        </div>
                                        <div class="col-xs">
                                            <div class="songSelect diff expert">EXPERT</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        $(".songs").append(data);
        if (music.publishedAt > now) {
            $(`#icon-tray${music.musicId}`).append(`<i class="fa fa-clock-o" id="icon" title="Releases on ${formatDate(new Date(parseInt(music.publishedAt)))}"></i>`);
        }
        $(`#icon-tray${music.musicId}`).append(`
            <a href="https://res.bangdream.ga/assets/sound/${music.bgmId}.mp3" download="${music.title} (Game Size).mp3"><i class="fa fa-download" id="icon"></i></a>
        `);
        $(`#icon-tray${music.musicId}`).append(`
            <a onclick="javascript:_createOsuMappableZip(${music.musicId})"><i class="fa fa-download" id="icon" style="color: #f1d2fb;"></i></a>
        `);
        if (music.difficulty.length >= 5) {
            $(`.songSelect.metadata#diffs${music.musicId} > .row`).append(`<div class="col-xs"><div class="songSelect diff special">SPECIAL</div></div>`);
        }
    });
}

function formatDate(date) {
    var monthNames = [
      "January", "February", "March",
      "April", "May", "June", "July",
      "August", "September", "October",
      "November", "December"
    ];
  
    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();
    var hour = date.getHours();
    var min = date.getMinutes();
    var meridian = (hour >= 12) ? "PM" : "AM";
    hour %= 12;
    hour = (hour) ? hour : 12;
    min = (min < 10) ? "0" + min : min;

    return `${monthNames[monthIndex]} ${day}, ${year}, ${hour}:${min}${meridian} (${Intl.DateTimeFormat().resolvedOptions().timeZone})`;
}