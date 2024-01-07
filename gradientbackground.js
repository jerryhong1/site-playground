
const c = document.getElementById('canv')
const $ = c.getContext('2d')

const color = function (x, y, h, s, l) {
  // $.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
  $.fillStyle = 'hsl(' + h + ',' + s + ',' + l + ')'
  $.fillRect(x, y, 1, 1)
}

const H = function (x, y, t) {
  return (Math.abs(100 + 200 * Math.sin(((x - xOffset) * (x - xOffset) * Math.cos(t / 50) + (y - yOffset) * (y - yOffset) * Math.sin(t / 30)) / 200)))
}

// the contours of these form ellipses, with more striation farther from the (x,y) origin. at ~(10, 10) the behavior seems less sharp.

// const G = function (x, y, t) {
//   return (Math.ceil(50 + 64 * Math.sin((x * x * Math.cos(t / 40) + y * y * Math.sin(t / 30)) / 300)))
// }

// const B = function (x, y, t) {
//   return (Math.ceil(50 + 64 * Math.sin(5 * Math.sin(t / 90) + ((x - 100) * (x - 100) + (y - 100) * (y - 100)) / 1100)))
// }

let t = 0
let tStep = 0.25
let xOffset = 0
let yOffset = 0
const xPartition = 100
const yPartition = 100

function run () {
  for (let x = 0; x <= xPartition; x++) {
    for (let y = 0; y <= yPartition; y++) {
      color(x, y, H(x, y, t), '30%', '85%')
    }
  }
  t = t + tStep
  window.requestAnimationFrame(run)
}

c.addEventListener('mousedown', () => {
  tStep = 1
})

c.addEventListener('mouseup', () => {
  tStep = 0.25
})

window.addEventListener('mousemove', (e) => {
  const mouseX = e.clientX;
  const mouseY = e.clientY;

  // Get the position of the target element
  const targetRect = c.getBoundingClientRect();

  // Calculate the mouse coordinates relative to the target element
  const relativeX = mouseX - targetRect.left;
  const relativeY = mouseY - targetRect.top;
  xOffset = relativeX / xPartition / 2;
  yOffset = relativeY / yPartition / 2;
  console.log(`x: ${relativeX}, y: ${relativeY}}`)
})

const b = document.getElementById('bong')
const bong = new Audio('bong.mp3')

b.addEventListener('click', () => {
  playBongAndSpeedGradient()
})

bong.addEventListener('ended', () => {
  b.disabled = false
  tStep = 0.25
})

function playBongAndSpeedGradient () {
  if (bong.duration === 0 || bong.paused) {
    b.disabled = true
    bong.play()
    tStep = 5
    setTimeout(() => { tStep = 1.5 }, 150)
    setTimeout(() => { tStep = 1 }, 700)
    setTimeout(() => { tStep = 0.7 }, 1500)
    setTimeout(() => { tStep = 0.4 }, 2000)
  }
}

 // Function to add random noise to the canvas
 function addNoise() {
  var imageData = $.getImageData(0, 0, c.width, c.height);
  var data = imageData.data;

  for (var i = 0; i < data.length; i += 4) {
      // Add random noise to the red, green, and blue channels
      s = Math.random() * 10
      data[i] = data[i] + s; // Red channel
      data[i + 1] = data[i + 1] + s; // Green channel
      data[i + 2] = data[i + 2] + s; // Blue channel
      // The alpha channel (data[i + 3]) remains unchanged
  }

  // Put the modified image data back onto the canvas
  $.putImageData(imageData, 0, 0);
}


run()