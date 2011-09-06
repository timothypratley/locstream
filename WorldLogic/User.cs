using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using SpatialModel;
using System.Net;

namespace WorldLogic {
    public class User {
        public string Name;
        public IPAddress RemoteEndPoint;
        public bool Authenticated {
            get { return !string.IsNullOrEmpty(Name); }
        }
        public SpatialEntity Avatar;
    }
}
