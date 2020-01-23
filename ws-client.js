const wsUri = "ws://localhost:8081";
let results;
let ws;
$(document).ready(function () {
    if (!init()) {
        return;
    }
    createSocket();
});

/**
 * Checks if the browser supports web socket.
 */
function init() {
    if (!window.WebSocket) {
        alert("This browser doesn't support WebSocket!!");
        return false;
    }
    results = $("#results");
    return true;
}

/**
 * Creates the client web socket.
 */
function createSocket() {
    ws = new WebSocket(wsUri);
    ws.onopen = evt => onOpen(evt);
    ws.onclose = evt => onClose(evt);
    ws.onerror = evt => onError(evt);
    ws.onmessage = evt => onMessage(evt);
}

/**
 * Refreshes the connection status on the page.
 */
function onOpen(evt) {
    $("#con-status").text("Connected");
}

/**
 * Refreshes the connection status on the page, and tries to reestablish the connection.
 */
function onClose(evt) {
    $("#con-status").text("Disconnected");
    createSocket();
}

/**
 * Refreshes the connection status.
 */
function onError(evt) {
    $("#con-status").text("Something went wrong!!");
}

/**
 * Parses game update messages.
 * @param evt message
 */
function onMessage(evt) {
    let msg = JSON.parse(evt.data);
    switch (msg.type.toLowerCase()) {
        case "all":
            // alert("Primljeni svi rezultati!!");
            $("#res-table tbody").empty();
            msg.games.forEach(g => add_table_row(g));
            break;
        case "update":
            // alert("Primljen update");
            update_table_row(msg.game);
            break;
        default:
            alert("Primljena neispravna poruka");

    }
}

/**
 * Creates a new game table entry.
 * @param game new game
 */
function add_table_row(game) {
    let html = "<tr id=tr_" + game.id + ">";
    html += form_game_table_row(game);
    html += "</tr>";

    $("#res-table tbody").append(html);
}

/**
 * Updates game data display.
 *
 * @param game an existing game
 */
function update_table_row(game) {
    $("#tr_" + game.id).html(form_game_table_row(game));
}

/**
 * Converts an ordinal number to it's string representation.
 *
 * @param down number of the football down
 * @returns {string|null}
 */
function convert_number_to_string(down) {
    switch (down) {
        case 1:
            return "1st";
        case 2:
            return "2nd";
        case 3:
            return "3rd";
        case 4:
            return "4th";
        default:
            return null;
    }
}

/**
 * Returns a HTML table row for the specified game.
 *
 * @param game a football game
 * @returns {string} game's HTML table row representation
 */
function form_game_table_row(game) {

    let html = "<td id='" + game.id + "-away'>" + game.away.name +
        (game.possession === game.away.short ? "&middot" : "") + "</td>"; // dodaj away
    html += "<td id='" + game.id + "-score'>" + game.score.away + " : " + game.score.home + "</td>"; // dodaj score
    html += "<td id='" + game.id + "-home'>" + game.home.name +
        (game.possession === game.home.short ? "&middot" : "") + "</td>"; // dodaj home
    html += "<td id='" + game.id + "-time'>" + convert_number_to_string(game.time.quarter) + " "
        + game.time.clock.min + ":" + ("%0" + game.time.clock.sec).slice(-2) + "</td>"; // dodaj time
    html += "<td id='" + game.id + "-ballSpot'>" + game.ballSpot.side + " " + check_yards(game.ballSpot.yd) + "</td>"; // dodaj lokaciju lopte
    html += "<td id='" + game.id + "-driveStatus'>" + convert_number_to_string(game.driveStatus.down) +
        " & " + check_yards(game.driveStatus.yd) + "</td>"; // dodaj down
    html += "<td id='" + game.id + "-stadium'>" + game.stadium + "</td>"; // dodaj stadium
    return html;
}

/**
 * Returns yards required for a new first down. If it's less than 1, 'inches' string is returned.
 *
 * @param yd yards required for a new first down
 * @returns {*} number of yards or 'inches'
 */
function check_yards(yd) {
    return yd < 1 ? "inches" : yd;
}