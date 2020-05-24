const discord = require('discord.js');
const express = require('express');
const path = require('path');
const youTube = require('simple-youtube-api');

//User imports 
const discordFunctions = require('./discordFunctions')

//Express routes import
const indexRoute = require('../routes/index');

//Path and Env variables Setup
const port = process.env.PORT || 3000;
const token = process.env.TOKEN;
const youtubeApiKey = process.env.YOUTUBE_API_KEY;

const PREFIX = '?';
const publicDirectoryPath = path.join(__dirname, "../public");
const bulmaPath = path.join(__dirname, "../node_modules/bulma/css/");

//Youtube Setup 
const youtube = new youTube(youtubeApiKey);

//DiscordJS Setup
const messageEmbedRoe = new discord.MessageEmbed();
const client = new discord.Client();

//Express Setup
const app = express();
app.set("view engine", "ejs");

//Express Routes
app.use('/', indexRoute);
app.use(express.static(publicDirectoryPath));
app.use("/bulma", express.static(bulmaPath));

//Discord JS Code
client.once('ready', () => {
    console.log('client is working!'); //client is working
});

client.on('message', message => {
    if (message.author.bot) return;
    if (message.content.charAt[0] != prefix) return;
    const serverQueue = discordFunctions.queue.get(message.guild.id);
    const args = message.content.substring(PREFIX.length).split(" ");

    switch (args[0]) {
        case 'play':
            youtube.search(args[1], limit = 1).then(results => {
                const link = results[0].url
                console.log("Got link: " + link);
                discordFunctions.start(message, serverQueue, link);
            })
            break;

        case 'skip':
            discordFunctions.skip(message, serverQueue);
            break;

        case 'stop':
            discordFunctions.stop(message, serverQueue);
            break;

        case 'creator':
            discordFunctions.creator(message, messageEmbedRoe);
            break;

        case 'download':
            youtube.search(args[1], limit = 1).then(results => {
                const link = results[0].url
                console.log("Got link: " + link);
                discordFunctions.download(message, serverQueue, discord, link);
            })
            break;

        case 'support':
            discordFunctions.donate(message);
            break;

    }
});

//Discord JS Login
client.login(token);

//Express Server Start
app.listen(port, console.log("Server running on port : " + port));