import $ from "jquery";
import d3 from "d3";

String.prototype.format = function() {
  var args = arguments;
  return this.replace(/{(\d+)}/g, function(match, number) { 
    return typeof args[number] != 'undefined'
      ? args[number]
      : match
    ;
  });
};


$(() => {
  var width = 400,
      height = 400;

  var svg = d3.select('body')
              .append('svg')
              .attr('width', width)
              .attr('height', height);
  var dataset = [10, 20, 30, 40, 33, 24, 12, 5];
  var linear = d3.scale.linear()    // 比例尺中的一种：线性比例尺
                       .domain([0, d3.max(dataset)])
                       .range([0, 250]);

  var padding = {left:30, right:30, top:20, bottom:20};
  var xScale = d3.scale.ordinal()
    .domain(d3.range(dataset.length))
    .rangeRoundBands([0, width - padding.left - padding.right]);
  console.log(xScale.rangeBand());
  var yScale = d3.scale.linear()
    .domain([0, d3.max(dataset)])
    .range([height - padding.top - padding.bottom, 0]);

  var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient('bottom');

  var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient('left');

  var rectPadding = 10;
  var rects = svg.selectAll('.myRect')
    .data(dataset)
    .enter()
    .append('rect')
    .attr('class', 'myRect')
    .attr('transform', 'translate({0}, {1})'.format(padding.left, padding.top))
    .attr('x', (d, i) => {
      return xScale(i) + rectPadding/2;
    })
    .attr('y', (d, i) => {
      return yScale(d);
    })
    .attr('width', xScale.rangeBand() - rectPadding)
    .attr('height', (d) => {
      return height - padding.top - padding.bottom - yScale(d);
    });

  var texts = svg.selectAll('.myText')
    .data(dataset)
    .enter()
    .append('text')
    .attr('class','myText')
    .attr('transform','translate({0}, {1})'.format(padding.left, padding.top))
    .attr('x', function(d,i){
      return xScale(i) + rectPadding/2;
    } )
    .attr('y',function(d){
        return yScale(d);
    })
    .attr('dx',function(){
      return (xScale.rangeBand() - rectPadding)/2
    })
    .attr('dy',function(d){
        return 20;
    })
    .text(function(d){
        return d;
    });

  svg.append("g")
    .attr("class","axis")
    .attr("transform","translate(" + padding.left + "," + (height - padding.bottom) + ")")
    .call(xAxis); 
          
  //添加y轴
  svg.append("g")
    .attr("class","axis")
    .attr("transform","translate(" + padding.left + "," + padding.top + ")")
    .call(yAxis);
});
