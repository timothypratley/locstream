using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Fleck;
using Newtonsoft.Json;
using SpatialModel;
using System.Collections.Concurrent;
using WorldLogic;
using WorldHistory;
using System.Threading.Tasks;

namespace server {
    class Program {
        static void Main(string[] args) {
            var commands = new BlockingCollection<CommandPending>();
            var results = new BlockingCollection<CommandResult>();
            var history = new History();
            var listener = new Listener(commands, results, history);
            var ticker = new Ticker(commands, results, history);
            var task = new Task(ticker.ProcessCommands);
            task.Start();

            var input = Console.ReadLine();
            while (input != "exit") {
                listener.Broadcast(input);
                input = Console.ReadLine();
            }
        }
    }
}
