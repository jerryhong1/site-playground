import dynamic from 'next/dynamic'
// Will only import `react-p5` on client-side
const Sketch = dynamic(() => import('react-p5').then((mod) => mod.default), {
  ssr: false
})

export default function RaindropsSketch () {
  const drops = []
  const gravity = 0.2
  const maxSpeed = 15
  // const waterLevel = 0
  // const waveOffset = 0
  const nFramesDelay = 30

  const setup = (p5, canvasParentRef) => {
    console.log(canvasParentRef.clientHeight)
    const canvas = p5.createCanvas(canvasParentRef.clientWidth, 1000)
    canvas.parent(canvasParentRef)
    for (let i = 0; i < 400; i++) {
      drops[i] = {
        x: p5.random(p5.width),
        y: p5.random(-500, -50),
        length: 0.5,
        max_length: p5.random(5, 20),
        speed: p5.random(1, 5),
        delayFrames: p5.random(0, 600)
      }
    }
  }

  const draw = (p5) => {
    p5.background(240, 240, 240)

    // rain
    for (let i = 0; i < drops.length; i++) {
      const drop = drops[i]
      if (drop.delayFrames >= p5.frameCount) {
        continue
      }
      const alpha = Math.max(Math.min((p5.frameCount - nFramesDelay) / 1.4, 255), 0)
      p5.stroke(200, 200, 200, alpha)
      p5.strokeWeight(1.5)
      p5.line(drop.x, drop.y, drop.x, drop.y + drop.length)
      drop.length = Math.min(drop.length + 0.2, drop.max_length)
      drop.y += drop.speed
      drop.speed = Math.min(drop.speed + gravity, maxSpeed)
      if (drop.y > p5.height + 50) {
        drop.y = p5.random(-500, -50)
        drop.speed = p5.random(5, 20)
        drop.x = p5.random(p5.width)
        drop.length = 0
      }
    }

    // // pooling water
    // p5.background(200, 220, 230)

    // // Draw the water
    // p5.fill(150, 200, 255)
    // p5.beginShape()
    // p5.vertex(0, p5.height)
    // for (let x = 0; x <= p5.width; x += 10) {
    //   const y = waterLevel + p5.noise(waveOffset + x * 0.01) * 50
    //   p5.vertex(x, y)
    // }
    // p5.vertex(p5.width, p5.height)
    // p5.endShape(p5.CLOSE)

    // // Update the wave offset to create the wave motion
    // waveOffset += 0.01

    // // Update the water level to simulate pooling
    // waterLevel += 1
    // waterLevel = p5.constrain(waterLevel, 250, p5.height)
  }

  return <Sketch setup={setup} draw={draw} />
}
