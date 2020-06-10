var canvas, ctx;

var trails = [];
var letters = [];

function lerp(a, b, v) {
  return (1 - v) * a + v * b;
}

var dpr = window.devicePixelRatio || 1;
var width = window.innerWidth * dpr;
var height = window.innerHeight * dpr;

function draw() {
  requestAnimationFrame(draw);

  ctx.fillStyle = "white";
  ctx.globalAlpha = 0.2;
  ctx.fillRect(0, 0, width, height);
  ctx.globalAlpha = 1;

  for (let i = 0; i < trails.length; i++) {
    const trail = trails[i];

    trail.life++;

    // Reset target vector every 20 frames
    if (trail.life % 50 === 0) {
      trail.tx = Math.random() * width;
      trail.ty = Math.random() * height;
    }

    if (trail.life % 5 === 0) {
      letters.push({
        trail,
        life: 0,
        lifetime: 100,
        x: trail.x,
        y: trail.y,
        vx: trail.vx,
        vy: trail.vy,
        char: trail.chars.shift(),
      });
    }

    // ctx.fillStyle = "red";
    // ctx.fillRect(trail.tx, trail.ty, 5, 5);

    // Calculate motion vec from target;
    trail.vx = lerp(trail.vx, (trail.tx - trail.x) * 0.8 * dpr, 0.005);
    trail.vy = lerp(trail.vy, (trail.ty - trail.y) * 0.8 * dpr, 0.005);

    if (trail.x < 0 || trail.x > width) {
      trail.vx = -trail.vx;
    }
    if (trail.y < 0 || trail.y > width) {
      trail.vy = -trail.vy;
    }

    // Add the motion vector to the
    trail.x = lerp(trail.x + trail.vx, trail.x, 0.98);
    trail.y = lerp(trail.y + trail.vy, trail.y, 0.98);

    // Draw the trail
    ctx.fillStyle = "black";
    ctx.fillRect(trail.x, trail.y, 5, 5);

    if (trail.life > trail.lifetime || !trail.chars.length) {
      trails.splice(trails.indexOf(trail), 1);
    }
  }

  for (let i = 0; i < letters.length; i++) {
    var letter = letters[i];

    letter.life++;

    letter.vx *= 0.99;
    letter.vy -= 0.01;

    letter.x += letter.vx * 0.01;
    letter.y += letter.vy * 0.01;

    ctx.fillStyle = ctx.strokeStyle = `rgba(0, 0, 0, ${
      1 - letter.life / letter.lifetime
    })`;

    ctx.beginPath();
    ctx.moveTo(letter.x - letter.vx * 0.5, letter.y - letter.vy * 0.5);
    ctx.lineTo(letter.x, letter.y);
    ctx.stroke();

    ctx.font = 20 * dpr + "px Arial";
    ctx.fillText(letter.char, letter.x, letter.y);

    if (
      letter.life > letter.lifetime ||
      letter.x < 0 ||
      letter.x > width ||
      letter.y < 0 ||
      letter.y > height
    ) {
      letters.splice(letters.indexOf(letter), 1);
    }
  }
}

function stringToArray(string) {
  var chars = [];
  for (var i = 0; i < string.length; i++) chars.push(string.charAt(i));
  return chars;
}

function setup() {
  canvas = document.createElement("canvas");
  canvas.style.position = "absolute";
  canvas.style.top = 0;
  canvas.style.left = 0;
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";

  dashws.on("msg", function (message) {
    trails.push({
      chars: stringToArray(JSON.stringify(message)),
      life: 0,
      lifetime: 1000,
      x: Math.random() * width,
      y: Math.random() * height,
      tx: Math.random() * width,
      ty: Math.random() * height,
      vx: Math.random() * 5,
      vy: Math.random() * 5,
    });
  });

  canvas.width = width;
  canvas.height = height;

  ctx = canvas.getContext("2d");

  document.body.appendChild(canvas);

  draw();
}

setup();
