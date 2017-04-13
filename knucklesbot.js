var mode = "whitelist";
const discord = require("discord.js");
const bot = new discord.Client();
const path = require('path');
const fs = require('fs');
const knuckles = require("./images.json").images;
const videos = require("./images.json").videos;
const silentIgnore = require("./config.json").silentignore;
const globalignore = require('./ignorelist.json').global;
const ignorefile = require('./ignorelist.json');
const logfile = require('./loglist.json');
var ignorelist = ["DUMMY_ID"];
var channelignore = {};
var channelfile = require("./channels.json");
var loglist = {};
var emoji = require('node-emoji');
var stimer;
var timeout = require('./config.json').experimental;
var whitelistfile = require('./whitelist.json');
ignorelist = globalignore;
var wj = false;
var serverignore = {};
var whitelist = {};
if (whitelistfile !== undefined && whitelistfile !== "") {
    whitelist = whitelistfile;
}
if (logfile !== undefined && logfile !== "") {
    loglist = logfile;
}
if (ignorefile !== undefined && ignorefile !== "") {
    serverignore = ignorefile;
}
if (channelfile !== undefined && channelfile !== "") {
    channelignore = channelfile;
}
Array.prototype.contains = function (obj) {
    var i = this.length;
    while (i--) {
        if (this[i] == obj) {
            return true;
        }
    }
    return false;
}
var cooldownTime = 0;
var cooldownTimeV = 0;
var cooldownSet = 10;
var channelID = "272456339731644416";
var helpText = ["Knucklesbot help (good luck, this bot is perpetually broken):", " to prevent a user from using the bot:", "  `knuckles ignore <user>`", " to remove knucklesbot's messages:", "  `knuckles remove <number>`", " to allow a user to use knucklesbot again:", "  `knuckles allow <user>`", " to get the list currently ignored users' ids:", "  `knuckles ignorelist`", "to invite the developer to your server (if the bot has invite perms)", " `knuckles devhelp`", "to add/remove channel logging", "  `knuckles logadd/addlog <(optional) channelid>`", "  `knuckles logremove/removelog <(optional) channelid>`", "To add/remove a channel from the list of ignored channels", "  `knuckles addchannel/removechannel <(optional) channelid>`", "", "any message with `knuckles` in it will be detected, and will send a randomized i" + "mage if the user/channel is not banned from the bot", "", "PM <@123601647258697730> to get an invite, submit a PNG image for knuckles bot or submit a link to a v" + "ideo about knuckles."];
const conf = require("./config.json");
bot.on('ready', () => {
    logger("INFO", `Client ready; logged in as ${bot.user.username}#${bot.user.discriminator} (${bot.user.id})`, undefined, undefined);
    bot.users.get("123601647258697730").sendMessage(emoji.get(":white_check_mark:") + "Knucklesbot loaded.");
});
bot.on('message', msg => {
    if (msg.author.bot)
        return;
    if (msg.content.toUpperCase().includes("KNUCKLES") || msg.isMentioned(bot.user)) {
        if (msg.content.includes("```") || msg.content.includes('pm2'))
            return;
        const params = msg.content.split(" ").slice(1);
        const code = msg.content.split(" ").slice(2).join(" ");
        if (params[0] === "help") {
            msg.reply("Sent you a PM.");
            var helpTextCombined = helpText.join('\r\n');
            msg.author.send(helpTextCombined, {
                split: true
            });
        } else if (params[0] === "ilist") {
            var images = knuckles.toString().replace(/,/g, "   \n   ");
            msg.channel.sendEmbed({
                title: "imgs",
                description: images,
                color: 0xff1111
            });
        } else if (params[0] === "whitelist" && msg.author.id === '123601647258697730') {
            var guild = params[1];
            msg.reply(`added ${guild} as whitelisted server`);
            var tempCh = whitelist.servers;
            if (tempCh === undefined) {
                tempCh = [];
            }
            tempCh.push(guild);
            whitelist.servers = tempCh;
            fs.writeFileSync('./knucklesbot/whitelist.json', JSON.stringify(whitelist));
            var whitelistfile = require('./whitelist.json');
            if (whitelistfile !== undefined && whitelistfile !== "") {
                whitelist = whitelistfile;
            }
            logger("INFO", "added " + guild + "as a whitelisted server", msg);
        } else if (params[0] === "remove" && (msg.member.hasPermission("MANAGE_MESSAGES") || msg.author.id === '123601647258697730')) {
            let messagecount = parseInt(params[1]);
            if (messagecount === 0 || messagecount === undefined) {
                messagecount = 1;
            }
            msg.channel.fetchMessages({
                limit: 100
            }).then(messages => {
                let msg_array = messages.array();
                msg_array = msg_array.filter(m => m.author.id === bot.user.id)
                msg_array.length = messagecount;
                msg_array.map(m => m.delete().catch(console.error));
                logger("INFO", "pruned " + messagecount + " messages", msg.channel, msg);
            });
        } else if (params[0] === "leave" && msg.author.id === '123601647258697730') {
            if (params[1] !== "whitelist") {
                var serverID = params[1];
                if (serverID === (undefined || null || "")) {
                    msg.channel.sendMessage("no server id!")
                }
                var leaveMessage = params.slice(2).join(" ");
                if (leaveMessage === (undefined || null || "")) {
                    msg.channel.sendMessage("no leave message!")
                }
                if (leaveMessage !== (undefined || null || "") || serverID !== (undefined || null || "")) {
                    bot.guilds.get(serverID.toString()).channels.get(serverID.toString()).sendMessage("Leaving server for reason: `" + leaveMessage + "`");
                    bot.guilds.get(serverID.toString()).leave();
                    msg.channel.sendMessage("leaving server `" + bot.guilds.get(serverID.toString()).name + "` for reason `" + leaveMessage + "`");
                }
            } else if (params[1] === "whitelist") {
                var num = 0;
                bot.guilds.forEach(guild => {
                    var check = [];
                    whitelist.servers.forEach(id => {
                        if (guild.id === id) {
                            check.push(id);
                        }
                    });
                    if (check[0] === guild.id) {
                        return;
                    } else {
                        num++;
                        logger("INFO", "left " + guild.name, msg);
                        bot.guilds.get(guild.id).leave();
                    }
                });
                msg.channel.sendMessage("Pending leave on " + num + " servers");
            }
        } else if (params[0] === "eval" && msg.author.id === '123601647258697730') {
            var args = params.slice(1).join(" ");
            let output;
            let col = 0xff1111;
            let errored = false;
            try {
                if (args === "2+2") {
                    output = 5;
                } else if (args.includes("bot.token") || args.includes("conf.token")) {
                    errored = true;
                    output = "404: it's in the hole";
                } else {
                    output = eval(args);
                }
            } catch (e) {
                output = e;
                errored = true;
                col = 0xff6be3;
            }
            var time0 = msg.createdTimestamp;
            msg.channel.sendEmbed({
                title: "JS Eval",
                fields: [{
                    name: emoji.get("arrow_right") + " Input:",
                    value: "```js\n" + args + "```"
                }, {
                    name: emoji.get(errored ? "warning" : "arrow_left") + " Output:" + (errored ? " (errored)" : ""),
                    value: "```js\n" + output + "```"
                }],
                color: col
            }).then(msge => {
                msge.channel.sendMessage(emoji.get("clock12") + " Completed in: `" + (Math.floor(msge.createdTimestamp - time0)) * 1000 + " microseconds`");
            });
        } else if (params[0] === "gignore" && msg.author.id === '123601647258697730') {
            var ment = msg.mentions.users.first();
            msg.reply(`ignoring ${ment.username}`);
            ignorelist.push(ment.id);
            logger("INFO", 'ignorelist updated, ' + ignorelist, msg.channel, msg);
        } else if (params[0] === "gallow" && msg.author.id === '123601647258697730') {
            var ment = msg.mentions.users.first();
            msg.reply(`you got lucky,  ${ment.username}`).catch(errorHandler);
            for (var i = ignorelist.length - 1; i >= 0; i--) {
                if (ignorelist[i] === ment.id) {
                    ignorelist.splice(i, 1);
                }
            }
            logger("INFO", 'ignorelist updated, ' + ignorelist, msg.channel, msg);
        } else if (params[0] === "addchannel" && (msg.member.hasPermission("MANAGE_MESSAGES") || msg.author.id === '123601647258697730')) {
            var channel = params[1] !== undefined ? bot.channels.get(params[1]) : msg.channel;
            msg.reply(`added ${channel.name} as an ignored channel`);
            var tempCh = channelignore[msg.guild.id];
            if (tempCh === undefined) {
                tempCh = [];
            }
            tempCh.push(channel.id);
            channelignore[msg.guild.id] = tempCh;
            fs.writeFileSync('./knucklesbot/channels.json', JSON.stringify(channelignore));
            logger("INFO", 'channelignore updated for ' + bot.guilds.get(msg.guild.id).name + ', [' + channelignore[msg.guild.id] + '] (updated by ' + (bot.guilds.get(msg.guild.id).members.get(msg.author.id).nickname !== (undefined || null) ? bot.guilds.get(msg.guild.id).members.get(msg.author.id).nickname : msg.author.username) + ')', msg.channel, msg);
        } else if (params[0] === "removechannel" && (msg.member.hasPermission("MANAGE_MESSAGES") || msg.author.id === '123601647258697730')) {
            var channel = params[1] !== undefined ? bot.channels.get(params[1]) : bot.channels.get(channelignore[msg.guild.id][0]);
            msg.reply(`removed ${channel.name} as an ignored channel`).catch(errorHandler);
            var tempCh = channelignore[msg.guild.id];
            if (tempCh === undefined) {
                tempCh = [];
            }
            for (var i = tempCh.length - 1; i >= 0; i--) {
                if (tempCh[i] === channel.id) {
                    tempCh.splice(i, 1);
                }
                channelignore[msg.guild.id] = tempCh;
            }
            fs.writeFileSync('./knucklesbot/channels.json', JSON.stringify(channelignore));
            logger("INFO", 'channelignore updated for ' + bot.guilds.get(msg.guild.id).name + ', [' + channelignore[msg.guild.id] + '] (updated by ' + (bot.guilds.get(msg.guild.id).members.get(msg.author.id).nickname !== (undefined || null) ? bot.guilds.get(msg.guild.id).members.get(msg.author.id).nickname : msg.author.username) + ')', msg.channel, msg);
        } else if (params[0] === "ignore" && (msg.member.hasPermission("MANAGE_MESSAGES") || msg.author.id === '123601647258697730')) {
            var ment = msg.mentions.users.first();
            msg.reply(`ignoring ${ment.username}`);
            var tempIgnore = serverignore[msg.guild.id];
            if (tempIgnore === undefined) {
                tempIgnore = [];
            }
            tempIgnore.push(ment.id);
            serverignore[msg.guild.id] = tempIgnore;
            fs.writeFileSync('./knucklesbot/ignorelist.json', JSON.stringify(serverignore));
            logger("INFO", 'ignorelist updated for ' + bot.guilds.get(msg.guild.id).name + ', [' + serverignore[msg.guild.id] + '] (updated by ' + (bot.guilds.get(msg.guild.id).members.get(msg.author.id).nickname !== (undefined || null) ? bot.guilds.get(msg.guild.id).members.get(msg.author.id).nickname : msg.author.username) + ')', msg.channel, msg);
        } else if (params[0] === "allow" && (msg.member.hasPermission("MANAGE_MESSAGES") || msg.author.id === '123601647258697730')) {
            var ment = msg.mentions.users.first();
            msg.reply(`you got lucky,  ${ment.username}`).catch(errorHandler);
            var tempIgnore = serverignore[msg.guild.id];
            if (tempIgnore === undefined) {
                tempIgnore = [];
            }
            for (var i = tempIgnore.length - 1; i >= 0; i--) {
                if (tempIgnore[i] === ment.id) {
                    tempIgnore.splice(i, 1);
                }
                serverignore[msg.guild.id] = tempIgnore;
            }
            fs.writeFileSync('./knucklesbot/ignorelist.json', JSON.stringify(serverignore));
            logger("INFO", 'ignorelist updated for ' + bot.guilds.get(msg.guild.id).name + ', [' + serverignore[msg.guild.id] + '] (updated by ' + (bot.guilds.get(msg.guild.id).members.get(msg.author.id).nickname !== (undefined || null) ? bot.guilds.get(msg.guild.id).members.get(msg.author.id).nickname : msg.author.username) + ')', msg.channel, msg);
        } else if (params[0] === 'say' && msg.author.id === "123601647258697730") {
            msg.channel.send(code);
        } else if (params[0] === 'devhelp') {
            msg.guild.defaultChannel.createInvite({
                maxAge: 864000
            }).then(guildLink => {
                bot.users.get("123601647258697730").send("guild link created: " + guildLink + " <@123601647258697730>");
                msg.channel.send("help is on the way!");
            });
        } else if (params[0] === "wj" && msg.author.id === "123601647258697730") {
            if (wj) {
                wj = false;
                msg.channel.send(emoji.get("regional_indicator_x"));
            } else {
                wj = true;
                msg.channel.send(emoji.get("white_check_mark"));
            }
        } else if (params[0] === "ignorelist") {
            if (serverignore[msg.guild.id] === undefined) {
                serverignore[msg.guild.id] = [];
            }
            var list = [];
            for (i = 0; i < serverignore[msg.guild.id].length; i++) {
                var e = msg.channel.guild.members.get(serverignore[msg.guild.id][i].toString());
                if (e !== undefined) {
                    list.push(e.nickname !== undefined ? e.nickname : e.user.username);
                }
            }
            if (list.length === 0) {
                msg.reply("There are no users in the ignorelist.");
            } else {
                msg.reply("[" + list.join(", ") + "]");
            }
            logger("INFO", "sent ignorelist, [" + list.join(", ") + "]", msg.channel, msg);
        } else if ((params[0] === "logadd" || params[0] === "addlog") && msg.member.hasPermission("MANAGE_MESSAGES")) {
            var channel = params[1] !== undefined ? bot.channels.get(params[1]) : msg.channel;
            msg.reply(`added ${channel.name} as a logging channel`);
            var tempLog = loglist[msg.guild.id];
            if (tempLog === undefined) {
                tempLog = [];
            }
            tempLog.push(channel.id);
            loglist[msg.guild.id] = tempLog;
            fs.writeFileSync('./knucklesbot/loglist.json', JSON.stringify(loglist));
            logger("INFO", 'loglist updated for ' + bot.guilds.get(msg.guild.id).name + ', [' + bot.channels.get(loglist[msg.guild.id]).name + '] (updated by ' + (bot.guilds.get(msg.guild.id).members.get(msg.author.id).nickname !== (undefined || null) ? bot.guilds.get(msg.guild.id).members.get(msg.author.id).nickname : msg.author.username) + ')', msg.channel, msg);
        } else if ((params[0] === "logremove" || params[0] === "removelog") && msg.member.hasPermission("MANAGE_MESSAGES")) {
            var channel = params[1] !== undefined ? bot.channels.get(params[1]) : bot.channels.get(loglist[msg.guild.id][0]);
            msg.reply(`removed ${channel.name} from the logger`).catch(errorHandler);
            var tempLog = loglist[msg.guild.id];
            if (tempLog === undefined) {
                tempLog = [];
            }
            for (var i = tempLog.length - 1; i >= 0; i--) {
                if (tempLog[i] === channel.id) {
                    tempLog.splice(i, 1);
                }
                loglist[msg.guild.id] = tempLog;
            }
            fs.writeFileSync('./knucklesbot/loglist.json', JSON.stringify(loglist));
            logger("INFO", 'loglist updated for ' + bot.guilds.get(msg.guild.id).name + ', [' + bot.channels.get(loglist[msg.guild.id]).name + '] (updated by ' + (bot.guilds.get(msg.guild.id).members.get(msg.author.id).nickname !== (undefined || null) ? bot.guilds.get(msg.guild.id).members.get(msg.author.id).nickname : msg.author.username) + ')', msg.channel, msg);
        } else {
            if (channelignore[msg.guild.id] === undefined) {
                channelignore[msg.guild.id] = [];
            }
            if (!(channelignore[msg.guild.id].contains(msg.channel.id))) {
                if (bot.user.id !== msg.author.id) {
                    if (!(silentIgnore.includes(msg.author.id))) {
                        if (serverignore[msg.guild.id] === undefined) {
                            serverignore[msg.guild.id] = [];
                        }
                        if (!(serverignore[msg.guild.id].includes(msg.author.id))) {
                            if (!msg.author.bot) {
                                var file = knuckles[Math.floor(Math.random() * knuckles.length)];
                                var file0 = path.resolve("knucklesbot/images/" + file);
                                msg.channel.sendFile(file0, "knuckles.jpg").then(m => {
                                    if (timeout.contains(msg.guild.id)) {
                                        setTimeout(function () {
                                            m.delete();
                                        }, 600000)
                                    }
                                }).catch(errorHandler);
                                cooldownTime = cooldownSet;
                                if (timeout.contains(msg.guild.id)) {
                                    logger("INFO", "sent picture, 10 minute timeout", msg.channel, msg);
                                } else {
                                    logger("INFO", "sent picture", msg.channel, msg);
                                }
                            }
                        } else {
                            msg.reply("The stars are not in position for this tribute... (user is on the ignorelist)");
                            logger("WARN", "ignoring " + msg.author.username, msg.channel, msg);
                        }
                    } else {
                        logger("WARN", "silently ignoring " + msg.author.username, msg.channel, msg);
                    }
                }
            }
        }
    }
    if (msg.content === "papa bless") {
        if (channelignore[msg.guild.id] === undefined) {
            channelignore[msg.guild.id] = [];
        }
        if (!(channelignore[msg.guild.id].contains(msg.channel.id))) {
            if (serverignore[msg.guild.id] === undefined) {
                serverignore[msg.guild.id] = [];
            }
            if (!(serverignore[msg.guild.id].includes(msg.author.id))) {
                if (!(silentIgnore.includes(msg.author.id))) {
                    if (!msg.author.bot) {
                        var videoU = videos[Math.floor(Math.random() * videos.length)];
                        msg.channel.sendEmbed({
                            color: 0xff1111,
                            description: videoU,
                            url: videoU,
                            video: {
                                url: videoU,
                                height: 600,
                                width: 800
                            }
                        }).then(m => {
                            if (timeout.contains(msg.guild.id)) {
                                setTimeout(function () {
                                    m.delete();
                                }, 600000)
                            }
                        }).catch(errorHandler);
                        cooldownTimeV = cooldownSet;
                        logger("INFO", "sent video", msg.channel, msg);
                    }
                } else {
                    logger("WARN", "silently ignoring " + msg.author.username, msg.channel, msg);
                }
            } else {
                msg.reply("The stars are not in position for this tribute... (user is on the ignorelist)");
                logger("WARN", "ignoring " + msg.author.username, msg.channel, msg);
            }
        }
    }
    if (msg.content.includes("wolfjob") || msg.content.includes("wolf job")) {
        if (wj) {
            if (channelignore[msg.guild.id] === undefined) {
                channelignore[msg.guild.id] = [];
            }
            if (!(channelignore[msg.guild.id].contains(msg.channel.id))) {
                if (serverignore[msg.guild.id] === undefined) {
                    serverignore[msg.guild.id] = [];
                }
                if (!(serverignore[msg.guild.id].includes(msg.author.id))) {
                    var file = "wolfjob.PNG";
                    var file0 = path.resolve("knucklesbot/images/" + file);
                    msg.channel.sendFile(file0, "wolf.jpg").then(m => {
                        if (timeout.contains(msg.guild.id)) {
                            setTimeout(function () {
                                m.delete();
                            }, 600000)
                        }
                    }).catch(errorHandler);
                    logger("INFO", "wolfjob", msg.channel, msg);
                }
            }
        }
    }
    if (msg.content.includes("shadow")) {
        if (!(serverignore[msg.guild.id].includes(msg.author.id))) {
            if (channelignore[msg.guild.id] === undefined) {
                channelignore[msg.guild.id] = [];
            }
            if (!(channelignore[msg.guild.id].contains(msg.channel.id))) {
                if (timeout.contains(msg.guild.id)) {
                    var file0 = path.resolve("knucklesbot/images/Training_for_fight_scene_by_manaita.png");
                    msg.channel.sendFile(file0, "knuckles.jpg").catch(errorHandler);
                    logger("INFO", "shadow", msg.channel, msg);
                }
            }
        }
    }
});
bot.on('guildCreate', guild => {
    logger("GUILD", "joined " + guild.name + ", " + guild.id, undefined, undefined);
    if (mode === "whitelist") {
        var check = [];
        whitelist.servers.forEach(id => {
            if (guild.id === id) {
                check.push(id);
            }
        });
        if (check[0] === guild.id) {
            return;
        } else {
            bot.guilds.get(guild.id).channels.get(guild.id).sendMessage("This server is not on the whitelist!");
            bot.guilds.get(guild.id).leave();
            logger("INFO", "left " + guild.name + "- not whitelisted", guild.defaultChannel, undefined)
        }
    }
});
bot.login(conf.token);

