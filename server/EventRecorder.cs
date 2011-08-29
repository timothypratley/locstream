using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using BookSleeve;

namespace server {
    class EventRecorder {
        public static void foo() {
            using (var redis = new RedisConnection("goosefish.redistogo.com", 9836, -1, "88f5c87381f5564b18b4ecba2647e9ab")) {
                redis.Open();
                redis.Lists.AddLast(1, "w00t", "t00t");
            }
        }
    }
}
