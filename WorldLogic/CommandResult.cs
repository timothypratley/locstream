using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace WorldLogic {
    public class CommandResult {
        public int Id { get; private set; }
        public string ErrorMessage { get; private set; }
        public bool Success { get { return ErrorMessage == null; } }
        public object Event { get; private set; }

        public CommandResult(int id, string errorMessage, object eventx) {
            Id = id;
            ErrorMessage = errorMessage;
            Event = eventx;
        }
    }
}
