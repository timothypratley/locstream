using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using SpatialModel;

namespace WorldLogic {
    public class User {
        public string Name;
        public bool Authenticated {
            get { return !string.IsNullOrEmpty(Name); }
        }
        public SpatialEntity Avatar;
    }
}
