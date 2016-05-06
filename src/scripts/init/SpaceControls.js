const PI_2 = Math.PI/2;

WHS.World.prototype.SpaceControls = function(object, params={}) {
    'use strict';

    let target = WHS.API.extend(params, {
      block: document.getElementById('blocker'),
      spedd: 1,
      ypos: 5
    });

    this.controls = new (function(camera,  mesh, parms){
      let inputVelocity = new THREE.Vector3(),
          euler = new THREE.Euler();

      let speedFactor = 1.0,
          rollSpeed = 0.005;

      let quat = new THREE.Quaternion(),
          moveState = { left: false, right: false, forward: false, back: false,
                        pitch: 0, yaw: 0, roll:0},
          moveVector = new THREE.Vector3(0, 0, 0),
          rotationVector = new THREE.Vector3(0, 0, 0),
          canJump = false;

      mesh.setAngularFactor({x: 0, y: 0, z: 0});

      let scope = this,
          player = mesh,
          pitchObject = new THREE.Object3D(),
          yawObject = new THREE.Object3D();

      pitchObject.add( camera.getNative() );

      yawObject.position.y = params.ypos; // eyes are 2 meters above the ground
      yawObject.add( pitchObject );

      function onMouseMove ( event ) {
        if ( scope.enabled === false ) return;

        let movementX = event.movementX || event.mozMovementX || event.getMovementX() || 0,
            movementY = event.movementY || event.mozMovementY || event.getMovementY() || 0;

        yawObject.rotation.y -= movementX * 0.002;
        pitchObject.rotation.x -= movementY * 0.002;
      }

      function onKeyDown ( event ) {
        switch ( event.keyCode ) {
          case 38: // up
          case 87: // w
            moveState.forward = true;
            break;

          case 37: // left
          case 65: // a
            moveState.left = true;
            break;

          case 40: // down
          case 83: // s
            moveState.back = true;
            break;

          case 39: // right
          case 68: // d
            moveState.right = true;
            break;

          case 32: // space
            if ( canJump ){
              player.applyCentralImpulse({x: 0, y: 0, z: -300});
            }
            canJump = false;
          break;

          case 16: // shift
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

      function onKeyUp ( event ) {
        switch( event.keyCode ) {

          case 38: // up
          case 87: // w
            moveState.forward = false;
            break;

          case 37: // left
          case 65: // a
            moveState.left = false;
            break;

          case 40: // down
          case 83: // a
            moveState.back = false;
            break;

          case 39: // right
          case 68: // d
            moveState.right = false;
            break;

          case 16: // shift
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

      this.getDirection = function(targetVec){
        targetVec.set(0,0,-1);
        quat.multiplyVector3(targetVec);
      };

      this.update = function(delta) {
        let moveVec = new THREE.Vector3();

        if ( scope.enabled === false ) return;

        inputVelocity.set(0,0,0);
        moveState.roll = moveState.roll * PI_2 / 2;
        delta = delta || 0.5;
        delta = Math.min(delta, 0.5);

        var speed = delta * speedFactor * params.speed;
        var rotMult = delta * rollSpeed;

        if(moveState.forward){
          inputVelocity.z = -speed;
        }

        if(moveState.back){
          inputVelocity.z = speed;
        }

        if(moveState.left){
          inputVelocity.x = -speed;
        }

        if(moveState.right){
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

    document.body.addEventListener( 'mousemove', onMouseMove, false );
    document.body.addEventListener( 'keydown', onKeyDown, false );
    document.body.addEventListener( 'keyup', onKeyUp, false );

    })(this.getCamera(), object.getNative(), target);

    let controls = this.controls;

    this.getScene().add( this.controls.getObject() );

    if ('pointerLockElement' in document ||
        'mozPointerLockElement' in document ||
        'webkitPointerLockElement' in document) {

          var element = document.body;

          this.pointerlockchange = function() {
            if (document.pointerLockElement === element ||
                document.mozPointerLockElement === element ||
                document.webkitPointerLockElement === element ) {

                controls.enabled = true;
                target.block.fadeOut();

            }
            else {

              controls.enabled = false;

              target.block.fadeIn();
            }

          };

    }
    else {
      console.warn("Your browser does not support the PointerLock WHS.API.");
    }

    document.addEventListener('pointerlockchange', this.pointerlockchange, false);
    document.addEventListener('mozpointerlockchange', this.pointerlockchange, false);
    document.addEventListener('webkitpointerlockchange', this.pointerlockchange, false);

    this.pointerlockerror = function() {
      console.warn("Pointer lock error.");
    };

    document.addEventListener('pointerlockerror', this.pointerlockerror, false);
    document.addEventListener('mozpointerlockerror', this.pointerlockerror, false);
    document.addEventListener('webkitpointerlockerror', this.pointerlockerror, false);

    target.block.addEventListener('click', function() {

      element.requestPointerLock = element.requestPointerLock ||
                                   element.mozRequestPointerLock ||
                                   element.webkitRequestPointerLock;

      element.requestFullscreen = element.requestFullscreen ||
                                  element.mozRequestFullscreen ||
                                  element.mozRequestFullScreen ||
                                  element.webkitRequestFullscreen;
      if (/Firefox/i.test(navigator.userAgent)) {

        var fullscreenchange = function() {
            if (document.fullscreenElement === element ||
                document.mozFullscreenElement === element ||
                document.mozFullScreenElement === element) {

                    document.removeEventListener('fullscreenchange', fullscreenchange);
                    document.removeEventListener('mozfullscreenchange', fullscreenchange);
                    element.requestPointerLock();
            }
        };

        document.addEventListener('fullscreenchange', fullscreenchange, false);
        document.addEventListener('mozfullscreenchange', fullscreenchange, false);

        element.requestFullscreen();

      }
      else{
        element.requestPointerLock();
      }
  });
};
