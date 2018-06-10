var preview = {};
var nowPlaying = {
    id: undefined,
    audio: undefined,
    overlay: undefined
};

$(document).ready(function() {
    $.getJSON("https://api.bangdream.ga/v1/jp/music",function(response){
        response.data.forEach(music => {
            music.description = (music.description != undefined) ? music.description : "";
            music.tag = (music.tag == "normal") ? "Original" : "Cover";
            var data = `
                <div class="row center-xs">
                    <div class="col-xs-10 col-sm-8 col-md-6 col-lg-5">
                        <div class="songSelect box" id="${music.musicId}">
                            <div class="row start-xs">
                                <div class="songSelect jacket">
                                    <div class="songSelect jacket image" style="background-image: url('https://res.bangdream.ga/assets/musicjacket/${music.jacketImage}_jacket.png');"></div>
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
                                                <div class="songSelect desc">${music.description}</div>
                                            </div>
                                            <div class="col-xs-3">
                                                <div class="songSelect tag">${music.tag}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="songSelect metadata">
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
            $("body").append(data);
        });
        $("body").on("click", ".songSelect.jacket.overlay", function() {
            var id = $(this).parents()[2].id.padStart(3, "0");
            if (preview[id] == undefined) {
                preview[id] = new Audio(`https://res.bangdream.ga/assets/sound/bgm${id}_chorus.mp3`);
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
                nowPlaying.audio.addEventListener("ended", function() {
                    nowPlaying.audio.pause();
                    nowPlaying.audio.currentTime = 0;
                    $(nowPlaying.button).removeClass("nowPlaying");
                    $(nowPlaying.button).children().attr("class", "fa fa-play");
                });
            }
        });
        $("body").on("click", ".songSelect.diff", function() {
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
});