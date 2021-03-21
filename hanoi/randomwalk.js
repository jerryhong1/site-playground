// simulate two rings!

// set the dimensions and margins of the graph
const marginWalk = { top: 16, right: 0, bottom: 0, left: 8 }
const widthWalk = 560 - marginWalk.left - marginWalk.right
const heightWalk = 250 - marginWalk.top - marginWalk.bottom

const positions = [{ x: 275, y: 20 },
  { x: 200, y: 90 },
  { x: 350, y: 90 },
  { x: 110, y: 150 },
  { x: 440, y: 150 },
  { x: 70, y: 215 },
  { x: 200, y: 215 },
  { x: 350, y: 215 },
  { x: 480, y: 215 }]

function stateToIndex (hanoi) {
  // hard coded because i got so lazy. next time i'd map a state to a ternary number.
  const state = hanoi.getState()
  console.log(state[0], state[1], state[2])
  if (state[0].length === 2) {
    return 0
  } else if (state[0].length === 1) {
    // only one block in the first peg
    if (state[0][0] === 1) {
      if (state[1][0] === 0) {
        return 2
      } else {
        return 1
      }
    } else {
      if (state[1][0] === 1) {
        return 6
      } else {
        return 7
      }
    }
  } else {
    if (state[1].length === 0) {
      return 5
    } else if (state[2].length === 2) {
      return 8
    } else if (state[1][0] === 0) {
      return 4
    } else {
      return 3
    }
  }
}

function drawWalk () {
  // append the svg object to the body of the page
  const hanoi = new Hanoi(2)
  console.log(hanoi.getState())

  const svg = d3.select('#random-walk')
    .append('svg')
    .attr('width', widthWalk + marginWalk.left + marginWalk.right)
    .attr('height', heightWalk + marginWalk.top + marginWalk.bottom)
    .append('g')
    .attr('transform',
      'translate(' + marginWalk.left + ',' + marginWalk.top + ')')
    .attr('id', 'walk')

  svg.append('svg:image')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', widthWalk)
    .attr('xlink:href', './2rings.png')

  svg.append('g')
  svg.selectAll('circle')
    .data(positions)
    .enter().append('circle')
    .attr('cx', function (d) {
      return d.x
    })
    .attr('cy', function (d) {
      return d.y
    })
    .attr('r', 0)
    .style('fill', 'rgba(27, 27, 27, 0.8)')
    .attr('id', function (d, i) {
      return `c${i.toString()}`
    })

  const stateIndeces = [0]
  const Iterator = d3.interval(function () {
    const legalMoves = hanoi.legalMoves()
    const move = sampleFromList(legalMoves)
    hanoi.makeMove(move[0], move[1])
    const nextStateIndex = stateToIndex(hanoi)
    console.log(nextStateIndex)
    if (stateIndeces.length >= 2) {
      d3.select(`#c${stateIndeces[stateIndeces.length - 2].toString()}`)
        .attr('r', 0)
    }
    d3.select(`#c${stateIndeces[stateIndeces.length - 1].toString()}`)
      .attr('r', 14)
    stateIndeces.push(nextStateIndex)
  }, 1000)
}

drawWalk()
