import $ from "jquery";
import d3 from "d3";
import * as utils from "./utils";
import {test_string_format} from "./tests";
import * as oneDayOnePerson from "./one_day_one_person";
import * as oneDayMultiPerson from "./one_day_multi_person";

let main = (bodyClass) => {

  test_string_format();

  var margin = {top: 20, right: 20, bottom: 30, left: 40},
      width = 960 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

  var x = d3.scale.linear()
    .domain([-width / 2, width / 2])
    .range([0, 24]);

  var y = d3.scale.linear()
    .domain([-height / 2, height / 2])
    .range([height, 0]);

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickSize(-height);

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(7)
    .tickSize(-width);

  var zoom = d3.behavior.zoom()
    .x(x)
    .y(y)
    .scaleExtent([1, 10])
    .on("zoom", zoomed);

  var svg = d3.select($(bodyClass)).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .call(zoom);

  svg.append("rect")
    .attr("width", width)
    .attr("height", height);

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);

  d3.select("button").on("click", reset);

  function zoomed() {
    svg.select(".x.axis").call(xAxis);
    svg.select(".y.axis").call(yAxis);
  }

  function reset() {
    d3.transition().duration(750).tween("zoom", function() {
    var ix = d3.interpolate(x.domain(), [-width / 2, width / 2]),
        iy = d3.interpolate(y.domain(), [-height / 2, height / 2]);
    return function(t) {
        zoom.x(x.domain(ix(t))).y(y.domain(iy(t)));
        zoomed();
      };
    });
  }
}

$(() => {
  const bodyClass = '.' + 'home';
  if ($(bodyClass).length != 0) {
    console.log('{0} page'.format(bodyClass))
    main(bodyClass);
  }
});
