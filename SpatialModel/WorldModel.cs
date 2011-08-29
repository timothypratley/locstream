using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Windows.Media.Media3D;
using Microsoft.FSharp.Collections;


namespace SpatialModel
{
    public class WorldModel
    {
        public FSharpMap<string, SpatialEntity> Entities { get; private set; }

        public WorldModel(FSharpMap<string, SpatialEntity> entities)
        {
            Entities = entities;
        }

        private static readonly WorldModel _empty = new WorldModel(MapModule.Empty<string, SpatialEntity>());
        public static WorldModel Empty { get { return _empty; } }

        public WorldModel Add(SpatialEntity entity)
        {
            return new WorldModel(Entities.Add(entity.Name, entity));
        }

        public WorldModel Remove(string entityName) {
            return new WorldModel(Entities.Remove(entityName)); 
        }
    }
}
