const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const events = require('events');
const uniqid = require("uniqid");
const Database = require('./lib/database.js');
const Redis = require('./lib/redis.js');

(async () => {
    //  Allows us to broadcast events in our application
    //  This is not the only way to do this - you can use
    //  socket.io, for example.
    const emitter = new events.EventEmitter();

    //  We pass the emitter to our redis class so we can
    //  use it to broadcast an event.
    const redis = new Redis(emitter);
    // redis.delete_messages();

    //  Init database for later
    let database = new Database('./api.db');

    //  We're listening for new messages
    emitter.on('new-message', function (message) {
        //  While this works - make sure you check the requirements for Lab 4.
        //  Here, you will still need to insert the record into the SQLite database

        console.log('New message!', 'Find me in ./server.js', JSON.stringify(message));

        database.add_message(message.status, message.message, (new Date(message.timestamp).toString()));

        //  Use sockets to talk to the front-end/client/dashboard.mustache
        io.emit('new-message', message);
    });

    // // update sqlite db
    // database.delete_messages();
    // let messages = await redis.get_messages().then(res => {
    //     const keys = Object.keys(res);
    //     for (let key in keys) {
    //         let date = new Date(res[key].timestamp);
    //         database.add_message(res[key].status, res[key].message, date.toString());
    //     }
    // });


    // include the mustache template engine for express
    const mustacheExpress = require('mustache-express');

    // registers the mustache engine with Express
    app.engine("mustache", mustacheExpress());

    // sets mustache to be the view engine
    app.set('view engine', 'mustache');

    // sets /views to be the /views folder
    // files should have the extension filename.mustache
    app.set('views', __dirname + '/views');

    app.get('/dashboard', async function (req, res) {

        let messages = await database.get_messages();
        console.log(messages);

        let data = {
            title: "Dashboard",
            items: messages,
        }

        res.render('dashboard', data);

    });

    app.get(/^(.+)$/, function (req, res) {
        console.log("static file request: " + req.params[0]);
        res.sendFile(__dirname + req.params[0]);
    });

    var server = http.listen(4000, function () {
        console.log("server listening...");
    });
})();