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

// Create a template .osu for mappers
function _createOsuMappableZip(CHART_ID) {
    CHART_ID += "";
    document.body.style.cursor = "wait";
    var promises = [
        fetch(`https://api.bangdream.ga/v1/jp/music/chart/${CHART_ID}/expert`),
        fetch(`https://api.bangdream.ga/v1/jp/music/${CHART_ID}`),
    ];
    Promise.all(promises)
        .then(function(data) {
            Promise.all([
                data[0].json(),
                data[1].json(),
            ])
            .then(function(data) {
                getFile(`https://res.bangdream.ga/assets/sound/bgm` + CHART_ID.padStart(3, "0") + '.mp3', null, function(buffer) {
                    var osz = new JSZip();
                    osz.file(`timing.osu`, __generateOsuFile(data[1], data[0]))
                    osz.file("audio.mp3", buffer, {binary: true});
                    osz.generateAsync({type:"blob"})
                        .then(function(blob) {
                            saveAs(blob, `bgm${CHART_ID.padStart(3, "0")}.osz`);
                            document.body.style.cursor = "default";
                        });
                });
            })
        })
        .catch(error => console.error(error));
}

function __generateOsuFile(meta, chart) {
    return `osu file format v14

[General]
AudioFilename: audio.mp3
AudioLeadIn: 0
PreviewTime: ${__getPreviewTime(chart)}
Countdown: 0
SampleSet: Normal
LetterboxInBreaks: 0
WidescreenStoryboard: 1

[Editor]
Bookmarks:
DistanceSpacing: 1
BeatDivisor: 4
GridSize: 4
TimelineZoom: 2

[Metadata]
${__generateOsuMetadata(meta)}

[Difficulty]
HPDrainRate: 5
CircleSize: 5
OverallDifficulty: 5
ApproachRate: 5
SliderMultiplier: 1.4
SliderTickRate: 1

[Events]
//Background and Video events
//Break Periods
//Storyboard Layer 0 (Background)
//Storyboard Layer 1 (Fail)
//Storyboard Layer 2 (Pass)
//Storyboard Layer 3 (Foreground)
//Storyboard Sound Samples

[TimingPoints]
${__generateOsuTimingPoints(chart)}

[HitObjects]


`;
}

