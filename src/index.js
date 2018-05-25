$(document).ready(function() {
    $.getJSON("https://api.bangdream.ga/v1/jp/music",function(response){
        response.data.forEach(music => {
            var data = [
                `<td></td>`,
                `<td>${music.bandName} - ${music.title}</td>`,
                `<td><a href="player.html?id=${music.musicId}&diff=easy">Easy</a></td>`,
                `<td><a href="player.html?id=${music.musicId}&diff=normal">Normal</a></td>`,
                `<td><a href="player.html?id=${music.musicId}&diff=hard">Hard</a></td>`,
                `<td><a href="player.html?id=${music.musicId}&diff=expert">Expert</a></td>`,
            ];
            var row = `<tr>${data.join("")}</tr>`;
            $("#songTable").append(row);
        });
    });
});