using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Events;
using SpatialModel;
using System.Diagnostics;

namespace WorldHistory {
    public class History {
        Recorded<WorldModel> recordedWorld = new Recorded<WorldModel>(WorldModel.Empty);
        public WorldModel Head { get { return recordedWorld.Head; } }

        public delegate void ChangedEventHandler(object sender, object e);
        public event ChangedEventHandler EventApplied;

        // TODO: do we even need this??
        public void ApplyEvent(dynamic eventx) {
            Apply(eventx);
            OnEventApplied(eventx);
        }

        private void OnEventApplied(dynamic eventx) {
            var eventHandler = EventApplied;
            if (eventHandler != null) {
                eventHandler(this, eventx);
            }
        }

        void Apply(object eventx) {
            Debug.Assert(false, "Unknown event " + eventx);
        }

        void Apply(Update update) {
            
        }

        void Apply(SpatialEntity entity) {
            recordedWorld.Head = recordedWorld.Head.Add(entity);
        }
    }
}
