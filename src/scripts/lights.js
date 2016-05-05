let ambient = game.AmbientLight({
  light: {
    color: 0x83DCF9,
    intensity: 0.2,

    pos: {
        x: 0,
        y: 120,
        z: 0,
    },

    target: {
        x: 0,
        y: 0,
        z: 0
    }
  }
});

let spot = game.DirectionalLight( {
    light: {
        color: 0xffffff,
        intensity: 0.1,
        distance: 50,
    },

    pos: {
        x: 600, // 100,
        y: 600, // 30,
        z: 600, // 100
    },

    target: {
        x: 450,
        y: 450,
        z: 450
    }
} );
