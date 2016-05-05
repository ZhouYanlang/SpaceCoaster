
const spaceship = game.ConvexModel({
  geometry:{
    path: 'assets/models/spaceship.json',
    physics: 'assets/models/spaceship_low.json'
  },

  material: {
  },

  mass: 100,

  pos: {
      x: 1000,
      y: 1000,
      z: 1000
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


spaceship.addTo(game, "wait").then(function () {

    game.SpaceControls( spaceship, { // *WHS* object, Pointer lock controls object, Jquery blocker div selector.
        block: document.getElementById('blocker'),
        speed: 1 // 5
    } );

});
