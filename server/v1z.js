/// The following comment gives you intellisense
/// <reference path="http://mrdoob.github.com/three.js/build/Three.js" />

// from: http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// shim layer with setTimeout fallback
window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame ||
              window.oRequestAnimationFrame ||
              window.msRequestAnimationFrame ||
              function (/* function */callback, /* DOMElement */element) {
                  window.setTimeout(callback, 1000 / 60);
              };
})();



var V1Z = function () {
    return {
        WebGl: !!window.WebGLRenderingContext,

        // Scene class, never instantiated directly
        // if pcolour... parameters are not passed, the class will try to fall back on globally scoped colour1... variables
        Scene: function (domContainer, height, width, autoAnimate, pcolour1, pcolour2, pcolour3, pcolour4, pcolour5) {
            this.DomContainer = domContainer;
            this.DomContainer.innerHeight = height;
            this.DomContainer.innerWidth = width;
            this.Camera = new THREE.Camera(70, height / width, 1, 50);
            this.Camera.far = 20000;
            //            this.Camera = new THREE.FirstPersonCamera({

            //                fov: 60, aspect: height / width, near: 1, far: 20000,
            //                movementSpeed: 1000, lookSpeed: 0.1, noFly: false, lookVertical: true

            //            });
            this.Scene = new THREE.Scene();
            this.Renderer = null;
            this.IsAnimated = autoAnimate;

            this.Colour1 = pcolour1;
            this.Colour2 = pcolour2;
            this.Colour3 = pcolour3;
            this.Colour4 = pcolour4;
            this.Colour5 = pcolour5;
            if (!pcolour1 && colour1) {
                this.Colour1 = colour1;
            }
            if (!pcolour2 && colour2) {
                this.Colour2 = colour2;
            }
            if (!pcolour3 && colour3) {
                this.Colour3 = colour3;
            }
            if (!pcolour4 && colour4) {
                this.Colour4 = colour4;
            }
            if (!pcolour5 && colour5) {
                this.Colour5 = colour5;
            }

            this.moveToward = function (target) {
                this.Camera.target.x = target.x;
                this.Camera.target.y = target.y;
                this.Camera.target.z = target.z;
                this.Camera.position = this.Camera.position.addSelf(target.subSelf(this.Camera.position).divideScalar(30));
            }

            this.initialise = function () {

                // TODO: The camera position should be based on the intial size of the scene, not hardcoded
                // This is why everyone needs HELP!
                this.Camera.position.x = 5;
                this.Camera.position.y = 5;
                this.Camera.position.z = 5;
                this.Camera.target.x = -1;
                this.Camera.target.y = -1;
                this.Camera.target.z = -1;

                var directionalLight = new THREE.DirectionalLight(0xffffff);
                directionalLight.position.x = -7.5;
                directionalLight.position.y = -7.5;
                directionalLight.position.z = 7.5;
                directionalLight.intensity = 0.5;
                directionalLight.position.normalize();

                this.Scene.addLight(directionalLight);

                var ambientLight = new THREE.AmbientLight(0xffffff);

                this.Scene.addLight(ambientLight);

            };

            this.initialiseScene = function () { throw 'You must redeclare initialise scene'; };

            this.initialise();

            this.renderCount = 0;
            this.animationCount = 0;
            this.render = function () {

                if (!this.Renderer) {

                    this.initialiseScene();

                    this.Renderer = new THREE.WebGLRenderer();
                    this.Renderer.setClearColor(0xffccaa, 0);
                    this.Renderer.setSize(this.DomContainer.innerWidth, this.DomContainer.innerHeight);
                    this.DomContainer.appendChild(this.Renderer.domElement);
                }

                this.renderCount++;
                if (this.IsAnimated == true) {
                    this.animationCount++;
                }
                for (var key in this.SceneObjects) {
                    if (this.IsAnimated == true) {
                        this.SceneObjects[key].animate(this.animationCount);
                    }
                }
                if (this.IsAnimated == true) {
                    this.animateCamera(this.animationCount);
                }

                this.Renderer.render(this.Scene, this.Camera);
            };

            this.animateCamera = function (pacemaker) { };

            // stores Gr1dObjects associated with this scene
            this.SceneObjects = new Object();

            this.addObject = function (object) {
                object.initialiseObject();

                this.SceneObjects[object.Key] = object;
                this.Scene.addObject(object.Mesh);
            }

            this.startRendering = function (fps) {
                setInterval(this.render, fps);
            };

            this.stopRendering = function () {
                clearInterval(this.render);
            };

            this.startAnimation = function () {
                this.IsAnimated = true;
            }

            this.stopAnimation = function () {
                this.IsAnimated = false;
            }

            this.colourGetIntensity = function (colour) {

                var red = (colour & 0xFF0000) / 0x010000;
                var green = (colour & 0x00FF00) / 0x000100;
                var blue = (colour & 0x0000FF) / 0x000001;
                // allegedly 0.3, 0.59, and 0.11 match how "dark" humans see various color tones
                return (0.3 * red) + (0.59 * green) + (0.11 * blue);
            };
        },

        Gr1dObject: function (scene, key) {
            this.Key = key;
            this.Mesh = null;
            this.Scene = scene;
            this.X = 0;
            this.Y = 0;
            this.Z = 0;
            this.animate = function (pacemaker) { };
            this.initialiseObject = function () { };
        },

        Player: function (scene, player, x, y, z) {
            this.inheritsFrom = V1Z.Gr1dObject;
            this.makeKey = function (player) {
                return 'Player_' + player;
            }
            this.inheritsFrom(scene, this.makeKey(player));

            this.initialiseObject = function () {
                var materials = [];
                for (var i = 0; i < 6; i++) {
                    materials.push([new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff })]);
                }

                var cube = new THREE.Mesh(new THREE.Cube(1, 1, 1, 1, 1, 1, materials), new THREE.MeshFaceMaterial());
                    cube.position.x = x;
                    cube.position.y = y;
                    cube.position.z = z;

                cube.overdraw = true;
                this.Mesh = cube;
            };

            this.animate = function (pacemaker) {
                this.Mesh.rotation.x = Math.cos(pacemaker / 50) * 5;
                this.Mesh.rotation.z = Math.sin(pacemaker / 50) * 5;
            };
        },

        Agent: function (scene, node, playerClassName, player, agentClassName, level, slot, stackMax, stackDeficit) {
            this.inheritsFrom = V1Z.Gr1dObject;
            this.makeKey = function (player, agentClassName, level, slot) {
                return 'Agent_' + player + '_' + agentClassName + '_' + level + '_' + slot;
            }
            this.inheritsFrom(scene, this.makeKey(player, agentClassName, length, slot));
            this.Class = agentClassName;

            this.initialiseObject = function () {

                // for now, I am a boring cube with random colours sides
                // IMAGINE IF this function was something like
                /*
                switch(Class) {
                case 'Engineer': // add cool engineer struts
                case 'Pirate' : // add cool pirate copy
                case 'AndSoOn' : // add other awesome stuff
                }

                */
                var materials = [];

                for (var i = 0; i < 6; i++) {

                    materials.push([new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff })]);

                }


                var cube = null;
                if (node) {
                    cube = new THREE.Mesh(new THREE.Cube(0.3, 0.3, 0.3, 1, 1, 1, materials), new THREE.MeshFaceMaterial());
                    cube.position.x = node.X;
                    cube.position.y = node.Y;
                    cube.position.z = node.Z;
                }
                else {
                    cube = new THREE.Mesh(new THREE.Cube(1, 1, 1, 1, 1, 1, materials), new THREE.MeshFaceMaterial());
                    cube.position.x = 0;
                    cube.position.y = 0;
                    cube.position.z = 0;

                }

                cube.overdraw = true;
                this.Mesh = cube;
            };

            this.animate = function (pacemaker) {
                this.Mesh.rotation.x = Math.cos(pacemaker / 50) * 5;
                this.Mesh.rotation.z = Math.sin(pacemaker / 50) * 5;
            };

        },

        Node: function (scene, layer, row, column, focusLayer, focusRow, focusColumn) {
            this.inheritsFrom = V1Z.Gr1dObject;
            validateLayerRowColumn(layer, row, column);
            validateLayerRowColumn(focusLayer, focusRow, focusColumn);
            this.makeKey = function (layer, row, column) {
                return 'Node_' + layer + '_' + row + '_' + column;
            }
            this.inheritsFrom(scene, this.makeKey(layer, row, column));

            this.Agents = new Object();

            function validateLayerRowColumn(layer, row, column) {
                if (row > layer || row > column || column > layer) {
                    //throw 'Invalid layer ' + layer + ', row ' + row + ', column ' + column + ' specified';
                }
            };

            this.addAgent = function (playerClassName, player, agentClassName, level, slot, stackMax, stackDeficit) {

                var agent = new V1Z.Agent(this.Scene, this, playerClassName, player, agentClassName, level, slot, stackMax, stackDeficit);

                // TODO: spread them out as more are added
                // We want agents to automatically spread out like they are repelled
                this.Agents[agent.Key] = agent;

                this.Scene.addObject(agent);
                return agent;
            };

            this.initialiseObject = function () {
                var nodeX = 0;
                var nodeY = 0;
                var nodeZ = 0;

                // focusLayer, focusRow and focusColumn represent the layer, row and column of the 
                // node that should be rendered at 0,0,0
                // TODO: following logic is incorrect and needs fixing!!!
                // Essentially, we want these nodes to have their position.x, .y and .z in a tetrahedral mesh
                nodeX = (layer);
                nodeY = (row);
                nodeZ = (column);

                // this chooses an opacity based on SceneColour1, lower opacity the higher the colour intensity
                // generally relies on their being a background behind the render target so may be very opaque on white
                var opacity = 1 / 2;


                // TODO: geometry and material can probably be reused, so perhaps no need to redeclare here
                // TODO: the /10 + 20 spam here is an attempt to get detail right, no use using a gazillion triangles to render a 20px sphere....
                var sphereG = new THREE.Sphere(1, (this.Scene.DomContainer.innerWidth / 20) + 20, (this.Scene.DomContainer.innerHeight / 20) + 20);
                var material = new THREE.MeshPhongMaterial({ ambient: this.Scene.Colour2, color: this.Scene.Colour1, specular: 0xffffff, shininess: 100, shading: THREE.SmoothShading, opacity: opacity })

                material.overdraw = false;
                material.doublesided = true;

                sphere = new THREE.Mesh(sphereG, material);
                sphere.overdraw = material.overdraw;
                sphere.doublesided = material.doublesided;

                sphere.position.x = nodeX; // 0.816496;
                sphere.position.y = nodeY; // 0;
                sphere.position.z = nodeZ; // 0.57735;

                this.X = sphere.position.x;
                this.Y = sphere.position.y;
                this.Z = sphere.position.z;

                this.Mesh = sphere;
            };

        },

        Gr1dScene: function (domContainer, height, width, focusLayer, focusRow, focusColumn, autoAnimate, colour1, colour2, colour3, colour4, colour5) {
            this.inheritsFrom = V1Z.Scene;
            this.inheritsFrom(domContainer, height, width, autoAnimate, colour1, colour2, colour3, colour4, colour5);
            this.FocusLayer = focusLayer;
            this.FocusRow = focusRow;
            this.FocusColumn = focusColumn;

            this.initialiseScene = function () { };

            this.addNode = function (layer, row, column) {
                var node = new V1Z.Node(this, layer, row, column, this.FocusLayer, this.FocusRow, this.FocusColumn);
                this.addObject(node);
                return node;
            };

            this.addPlayer = function (player, x, y, z) {
                var agent = new V1Z.Agent(this.Scene, this, playerClassName, player, agentClassName, level, slot, stackMax, stackDeficit);

                // TODO: spread them out as more are added
                // We want agents to automatically spread out like they are repelled
                this.Agents[agent.Key] = agent;

                this.Scene.addObject(agent);
                return agent;
            };


            this.fillNodes = function (radius) {
                // forward:
                var addingLayer = focusLayer;
                while (addingLayer < radius) {
                    var addingRow = focusRow;
                    while (addingRow < radius && addingRow <= addingLayer) {
                        var addingColumn = focusColumn;
                        while (addingColumn < radius && addingColumn <= addingRow) {
                            this.addNode(addingLayer, addingRow, addingColumn);
                            addingColumn++;
                        }
                        addingRow++;
                    }
                    addingLayer++;
                }
                // TODO: backward
                //this.Camera.position.x *= radius;
                //this.Camera.position.y *= radius;
                //this.Camera.position.z *= radius;
            }
        },

        LogoScene: function (domContainer, height, width, colour1, colour2, colour3, colour4, colour5) {
            this.inheritsFrom = V1Z.Gr1dScene;
            this.inheritsFrom(domContainer, height, width, 0, 0, 0, true, colour1, colour2, colour3, colour4, colour5);

            this.initialiseScene = function () {
                this.addNode(0, 0, 0);
                this.addNode(1, 0, 0);
                this.addNode(1, 1, 0);
                this.addNode(1, 1, 1);

            };

            // "override" animateCamera with logo specific animation
            this.animateCamera = function (pacemaker) {
                this.Camera.position.x = Math.cos(pacemaker / 50) * 2.5;
                this.Camera.position.z = Math.sin(pacemaker / 50) * 2.5;
            }

        },

        AgentScene: function (domContainer, height, width, agentClass, colour1, colour2, colour3, colour4, colour5) {
            this.inheritsFrom = V1Z.Scene;
            this.inheritsFrom(domContainer, height, width, false, colour1, colour2, colour3, colour4, colour5);
            this.AgentClass = agentClass;

            this.initialiseScene = function () {
                var agent = new V1Z.Agent(this.Scene, null, agentClass, null, null, 1, 1, 20, 0);
                this.addObject(agent);
                this.Camera.position.x = 1.1;
                this.Camera.position.y = 1.1;
                this.Camera.position.z = 1.1;
            }
        }
    };
} ();