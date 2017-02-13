const discord = require("discord.js");
const bot = new discord.Client();
const path = require('path');
const fs = require('fs');
const knuckles = require("./images.json").images;
const videos = require("./images.json").videos;
const silentIgnore = require("./config.json").silentignore;
const globalignore = require('./ignorelist.json').global;
const ignorefile = require('./ignorelist.json');
var ignorelist = ["DUMMY_ID"];
ignorelist = globalignore;
var serverignore = {};
if(ignorefile !== undefined && ignorefile !== "")
{
serverignore = ignorefile;
}
var cooldownTime = 0;
var cooldownTimeV = 0;
var cooldownSet = 10;
var channelID = "272456339731644416";
var helpText = ["Knucklesbot help (good luck, this bot is perpetually broken):", "	to prevent a user from using the bot:", "		`knuckles ignore <user>`", "	to remove knucklesbot's messages:", "		`knuckles remove <number>`",
	"	to allow a user to use knucklesbot again:", "		`knuckles allow <user>`", "	to get the list currently ignored users' ids:", "		`knuckles ignorelist`","to invite the developer to your server (if the bot has invite perms)", "	`knuckles invite dev`", "", "any message with `knuckles` in it will be detected, the message `papa bless` will send a random video.",
	"PM @jane#1570 to submit a PNG image for knuckles bot or a link to a video about knuckles.", "visit https://github.com/statefram/knucklesbot to view the code and report bugs."];
const conf = require("./config.json");
bot.on('ready', () => {
	logger("INFO", `Client ready; logged in as ${bot.user.username}#${bot.user.discriminator} (${bot.user.id})`, undefined);
	bot.user.setPresence({
		status: "online",
		game: {
			name: "knuckles help"
		}
	});
});
bot.on('message', msg => {
	if (msg.mentions.everyone && msg.guild.member(bot.user).hasPermission("MANAGE_MESSAGES") && (msg.guild.id === '254436289405779979' || msg.guild.id === '141930443518771200')) {
		msg.reply("don't do that. it's annoying.");
		msg.delete (1000);
		logger("INFO", "deleted `everyone` mention", msg.channel);
	}
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
					logger("INFO", "pruned " + messagecount + " messages", msg.channel);
				});
			} else if (params[0] === "gignore" && msg.author.id === '123601647258697730') {
				var ment = msg.mentions.users.first();
				msg.reply(`ignoring ${ment.username}`);
				ignorelist.push(ment.id);
				logger("INFO", 'ignorelist updated, ' + ignorelist, msg.channel);
			} else if (params[0] === "gallow" && msg.author.id === '123601647258697730') {
				var ment = msg.mentions.users.first();
				msg.reply(`you got lucky,  ${ment.username}`).catch (errorHandler);
				for (var i = ignorelist.length - 1; i >= 0; i--) {
					if (ignorelist[i] === ment.id) {
						ignorelist.splice(i, 1);
					}
				}
				logger("INFO", 'ignorelist updated, ' + ignorelist, msg.channel);
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
				logger("INFO", 'ignorelist updated for '+ msg.guild.id +', ' + serverignore[msg.guild.id], msg.channel);
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
				logger("INFO", 'ignorelist updated for '+ msg.guild.id +', ' + serverignore[msg.guild.id], msg.channel);
			}
			else if(params[0] === 'invite dev')
			{
				guild.defaultChannel.createInvite({
			maxAge: 864000
			}).then(guildLink => {
			logger("GUILD", "guild link created: " + guildLink + "<@" + bot.user.id + ">", undefined);
			});
			}
			 else if (params[0] === "ignorelist") {
				msg.reply(serverignore[msg.guild.id]);
				logger("INFO", "sent ignorelist", msg.channel);
			} else {
					if(msg.channel.id !== '110373943822540800')
					{
						//logger("DEBUG", "not dbots", undefined);
						if (bot.user.id !== msg.author.id) {
							//logger("DEBUG", "not knuckles", undefined);
							if (!(silentIgnore.includes(msg.author.id))) {
								//logger("DEBUG","not silentIgnore", undefined);
						if (!(serverignore[msg.guild.id].includes(msg.author.id))) {
							//logger("DEBUG","not ignore", undefined);
								if (!msg.author.bot) {
									//logger("DEBUG","not bot", undefined);
									var file = knuckles[Math.floor(Math.random() * knuckles.length)];
									var file0 = path.resolve("knucklesbot/images/" + file);
									msg.channel.sendFile(file0, "knuckles.jpg").catch (errorHandler);
									cooldownTime = cooldownSet;
									logger("INFO", "sent picture", msg.channel);
								}
						} else {
							msg.reply("The stars are not in position for this tribute... (user is on the ignorelist)");
						}
						} else {
								logger("WARN", "silently ignoring " + msg.author.username, msg.channel);
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
							logger("INFO", "sent video", msg.channel);
						}
					} else {
						logger("WARN", "silently ignoring " + msg.author.username, msg.channel);
					}
				} else {
					msg.reply("The stars are not in position for this tribute... (user is on the ignorelist)");
				}
		}
	});
	bot.on('guildCreate', guild => {
		logger("GUILD", "joined" + guild.name + ", " + guild.id, undefined);
	});
	bot.login(conf.token);
	function errorHandler(error) {
		logger("ERROR", error, undefined);
	}
	function logger(eventType, message, channel) {
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
		if (bot.channels.get(channelID) !== undefined) {
			if (channel !== undefined) {
				bot.channels.get(channelID).sendMessage(eventType + " ::: " + hrs + ":" + mins + ":" + secs + ":::" + channel + " ::: " + message);
			} else {
				bot.channels.get(channelID).sendMessage(eventType + " ::: " + hrs + ":" + mins + ":" + secs + " ::: " + message);
			}
		}
	}