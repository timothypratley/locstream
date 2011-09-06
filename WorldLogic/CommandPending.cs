using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace WorldLogic {
    public class CommandPending {
        public int Id { get; private set; }
        public User User { get; private set; }
        public object Command { get; private set; }

        public CommandPending(int id, User user, object command) {
            Id = id;
            User = user;
            Command = command;
        }
    }
}
