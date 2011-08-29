using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using SpatialModel;

namespace WorldLogic {
    public class Ticker {
        Recorded<WorldModel> recordedWorld = new Recorded<WorldModel>(WorldModel.Empty);
        Intelligence intelligence = new Intelligence();
        MessageProcessor messageProcessor = new MessageProcessor();
        Rules rules = new Rules();

        public void Update() {
            intelligence.Update();
            messageProcessor.CheckAndProcessMessage();
            rules.Update();
        }
    }
}
