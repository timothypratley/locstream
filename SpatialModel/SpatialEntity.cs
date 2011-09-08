using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Windows.Media.Media3D;

namespace SpatialModel
{
    public class SpatialEntity
    {
        public string Name { get; private set; }
        public string Model { get; private set; }
        public Vector3D Position { get; private set; }
        public Quaternion Rotation { get; private set; }

        public SpatialEntity(string name, string model, Vector3D position, Quaternion rotation)
        {
            Name = name;
            Model = model;
            Position = position;
            Rotation = rotation;
        }
    }
}
