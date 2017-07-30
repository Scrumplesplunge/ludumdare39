var Config = {
  animationFrameRate: 15,
  cameraTrackingRate: 0.999,
  creatures: {
    monster: {
      color: {
        bones: "#5c5c5c",
        robe: "#cfd086",
        shoes: "#41351d",
        skin: "#87b144",
      },
      jumpSpeed: 400,
      speed: 100,
    },
    wizard: {
      color: {
        bones: "#5c5c5c",
        robe: "#5c5c5c",
        shoes: "#1c1c1c",
        skin: "#acacac",
      },
      maxLife: 100,
      jumpSpeed: 750,
      lifeLostPerSecond: 10,
      speed: 300,
    },
  },
  deathScreenTimeout: 3,
  gravity: 30,
  levelMakerCameraSpeed: 500,
  loader: {
    backgroundColor: "#5c5c5c",
    color: "#acacac",
    largeFontSize: 50,
    smallFontSize: 20,
    history: 5,
  },
  screen: {
    width: 800,
    height: 600,
  },
  showBoundaries: false,
  updateDelay: 0.01,
  orbColor: "#00ff00",
  rewardSpeed: 500,
};
