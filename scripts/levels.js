class Level extends Universe {
  constructor(json, pointHandlers, readyCallback) {
    super(json.displayName);
    this.on("mousemove", event => this.adjustMouse(event));
    this.keyboard = new Keyboard(this);
    var barrier = new AsyncBarrier;
    this.horizon = loadImage(json.horizon, barrier.increment());
    this.scenery = loadImage(json.scenery, barrier.increment());
    this.target = null;
    this.cameraPosition = new Vector(0, 0);  // In world coordinates.
    this.mousePosition = new Vector(0, 0);  // In world coordinates.
    // Create all the boundaries.
    for (var i = 0, n = json.shapes.length; i < n; i++) {
      var shape = json.shapes[i];
      var a = new Vector(shape[0][0], shape[0][1]);
      for (var j = 1, m = shape.length; j < m; j++) {
        var b = new Vector(shape[j][0], shape[j][1]);
        this.add(new Boundary(a, b));
        a = b;
      }
    }
    // Create all the special items.
    for (var i in json.points) if (json.points.hasOwnProperty(i)) {
      console.log("Creating " + i + "...");
      if (!pointHandlers.hasOwnProperty(i))
        throw Error("No point handler for point type " + i);
      var position = new Vector(json.points[i][0], json.points[i][1]);
      pointHandlers[i](this, position, barrier.increment());
      delete pointHandlers[i];
    }
    for (var i in pointHandlers) if (pointHandlers.hasOwnProperty(i))
      throw Error("No point defined for handler " + i);
    barrier.wait(function() {
      console.log("Level loaded.");
      readyCallback();
    });
  }
  adjustMouse(event) {
    var center =
        new Vector(Config.screen.width * 0.5, Config.screen.height * 0.5);
    this.mousePosition =
        this.cameraPosition.sub(center).add(new Vector(event.x, event.y));
  }
  update(delta) {
    if (this.target != null) {
      var offset = this.target.position.sub(this.cameraPosition);
      var amount = 1 - Math.pow(1 - Config.cameraTrackingRate, delta);
      this.cameraPosition = this.cameraPosition.add(offset.mul(amount));
    }
    super.update(delta);
  }
  draw(context) {
    var canvas = context.canvas;
    context.save();
      var center = new Vector(canvas.width * 0.5, canvas.height * 0.5);
      var topLeft = this.cameraPosition.sub(center);
      context.drawImage(this.horizon, 0, 0);
      context.drawImage(
        this.scenery, Math.floor(topLeft.x), Math.floor(topLeft.y),
        canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
      context.translate(-topLeft.x, -topLeft.y);
      super.draw(context);
    context.restore();
  }
}

var Levels = {
  "demo": {
    "displayName": "Demo Level",
    "horizon": "images/horizon.png",
    "scenery": "images/demo_level.png",
    "shapes": [
      [
        [
          533,
          695
        ],
        [
          534,
          227.5
        ],
        [
          3399.5,
          226.5
        ],
        [
          3438.5,
          1473
        ],
        [
          3318.5,
          1481
        ],
        [
          3218,
          1430
        ],
        [
          3076,
          1383
        ],
        [
          2895,
          1345
        ],
        [
          2760.5,
          1334
        ],
        [
          2629.5,
          1347
        ],
        [
          2474.5,
          1401
        ],
        [
          2368.5,
          1447
        ],
        [
          2230.5,
          1520
        ],
        [
          2112.5,
          1524
        ],
        [
          2009.5,
          1510
        ],
        [
          1924.5,
          1519
        ],
        [
          1842,
          1511
        ],
        [
          1763,
          1519
        ],
        [
          1684,
          1511
        ],
        [
          1620,
          1509
        ],
        [
          1489.5,
          1491
        ],
        [
          1438.5,
          1479
        ],
        [
          1403.5,
          1488
        ],
        [
          1335.5,
          1488
        ],
        [
          1271.5,
          1499
        ],
        [
          1227.5,
          1493
        ],
        [
          1158.5,
          1499
        ],
        [
          1060,
          1475
        ],
        [
          1009,
          1419
        ],
        [
          985,
          1365
        ],
        [
          961,
          1269
        ],
        [
          972,
          1093
        ],
        [
          962.5,
          1068.5
        ],
        [
          990.5,
          956.5
        ],
        [
          978.5,
          925.5
        ],
        [
          986.5,
          866.5
        ],
        [
          978.5,
          846.5
        ],
        [
          980.5,
          805.5
        ],
        [
          959.5,
          739.5
        ],
        [
          999.5,
          735.5
        ],
        [
          1002.5,
          723.5
        ],
        [
          967.5,
          694.5
        ],
        [
          900.5,
          677.5
        ],
        [
          831.5,
          680.5
        ],
        [
          815.5,
          670.5
        ],
        [
          779.5,
          683.5
        ],
        [
          721.5,
          682.5
        ],
        [
          663.5,
          688.5
        ],
        [
          583.5,
          684.5
        ],
        [
          533,
          695
        ]
      ]
    ],
    "points": {
      "player": [
        600,
        670
      ],
      "monster": [
        3324,
        1452,
      ],
      "health": [
        1030,
        650
      ],
      "transformSpell": [
        2775,
        1300,
      ],
      "portal": [
        3400,
        1430
      ]
    }
  },
};
