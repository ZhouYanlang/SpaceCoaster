
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
      y: 0,
      z: 0
  },

  scale: {
      x: 0.5,
      y: 0.5,
      z: 0.5
  },
});


spaceship.addTo(game, "wait").then(function () {

    game.SpaceControls( spaceship, {
        block: document.getElementById('blocker'),
        speed: 1,
        ypos: 3 // 5
    } );

});