function __generateOsuMetadata(meta) {
    var bandsUnicode = [
        "Poppin'Party", "Afterglow", "\u30CF\u30ED\u30FC\u3001\u30CF\u30C3\u30D4\u30FC\u30EF\u30FC\u30EB\u30C9\uFF01", "Pastel\uFF0APalettes", "Roselia"
    ];
    var bands = [
        "Poppin'Party", "Afterglow", "Hello, Happy World!", "Pastel*Palettes", "Roselia"
    ];
    var tags = [
        "Toyama Kasumi \u6238\u5C71 \u9999\u6F84 Ushigome Rimi \u725B\u8FBC \u308A\u307F Yamabuki Saaya \u5C71\u5439 \u6C99\u7DBE Ichigaya Arisa \u5E02\u30F6\u8C37 \u6709\u54B2 Hanazono Tae \u82B1\u5712 \u305F\u3048 Terakawa Aimi \u5BFA\u5DDD\u611B\u7F8E Nishimoto Rimi \u897F\u672C \u308A\u307F Ohashi Ayaka \u5927\u6A4B \u5F69\u9999 Itou Ayasa \u4F0A\u85E4 \u5F69\u6C99 Otsuka Sae \u5927\u585A\u7D17\u82F1",
        "Aoba Moca \u9752\u8449 \u30E2\u30AB Mitake Ran \u7F8E\u7AF9 \u862D Uehara Himari \u4E0A\u539F \u3072\u307E\u308A Udagawa Tomoe \u5B87\u7530\u5DDD \u5DF4 Hazawa Tsugumi \u7FBD\u6CA2 \u3064\u3050\u307F Misawa Sachika \u4E09\u6FA4 \u7D17\u5343\u9999 Sakura Ayane \u4F50\u5009 \u7DBE\u97F3 Katou Emiri \u52A0\u85E4 \u82F1\u7F8E\u91CC Hikasa Yoko \u65E5\u7B20 \u967D\u5B50 Kanemoto Hisako \u91D1\u5143 \u5BFF\u5B50",
        "Tsurumaki Kokoro \u5F26\u5DFB \u3053\u3053\u308D Okusawa Misaki \u5965\u6CA2\u7F8E\u54B2 Michelle \u5965\u6CA2 \u7F8E\u54B2 Seta Kaoru \u702C\u7530 \u85AB Matsubara Kanon \u677E\u539F \u82B1\u97F3 Kitazawa Hagumi \u5317\u6CA2 \u306F\u3050\u307F Miku Itou \u7F8E\u6765 \u4F0A\u85E4 Kurosawa Tomoyo \u9ED2\u6CA2 \u3068\u3082\u3088 Tadokoro Azusa \u7530\u6240 \u3042\u305A\u3055 Toyota Moe \u8C4A\u7530 \u840C\u7D75 Yoshida Yuri \u6709\u91CC \u5409\u7530",
        "Maruyama Aya \u4E38\u5C71 \u5F69 Hikawa Hina \u6C37\u5DDD \u65E5\u83DC Shirasagi Chisato \u767D\u9DFA \u5343\u8056 Wakamiya Eve \u82E5\u5BAE \u30A4\u30F4 Yamato Maya \u5927\u548C \u9EBB\u5F25 Maeshima Ami \u524D\u5CF6\u4E9C\u7F8E Ozawa Ari \u5C0F\u6FA4\u4E9C\u674E Uesaka Sumire \u4E0A\u5742 \u3059\u307F\u308C Hata Sawako \u79E6 \u4F50\u548C\u5B50 Nakagami Ikumi \u80B2\u5B9F \u4E2D\u4E0A",
        "Minato Yukina \u6E4A\u53CB\u5E0C\u90A3 Hikawa Sayo \u6C37\u5DDD\u7D17\u591C Imai Lisa \u4ECA\u4E95\u30EA\u30B5 Udagawa Ako \u5B87\u7530\u5DDD\u3042\u3053 Shirokane Rinko \u767D\u91D1\u71D0\u5B50 \u30ED\u30BC\u30EA\u30A2 Aiba Aina \u76F8\u7FBD\u3042\u3044\u306A Akesaka Satomi \u660E\u5742\u8061\u7F8E Endou Yurika \u9060\u85E4\u3086\u308A\u304B Kudou Haruka \u5DE5\u85E4\u6674\u9999 Sakuragawa Megu \u685C\u5DDD\u3081\u3050"
    ];
    return [
        `Title:Unknown Title`,
        `TitleUnicode:${meta.title}`,
        `Artist:${bands[meta.bandId - 1]}`,
        `ArtistUnicode:${bandsUnicode[meta.bandId - 1]}`,
        `Creator:BanG Dream! Girls Band Party!`,
        `Version:Timing`,
        `Source:\u30D0\u30F3\u30C9\u30EA\uFF01\u30AC\u30FC\u30EB\u30BA\u30D0\u30F3\u30C9\u30D1\u30FC\u30C6\u30A3\uFF01`,
        `Tags:BanG Dream! Girls Band Party! bandori garupa ${tags[meta.bandId - 1]}`,
        `BeatmapID:-1`,
        `BeatmapSetID:-1`
    ].join('\n');
}

function __getPreviewTime(chart) {
    var point = chart.objects.filter(object => object.effect === "CmdFeverStart").pop();
    return Math.floor(point.timing * 1000);
}

function __generateOsuTimingPoints(chart) {
    var timing = [];
    var points = chart.objects.filter(object => object.type === "System");
    timing.push(`0,${60000 / chart.metadata.bpm},4,0,0,100,1,0`);
    points.forEach(point => {
        var time = Math.floor(point.timing * 1000);
        switch(point.effect) {
            case "BPMChange": {
                var mpb = 60000 / point.value;
                timing.push(`${time},${mpb},4,0,0,100,1,0`);
            }
            case "CmdFeverStart": {
                timing.push(`${time},-100,4,0,0,100,0,1`);
            }
            case "CmdFeverEnd": {
                timing.push(`${time},-100,4,0,0,100,0,0`);
            }
        }
    });
    return timing.join('\n');
}