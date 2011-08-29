using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Fleck;
using SpatialModel;
using Newtonsoft.Json;
using System.Collections.Concurrent;
using Commands;

namespace server {
    public class Listener {
        List<IWebSocketConnection> allSockets = new List<IWebSocketConnection>();

        public Listener(ConcurrentQueue<SocketCommand> commands) {
            var server = new WebSocketServer("ws://localhost:8181");
            server.Start(socket => {
                socket.OnOpen = () => {
                    Console.WriteLine("Open!");
                    allSockets.Add(socket);
                    SendWorld(socket);
                };
                socket.OnClose = () => {
                    Console.WriteLine("Close!");
                    allSockets.Remove(socket);
                };
                socket.OnMessage = message => {
                    Console.WriteLine(message);
                    try {
                        var update = JsonConvert.DeserializeObject<Update>(message);
                        commands.Enqueue(new SocketCommand(socket, update));
                    } catch (Exception ex) {
                        Console.WriteLine(ex);
                    }
                };
            });
        }

        public void Broadcast(object message) {
            foreach(var socket in allSockets.ToList()) {
                socket.Send(JsonConvert.SerializeObject(message));
            }
        }

        public void Send(IWebSocketConnection socket, object message) {
            socket.Send(JsonConvert.SerializeObject(message));
        }
    }
}
