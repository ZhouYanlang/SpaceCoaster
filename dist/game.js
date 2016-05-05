'use strict';

/**
 * © Alexander Buzin, 2014-2015
 * Site: http://alexbuzin.me/
 * Email: alexbuzin88@gmail.com
*/

/**
 * First person controls.
 *
 * @param {Object} object - *WHS* figure/object.
 * @param {Object} params - Controls parameter objects.
 */

var PI_2 = Math.PI / 2;

WHS.World.prototype.SpaceControls = function (object) {

    'use strict';

    var params = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    var target = WHS.API.extend(params, {
        block: document.getElementById('blocker'),
        speed: 1,
        ypos: 1
    });

    this.controls = new function (camera, mesh, params) {

        /* Velocity properties */
        var velocityFactor = 1,
            runVelocity = 0.25;

        //mesh.setAngularFactor({x: 0, y: 0, z: 0});

        /* Init */
        var scope = this,
            player = mesh,
            pitchObject = new THREE.Object3D();

        pitchObject.add(camera.getNative());

        var yawObject = new THREE.Object3D();

        yawObject.position.y = params.ypos; // eyes are 2 meters above the ground
        yawObject.add(pitchObject);

        var quat = new THREE.Quaternion(),
            moveForward = false,
            moveBackward = false,
            moveLeft = false,
            moveRight = false,
            canJump = false;

        player.addEventListener("collision", function (other_object, v, r, contactNormal) {
            if (contactNormal.y < 0.5) // Use a "good" threshold value between 0 and 1 here!
                canJump = true;
        });

        function onMouseMove(event) {
            if (scope.enabled === false) return;

            var movementX = event.movementX || event.mozMovementX || event.getMovementX() || 0,
                movementY = event.movementY || event.mozMovementY || event.getMovementY() || 0;

            yawObject.rotation.y -= movementX * 0.002, pitchObject.rotation.x -= movementY * 0.002;

            pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));
        };

        function onKeyDown(event) {

            switch (event.keyCode) {

                case 38: // up
                case 87:
                    // w
                    moveForward = true;
                    break;

                case 37: // left
                case 65:
                    // a
                    moveLeft = true;
                    break;

                case 40: // down
                case 83:
                    // s
                    moveBackward = true;
                    break;

                case 39: // right
                case 68:
                    // d
                    moveRight = true;
                    break;

                case 32:
                    // space
                    if (canJump == true) {

                        player.applyCentralImpulse({ x: 0, y: 300, z: 0 });
                    }

                    canJump = false;

                    break;

                case 16:
                    // shift

                    runVelocity = 0.5;
                    break;

            }
        };

        function onKeyUp(event) {
            switch (event.keyCode) {

                case 38: // up
                case 87:
                    // w
                    moveForward = false;
                    break;

                case 37: // left
                case 65:
                    // a
                    moveLeft = false;
                    break;

                case 40: // down
                case 83:
                    // a
                    moveBackward = false;
                    break;

                case 39: // right
                case 68:
                    // d
                    moveRight = false;
                    break;

                case 16:
                    // shift
                    runVelocity = 0.25;
                    break;

            }
        };

        document.body.addEventListener('mousemove', onMouseMove, false);
        document.body.addEventListener('keydown', onKeyDown, false);
        document.body.addEventListener('keyup', onKeyUp, false);

        this.enabled = false;

        this.getObject = function () {
            return yawObject;
        };

        this.getDirection = function (targetVec) {
            targetVec.set(0, 0, -1);
            quat.multiplyVector3(targetVec);
        };

        // Moves the camera to the Cannon.js object position
        // and adds velocity to the object if the run key is down.
        var inputVelocity = new THREE.Vector3(),
            euler = new THREE.Euler();

        this.update = function (delta) {

            var moveVec = new THREE.Vector3();

            if (scope.enabled === false) return;

            delta = delta || 0.5;
            delta = Math.min(delta, 0.5);

            inputVelocity.set(0, 0, 0);

            var speed = velocityFactor * delta * params.speed * runVelocity;

            if (moveForward) {
                inputVelocity.z = -speed;
            }

            if (moveBackward) {
                inputVelocity.z = speed;
            }

            if (moveLeft) {
                inputVelocity.x = -speed;
            }

            if (moveRight) {
                inputVelocity.x = speed;
            }

            // Convert velocity to world coordinates
            euler.x = pitchObject.rotation.x, euler.y = yawObject.rotation.y, euler.order = "XYZ";

            quat.setFromEuler(euler);

            inputVelocity.applyQuaternion(quat);

            //player.applyCentralImpulse({x: inputVelocity.x * 10, y: 0, z: inputVelocity.z * 10});
            player.setLinearVelocity({ x: inputVelocity.z * 10, y: 0, z: -inputVelocity.x * 10 });
            player.setAngularFactor({ x: 0, y: 0, z: 0 });

            yawObject.position.copy(player.position);
        };
    }(this.getCamera(), object.getNative(), target);

    var controls = this.controls;

    object.getNative().add(this.controls.getObject());
    console.log(object.getNative());

    if ('pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document) {

        var element = document.body;

        this.pointerlockchange = function () {
            if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {

                controls.enabled = true;

                target.block.fadeOut();
            } else {

                controls.enabled = false;

                target.block.fadeIn();
            }
        };
    } else {

        console.warn("Your browser does not support the PointerLock WHS.API.");
    }

    document.addEventListener('pointerlockchange', this.pointerlockchange, false);
    document.addEventListener('mozpointerlockchange', this.pointerlockchange, false);
    document.addEventListener('webkitpointerlockchange', this.pointerlockchange, false);

    this.pointerlockerror = function () {
        console.warn("Pointer lock error.");
    };

    document.addEventListener('pointerlockerror', this.pointerlockerror, false);
    document.addEventListener('mozpointerlockerror', this.pointerlockerror, false);
    document.addEventListener('webkitpointerlockerror', this.pointerlockerror, false);

    target.block.addEventListener('click', function () {

        element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

        element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

        if (/Firefox/i.test(navigator.userAgent)) {

            var fullscreenchange = function fullscreenchange() {
                if (document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element) {

                    document.removeEventListener('fullscreenchange', fullscreenchange);
                    document.removeEventListener('mozfullscreenchange', fullscreenchange);

                    element.requestPointerLock();
                }
            };

            document.addEventListener('fullscreenchange', fullscreenchange, false);
            document.addEventListener('mozfullscreenchange', fullscreenchange, false);

            element.requestFullscreen();
        } else element.requestPointerLock();
    });
};
'use strict';

