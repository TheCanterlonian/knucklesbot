const discord = require("discord.js");
const bot = new discord.Client();
const path = require('path');
const knuckles = require("./images.json").images;
const videos = require("./images.json").videos;
const ignorelist = ["DUMMY_ID"];
const silentIgnore = ["123601647258697730"];
var cooldownTime = 0;
var cooldownTimeV = 0;
var cooldownSet = 10;
var channelID = "272456339731644416";
const conf = require("./config.json");
bot.on('ready', () => {
	logger("INFO", `Client ready; logged in as ${bot.user.username}#${bot.user.discriminator} (${bot.user.id})`, undefined);
	bot.user.setPresence({status : "online", game : {name : "PM jane#1570 to submit images/videos"}});
});
bot.on('message', msg => {
	if (msg.content.includes("knuckles") || msg.content.includes("Knuckles") || msg.content.includes("KNUCKLES")) {
		const params = msg.content.split(" ").slice(1);
		if (params[0] === "remove" && (msg.member.hasPermission("MANAGE_MESSAGES") || msg.author.id === '123601647258697730')) {
			let messagecount = parseInt(params[1]);
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
			} else if (params[0] === "ignore" && (msg.member.hasPermission("MANAGE_MESSAGES")|| msg.author.id === '123601647258697730')) {
				var ment = msg.mentions.users.first();
				msg.reply(`ignoring ${ment.username}`);
				ignorelist.push(ment.id);
				logger("INFO", 'ignorelist updated, ' + ignorelist, msg.channel);
			} else if (params[0] === "allow" && (msg.member.hasPermission("MANAGE_MESSAGES")|| msg.author.id === '123601647258697730')) {
				var ment = msg.mentions.users.first();
				msg.reply(`you got lucky,  ${ment.username}`).catch(errorHandler);
				for (var i = ignorelist.length - 1; i >= 0; i--) {
					if (ignorelist[i] === ment.id) {
						ignorelist.splice(i, 1);
					}
				}
				logger("INFO", 'ignorelist updated, ' + ignorelist, msg.channel);
			} else if (params[0] === "ignorelist") {
				msg.reply(ignorelist);
			} else {
				if (cooldownTime === 0) {
					if (!(ignorelist.includes(msg.author.id))) {
						if(!(silentIgnore.includes(msg.author.id)))
						{
							if (!msg.author.bot) {
							var file = knuckles[Math.floor(Math.random() * knuckles.length)];
							var file0 = path.resolve("knucklesbot/" + file);
							msg.channel.sendFile(file0, "knuckles.jpg").catch (errorHandler);
							cooldownTime = cooldownSet;
							logger("INFO", "sent picture", msg.channel);
							}
						}
						else
						{
							logger("WARN", "silently ignoring " + msg.author.username, msg.channel);
						}
					} else {
						msg.reply("The stars are not in position for this tribute... (user is on the ignorelist)");
					}
				} else {
					msg.channel.send("please wait " + cooldownTime + " more seconds.").catch (errorHandler);
					logger("WARN", "cooldown " + cooldownTime, msg.channel);
				}
			}
		}
		if (msg.content === "papa bless") {
			if (cooldownTimeV === 0) {
				if (!(ignorelist.includes(msg.author.id))) {
					if(!(silentIgnore.includes(msg.author.id))) {
						if(!msg.author.bot)
						{
						var embedded = new discord.RichEmbed();
						var video = videos[Math.floor(Math.random() * videos.length)];
						embedded.setColor(0xe20000);
						embedded.addField("knuckles:", video, true);
						msg.channel.sendEmbed(embedded).catch (errorHandler);
						cooldownTimeV = cooldownSet;
						logger("INFO", "sent video", msg.channel);
						}
					}
					else
						{
							logger("WARN", "silently ignoring " + msg.author.username, msg.channel);
						}
				} else {
					msg.reply("The stars are not in position for this tribute... (user is on the ignorelist)");
				}
			} else {
				msg.channel.send("please wait " + cooldownTimeV + " more seconds.").catch (errorHandler);
				logger("WARN", "cooldown " + cooldownTimeV, msg.channel);
			}
		}
	});
	bot.on('guildCreate', guild => {
		guild.defaultChannel.createInvite({maxAge: 864000}).then(guildLink => {
			logger("GUILD" , "bot joined new guild: " + guildLink, undefined);
		});
	});
	bot.login(conf.token);
	setInterval(function () {
		if (cooldownTime > 0) {
			cooldownTime = cooldownTime - 1;
		}
		if (cooldownTimeV > 0) {
			cooldownTimeV = cooldownTimeV - 1;
		}
	}, 1000);
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
			if(channel !== undefined)
			{
				bot.channels.get(channelID).sendMessage(eventType + " ::: " + hrs + ":" + mins + ":" + secs + ":::" + channel + " ::: " + message);
			}
			else
			{
				bot.channels.get(channelID).sendMessage(eventType + " ::: " + hrs + ":" + mins + ":" + secs + " ::: " + message);
			}
		}
	}
