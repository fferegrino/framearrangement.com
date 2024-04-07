let frames = [];
let canvas = document.getElementById("wall");
let ctx = canvas.getContext("2d");
let addFrameButton = document.getElementById("addFrame");
let chevronSize = 5;
let ratioCanvasSizeToWallSize = 300 / 1000; // 300cm to 1000px
const yLocation = canvas.height / 3;

let distributionStyleRadios = document.querySelectorAll(
  'input[name="distributionStyle"]'
);

addFrameButton.addEventListener("click", addFrame);

function drawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  frames.forEach(drawFrame);
  drawDistances();
  drawDistance(0, canvas.width, yLocation * 2);
}

function parseMeasurementToCm(measurement) {
  let measurementInCm = 0;
  if (measurement.includes("cm")) {
    measurementInCm = parseFloat(measurement);
  } else if (measurement.includes("m")) {
    measurementInCm = parseFloat(measurement) * 100;
  } else {
    measurementInCm = parseFloat(measurement);
  }
  return measurementInCm;
}

let setWallButton = document.getElementById("setWall");

setWallButton.addEventListener("click", function () {
  let wallWidth = parseMeasurementToCm(
    document.getElementById("wallWidth").value
  );

  ratioCanvasSizeToWallSize = wallWidth / canvas.width;

  drawCanvas();
});

function equidistantFrames() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let wallWidth = parseInt(canvas.width);

  let sortedFrames = frames.slice().sort((a, b) => a.x - b.x);

  let totalWidth = sortedFrames.reduce((acc, frame) => acc + frame.width, 0);
  let totalGap = wallWidth - totalWidth;
  let gapEvery = totalGap / (sortedFrames.length + 1);

  let currentX = gapEvery;
  sortedFrames.forEach((frame) => {
    frame.x = currentX;
    currentX += frame.width + gapEvery;
  });
}

function distributeFrames() {
  let wallWidth = parseInt(canvas.width);
  let frameCount = frames.length;
  let frameEvery = wallWidth / (frameCount + 1);

  let sortedFrames = frames.slice().sort((a, b) => a.x - b.x);
  sortedFrames.forEach((frame, index) => {
    frame.x = (index + 1) * frameEvery - frame.width / 2;
    frame.y = yLocation - frame.height / 2;
  });
}

function drawDistance(x1, x2, y) {
  ctx.strokeStyle = "black";
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x2, y);

  // Add chevrons
  ctx.moveTo(x1, y);
  ctx.lineTo(x1 + chevronSize, y - chevronSize);
  ctx.moveTo(x1, y);
  ctx.lineTo(x1 + chevronSize, y + chevronSize);

  ctx.moveTo(x2, y);
  ctx.lineTo(x2 - chevronSize, y - chevronSize);
  ctx.moveTo(x2, y);
  ctx.lineTo(x2 - chevronSize, y + chevronSize);

  ctx.stroke();

  let distanceTwoDecimals = (x2 - x1) * ratioCanvasSizeToWallSize;
  distanceTwoDecimals = Number.isInteger(distanceTwoDecimals)
    ? distanceTwoDecimals.toFixed(0)
    : distanceTwoDecimals.toFixed(1);
  let distanceText = `${distanceTwoDecimals}cm`;
  ctx.font = "20px serif";
  let textWidth = ctx.measureText(distanceText).width;
  ctx.fillText(distanceText, x1 + (x2 - x1) / 2 - textWidth / 2, y);
}

function drawDistances() {
  let sortedFrames = frames.slice().sort((a, b) => a.x - b.x);
  let distances = [];
  let currentX = 0;

  for (let i = 0; i < sortedFrames.length; i++) {
    distances.push({ x1: currentX, x2: sortedFrames[i].x });
    currentX = sortedFrames[i].x + sortedFrames[i].width;
  }
  if (currentX < canvas.width) {
    distances.push({ x1: currentX, x2: canvas.width });
  }

  distances.forEach((distance) => {
    drawDistance(distance.x1, distance.x2, yLocation);
  });
}

function addFrame() {
  let frameWidth = parseMeasurementToCm(
    document.getElementById("frameWidth").value
  );
  let frameHeight = 30;
  let frame = {
    width: frameWidth / ratioCanvasSizeToWallSize,
    height: frameHeight,
    x: 0,
    y: yLocation - frameHeight / 2,
  };
  frames.push(frame);

  let distributionStyle = document.querySelector(
    'input[name="distributionStyle"]:checked'
  ).value;

  if (distributionStyle === "distribute") {
    distributeFrames();
  } else if (distributionStyle === "equidistant") {
    equidistantFrames();
  }

  drawCanvas();
}

function drawFrame(frame) {
  ctx.strokeStyle = "black"; // or any color for the border
  ctx.fillStyle = "blue"; // or any color for the fill

  let actualX = frame.x; // * ratioCanvasSizeToWallSize;
  let actualWidth = frame.width; // * ratioCanvasSizeToWallSize;

  ctx.strokeRect(actualX, frame.y, actualWidth, frame.height);
}

let selectedFrame = null;

canvas.addEventListener("mousedown", function (e) {
  let rect = canvas.getBoundingClientRect();

  let x = e.clientX - rect.left;
  let y = e.clientY - rect.top;
  selectedFrame = frames.find(
    (frame) =>
      x > frame.x &&
      x < frame.x + frame.width &&
      y > frame.y &&
      y < frame.y + frame.height
  );
});

canvas.addEventListener("mousemove", function (e) {
  if (selectedFrame) {
    let rect = canvas.getBoundingClientRect();
    selectedFrame.x = e.clientX - rect.left - selectedFrame.width / 2;

    canvas.style.cursor = "grabbing";
    drawCanvas();
  }
});

canvas.addEventListener("mouseup", function (e) {
  selectedFrame = null;
  canvas.style.cursor = "default";

  let distributionStyle = document.querySelector(
    'input[name="distributionStyle"]:checked'
  ).value;

  if (distributionStyle === "distribute") {
    distributeFrames();
  } else if (distributionStyle === "equidistant") {
    equidistantFrames();
  }
  drawCanvas();
});

distributionStyleRadios.forEach((radio) => {
  radio.addEventListener("change", function () {
    if (radio.value === "distribute") {
      distributeFrames();
    } else if (radio.value === "equidistant") {
      equidistantFrames();
    }

    drawCanvas();
  });
});
