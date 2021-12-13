
const c = document.getElementById('canv')
const $ = c.getContext('2d')

const col = function (x, y, h, s, l) {
  // $.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
  $.fillStyle = 'hsl(' + h + ',' + s + ',' + l + ')'
  $.fillRect(x, y, 1, 1)
}
const H = function (x, y, t) {
  return (Math.abs(100 + 200 * Math.sin((x * x * Math.cos(t / 40) + y * y * Math.sin(t / 30)) / 300)))
}

// const G = function (x, y, t) {
//   return (Math.ceil(50 + 64 * Math.sin((x * x * Math.cos(t / 40) + y * y * Math.sin(t / 30)) / 300)))
// }

// const B = function (x, y, t) {
//   return (Math.ceil(50 + 64 * Math.sin(5 * Math.sin(t / 90) + ((x - 100) * (x - 100) + (y - 100) * (y - 100)) / 1100)))
// }

let t = 0
let tStep = 0.25

function run () {
  for (let x = 0; x <= 35; x++) {
    for (let y = 0; y <= 35; y++) {
      col(x, y, H(x, y, t), '25%', '85%')
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

run()