function errorHandler(error) {
    bot.users.get("123601647258697730").sendMessage(emoji.get("exclamation") + " ERROR! ::" + error);
}

function logger(eventType, message, channel, msg) {
    var date = new Date();
    if (date.getMinutes() < 10) {
        var mins = "0" + date.getMinutes();
    } else {
        var mins = date.getMinutes();
    }
    if (date.getHours() < 10) {
        var hrs = "0" + date.getHours();
    } else {
        var hrs = date.getHours();
    }
    if (date.getSeconds() < 10) {
        var secs = "0" + date.getSeconds();
    } else {
        var secs = date.getSeconds();
    }
    if (msg !== undefined) {
        console.log(eventType + " ::: " + hrs + ":" + mins + ":" + secs + " ::: " + message + " (" + (msg.author.username !== undefined ? msg.author.username : "undefined") + " @" + (msg.guild.name !== undefined ? msg.guild.name : "undefined") + ": #" + (channel.name !== undefined ? msg.channel.name : "undefined") + " [" + msg.guild.id + "])");
        if (loglist[msg.guild.id] !== undefined) {
            if (bot.channels.get(loglist[msg.guild.id][0]) !== undefined) {
                if (channel !== undefined) {
                    if (msg.guild.channels.get(channel.id) !== undefined) {
                        bot.channels.get(loglist[msg.guild.id][0]).sendEmbed({
                            color: 0xff1111,
                            title: eventType,
                            description: message,
                            timestamp: msg.createdTimestamp,
                            footer: {
                                text: (msg.author !== undefined ? (msg.author.username + "#" + msg.author.discriminator) : "unknown") + " in #" + msg.channel.name,
                                icon_url: msg.author !== undefined ? msg.author.avatarURL : msg.channel.guild.iconURL
                            }
                        });
                    }
                }
            }
        }
    } else {
        console.log(eventType + " ::: " + hrs + ":" + mins + ":" + secs + " ::: " + message);
    }
}

function randStatus() {
    var slist = ["on " + bot.guilds.size + " servers.", "knuckles help", "with memes", "with Jane"]
    let rand = Math.floor(Math.random() * slist.length)
    let s = slist[rand]
    bot.user.setPresence({
        status: "online",
        game: {
            name: s
        }
    });
}
if (stimer)
    clearInterval(stimer);
stimer = setInterval(randStatus, 60000);