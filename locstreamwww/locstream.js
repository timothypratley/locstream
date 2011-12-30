
var myName = 'player' + (10000 + Math.floor(Math.random() * 10000))

var Key = {
    _pressed: {},

    LEFT: 65,
    UP: 87,
    RIGHT: 68,
    DOWN: 83,

    isDown: function (keyCode) {
        return this._pressed[keyCode];
    },

    onKeydown: function (event) {
        this._pressed[event.keyCode] = true;
    },

    onKeyup: function (event) {
        delete this._pressed[event.keyCode];
    }
};



/// The following comment gives you intellisense
/// <reference path="http://mrdoob.github.com/three.js/build/Three.js' />

var mouseX = 0, mouseY = 0;
var windowHalfX = 200;
var windowHalfY = 200;

var gr1dSpaceScene1;

var isUserInteracting = false,
            lon = 0, onMouseDownLon = 0,
            lat = 0, onMouseDownLat = 0,
            phi = 0, theta = 0;

var onPointerDownPointerX;
var onPointerDownPointerY;

document.addEventListener('keyup', function (event) { Key.onKeyup(event); }, false);
document.addEventListener('keydown', function (event) { Key.onKeydown(event); }, false);

document.addEventListener('mousedown', onDocumentMouseDown, false);
document.addEventListener('mousemove', onDocumentMouseMove, false);
document.addEventListener('mouseup', onDocumentMouseUp, false);
document.addEventListener('click', onDocumentClick, false);

function onDocumentMouseDown(event) {
    event.preventDefault();
    isUserInteracting = true;
    onPointerDownPointerX = event.clientX;
    onPointerDownPointerY = event.clientY;
    onPointerDownLon = lon;
    onPointerDownLat = lat;
}

function onDocumentMouseMove(event) {
    if (isUserInteracting) {
        lon = (onPointerDownPointerX - event.clientX) * 0.3 + onPointerDownLon;
        lat = (event.clientY - onPointerDownPointerY) * 0.3 + onPointerDownLat;
    }
}

function onDocumentMouseUp(event) {
    isUserInteracting = false;
}

function onDocumentClick(event) {
    event.preventDefault();
    var camera = gr1dSpaceScene1.Camera;
    var vector = new THREE.Vector3((event.clientX / 400) * 2 - 1, -(event.clientY / 400) * 2 + 1, 0.5);
    (new THREE.Projector()).unprojectVector(vector, camera);
    var ray = new THREE.Ray(camera.position, vector.subSelf(camera.position).normalize());
    var intersects = ray.intersectScene(gr1dSpaceScene1.Scene);
    if (intersects.length > 0) {
        gr1dSpaceScene1.moveToward(intersects[0].point);
    }
}

var ws;
var start = function () {
    var inc = document.getElementById('incomming');
    var server = 'ws://localhost:8181/locstream';
    inc.innerHTML += 'connecting to server ' + server + '<br/>';
    var players = {};
    var rot90 = new THREE.Quaternion();
    rot90.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
    var loader = new THREE.JSONLoader();

    ws = new WebSocket(server);

    ws.onmessage = function (evt) {
        inc.innerHTML = evt.data + '<br/>';
        var msg = JSON.parse(evt.data);

        if (msg.name !== myName && msg.name) {
            var move = function(p) {
                p.position = new THREE.Vector3(msg.x, msg.y, msg.z);
                p.quaternion = new THREE.Quaternion(msg.qx, msg.qy, msg.qz, msg.qw);
                p.quaternion.multiplySelf(rot90);
                p.useQuaternion = true;
            }
            var p = players[msg.name];
            if (p) {
                move(p);
            } else {
                players[msg.name] = {};
                loader.load({
                    model: 'assets/models/animals/hummingbird.js', callback: function (g) {
                        var material = [new THREE.MeshFaceMaterial(), new THREE.MeshLambertMaterial({ color: 0x000000, opacity: 0.9, shading: THREE.FlatShading, wireframe: true, wireframeLinewidth: 2 })];
                        var pp = new THREE.Mesh(g, material);
                        move(pp);
                        players[msg.name] = pp;
                        gr1dSpaceScene1.Scene.addObject(pp);
                    }
                });
            }
        }
    };

    ws.onopen = function () {
        inc.innerHTML = '.. connection open<br/>';
    };

    ws.onclose = function () {
        inc.innerHTML = '.. connection closed<br/>';
    }

    ws.onerror = function () {
        inc.innerHTML = '.. connection error<br/>';
    }

    var c = 0xFF0000;
    gr1dSpaceScene1 = new V1Z.Gr1dScene(container, 400, 400, 0, 0, 0, true, c, c, c, c, c);
    gr1dSpaceScene1.addNode(0, 0, 0);

    //gr1dSpaceScene1.addObject('../assets/models/animals/hummingbird.js');

    // now, render it at 25FPS:
    setInterval(render, 1000 / 25);
    setInterval(sendPosition, 200);
}

