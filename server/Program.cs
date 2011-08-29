using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Fleck;
using Newtonsoft.Json;
using SpatialModel;
using System.Collections.Concurrent;
using WorldLogic;

namespace server {
    class Program {
        static void Main(string[] args) {
            var commands = new ConcurrentQueue<SocketCommand>();
            var listener = new Listener(commands);
            var ticker = new Ticker();
            ticker.Update();

            var input = Console.ReadLine();
            while (input != "exit") {
                listener.Broadcast(input);
                input = Console.ReadLine();
            }
        }
    }
}
