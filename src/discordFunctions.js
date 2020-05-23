const ytdl = require('ytdl-core');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');


//Main Song Queue
const queue = new Map();

async function start(message, serverQueue, link) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.channel.send('Please Join a VC first.');
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
        return message.channel.send('Give me the right permission to connect and speak at least.');
    }
    if (!link) {
        return message.channel.send("Can't find the video on youtube, Try using a different name.");
    }

    const songInfo = await ytdl.getInfo(link);
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
    if (!message.member.voice.channel) return message.channel.send('Lmao. No, join a vc first nub.');
    if (!serverQueue) return message.channel.send('No songs playing right now, Nothing to skip.');
    serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
    if (!message.member.voice.channel)
        return message.channel.send("Lmao. No, join a vc first nub.");
    if (!serverQueue)
        return message.channel.send('No songs playing right now, Nothing to stop.');

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

function creator(message, messageEmbedRoe) {
    messageEmbedRoe
        .setColor('#0099ff')
        .setTitle('Roe')
        .setURL('https://github.com/roeintheglasses')
        .setThumbnail('https://avatars2.githubusercontent.com/u/24797615?s=460&u=3d1b0823a9c99a1ed01089f251045c0dc9596d18&v=4')
    message.channel.send(messageEmbedRoe);
    return message.channel.send("roewuzhere!")
}

async function download(message, serverQueue, discord, link) {
    if (serverQueue) {
        return message.channel.send(`${message.author} There is currently music playing on ther server. Please stop it to download music.`)
    }
    message.channel.send(`${message.author}, Downloading Audio. Please wait.`);
    const videoInfo = await ytdl.getInfo(link);
    const video = {
        title: videoInfo.title,
        url: videoInfo.video_url
    };
    var stream = ytdl(video.url);
    var saveLocation = video.title + '.mp3';

    var proc = new ffmpeg({
            source: stream
        })
        .withAudioCodec('libmp3lame')
        .toFormat('mp3')
        .on('end', function() {
            console.log('file has been converted succesfully');
            const attachment = new discord.MessageAttachment(saveLocation);
            message.channel.send(message.author, attachment).catch(err => {
                if (err)
                    return message.channel.send(`${message.author}  Error :  ${err.message}`);
            }).then(() => {
                try {
                    //Deleting downloaded file after discord upload
                    fs.unlinkSync(saveLocation)
                } catch (err) {
                    console.error(err)
                }
            });
        })
        .on('error', function(err, stdout, stderr) {
            console.log('an error happened: ' + err.message);
        })
        .saveToFile(saveLocation);
}

function donate(message) {
    return message.channel.send(`Love my work? Buy me a coffee here : ${"https://www.buymeacoffee.com/roeintheglasses"}`)
}


module.exports = {
    queue,
    start,
    creator,
    play,
    skip,
    stop,
    download,
    donate
};