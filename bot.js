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
var loglist = {};
ignorelist = globalignore;
var wj = false;
var serverignore = {};
if(logfile !== undefined && logfile !== "")
{
loglist = logfile;
}
if(ignorefile !== undefined && ignorefile !== "")
{
serverignore = ignorefile;
}
var cooldownTime = 0;
var cooldownTimeV = 0;
var cooldownSet = 10;
var channelID = "272456339731644416";
var helpText = ["Knucklesbot help (good luck, this bot is perpetually broken):", "	to prevent a user from using the bot:", "		`knuckles ignore <user>`", "	to remove knucklesbot's messages:", "		`knuckles remove <number>`",
	"	to allow a user to use knucklesbot again:", "		`knuckles allow <user>`", "	to get the list currently ignored users' ids:", "		`knuckles ignorelist`","to invite the developer to your server (if the bot has invite perms)", "	`knuckles devhelp`","to add/remove a channel to log to","		`knuckles logadd/addlog <(optional) channelid>`","		`knuckles logremove/removelog <(optional) channelid>`" , "", "any message with `knuckles` in it will be detected, the message `papa bless` will send a random video.",
	"PM @jane#1570 to submit a PNG image for knuckles bot or a link to a video about knuckles.", "visit https://github.com/statefram/knucklesbot to view the code and report bugs."];
