import $ from "jquery";
import d3 from "d3";

$(() => {
  var svg = d3.select('body')
              .append('svg')
              .attr('width', '100%')
              .attr('height', '100%');
  var dataset = [2.5, 2.1, 0.3]
  var linear = d3.scale.linear()
                       .domain([0, d3.max(dataset)])
                       .range([0, 250])

  svg.selectAll('rect')
    .data(dataset)
    .enter()
    .append('rect')
    .attr('x', 20)
    .attr('y', (d, i) => {
      return i*20;
    })
    .attr('width', (d, i) => {
      console.log(d, i);
      return linear(d);
    })
    .attr('height', 10)
    .attr('fill', 'blue');
});
