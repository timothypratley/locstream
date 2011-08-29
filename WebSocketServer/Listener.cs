using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Fleck;

namespace WebSocketServer {
    public class Listener {
        public Listener() {
                    var allSockets = new List<IWebSocketConnection>();
            var server = new WebSocketServer("ws://localhost:8181");
            server.Start(socket => {
                socket.OnOpen = () => {
                    Console.WriteLine("Open!");
                    allSockets.Add(socket);
                    SendAll(socket);
                };
                socket.OnClose = () => {
                    Console.WriteLine("Close!");
                    allSockets.Remove(socket);
                };
                socket.OnMessage = message => {
                    Console.WriteLine(message);
                };
            });


            var input = Console.ReadLine();
            while (input != "exit") {
                foreach (var socket in allSockets.ToList()) {
                    socket.Send(input);
                    var e = new SpatialEntity { name = "foo", model = "bar", X = 1, Y = 1, Z = 1 };
                    world.Add(e.name, e);
                    socket.Send(JsonConvert.SerializeObject(e));
                }
                input = Console.ReadLine();
            }
        }

        static void SendAll(IWebSocketConnection socket) {
            foreach (var e in world.Values.ToList()) {
                socket.Send(JsonConvert.SerializeObject(e));
            }
        }
    }
}