const conf = require("./config.json");
bot.on('ready', () => {
	logger("INFO", `Client ready; logged in as ${bot.user.username}#${bot.user.discriminator} (${bot.user.id})`, undefined, undefined);
	bot.user.setPresence({
		status: "online",
		game: {
			name: "knuckles help"
		}
	});
});
bot.on('message', msg => {
	/*if (msg.mentions.everyone && msg.guild.member(bot.user).hasPermission("MANAGE_MESSAGES") && (msg.guild.id === '254436289405779979' || msg.guild.id === '141930443518771200')) {
		msg.reply("don't do that. it's annoying.");
		msg.delete (1000);
		logger("INFO", "deleted `everyone` mention", msg.guild.name + ":" + msg.channel.name);
	}*/
	if (msg.author.bot)
		return;
	if (msg.content.includes("knuckles") || msg.content.includes("Knuckles") || msg.content.includes("KNUCKLES")) {
		const params = msg.content.split(" ").slice(1);
		if (params[0] === "help") {
			msg.reply("Sent you a PM.");
			var helpTextCombined = helpText.join('\r\n');
			msg.author.send(helpTextCombined);
		} else if (params[0] === "remove" && (msg.member.hasPermission("MANAGE_MESSAGES") || msg.author.id === '123601647258697730')) {
			let messagecount = parseInt(params[1]);
			if(messagecount === 0 || messagecount === undefined)
			{
				messagecount = 1;
			}
			msg.channel.fetchMessages({
				limit: 100
			}).then(messages => {
				let msg_array = messages.array();
				msg_array = msg_array.filter(m => m.author.id === bot.user.id)
					msg_array.length = messagecount + 1;
				msg_array.map(m => m.delete ().catch (console.error)
						);
					logger("INFO", "pruned " + messagecount + " messages"   , msg.channel, msg);
				});
			} else if (params[0] === "gignore" && msg.author.id === '123601647258697730') {
				var ment = msg.mentions.users.first();
				msg.reply(`ignoring ${ment.username}`);
				ignorelist.push(ment.id);
				logger("INFO", 'ignorelist updated, ' + ignorelist   , msg.channel, msg);
			} else if (params[0] === "gallow" && msg.author.id === '123601647258697730') {
				var ment = msg.mentions.users.first();
				msg.reply(`you got lucky,  ${ment.username}`).catch (errorHandler);
				for (var i = ignorelist.length - 1; i >= 0; i--) {
					if (ignorelist[i] === ment.id) {
						ignorelist.splice(i, 1);
					}
				}
				logger("INFO", 'ignorelist updated, ' + ignorelist   , msg.channel, msg);
			} else if (params[0] === "ignore" && (msg.member.hasPermission("MANAGE_MESSAGES") || msg.author.id === '123601647258697730')) {
				var ment = msg.mentions.users.first();
				msg.reply(`ignoring ${ment.username}`);
				var tempIgnore = serverignore[msg.guild.id];
				if(tempIgnore === undefined)
				{
					tempIgnore = [];
				}
				tempIgnore.push(ment.id);
				serverignore[msg.guild.id] = tempIgnore;
				fs.writeFileSync('./knucklesbot/ignorelist.json', JSON.stringify(serverignore));
				logger("INFO", 'ignorelist updated for '+ bot.guilds.get(msg.guild.id).name +', [' + serverignore[msg.guild.id] + '] (updated by ' + (bot.guilds.get(msg.guild.id).members.get(msg.author.id).nickname !== (undefined || null) ? bot.guilds.get(msg.guild.id).members.get(msg.author.id).nickname : msg.author.username) + ')', msg.channel, msg);
			} else if (params[0] === "allow" && (msg.member.hasPermission("MANAGE_MESSAGES") || msg.author.id === '123601647258697730')) {
				var ment = msg.mentions.users.first();
				msg.reply(`you got lucky,  ${ment.username}`).catch (errorHandler);
				var tempIgnore = serverignore[msg.guild.id];
				if(tempIgnore === undefined)
				{
					tempIgnore = [];
				}
				for (var i = tempIgnore.length - 1; i >= 0; i--) {
					if (tempIgnore[i] === ment.id) {
						tempIgnore.splice(i, 1);
					}
					serverignore[msg.guild.id] = tempIgnore;
				}
				fs.writeFileSync('./knucklesbot/ignorelist.json', JSON.stringify(serverignore));
				logger("INFO", 'ignorelist updated for '+ bot.guilds.get(msg.guild.id).name +', [' + serverignore[msg.guild.id] + '] (updated by ' + (bot.guilds.get(msg.guild.id).members.get(msg.author.id).nickname !== (undefined || null) ? bot.guilds.get(msg.guild.id).members.get(msg.author.id).nickname : msg.author.username) + ')', msg.channel, msg);
			}
			else if(params[0] === 'devhelp')
			{
				msg.guild.defaultChannel.createInvite({
			maxAge: 864000
			}).then(guildLink => {
			logger("INFO", "guild link created: " + guildLink + " <@" + "123601647258697730" + ">", undefined, undefined);
			msg.channel.send("help is on the way!");
			});
			}else if(params[0] === "wj") {
				if(wj)
				{wj=false;}
				else
				{wj=true;}
			}
			 else if (params[0] === "ignorelist") {
				msg.reply(serverignore[msg.guild.id]);
				logger("INFO", "sent ignorelist"  , msg.channel, msg);
			}else if ((params[0] === "logadd" || params[0] === "addlog") && msg.member.hasPermission("MANAGE_MESSAGES")) {
				var channel = params[1] !== undefined ? bot.channels.get(params[1]) : msg.channel;
				msg.reply(`added ${channel.name} as a logging channel`);
				var tempLog = loglist[msg.guild.id];
				if(tempLog === undefined)
				{
					tempLog = [];
				}
				tempLog.push(channel.id);
				loglist[msg.guild.id] = tempLog;
				fs.writeFileSync('./knucklesbot/loglist.json', JSON.stringify(loglist));
				logger("INFO", 'loglist updated for '+ bot.guilds.get(msg.guild.id).name +', [' + bot.channels.get(loglist[msg.guild.id]).name + '] (updated by ' + (bot.guilds.get(msg.guild.id).members.get(msg.author.id).nickname !== (undefined || null) ? bot.guilds.get(msg.guild.id).members.get(msg.author.id).nickname : msg.author.username) + ')', msg.channel, msg);
			} else if ((params[0] === "logremove" || params[0] === "removelog") && msg.member.hasPermission("MANAGE_MESSAGES")) {
				var channel = params[1] !== undefined ? bot.channels.get(params[1]) : bot.channels.get(loglist[msg.guild.id][0]);
				msg.reply(`removed ${channel.name} from the logger`).catch (errorHandler);
				var tempLog = loglist[msg.guild.id];
				if(tempLog === undefined)
				{
					tempLog = [];
				}
				for (var i = tempLog.length - 1; i >= 0; i--) {
					if (tempLog[i] === channel.id) {
						tempLog.splice(i, 1);
					}
					loglist[msg.guild.id] = tempLog;
				}
				fs.writeFileSync('./knucklesbot/loglist.json', JSON.stringify(loglist));
				logger("INFO", 'loglist updated for '+ bot.guilds.get(msg.guild.id).name +', [' + bot.channels.get(loglist[msg.guild.id]).name + '] (updated by ' + (bot.guilds.get(msg.guild.id).members.get(msg.author.id).nickname !== (undefined || null) ? bot.guilds.get(msg.guild.id).members.get(msg.author.id).nickname : msg.author.username) + ')', msg.channel, msg);
			} else {
					if(msg.channel.id !== '110373943822540800')
					{
						//logger("DEBUG", "not dbots", undefined);
						if (bot.user.id !== msg.author.id) {
							//logger("DEBUG", "not knuckles", undefined);
							if (!(silentIgnore.includes(msg.author.id))) {
								//logger("DEBUG","not silentIgnore", undefined);
								if(serverignore[msg.guild.id] === undefined)
								{
									serverignore[msg.guild.id] = [];
								}
						if (!(serverignore[msg.guild.id].includes(msg.author.id))) {
							//logger("DEBUG","not ignore", undefined);
								if (!msg.author.bot) {
									//logger("DEBUG","not bot", undefined);
									var file = knuckles[Math.floor(Math.random() * knuckles.length)];
									var file0 = path.resolve("knucklesbot/images/" + file);
									msg.channel.sendFile(file0, "knuckles.jpg").catch (errorHandler);
									cooldownTime = cooldownSet;
									logger("INFO", "sent picture", msg.channel, msg);
								}
						} else {
							msg.reply("The stars are not in position for this tribute... (user is on the ignorelist)");
							logger("WARN", "ignoring " + msg.author.username , msg.channel, msg);
						}
						} else {
								logger("WARN", "silently ignoring " + msg.author.username , msg.channel, msg);
							}
					}
					}
			}
		}
		if (msg.content === "papa bless") {
				if (!(serverignore[msg.guild.id].includes(msg.author.id))) {
					if (!(silentIgnore.includes(msg.author.id))) {
						if (!msg.author.bot) {
							var embedded = new discord.RichEmbed();
							var video = videos[Math.floor(Math.random() * videos.length)];
							embedded.setColor(0xe20000);
							embedded.addField("knuckles:", video, true);
							msg.channel.sendEmbed(embedded).catch (errorHandler);
							cooldownTimeV = cooldownSet;
							logger("INFO", "sent video"   , msg.channel, msg);
						}
					} else {
						logger("WARN", "silently ignoring " + msg.author.username , msg.channel, msg);
					}
				} else {
					msg.reply("The stars are not in position for this tribute... (user is on the ignorelist)");
					logger("WARN", "ignoring " + msg.author.username ,msg.channel, msg);
				}
		}
		if(msg.content.includes("wolfjob"))
		{
			if(wj)
			{
				var file = "wolfjob.PNG";
				var file0 = path.resolve("knucklesbot/images/" + file);
				msg.channel.sendFile(file0, "wolf.jpg").catch (errorHandler);
				logger("INFO", "wolfjob", msg.channel, msg);
			}
		}
	});
	bot.on('guildCreate', guild => {
		logger("GUILD", "joined" + guild.name + ", " + guild.id, undefined, undefined);
	});
	bot.login(conf.token);
	function errorHandler(error) {
		logger("ERROR", error, undefined, undefined);
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
		console.log(eventType + " ::: " + hrs + ":" + mins + ":" + secs + " ::: " + message);
		if(msg !== undefined)
		{
		if(loglist[msg.guild.id] !== undefined)
			{
				if(bot.channels.get(loglist[msg.guild.id][0]) !== undefined)
				{
					if (channel !== undefined) {
						if(msg.guild.channels.get(channel.id) !== undefined)
							{
							bot.channels.get(loglist[msg.guild.id][0]).sendEmbed({color: 0xff1111,title: eventType, description: message, footer: {text: "at " + hrs + ":" + mins + ":" + secs + " in #" + channel.name, icon_url: msg.guild.iconURL}});
						}
					}
				}
			}
		}	
	}