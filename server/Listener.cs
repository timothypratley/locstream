using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Fleck;
using SpatialModel;
using Newtonsoft.Json;
using System.Collections.Concurrent;
using Commands;
using WorldHistory;
using WorldLogic;

namespace server {
    public class Listener {
        readonly List<IWebSocketConnection> allSockets = new List<IWebSocketConnection>();

        public Listener(BlockingCollection<CommandPending> pendingCommands, BlockingCollection<CommandResult> commandResults, History history) {
            var server = new WebSocketServer("ws://localhost:8181");
            var commandMap = new Dictionary<int, IWebSocketConnection>();
            int commandID = 0;
            var userMap = new Dictionary<IWebSocketConnection, User>();

            history.EventApplied += (sender, e) => Broadcast(e);
            server.Start(socket => {
                socket.OnOpen = () => {
                    Console.WriteLine("Open!");
                    allSockets.Add(socket);

                    // send the current world
                    // TODO: race condition if event fires before world is sent
                    foreach (var entity in history.Head.Entities) {
                        Send(socket, entity);
                    }
                };
                socket.OnClose = () => {
                    Console.WriteLine("Close!");
                    allSockets.Remove(socket);
                };
                socket.OnMessage = message => {
                    Console.WriteLine(message);
                    try {
                        var update = JsonConvert.DeserializeObject<Update>(message);
                        commandMap.Add(commandID++, socket);
                        pendingCommands.TryAdd(new CommandPending(0, new User(), update));
                    } catch (Exception ex) {
                        Console.WriteLine(ex);
                    }
                };
            });

            CommandResult result;
            while (commandResults.TryTake(out result)) {
                IWebSocketConnection socket;
                if (commandMap.TryGetValue(result.Id, out socket)) {
                    Send(socket, result);
                    commandMap.Remove(result.Id);
                }
            }
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
