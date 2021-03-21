
// set the dimensions and margins of the graph
const margin = { top: 16, right: 0, bottom: 30, left: 8 }
const width = 560 - margin.left - margin.right
const height = 400 - margin.top - margin.bottom
let canvasDrawn = false

// get the data
function drawHistogram (data) {
  let svg = d3.select('#histogram')
  // append the svg object to the body of the page
  if (!canvasDrawn) {
    svg = d3.select('#bootstrapping-histogram')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform',
        'translate(' + margin.left + ',' + margin.top + ')')
      .attr('id', 'histogram')
  }

  // X axis: scale and draw:
  const x = d3.scaleLinear()
    .domain([0, d3.max(data, function (d) { return +d })])
    .range([0, width])

  // set the parameters for the histogram
  const histogram = d3.histogram()
    .value(function (d) { return d }) // I need to give the vector of value
    .domain(x.domain()) // then the domain of the graphic
    .thresholds(x.ticks(20)) // then the numbers of bins

  // And apply this function to data to get the bins
  const bins = histogram(data)
  svg.selectAll('g')
    .remove()
    .exit()
  svg.append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisBottom(x))

  // Y axis: scale and draw:
  const y = d3.scaleLinear()
    .range([height, 0])
  y.domain([0, d3.max(bins, function (d) { return d.length })]) // d3.hist has to be called before the Y axis obviously
  svg.append('g')
    .call(d3.axisLeft(y))

  // append the bar rectangles to the svg element
  svg.selectAll('rect')
    .remove()
    .exit()
    .data(bins)
    .enter()
    .append('rect')
    .attr('x', 1)
    .attr('transform', function (d) { return 'translate(' + x(d.x0) + ',' + y(d.length) + ')' })
    .attr('width', function (d) { return x(d.x1) - x(d.x0) })
    .attr('height', function (d) { return height - y(d.length) })
    .style('fill', 'lightgrey')

  canvasDrawn = true
}