var preloader = Preloader();

var game = new WHS.World({
  stats: false,
  autoresize: true,

  gravity: {
    x: 0,
    y: 0,
    z: 0
  },

  camera: {
    far: 10000,
    aspect: 45
  },

  shadowmap: {
    type: THREE.PCFShadowMap
  },

  rWidth: 1,
  rHeight: 1,

  background: 0x1E2F40,

  path_worker: '../src/scripts/vendor/physijs_worker.js',

  path_ammo: 'ammo.js'
});

game.start();

var camera = game.getCamera();

preloader.check();
'use strict';

var track = new THREE.AudioListener();
var soundtrack = new THREE.Audio(track);
var shipSound = new THREE.Audio(track);
var camera = game.getCamera();
var loader = new THREE.AudioLoader();

camera.add(track);

game.add(soundtrack);

loader.load('assets/audio/365-days-in-space.ogg', function (audioBuffer) {
  soundtrack.setBuffer(audioBuffer);
  soundtrack.play();
}, function (xhr) {}, function (xhr) {
  console.log('An error happened');
});

loader.load('assets/audio/flyby.ogg', function (audioBuffer) {
  shipSound.setBuffer(audioBuffer);
  shipSound.loaded = true;
}, function (xhr) {}, function (xhr) {
  console.log('An error happened');
});
'use strict';

var spaceship = game.ConvexModel({
    geometry: {
        path: 'assets/models/spaceship.json',
        physics: 'assets/models/spaceship_low.json'
    },

    material: {},

    mass: 100,

    pos: {
        x: 0,
        y: 0,
        z: 0
    },

    rotation: {
        x: 0,
        z: 0,
        y: 0
    },

    scale: {
        x: 1,
        y: 1,
        z: 1
    }
});

/*const camera = new WHS.PerspectiveCamera({
    pos: {
        x:0,
        y:100,
        z:0
    }
});

game.setCamera(camera);*/

spaceship.addTo(game, "wait").then(function () {

    //spaceship.add(camera);

    game.SpaceControls(spaceship, { // *WHS* object, Pointer lock controls object, Jquery blocker div selector.
        block: document.getElementById('blocker'),
        speed: 1 // 5
    });
});
"use strict";

var fog = game.FogExp2({
  hex: 0x25424d,
  near: 1,
  far: 5
});
"use strict";

