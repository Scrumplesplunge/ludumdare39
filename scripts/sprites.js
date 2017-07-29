var Sprites = (function() {
  var loaded = false;
  var spriteSheet;

  function load(callback) {
    console.log("Loading sprite image...");
    loaded = false;
    var spriteImage = new Image;
    spriteImage.onload = () => spriteImageLoaded(spriteImage, callback);
    spriteImage.src = "sprites.png";
  }

  function spriteImageLoaded(spriteImage, callback) {
    console.log("Setting wizard colours...");
    spriteSheet = document.createElement("canvas");
    spriteSheet.width = spriteImage.width;
    spriteSheet.height = spriteImage.height;
    var context = spriteSheet.getContext("2d");
    // Set the colours from the config.
    context.fillStyle = Config.wizard.robeColor;
    context.fillRect(0, 0, 512, 64);
    context.fillRect(0, 192, 512, 64);
    context.fillStyle = Config.wizard.shoeColor;
    context.fillRect(0, 64, 512, 64);
    context.fillRect(0, 256, 512, 64);
    context.fillStyle = Config.wizard.skinColor;
    context.fillRect(0, 128, 512, 64);
    context.fillRect(0, 320, 512, 64);
    // Draw the sprite sheet into the canvas.
    context.globalCompositeOperation = "destination-in";
    context.drawImage(spriteImage, 0, 0);
    console.log("Sprites loaded.");
    loaded = true;
    schedule(callback);
  }

  function draw(context, index, x, y, w, h) {
    if (!loaded)
      throw Error("Trying to draw sprite before sprites are loaded.");
    var cellX = index % 8;
    var cellY = Math.floor(index / 8);
    var offsetX = cellX * 64;
    var offsetY = cellY * 64;
    context.drawImage(spriteSheet, offsetX, offsetY, 64, 64, x, y, w, h);
  }

  var Direction = {
    RIGHT: 0,
    LEFT: 24,
  };
  var Part = {
    ROBE: 0,
    SHOES: 8,
    SKIN: 16,
  };
  var State = {
    STATIONARY: 0,
    RUNNING: [1, 2, 3, 4, 5],
  };

  return {
    load: load,
    draw: draw,
    Direction: Direction,
    Part: Part,
    State: State,
  };
}());
