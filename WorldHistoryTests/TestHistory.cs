using System;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using WorldHistory;
using SpatialModel;
using System.Windows.Media.Media3D;
using FluentAssertions;

namespace WorldHistoryTests
{
    [TestClass]
    public class TestHistory
    {
        [TestMethod]
        public void TestAddEntity()
        {
            var history = new History();
            var eventx = new SpatialEntity("foo", "bar", new Vector3D(), Quaternion.Identity);
            history.ApplyEvent(eventx);
            history.Head.Entities["foo"].Should().BeSameAs(eventx);
        }
    }
}