var ambient = game.AmbientLight({
    light: {
        color: 0x83DCF9,
        intensity: 0.2,

        pos: {
            x: 0,
            y: 120,
            z: 0
        },

        target: {
            x: 0,
            y: 0,
            z: 0
        }
    }
});

var spot = game.SpotLight({
    light: {
        color: 0x83DCF9,
        intensity: 0.8,
        distance: 500
    },

    shadowmap: {
        width: 2048,
        height: 2048,
        top: 0,
        fov: 90
    },

    pos: {
        x: 160, // 100,
        y: 120, // 30,
        z: 160 },

    // 100
    target: {
        x: 0,
        y: 0,
        z: 0
    }
});
'use strict';

var sunTexture = WHS.API.texture('assets/textures/sun.jpg');
var jupiterTexture = WHS.API.texture('assets/textures/jupiter.jpg');
var sun = game.Model({
  geometry: {
    path: 'assets/models/ik89123.json'
  },

  material: {
    shading: THREE.SmoothShading,
    map: sunTexture,
    bunmap: sunTexture,
    kind: 'phong',
    wireframe: false,
    vertexColors: false,
    doubleSided: true,
    depthWrite: true,
    emissive: 0xffffff,
    emissiveIntensity: 0.3
  },

  mass: 0,
  pos: {
    x: 500,
    y: 500,
    z: 500
  },

  scale: {
    x: 50,
    y: 50,
    z: 50
  }
});

var jupiter = game.Model({
  geometry: {
    path: 'assets/models/ik89123.json'
  },

  material: {
    shading: THREE.SmoothShading,
    map: jupiterTexture,
    bunmap: jupiterTexture,
    kind: 'phong',
    wireframe: false,
    vertexColors: false,
    doubleSided: true,
    depthWrite: true,
    emissive: 0xde9fa3,
    emissiveIntensity: 0.3
  },

  mass: 0,
  pos: {
    x: 500,
    y: 650,
    z: 120
  },

  scale: {
    x: 20,
    y: 20,
    z: 20
  }
});

/*setInterval(function(){
    var rot = sun.rotation;
    sun.rotation.set(rot.x+=0.2, 0,0);
    requestAnimationFrame();
}, 500);*/

var updateSun = new WHS.loop(function (clock) {
  sun.rotation.x = clock.getElapsedTime() * 1000 / 10000 * Math.PI * 2;
});

updateSun.start();
/*const spaceship = game.Model({
  geometry:{
    path: 'assets/models/spaceship.json',
    physics: 'assets/models/spaceship_low.json'
  },

  material: {
  },

  mass: 0,
  pos: {
      x: -1000,
      y: -1000,
      z: -1000
  },

  rotation: {
      x: 0,
      z: Math.PI / 4,
      y: 0,
  },

  scale: {
      x: 1,
      y: 1,
      z: 1
  },
});
var curve = new THREE.CurvePath();
curve.add(
    new THREE.CubicBezierCurve3(
        new THREE.Vector3( -1000, -1000, -1000),
        new THREE.Vector3( -865, -650, -525 ),
        new THREE.Vector3( -350, -350, -225 ),
       new THREE.Vector3( -100, -100, -100 )
    )
);
curve.add(
    new THREE.CubicBezierCurve3(
        new THREE.Vector3( -100, -100, -100 ),
        new THREE.Vector3( 0, 0, 0 ),
        new THREE.Vector3( 25, 125, 0),
        new THREE.Vector3( 200, 100, 350 )
    )
);
curve.add(
    new THREE.CubicBezierCurve3(
        new THREE.Vector3( 200, 100, 350 ),
        new THREE.Vector3( 350, 250, 350 ),
        new THREE.Vector3( 650, 750,  750 ),
        new THREE.Vector3( 1000, 1000, 1000 )
    )
);

curve.add(
    new THREE.CubicBezierCurve3(
        new THREE.Vector3( 1000, 1000, 1000 ),
        new THREE.Vector3( 1250, 1250, 3500 ),
        new THREE.Vector3( 6500, 7500,  7500 ),
        new THREE.Vector3( 10000, 10000, 10000 )
    )
);


spaceship.addTo(game,'wait').then(function(obj){
  obj.follow(curve,245000,false);
  spaceship.add(shipSound);
});
*/
"use strict";
"use strict";

game.skybox = game.Skybox({
    path: "img/space",
    imgSuffix: ".jpg",
    skyType: "sphere",
    radius: 10000
});
//# sourceMappingURL=game.js.map
