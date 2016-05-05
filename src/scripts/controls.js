
const spaceship = game.ConvexModel({
  geometry:{
    path: 'assets/models/spaceship.json',
    physics: 'assets/models/spaceship_low.json'
  },

  material: {
  },

  mass: 100,

  pos: {
      x: 0,
      y: 0,
      z: 0
  },

  rotation: {
      x: 0,
      z: 0,
      y: 0,
  },

  scale: {
      x: 1,
      y: 1,
      z: 1
  },
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

    game.SpaceControls( spaceship, { // *WHS* object, Pointer lock controls object, Jquery blocker div selector.
        block: document.getElementById('blocker'),
        speed: 1 // 5
    } );

})
