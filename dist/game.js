'use strict';

var PI_2 = Math.PI / 2;

WHS.World.prototype.SpaceControls = function (object) {
  'use strict';

  var params = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  var target = WHS.API.extend(params, {
    block: document.getElementById('blocker'),
    spedd: 1,
    ypos: 5
  });

  this.controls = new function (camera, mesh, parms) {
    var inputVelocity = new THREE.Vector3(),
        euler = new THREE.Euler();

    var speedFactor = 1.0,
        rollSpeed = 0.005;

    var quat = new THREE.Quaternion(),
        moveState = { left: false, right: false, forward: false, back: false,
      pitch: 0, yaw: 0, roll: 0 },
        moveVector = new THREE.Vector3(0, 0, 0),
        rotationVector = new THREE.Vector3(0, 0, 0),
        canJump = false;

    mesh.setAngularFactor({ x: 0, y: 0, z: 0 });

    var scope = this,
        player = mesh,
        pitchObject = new THREE.Object3D(),
        yawObject = new THREE.Object3D();

    pitchObject.add(camera.getNative());

    yawObject.position.y = params.ypos; // eyes are 2 meters above the ground
    yawObject.add(pitchObject);

    function onMouseMove(event) {
      if (scope.enabled === false) return;

      var movementX = event.movementX || event.mozMovementX || event.getMovementX() || 0,
          movementY = event.movementY || event.mozMovementY || event.getMovementY() || 0;

      yawObject.rotation.y -= movementX * 0.002;
      pitchObject.rotation.x -= movementY * 0.002;
    }

    function onKeyDown(event) {
      switch (event.keyCode) {
        case 38: // up
        case 87:
          // w
          moveState.forward = true;
          break;

        case 37: // left
        case 65:
          // a
          moveState.left = true;
          break;

        case 40: // down
        case 83:
          // s
          moveState.back = true;
          break;

        case 39: // right
        case 68:
          // d
          moveState.right = true;
          break;

        case 32:
          // space
          if (canJump) {
            player.applyCentralImpulse({ x: 0, y: 0, z: -300 });
          }
          canJump = false;
          break;

        case 16:
          // shift
          addedSpeed = 0.5;
          break;

        case 81:
          moveState.roll = -1;
          break;

        case 69:
          moveState.roll = 1;
          break;
      }
    }

    function onKeyUp(event) {
      switch (event.keyCode) {

        case 38: // up
        case 87:
          // w
          moveState.forward = false;
          break;

        case 37: // left
        case 65:
          // a
          moveState.left = false;
          break;

        case 40: // down
        case 83:
          // a
          moveState.back = false;
          break;

        case 39: // right
        case 68:
          // d
          moveState.right = false;
          break;

        case 16:
          // shift
          speedFactor = 0.25;
          break;

        case 81:
        case 69:
          moveState.roll = 0;
          break;
      }
    }

    this.getObject = function () {
      return yawObject;
    };

    this.getDirection = function (targetVec) {
      targetVec.set(0, 0, -1);
      quat.multiplyVector3(targetVec);
    };

    this.update = function (delta) {
      var moveVec = new THREE.Vector3();

      if (scope.enabled === false) return;

      inputVelocity.set(0, 0, 0);
      moveState.roll = moveState.roll * PI_2 / 2;
      delta = delta || 0.5;
      delta = Math.min(delta, 0.5);

      var speed = delta * speedFactor * params.speed;
      var rotMult = delta * rollSpeed;

      if (moveState.forward) {
        inputVelocity.z = -speed;
      }

      if (moveState.back) {
        inputVelocity.z = speed;
      }

      if (moveState.left) {
        inputVelocity.x = -speed;
      }

      if (moveState.right) {
        inputVelocity.x = speed;
      }

      euler.x = pitchObject.rotation.x;
      euler.y = yawObject.rotation.y;
      euler.order = "XYZ";

      quat.setFromEuler(euler);

      inputVelocity.applyQuaternion(quat);

      player.applyCentralImpulse({
        x: inputVelocity.x * 10,
        y: inputVelocity.y * 10,
        z: inputVelocity.z * 10
      });

      yawObject.position.copy(player.position);
    };

    document.body.addEventListener('mousemove', onMouseMove, false);
    document.body.addEventListener('keydown', onKeyDown, false);
    document.body.addEventListener('keyup', onKeyUp, false);
  }(this.getCamera(), object.getNative(), target);

  var controls = this.controls;

  this.getScene().add(this.controls.getObject());

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
    } else {
      element.requestPointerLock();
    }
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
    aspect: 35
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
        x: 1000,
        y: 1000,
        z: 1000
    },

    rotation: {
        x: 0,
        y: 0,
        z: 0
    },

    scale: {
        x: 0.5,
        y: 0.5,
        z: 0.5
    }
});

