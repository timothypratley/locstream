using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using SpatialModel;
using System.Collections.Concurrent;
using WorldHistory;

namespace WorldLogic {
    public class Ticker {
        History worldHistory;
        object worldLock = new object();

        Intelligence intelligence = new Intelligence();
        Rules rules = new Rules();
        BlockingCollection<CommandPending> pendingCommands;
        BlockingCollection<CommandResult> commandResults;

        public Ticker(BlockingCollection<CommandPending> pending, BlockingCollection<CommandResult> results, History history) {
            pendingCommands = pending;
            commandResults = results;
            worldHistory = history;
        }

        public void Update() {
            lock (worldLock) {
                intelligence.Update();
                rules.Update();
            }
        }

        public void ProcessCommands() {
            while (!pendingCommands.IsCompleted) {
                var pending = pendingCommands.Take();
                lock (worldLock) {
                    string errorMessage;
                    var eventx = worldHistory.Head.CheckAndProcessMessage(pending.User, pending.Command, out errorMessage);
                    if (eventx != null && errorMessage == null)
                        worldHistory.ApplyEvent(eventx);
                    commandResults.TryAdd(new CommandResult(pending.Id, errorMessage, eventx));
                }
            }
        }
    }
}
