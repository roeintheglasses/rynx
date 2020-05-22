const {
    Client,
    MessageEmbed,
    Attachment
} = require('discord.js');
const ytdl = require('ytdl-core');
// const musicFunctions = require('./musicFunctions')
const messageEmbedRoe = new MessageEmbed();
const client = new Client();

//Prefixes and Enviourment Variables
const token = process.env.TOKEN;
const port = process.env.PORT || 3000;
const PREFIX = '?';


//Express Code
const express = require('express');
const app = express();


//Setting up routes
// const usersRoute = require('../routes/users');
// const indexRoute = require('../routes/index');

//Express Code
app.use
app.get('/', (req, res) => {
    res.render("index")
})

//Discord JS Code
client.once('ready', () => {
    console.log('client is working!'); //client is working
});

//Using a map instead of an array to seperate bot commands over different servers
const queue = new Map();

client.on('message', message => {
    const serverQueue = queue.get(message.guild.id);
    let args = message.content.substring(PREFIX.length).split(" ");
    switch (args[0]) {
        case 'play':
            start(message, serverQueue, args);
            break;

        case 'skip':
            skip(message, serverQueue);
            break;

        case 'stop':
            stop(message, serverQueue);
            break;

        case 'creator':
            creator(message);

            // case 'bhawda':
            //     bhawda(message, serverQueue);
    }
});

async function start(message, serverQueue, args) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.channel.send('Are sir, vc to join karlo pahale. Kya bakchodi kar re.');
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
        return message.channel.send('Bahut hi bahiyda, Ye noobde ne permission di nahi aur gana chalane ko bolra h. Slow Claps.');
    }
    if (!args[1] || !args[1].match(
            /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/
        )) {
        return message.channel.send("Oo Bhadwe, Dhang ka youtube URL to de.");
    }

    const songInfo = await ytdl.getInfo(args[1]);
    const song = {
        title: songInfo.title,
        url: songInfo.video_url
    };

    //Making a json object for the queue to keep track of channels and connections
    if (!serverQueue) {
        const queueObject = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
        };
        queue.set(message.guild.id, queueObject);
        queueObject.songs.push(song);
        var connection = await voiceChannel.join();
        queueObject.connection = connection;
        play(message.guild, queueObject.songs[0]);

    } else {
        serverQueue.songs.push(song);
        return message.channel.send(`Yooooo ${song.title} has been added to the queue!`);
    }
}

function skip(message, serverQueue) {
    if (!message.member.voice.channel) return message.channel.send('Lmao. No, vc to join kar pahale nub.');
    if (!serverQueue) return message.channel.send('Abe saloo gana to baja lo be vc me.');
    serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
    if (!message.member.voice.channel)
        return message.channel.send("Lmao, No. Join a vc nibba!");
    if (!serverQueue)
        return message.channel.send('Abe saloo gana to baja lo be vc me.');

    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
}

function play(guild, song) {
    const serverQueue = queue.get(guild.id);
    if (!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }
    const dispatcher = serverQueue.connection
        .play(ytdl(song.url))
        .on("finish", () => {
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0]);
        })
    serverQueue.textChannel.send(`Now playing: **${song.title}**`);
}

function creator(message) {
    messageEmbedRoe
        .setColor('#0099ff')
        .setTitle('Roe')
        .setURL('https://github.com/roeintheglasses')
        .setThumbnail('https://avatars2.githubusercontent.com/u/24797615?s=460&u=3d1b0823a9c99a1ed01089f251045c0dc9596d18&v=4')
    message.channel.send(messageEmbedRoe);
}

client.login(token);
app.listen(port, console.log("Server running on port : " + port));