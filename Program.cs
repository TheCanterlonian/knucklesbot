//knucklesbot rewritten by Nikole Powell
/* Documentation -:
Intent:
basically knuckles bot but in C#
End of Line */

//this is the using list
//you'll need the first one for EVERYTHING you ever make
using System;
//these came with the initialization
using System.Collections.Generic;
using System.Linq;
using System.Text;
//usefull thingsies
using System.Threading.Tasks;
using System.Threading;
using System.IO;
using System.Reflection;
using System.Data;
//Discord stuffs ^w^
using Discord;
using Discord.Commands;
using Discord.WebSocket;

//KnucklesBot ReWritten
namespace knucklesBot
{
    //make this public so it can be called from outside
    public class Program
    {
        //variable to be assigned a token at runtime
        public static string botTokenVariable = ("notYet");
        //creates a holder to sterilize the token
        public static string botTokenVariableHolder = ("notYet");
        //main program starting method
        public static void Main(string[] args)
        {
            //checks if the bot folder doesn't exist
            if (!Directory.Exists(@"C:\CanterlotApplications\knucklesBot\"))
            {
                //checks if the app folder doesn't exist
                if (!Directory.Exists(@"C:\CanterlotApplications\"))
                {
                    //create the app folder
                    DirectoryInfo workDir = Directory.CreateDirectory(@"C:\CanterlotApplications\");
                    //make it hidden so the user doesn't destroy it
                    workDir.Attributes = FileAttributes.Directory | FileAttributes.Hidden;
                }
                //creates the bot folder
                Directory.CreateDirectory(@"C:\CanterlotApplications\knucklesBot\");
            }
            //checks for the nonexistence of the token file
            if (!File.Exists(@"C:\CanterlotApplications\knucklesBot\token.txt"))
            {
                //creates the token file
                File.Create(@"C:\CanterlotApplications\knucklesBot\token.txt");
                //retrieves a token from the user
                Console.WriteLine("");
                Console.WriteLine("knucklesBot needs a token:");
                Console.WriteLine("");
                Console.WriteLine("");
                //puts the token in the holder
                botTokenVariableHolder = Console.ReadLine();
                //check if the token is null
                while (botTokenVariableHolder == (null) || botTokenVariableHolder == (""))
                {
                    //inform the user of their mistake
                    Console.WriteLine("");
                    Console.WriteLine("The token was null.");
                    //try to get the token again
                    Console.WriteLine("");
                    Console.WriteLine("Please enter the correct token:");
                    Console.WriteLine("");
                    Console.WriteLine("");
                    botTokenVariableHolder = Console.ReadLine();
                }
                //checks if the user wants to continue
                if (botTokenVariableHolder == ("notYet"))
                {
                    //deletes the token file
                    File.Delete(@"C:\CanterlotApplications\knucklesBot\token.txt");
                    //exits the program
                    Environment.Exit(0);
                }
                //opens a stream to the token file
                StreamWriter swToken = new StreamWriter(@"C:\CanterlotApplications\knucklesBot\token.txt", false);
                //writes token to the token file
                swToken.WriteLine(botTokenVariableHolder);
                //remember to always close the stream when you're done... ALWAYS!!!
                swToken.Close();
                //clears the screen so that the token can't be seen
                Console.Clear();
            }
            //checks that the token file exists
            if (File.Exists(@"C:\CanterlotApplications\knucklesBot\token.txt"))
            {
                //writes the content of the token file to the holder
                botTokenVariableHolder = File.ReadAllText(@"C:\CanterlotApplications\knucklesBot\token.txt");
                //writes the token from the holder to the token variable
                botTokenVariable = botTokenVariableHolder;
            }
            //is obsolete but still looks good on the console
            Console.WriteLine("");
            Console.WriteLine("knucklesBot is running...");
            Console.WriteLine("");
            Console.WriteLine("");
            //run the async threading method which starts the bot
            new Program().MainAsync().GetAwaiter().GetResult();
        }
        //async threading method
        public async Task MainAsync()
        {
            //creates a new instance of DiscordSocketClient
            DiscordSocketClient _client = new DiscordSocketClient();
            //hooks log event to log handler method
            _client.Log += Log;
            //logs the bot in to discord
            await _client.LoginAsync(TokenType.Bot, botTokenVariable);
            //start connection-reconnection logic
            await _client.StartAsync();
            //activates message receiver when a message is received
            _client.MessageReceived += MessageReceived;
            //block the async main method from returning until after the application is exited
            await Task.Delay(-1);
        }
        //message receiver activates when a message is recieved
        private async Task MessageReceived(SocketMessage message)
        {
            //activates if the bot is pinged
            String mescon= message.Content;
            //lowers the case of the input
            String meslower = mescon.ToLower();
            //checks if it is the correct input
            if (meslower.Contains("knuckles") == true)
            {
                //pongs back where it was pinged
                await message.Channel.SendFileAsync("images/knuck.png");
                //TODO: make this an array of files instead of a single file
            }
        }
        //log handler method
        private Task Log(LogMessage logmsg)
        {
            //writes log to console
            Console.WriteLine(logmsg.ToString());
            //tells the caller that this task was completed
            return Task.FromResult(1);
        }
    }
}
