//knucklesBot by Nikole Tiffany Powell
using System;
//these came with the initialization
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
//useful thingsies
using System.IO;
using System.Threading;
using System.Reflection;
using System.Data;
//discord stuffs ^w^
using Discord;
using Discord.Commands;
using Discord.WebSocket;

namespace knucklesBot
{
    //make this public so it can be called from outside
    public class Program
    {

        //variable to be assigned a token at runtime
        public static string botToken = ("notYet");
        //main program starting method is also public
        public static void Main(string[] args)
        {

            //create the runonce directory if it doesn't already exist
            if (!Directory.Exists(@"C:\CanterlotApplications\knucklesBot\"))
            {
                Console.WriteLine("Initializing...");
                //this will be used the entirety of the program's life
                if (!Directory.Exists(@"C:\CanterlotApplications\"))
                {
                    //make the parent first
                    DirectoryInfo diPMnew = Directory.CreateDirectory(@"C:\CanterlotApplications\");
                    //make it hidden so the user doesn't stumble upon it
                    diPMnew.Attributes = FileAttributes.Directory | FileAttributes.Hidden;
                }
                //now make the child
                Directory.CreateDirectory(@"C:\CanterlotApplications\knucklesBot\");
                Console.WriteLine("Done!");
            }
            Console.WriteLine("Ready.");
            //create some startup variables
            bool answerIsNotValid = true;
            char answerReply = 'a';
            //ask permision to startup
            while (answerIsNotValid)
            {
                Console.WriteLine(@"Start knucklesBot? Y/N:");
                //take in the answer and assign it into a single-character variable
                ConsoleKeyInfo replyKeyChar = Console.ReadKey();
                Console.WriteLine("");
                answerReply = replyKeyChar.KeyChar;
                //check to see if the answer is any of the valid options
                if (((answerReply == 'y') || (answerReply == 'Y')) || ((answerReply == 'n') || (answerReply == 'N')))
                {
                    answerIsNotValid = false;
                }
                //check if the user said to close the program
                if ((answerReply == 'n') || (answerReply == 'N'))
                {
                    //close the program
                    Environment.Exit(499);
                }
                if (answerIsNotValid)
                {
                    Console.WriteLine("");
                    Console.WriteLine(@"Invalid option, please press 'Y' or 'N'.");
                }
            }
            Console.WriteLine("Starting knucklesBot...");
            //validity checking variable
            bool tokenIsValid = false;
            //check to see if the token file doesn't exist yet
            if (!File.Exists(@"C:\CanterlotApplications\knucklesBot\token.txt"))
            {
                //creates the token file
                File.Create(@"C:\CanterlotApplications\knucklesBot\token.txt");
                //check validity of token
                while (tokenIsValid == false)
                {
                    Console.WriteLine("");
                    Console.WriteLine("knucklesBot needs a valid token:");
                    //puts the token in the holder
                    botToken = Console.ReadLine();
                    Console.WriteLine("");
                    //check that the token is not null
                    if ((botToken != (null)) && (botToken != ("")))
                    {
                        // opens a stream to the token file
                        StreamWriter swToken = new StreamWriter(@"C:\CanterlotApplications\knucklesBot\token.txt", false);
                        //writes token to the token file
                        swToken.WriteLine(botToken);
                        //remember to always close the stream when you're done... ALWAYS!!!
                        swToken.Close();
                        //clears the screen so that the token can't be seen
                        Console.Clear();
                        //validate the token internally
                        tokenIsValid = true;
                    }
                    //checks if the user wants to continue
                    if (botToken == ("notYet"))
                    {
                        //deletes the token file
                        File.Delete(@"C:\CanterlotApplications\knucklesBot\token.txt");
                        //exits the program
                        Environment.Exit(498);
                    }
                    Console.WriteLine("That was not a valid token.");
                }
            }
            //writes the content of the token file to the holder
            botToken = File.ReadAllText(@"C:\CanterlotApplications\knucklesBot\token.txt");
            Console.WriteLine("");
            Console.WriteLine("Token has been loaded.");
            Console.WriteLine("");
            Console.WriteLine("Logging in...");
            Console.WriteLine("");
            //sets up to catch exceptions
            try
            {
                //run the async threading method which starts the bot
                new Program().MainAsync().GetAwaiter().GetResult();
            }
            //if an exception occurs
            catch (Exception errorOutput)
            {
                //let the user know
                Console.WriteLine("");
                Console.WriteLine("An error occured: ");
                Console.WriteLine("");
                Console.WriteLine(errorOutput);
                Console.WriteLine("");
                Console.WriteLine("End of Line.");
                Console.WriteLine("");
                Console.WriteLine("Quitting program...");
                Console.ReadKey();
                Environment.Exit(497);
            }

        }
        //async threading method
        public async Task MainAsync()
        {
            // creates a new instance of DiscordSocketClient
            DiscordSocketClient _client = new DiscordSocketClient();
            //hooks log event to log handler method
            _client.Log += Log;
            //logs the bot in to discord
            await _client.LoginAsync(TokenType.Bot, botToken);
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
            String mescon = message.Content;
            //makes the conent a string
            mescon = mescon.ToString();
            //lowers the case of the input
            mescon = mescon.ToLower();
            //checks if it is the correct input and pongs back where it was pinged
            if((mescon.Contains("knuckles") == true) && (!(message.Author.IsBot)))
            {
                await message.Channel.SendFileAsync(@"images\knuck.png");
                //TODO: make into a array and elect a random image instead of a specific one 
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
