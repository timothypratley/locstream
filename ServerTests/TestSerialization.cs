using System;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Newtonsoft.Json;
using System.Windows.Media.Media3D;
using FluentAssertions;


namespace ServerTests
{
    [TestClass]
    public class TestSerialization
    {
        [TestMethod]
        public void JsonVector3D()
        {
            var vec = new Vector3D(1, 2, 3);
            var str = JsonConvert.SerializeObject(vec);
            var vec2 = JsonConvert.DeserializeObject<Vector3D>(str);
            vec2.Should().Equals(vec);
        }
    }
}