function render() {
    lat = Math.max(-85, Math.min(85, lat));
    phi = (90 - lat) * Math.PI / 180;
    theta = lon * Math.PI / 180;

    var camera = gr1dSpaceScene1.Camera;
    camera.target.position.x = 500 * Math.sin(phi) * Math.cos(theta);
    camera.target.position.y = 500 * Math.cos(phi);
    camera.target.position.z = 500 * Math.sin(phi) * Math.sin(theta);

    var x = 0;
    var z = 0;
    if (Key.isDown(Key.UP)) x += 1;
    if (Key.isDown(Key.LEFT)) z -= 1;
    if (Key.isDown(Key.DOWN)) x -= 1;
    if (Key.isDown(Key.RIGHT)) z += 1;

    camera.position.x += x * Math.cos(theta) - z * Math.sin(theta);
    camera.position.z += x * Math.sin(theta) + z * Math.cos(theta);

    gr1dSpaceScene1.render();

    var info = document.getElementById('info');
    info.innerHTML = 'Position: ' + Math.round(camera.position.x, 1) + ',' + Math.round(camera.position.y) + ',' + Math.round(camera.position.z);
}

function matrix2quaternion(m) {
    var t = m.n11 + m.n22 + m.n33 + 1;
    var s;
    if (t > 0) {
        s = 0.5 / Math.sqrt(t);
        return new THREE.Quaternion(
            (m.n32 - m.n23) * s,
            (m.n13 - m.n31) * s,
            (m.n21 - m.n12) * s,
            0.25 / s);
    } else {
        if (m.n11 >= m.n22 && m.n11 >= m.n33) {
            s = sqrt(1.0 + m.n11 - m.n22 - m.n33) * 2;
            return new THREE.Quaternion(
                0.5 / s,
                (m.n12 + m.n21) / s,
                (m.n13 + m.n31) / s,
                (m.n32 + m.n23) / s);
        } else if (m.n22 >= m.n11) {
            s = sqrt(1.0 + m.n22 - m.n11 - m.n33) * 2;
            return new THREE.Quaternion(
                (m.n12 + m.n21) / s,
                0.5 / S,
                (m.n23 + m.n32) / s,
                (m.n12 + m.n21) / s);
        } else {
            s = sqrt(1.0 + m.n33 - m.n11 - m.n22) * 2;
            return new THREE.Quaternion(
                (m.n13 + m.n31) / s,
                (m.n23 + m.n32) / s,
                0.5 / s,
                (m.n21 + m.n12) / s);
        }
    }
}

function sendPosition() {
    var pos = gr1dSpaceScene1.Camera.position;
    var rot = matrix2quaternion(gr1dSpaceScene1.Camera.matrix);
    //var rot = new THREE.Quaternion();
    //rot.setFromRotationMatrix(gr1dSpaceScene1.Camera.matrix);
    var me = {
        name: myName,
        x: pos.x,
        y: pos.y,
        z: pos.z,
        qx: rot.x,
        qy: rot.y,
        qz: rot.z,
        qw: rot.w
    };
    if (ws.readyState === WebSocket.OPEN)
        ws.send(JSON.stringify(me));
}

window.onload = start;
