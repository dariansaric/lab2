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
const commands = ["multiple", "score", "time", "driveStatus", "possession", "ballSpot"];
standardInput.setEncoding('utf-8');
// procesiranje upisa updatea
standardInput.on('data', data => {
    console.log('primio sam: %s', data);
    if (data === 'exit\n') {
        console.log("WARNING: prekidam rad servera...");
        process.exit();
    }

    // todo: vise updateova istovremeno
    let input = data.split("-");
    if (commands.includes(input[0])) {
        if (input[0] === "multiple") {
            JSON.parse(input[1]).forEach(mu => update_game(mu.update, mu.type))
        } else {
            update_game(JSON.parse(input[1]), input[0]);
        }
    } else {
        console.log("ERROR: Invalid command '%s'", input[0]);
    }
})
;
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

function update_game(update, type) {
    console.log("mijenjam %s za utakmicu %s", type, update.id);
    if (update.id === null) {
        // error log
        return;
    } else if (update[type] === null) {
        // error log
        return;
    }

    let game = retrieve_game_for_id(update.id);
    if (game === null) {
        console.log("Ne postoji utakmica s id '%d'", update.id);
        return;
    }
    game[type] = update[type];
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
    let msg = {type: "update", game: game};
    connections.forEach(ws => ws.send(JSON.stringify(msg)));
}

// naredbe za testiranje promjena
// score-{"id":0,"score":{"home":24,"away":9}}
// time-{"id":0,"time":{"quarter":2,"clock":{"min":1,"sec":9}}}
// driveStatus-{"id":1, "driveStatus":{"down":4,"yd":0}}
// possession-{"id":1,"possession":"SF"}
// ballSpot-{"id":1,"ballSpot":{"yd":20,"side":"SF"}}
// multiple-[{"type":"ballSpot", "update":{"id":1, "ballSpot":{"yd":20, "side":"SF"}}}, {"type":"possession", "update":{"id":0, "possession":"KC"}}]
// multiple-[{"type":"ballSpot", "update":{"id":1, "ballSpot":{"yd":20, "side":"GB"}}}, {"type":"possession", "update":{"id":0, "possession":"TEN"}},{"type":"score", "update":{"id":0,"score":{"home":28, "away":12}}}]
