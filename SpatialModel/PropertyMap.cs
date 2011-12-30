using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Windows.Media.Media3D;
using Microsoft.FSharp.Collections;

namespace SpatialModel
{
    public class PropertyMap
    {
        public enum PropertyEnum
        {
            Id,
            Postition,
            Rotation,
            Mesh,
            Speed
        }

        public readonly FSharpMap<PropertyEnum, object> Properties
            = MapModule.Empty<PropertyEnum, object>();

        public static readonly IDictionary<PropertyEnum, Type> PropertyTypes
            = MapModule.Empty<PropertyEnum, Type>()
            .Add(PropertyEnum.Id, typeof (int))
            .Add(PropertyEnum.Postition, typeof (Vector3D))
            .Add(PropertyEnum.Rotation, typeof (Quaternion))
            .Add(PropertyEnum.Mesh, typeof (string))
            .Add(PropertyEnum.Speed, typeof (double));
    }
}

