/// The following comment gives you intellisense
/// <reference path="http://mrdoob.github.com/three.js/build/Three.js" />

(function (v1z) {

    // public
    v1z.view = {
        horizonSquared: 100 * 100,
        rotate: true,
        clearColor: 0x000000
    };

    // View rendering to either fullscreen or an element
    v1z.view.create = function (world) {
        // private
        var width = window.innerWidth,
            height = window.innerHeight,
            VIEW_ANGLE = 45,
            ASPECT = width / height,
            NEAR = 0.1,
            FAR = 10000,
            renderer = new THREE.WebGLRenderer(
                { clearAlpha: 1, clearColor: v1z.view.clearColor }),
            camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR),
            mouse = { x: 0, y: 0 },
            INTERSECTED,
            TARGET,
            onSelect,
            projector = new THREE.Projector(),
            clock = new THREE.Clock(),
            controls = new THREE.FlyControls(camera, renderer.domElement),
            stats = new Stats(),
            scene = new THREE.Scene();

        function pick() {
            var vector = new THREE.Vector3(mouse.x, mouse.y, 1),
                from = camera.position,
                ray,
                intersects;

            projector.unprojectVector(vector, camera);
            ray = new THREE.Ray(from, vector.subSelf(from).normalize());
            intersects = ray.intersectScene(scene);
            if (intersects.length > 0) {
                if (INTERSECTED !== intersects[0].object) {
                    if (INTERSECTED) {
                        INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
                    }
                    INTERSECTED = intersects[0].object;
                    INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
                    INTERSECTED.material.color.setHex(0xff0000);
                }
            } else {
                if (INTERSECTED) {
                    INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
                }
                INTERSECTED = null;
            }
        }

        function onDocumentMouseMove(event) {
            event.preventDefault();
            mouse.x = (event.clientX / width) * 2 - 1;
            mouse.y = -(event.clientY / height) * 2 + 1;
        }

        function onDocumentMouseDown(event) {
            event.preventDefault();
            pick();
            if (INTERSECTED) {
                if (INTERSECTED === TARGET) {
                    TARGET = TARGET.parent;
                } else {
                    TARGET = INTERSECTED;
                }
                if (onSelect) {
                    onSelect(TARGET);
                }
                camera.useQuaternion = false;
            } else {
                TARGET = null;
                camera.quaternion.setFromRotationMatrix(camera.matrix);
                camera.useQuaternion = true;
            }
        }

        function move(delta) {
            var dist, v, target;
            if (TARGET) {
                dist = 100;
                if (!dist) {
                    dist = 1;
                }
                v = new THREE.Vector3(0, 0, dist);
                target = TARGET.matrixWorld.getPosition();
                TARGET.matrixWorld.multiplyVector3(v)
                    .subSelf(camera.position)
                    .multiplyScalar(delta * 3);
                camera.position.addSelf(v);
                camera.lookAt(target);
            }
        }

        function nextAxis(a) {
            return (a === 'x') ? 'y' : (a === 'y') ? 'z' : 'x';
        }

        function rotate(object, delta, axis, rate) {
            var ii;
            rate = rate || 0.01;
            if (v1z.view.rotate) {
                object.rotation[axis] += delta * rate;
                for (ii = 0; ii < object.children.length; ii++) {
                    axis = nextAxis(axis);
                    rotate(object.children[ii], delta, axis, rate * 2);
                    delta = -delta;
                }
            }
        }

        function onWindowResize() {
            // TODO: see controls.getContainerDimensions() for example to get dims better
            width = window.innerWidth;
            height = window.innerHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            camera.radius = (width + height) / 4;
        }

        function addLights() {
            var dirLight = new THREE.DirectionalLight(0xFFFFFF),
                dirLight2 = new THREE.DirectionalLight(0x888888),
                dirLight3 = new THREE.DirectionalLight(0x222222);

            dirLight.position.set(-1, 0, 1).normalize();
            scene.add(dirLight);
            dirLight2.position.set(-1, 1, -1).normalize();
            scene.add(dirLight2);
            dirLight3.position.set(1, -1, 0).normalize();
            scene.add(dirLight3);
        }

        function init() {
            if (world) {
                scene.add(world);
            }
            renderer.setSize(width, height);
            renderer.sortObjects = false;
            renderer.autoClear = false;
            camera.position.z = 1000;
            controls.movementSpeed = 100;
            controls.rollSpeed = 1;
            controls.dragToLook = true;
            camera.lookAt(new THREE.Vector3());
            camera.quaternion.setFromRotationMatrix(camera.matrix);
        }

        function render() {
            var delta = clock.getDelta();
            pick();
            rotate(scene, delta);
            scene.updateMatrixWorld();
            controls.update(delta);
            move(delta);
            renderer.clear();
            renderer.render(scene, camera);
        }

        function animate() {
            requestAnimationFrame(animate);
            render();
            stats.update();
        }

        function createFullScreenContainer() {
            var container = document.createElement('div'),
                info = document.createElement('div');
            document.body.appendChild(container);

            info.style.position = 'absolute';
            info.style.top = '10px';
            info.style.width = '100%';
            info.style.textAlign = 'center';
            info.innerHTML = '<a href="https://github.com/mrdoob/three.js/" target="_blank">click on the nodes when mouse over!</a>';
            container.appendChild(info);

            stats.domElement.style.position = 'absolute';
            stats.domElement.style.top = '0px';
            container.appendChild(stats.domElement);

            window.addEventListener('resize', onWindowResize, false);
            return container;
        }

        function attach(container) {
            var e = renderer.domElement;
            container.appendChild(renderer.domElement);
            e.addEventListener('mousemove', onDocumentMouseMove, false);
            e.addEventListener('mousedown', onDocumentMouseDown, false);
        }

        init();
        scene.add(camera);
        addLights();

        // public
        return {
            // The element to be rendered
            attach: attach,

            // Create full screen rendering elements
            fullScreen: function () {
                attach(createFullScreenContainer());
            },

            getScene: function () { return scene; },

            // Render once
            render: render,

            // Start a render loop
            animate: animate,

            setSelector: function (f) {
                onSelect = f;
            }
        };
    };
} (window.v1z = window.v1z || {}));
