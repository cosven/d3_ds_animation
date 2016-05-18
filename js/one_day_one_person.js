import $ from "jquery";
import d3 from 'd3';
import {get_width, get_height} from './consts'
import {print} from './utils';


let main = (bodyClass) => {

  var margins = [20, 20, 20, 20];

  let timeScale = d3.time.scale()
    .domain([new Date(2016, 1, 1), new Date(2016, 1, 2)])
    .range([0, get_width() - 40]);

  let timeAxisZoomed = () => {
    print('time axis zoomed');
    svg.select('.axis').call(timeAxis);
  }

  let timeAxisZoom = d3.behavior.zoom()
    .x(timeScale)
    .scaleExtent([1, Infinity])
    .on('zoom', timeAxisZoomed);
    
  let timeAxis = d3.svg.axis()
    .scale(timeScale)
    .orient('bottom');

  let svg = d3.select($(bodyClass)[0])
    .append('svg')
    .attr('width', get_width())
    .attr('height', get_height())
    .call(timeAxisZoom);

  svg.append('g')
    .attr('class', 'axis')
    .attr('transform', 'translate({0}, {1})'.format(
          margins[0], get_height()/2 - margins[1]))
    .call(timeAxis);
}

$(() => {
  const bodyClass = '.' + 'oneDayOnePerson';
  console.log($(bodyClass));
  if ($(bodyClass).length != 0){
    console.log('{0} page'.format(bodyClass))
    main(bodyClass);
  }
});
