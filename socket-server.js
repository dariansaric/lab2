const WebSocketServer = require('ws').Server;
// const readline = require('readline');
const standardInput = process.stdin;
const game = { // ovo je izgled utakmice
    id: 0,
    home: {
        name: "Kansas City Chiefs",
        short: "KC",
        record: {
            win: 11,
            loss: 5
        }
    },
    away: {
        name: "Tennessee Titans",
        short: "TEN",
        record: {
            win: 9,
            loss: 7
        }
    },
    stadium: "Arrowhead, Kansas City, MO",
    // kickoffTime:
    score: {
        home: 0,
        away: 0
    },
    time: {
        quarter: "1st",
        clock: {
            min: 15,
            sec: 0
        }
    }
}; // todo: pametniji način smisljanja utakmica
const games = [];
standardInput.setEncoding('utf-8');
standardInput.on('data', data => {
    console.log('primio sam: %s', data);
    if (data === 'exit\n') {
        process.exit();
    }
});
init_data();
const wss = new WebSocketServer({"port": 8081});

// todo: baratanje ulaznim podacima
// todo: definiranje rezultata
// todo: rad websocket servera s porukama
wss.on('connection', (ws, req) => {
    const client_remote_address = req.connection.remoteAddress;
    console.log("LOG: spojen novi klijent s '%s'! Šaljem sve utakmice...", client_remote_address);
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

function init_data() {
    games.push(game);
}
