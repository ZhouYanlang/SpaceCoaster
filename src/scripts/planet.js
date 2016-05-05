let sunTexture = WHS.API.texture('assets/textures/sun.jpg');
let jupiterTexture = WHS.API.texture('assets/textures/jupiter.jpg');

let marsTexture = {
  map: WHS.API.texture('assets/textures/mars.jpg'),
  bump: WHS.API.texture('assets/textures/marsmap.jpg')
};

let saturnTexture = {
  map: WHS.API.texture('assets/textures/saturnmap.jpg'),
  ring: WHS.API.texture('assets/textures/saturnringcolor.jpg'),
  ringPattern: WHS.API.texture('assets/textures/saturnringpattern.jpg')
};

const theSun = game.Model({
  geometry:{
    path: 'assets/models/ik89123.json'
  },

  material: {
    shading: THREE.SmoothShading,
    shininess:0,
    map: sunTexture,
    bumpMap: sunTexture,
    kind: 'phong',
    wireframe:false,
    vertexColors:false,
    doubleSided:true,
    depthWrite:true,
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
  },
});


let jupiter = game.Model({
  geometry:{
    path: 'assets/models/ik89123.json'
  },

  material: {
    shading: THREE.SmoothShading,
    shininess:0,
    map: jupiterTexture,
    bumpMap: jupiterTexture,
    kind: 'phong',
    wireframe:false,
    vertexColors:false,
    doubleSided:true,
    depthWrite:true,
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

let mars = game.Model({
  geometry:{
    path: 'assets/models/ik89123.json'
  },

  material: {
    shading: THREE.SmoothShading,
    shininess:0,
    map: marsTexture.map,
    bumpMap: marsTexture.bump,
    kind: 'phong',
    wireframe:false,
    vertexColors:false,
    doubleSided:true,
    depthWrite:true,
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

let saturn = new WHS.Model({
  geometry:{
    path: 'assets/models/ik89123.json'
  },

  material: {
    shading: THREE.SmoothShading,
    shininess:0,
    map: saturnTexture.map,
    bumpMap: saturnTexture.map,
    kind: 'phong',
    wireframe:false,
    vertexColors:false,
    doubleSided:true,
    depthWrite:true,
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

var rotateSun = new WHS.loop(function ( clock ) {
    theSun.rotation.x = (clock.getElapsedTime() * 1000) / 50000 * Math.PI*2;
});


var rotateJupiter = new WHS.loop(function(clock){
    var factor = (clock.getElapsedTime() * 1000) / 70000 * Math.PI*2;
    jupiter.rotation.x = factor;
    jupiter.rotation.y = factor;
});

var rotateMars = new WHS.loop(function(clock){
    var factor = (clock.getElapsedTime() * 1000) / 60000 * Math.PI*2;
    mars.rotation.x = factor;
    mars.rotation.y = factor;
});
rotateSun.start();
rotateJupiter.start();
rotateMars.start();
