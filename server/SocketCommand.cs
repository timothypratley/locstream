using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Fleck;

namespace server {
    public class SocketCommand {
        public IWebSocketConnection Socket;
        public object Command;

        public SocketCommand(IWebSocketConnection socket, object update) {
            // TODO: Complete member initialization
            Socket = socket;
            Command = update;
        }
    }
}
