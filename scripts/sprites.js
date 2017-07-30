class SpriteSheet {
  constructor(filename, callback) {
    this.loaded = false;
    this.filename = filename;
    this.image = loadImage(filename, () => this.imageLoaded(callback));
    this.sprites = this.image;
  }
  imageLoaded(callback) {
    console.log(this.filename + " loaded.");
    if (this.image.width != 512)
      throw Error("Sprite sheet must be 512px wide.");
    this.loaded = true;
    callback();
  }
  setColorMap(colorMap) {
    if (!this.loaded)
      throw Error("Trying to edit sprite sheet before it is loaded.");
    if (colorMap.width != this.sprites.width ||
        colorMap.height != this.sprites.height) {
      throw Error("Sprite map and color map are of different sizes.");
    }
    this.sprites = document.createElement("canvas");
    this.sprites.width = this.image.width;
    this.sprites.height = this.image.height;
    var context = this.sprites.getContext("2d");
    context.drawImage(colorMap, 0, 0);
    context.globalCompositeOperation = "destination-in";
    context.drawImage(this.image, 0, 0);
    console.log(this.filename + " colors applied.");
  }
  draw(context, index, x, y, w, h) {
    if (!this.loaded)
      throw Error("Trying to draw sprite before sprites are loaded.");
    var cellX = index % 8;
    var cellY = Math.floor(index / 8);
    var offsetX = cellX * 64;
    var offsetY = cellY * 64;
    context.drawImage(this.sprites, offsetX, offsetY, 64, 64, x, y, w, h);
  }
}

class CreatureSpriteSheet extends SpriteSheet {
  constructor(filename, callback) {
    super(filename, () => this.spriteSheetReady(callback));
  }
  spriteSheetReady(callback) {
    this.setColors(Config.wizard.color.bones,
                   Config.wizard.color.robe,
                   Config.wizard.color.shoes,
                   Config.wizard.color.skin);
    callback();
  }
  setColors(bones, robe, shoes, skin) {
    var colorMap = document.createElement("canvas");
    colorMap.width = this.image.width;
    colorMap.height = this.image.height;
    var context = colorMap.getContext("2d");
    // Set the colours from the config.
    context.fillStyle = bones;
    context.fillRect(0, 0, 512, 64);
    context.fillRect(0, 256, 512, 64);
    context.fillStyle = robe;
    context.fillRect(0, 64, 512, 64);
    context.fillRect(0, 320, 512, 64);
    context.fillStyle = shoes;
    context.fillRect(0, 128, 512, 64);
    context.fillRect(0, 384, 512, 64);
    context.fillStyle = skin;
    context.fillRect(0, 192, 512, 64);
    context.fillRect(0, 448, 512, 64);
    this.setColorMap(colorMap);
  }
}

class ItemSpriteSheet extends SpriteSheet {
  constructor(filename, callback) {
    super(filename, () => this.spriteSheetReady(callback));
  }
  spriteSheetReady(callback) {
    var colorMap = document.createElement("canvas");
    colorMap.width = this.image.width;
    colorMap.height = this.image.height;
    var context = colorMap.getContext("2d");
    // Set the colours from the config.
    context.fillStyle = Config.orbColor;
    context.fillRect(0, 0, 64, 64);
    this.setColorMap(colorMap);
    console.log("Item sprites loaded.");
    callback();
  }
}

var Sprites = (function() {
  var sheet = {
    wizard: null,
  };

  var codes = {
    creature: {
      direction: {
        right: 0,
        left: 32,
      },
      part: {
        bones: 0,
        robe: 8,
        shoes: 16,
        skin: 24,
      },
      state: {
        stationary: 0,
        running: [1, 2, 3, 4, 5],
        jumping: 6,
      },
    },
    items: {
      orb: 0,
    },
  };

  function load(callback) {
    console.log("Loading sprites...");
    var barrier = new AsyncBarrier;
    sheet.wizard =
        new CreatureSpriteSheet("images/wizard.png", barrier.increment());
    sheet.monster =
        new CreatureSpriteSheet("images/monster.png", barrier.increment());
    sheet.items = new ItemSpriteSheet("images/items.png", barrier.increment());
    barrier.wait(function() {
      console.log("All sprites loaded.");
      callback();
    });
  }

  return {
    load: load,
    sheet: sheet,
    codes: codes,
  };
}());
