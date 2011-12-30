/// The following comment gives you intellisense
/// <reference path="http://mrdoob.github.com/three.js/build/Three.js" />

(function (v1z) {

    var geometries = {},
        materials = {};

    function createModelGeometry(modelName) {
        return new THREE.CubeGeometry(5, 2, 10);
    }
    function createContainerGeometry(dimensions) {
        return new THREE.CubeGeometry(dimensions.length, dimensions.width, dimensions.height);
    }
    function getGeometry(object) {
        var create, dimensions, spec, key;
        switch (object.type) {
            case "container":
                create = createContainerGeometry;
                spec = v1z.sizetype.getDimensions(object.sizetype);
                break;
            default:
                create = createModelGeometry;
                spec = object.type;
        }
        key = JSON.stringify(spec);
        return geometries[key]
            || (geometries[key] = create(spec));
    }

    function createMaterial(spec) {
        return new THREE.MeshPhongMaterial(spec);
    }
    function getMaterial(object) {
        var spec, key;
        switch (object.type) {
            case "container":
                spec = { color: object.shipper || 0x004488 };
                break;
            default:
                spec = { color: object.color || 0x448800 };
        }

        key = JSON.stringify(spec);
        return materials[key]
            || (materials[key] = createMaterial(spec));
    }

    function createEntity(object) {
        var e = new THREE.Mesh(getGeometry(object));
        e.material = getMaterial(object);
        return e;
    }

    function generate() {
        var world = new THREE.Object3D(),
            ii, jj, kk, height, st,
            container,
            count = 0,
            colors = [0x4400CC, 0x880088, 0xCC0044];

        // randomly generate some containers
        for (ii = 0; ii < 20; ii++) {
            for (jj = 0; jj < 20; jj++) {
                height = (Math.floor(Math.random() * 4));
                st = (Math.random() < 0.5 ? "2200" : "4200");
                for (kk = 0; kk < height; kk++) {
                    container = createEntity({
                        type: "container",
                        sizetype: st,
                        shipper: colors[Math.floor(Math.random() * 3)]
                    });
                    container.position.set(
                        -200 + ii * 13.176 + Math.floor(ii / 10) * 5,
                        -70 + jj * 3.422 + Math.floor(jj / 8) * 5,
                        kk * 2.9);
                    world.add(container);
                    count++;
                }
            }
        }
        console.log("generated " + count + " containers");
        return world;
    }

    v1z.model = {};

    v1z.model.create = function () {
        return generate();
    };

} (window.v1z = window.v1z || {}));
