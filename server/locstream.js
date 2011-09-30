
var myName = 'player' + Math.floor(Math.random() * 1000);

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
var colour1 = Math.random() * 0xffffff;
var colour2 = Math.random() * 0xffffff;
var colour3 = Math.random() * 0xffffff;
var colour4 = Math.random() * 0xffffff;
var colour5 = Math.random() * 0xffffff;

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

    // create a new websocket and connect
    ws = new WebSocket(server);

    // when data is comming from the server, this metod is called
    ws.onmessage = function (evt) {
        inc.innerHTML = evt.data + '<br/>';
        var myObject = JSON.parse(evt.data);

        // so, we now have a Gr1dScene, lets add nodes!
        //alert('w00t ' + myObject);
        if (myObject.name != myName)
            gr1dSpaceScene1.addPlayer(myObject.name, myObject.x, myObject.y, myObject.z);
    };

    // when the connection is established, this method is called
    ws.onopen = function () {
        inc.innerHTML = '.. connection open<br/>';
    };

    // when the connection is closed, this method is called
    ws.onclose = function () {
        inc.innerHTML = '.. connection closed<br/>';
    }

    ws.onerror = function () {
        inc.innerHTML = '.. connection error<br/>';
    }

    gr1dSpaceScene1 = new V1Z.Gr1dScene(
            container, // where to render to
            400, // height - can't automatically detect from the div yet...
            400, // width - can't automatically detect from the div yet...
            0,   // the central node's stack 
            0,   // the central node's column
            0,   // the central node's row
            true // auto animate       
        );
    gr1dSpaceScene1.addNode(0, 0, 0);

    loader = new THREE.JSONLoader();
    var x = { model: 'assets/models/animals/hummingbird.js', callback: function (g) {
            var material = [new THREE.MeshFaceMaterial(), new THREE.MeshLambertMaterial({ color: 0xffffff, opacity: 0.9, shading: THREE.FlatShading, wireframe: true, wireframeLinewidth: 2 })];
            gr1dSpaceScene1.addObject(new THREE.Mesh(g, material));
        }}
    try {
        loader.load(x);
    } catch (err) {
        alert(err);
        //console.log(err);
    }


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

function sendPosition() {
    var me = gr1dSpaceScene1.Camera.position;
    me.name = myName;
    if (WebSocket.readyState === ws.OPEN)
        ws.send(JSON.stringify(me));
}

window.onload = start;
