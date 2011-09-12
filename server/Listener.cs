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
using System.Diagnostics.Contracts;

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
                    foreach (var entity in history.Head.Entities.Select(x => x.Value)) {
                        Send(socket, entity);
                    }
                };
                socket.OnClose = () => {
                    Console.WriteLine("Close!");
                    allSockets.Remove(socket);
                    User user;
                    if (userMap.TryGetValue(socket, out user)) {
                        var remove = new Remove() { name = user.Name };
                        pendingCommands.TryAdd(new CommandPending(commandID, new User(), remove));
                        commandMap.Add(commandID++, socket);
                    }
                };
                socket.OnMessage = message => {
                    Console.WriteLine(message);
                    try {
                        var update = JsonConvert.DeserializeObject<Update>(message);
                        userMap[socket] = new User() { Name = update.name };
                        pendingCommands.TryAdd(new CommandPending(commandID, new User(), update));
                        commandMap.Add(commandID++, socket);
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
                socket.Send(Serialize(message));
            }
        }

        public void Send(IWebSocketConnection socket, object message) {
            socket.Send(Serialize(message));
        }

        public static string Serialize(object message) {
            if (message is SpatialEntity) {
                var se = (SpatialEntity)message;
                message = new Events.Update() { name = se.Name, x = (float)se.Position.X, y = (float)se.Position.Y, z = (float)se.Position.Z };
            }
            return JsonConvert.SerializeObject(message);
        }

        [ContractInvariantMethod]
        void Invariants()
        {
            Contract.Invariant(allSockets != null);
        }
    }
}
