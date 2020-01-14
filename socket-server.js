const fs = require('fs');
const WebSocketServer = require('ws').Server;
// const readline = require('readline');
const standardInput = process.stdin;
// const game = { // ovo je izgled utakmice
//     id: 0,
//     home: {
//         name: "Kansas City Chiefs",
//         short: "KC",
//         record: {
//             win: 11,
//             loss: 5
//         }
//     },
//     away: {
//         name: "Tennessee Titans",
//         short: "TEN",
//         record: {
//             win: 9,
//             loss: 7
//         }
//     },
//     stadium: "Arrowhead, Kansas City, MO",
//     // kickoffTime:
//     score: {
//         home: 0,
//         away: 0
//     },
//     time: {
//         quarter: "2nd",
//         clock: {
//             min: 7,
//             sec: 55
//         }
//     },
//     possession: "KC",
//     ballSpot: {
//         yd: 34,
//         side: "KC"
//     },
//     driveStatus: {
//         down: 2,
//         yd: 4
//     }
// };
// const gf = fs.readFileSync('games.json', 'utf-8');
// console.log(gf);
const games = JSON.parse(fs.readFileSync('games.json', 'utf-8'));
const connections = [];
standardInput.setEncoding('utf-8');
standardInput.on('data', data => {
    console.log('primio sam: %s', data);
    if (data === 'exit\n') {
        console.log("WARNING: prekidam rad servera...");
        process.exit();
    }

    // vrste updatea: rezultat, vrijeme
    let input = data.split("-");
    switch (input[0]) {
        case "TIME": // mijenjaj vrijeme
            update_time(JSON.parse(input[1]));
            break;
        case "SCORE": // mijenjaj rezultat
            update_score(JSON.parse(input[1]));
            break;
        default: // ne valja input
            console.log("WARNING: neispravna update naredba '%s'", input);
    }
});
// init_data();
const wss = new WebSocketServer({"port": 8081});

// todo: baratanje ulaznim podacima
// todo: rad websocket servera s porukama
wss.on('connection', (ws, req) => {
    const client_remote_address = req.connection.remoteAddress;
    console.log("LOG: spojen novi klijent s '%s'! Šaljem sve utakmice...", client_remote_address);
    connections.push(ws);
    /*
    format poruka:
    {vrsta poruke: sve, dodaj jednu (opt), makni jednu (opt), update
    sadrzaj: lista, jedna (maybe)
     */
    let msg = {};
    msg.type = "all";
    msg.games = games; // todo: zasad saljem sve podatke, a trebao bi samo sazetke, a onda na klik prikazati interesantnu utakmicu sa svim podacima
    ws.send(JSON.stringify(msg));

    ws.on('close', function () {
        console.log("LOG: Odspojen klijent s '%s'...", client_remote_address);
    })
});

// function init_data() {
//     games.push(game);
// }

function update_time(update) {
    if (update.id === null) {
        // error log
        return;
    } else if (update.time === null) {
        // error log
        return;
    }

    let game = retrieve_game_for_id(update.id);
    if (game === null) {
        //error log
        return;
    }
    game.time = update.time;
    // broadcast?
    broadcast_game_update(game);
}

function update_score(update) {
    console.log("mijenjam rezultat za utakmicu %s", update.id);
    if (update.id === null) {
        // error log
        return;
    } else if (update.score === null) {
        // error log
        return;
    }

    let game = retrieve_game_for_id(update.id);
    if (game === null) {
        console.log("Ne postoji utakmica s id '%d'", update.id);
        return;
    }
    game.score = update.score;
    broadcast_game_update(game);
}

function retrieve_game_for_id(id) {
    // console.log(games);
    for (let i = 0; i < games.length; i++) {
        if (games[i].id === id) {
            return games[i];
        }
    }
    // for (let g in games) {
    //     console.log(g.toString());
    //     // console.log("Usporedjujem %d i %d", g.id, id);
    //     if (g.id === id) {
    //         return g;
    //     }
    // }

    return null;
}

function broadcast_game_update(game) {
    let msg = {};
    msg.type = "update";
    msg.game = game;
    connections.forEach(ws => ws.send(JSON.stringify(msg)));
}