spaceship.addTo(game, "wait").then(function () {

    game.SpaceControls(spaceship, {
        block: document.getElementById('blocker'),
        speed: 1,
        ypos: 3 // 5
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

var spot = game.DirectionalLight({
    light: {
        color: 0xffffff,
        intensity: 0.1,
        distance: 50
    },

    pos: {
        x: 600, // 100,
        y: 600, // 30,
        z: 600 },

    // 100
    target: {
        x: 450,
        y: 450,
        z: 450
    }
});
'use strict';

var sunTexture = WHS.API.texture('assets/textures/sun.jpg');
var jupiterTexture = WHS.API.texture('assets/textures/jupiter.jpg');

var marsTexture = {
  map: WHS.API.texture('assets/textures/mars.jpg'),
  bump: WHS.API.texture('assets/textures/marsmap.jpg')
};

var saturnTexture = {
  map: WHS.API.texture('assets/textures/saturnmap.jpg'),
  ring: WHS.API.texture('assets/textures/saturnringcolor.jpg'),
  ringPattern: WHS.API.texture('assets/textures/saturnringpattern.jpg')
};

var theSun = game.Model({
  geometry: {
    path: 'assets/models/ik89123.json'
  },

  material: {
    shading: THREE.SmoothShading,
    shininess: 0,
    map: sunTexture,
    bumpMap: sunTexture,
    kind: 'phong',
    wireframe: false,
    vertexColors: false,
    doubleSided: true,
    depthWrite: true,
    emissive: 0xeffe75,
    emissiveIntensity: 0.8,
    bumpScale: 0.05
  },

  mass: 0,
  pos: {
    x: 0,
    y: 0,
    z: 0
  },

  scale: {
    x: 500,
    y: 500,
    z: 500
  }
});

var jupiter = game.Model({
  geometry: {
    path: 'assets/models/ik89123.json'
  },

  material: {
    shading: THREE.SmoothShading,
    shininess: 0,
    map: jupiterTexture,
    bumpMap: jupiterTexture,
    kind: 'phong',
    wireframe: false,
    vertexColors: false,
    doubleSided: true,
    depthWrite: true,
    emissive: 0xde9fa3,
    emissiveIntensity: 0.1,
    bumpScale: 0.05

  },

  mass: 0,
  pos: {
    x: 1000,
    y: 650,
    z: 120
  },

  scale: {
    x: 100,
    y: 100,
    z: 100
  }
});

var mars = game.Model({
  geometry: {
    path: 'assets/models/ik89123.json'
  },

  material: {
    shading: THREE.SmoothShading,
    shininess: 0,
    map: marsTexture.map,
    bumpMap: marsTexture.bump,
    kind: 'phong',
    wireframe: false,
    vertexColors: false,
    doubleSided: true,
    depthWrite: true,
    emissive: 0xde9fa3,
    emissiveIntensity: 0.1,
    bumpScale: 0.05
  },

  mass: 0,
  pos: {
    x: -650,
    y: -1050,
    z: -1000
  },

  scale: {
    x: 101,
    y: 101,
    z: 101
  }
});

var saturn = new WHS.Model({
  geometry: {
    path: 'assets/models/ik89123.json'
  },

  material: {
    shading: THREE.SmoothShading,
    shininess: 0,
    map: saturnTexture.map,
    bumpMap: saturnTexture.map,
    kind: 'phong',
    wireframe: false,
    vertexColors: false,
    doubleSided: true,
    depthWrite: true,
    emissive: 0xde9fa3,
    emissiveIntensity: 0.1,
    bumpScale: 0.05
  },

  mass: 0,
  pos: {
    x: -650,
    y: -2000,
    z: 375
  },

  scale: {
    x: 20,
    y: 20,
    z: 20
  }
});

var rotateSun = new WHS.loop(function (clock) {
  theSun.rotation.x = clock.getElapsedTime() * 1000 / 50000 * Math.PI * 2;
});

var rotateJupiter = new WHS.loop(function (clock) {
  var factor = clock.getElapsedTime() * 1000 / 70000 * Math.PI * 2;
  jupiter.rotation.x = factor;
  jupiter.rotation.y = factor;
});

var rotateMars = new WHS.loop(function (clock) {
  var factor = clock.getElapsedTime() * 1000 / 60000 * Math.PI * 2;
  mars.rotation.z = factor;
});
rotateSun.start();
rotateJupiter.start();
rotateMars.start();
"use strict";
"use strict";

game.skybox = game.Skybox({
    path: "img/space",
    imgSuffix: ".jpg",
    skyType: "sphere",
    radius: 10000
});
//# sourceMappingURL=game.js.map
