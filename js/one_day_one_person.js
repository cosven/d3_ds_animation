import $ from "jquery";
import d3 from 'd3';
import {get_width, get_height} from './consts';
import {oneDayOnePersonData} from './data';


let main = (bodyClass) => {

  const margins = [20, 20, 20, 20];  // top, right, bottom, left
  const eventsColor = d3.scale.category10();

  let getEventColor = (event) => {
    var color = 'blue';
    switch (event.thing) {
    case 'whether':
      color = eventsColor(0);
      break;
    case 'music':
      color = eventsColor(1);
      break;
    default:
      color = eventsColor(2);
    }
    return color;
  };

  let timeScale = d3.time.scale()
    .domain([new Date(2016, 1, 1), new Date(2016, 1, 2)])
    .range([0, get_width() - 40]);

  let timeAxisZoomed = () => {
    SVG.select('.axis').call(timeAxis);
    pointGroup.selectAll('circle')
      .data(oneDayOnePersonData.events)
      .attr('cx', (d, i) => {
        return timeScale(d.timestamp);
      });
  };

  let timeAxisZoom = d3.behavior.zoom()
    .x(timeScale)
    .scaleExtent([1, Infinity])
    .on('zoom', timeAxisZoomed);

  let timeAxis = d3.svg.axis()
    .scale(timeScale)
    .orient('bottom');

  let initTimeAxis = () => {
    timeAxisZoom.x(timeScale.domain([new Date(2016, 1, 1, 0), new Date(2016, 1, 1, 3)]));
    timeAxisZoomed();
  };

  let loadData = (data=oneDayOnePersonData) => {
    let events = data.events;

    // draw points

    pointGroup.selectAll('circle')
      .data(events)
      .enter()
      .append('circle')
      .attr('fill', (d, i) => {
        return getEventColor(d);
      })
      .attr('cx', (d, i) => {
        return timeScale(d.timestamp);
      })
      .attr('cy', -2)
      .attr('r', 5)
      .append('title')
      .text((d, i) => {
        return d.thing;
      });
  };

  let animation = () => {
    timeScale.domain([new Date(2016, 1, 1, 1), new Date(2016, 1, 1, 10)]);
    SVG.select('.axis')
      .transition().duration(5000).ease('linear')
      .call(timeAxis);
    pointGroup.selectAll('circle')
      .data(oneDayOnePersonData.events)
      .attr('flag', 'false')  // automatic convert to string
      .transition().duration(5000).ease('linear')
      .tween('progress', (d, i) => {
        let ele = pointGroup.selectAll('circle')[0][i];
        return () => {
          let cx = ele.attributes.cx.value;
          if ((cx <= get_width() / 2) && ele.attributes.flag.value == 'false'){
            d3.select(ele).attr('flag', 'true');
            console.log(d.detail);
          }
        };
      })
      .attr('cx', (d, i) => {
        let cx = timeScale(d.timestamp);
        return cx;
      });
  };

  let SVG = d3.select($(bodyClass)[0])
    .append('svg')
    .attr('width', get_width())
    .attr('height', get_height())
    .call(timeAxisZoom);

  let pointGroup = SVG.append('g')
        .attr('class', 'time-event-point')
        .attr('transform', 'translate({0}, {1})'.format(margins[3], get_height()/2 - margins[2]));

  SVG.append('g')
    .attr('class', 'axis')
    .attr('transform', 'translate({0}, {1})'.format(
          margins[3], get_height()/2 - margins[2]))
    .call(timeAxis);

  initTimeAxis();
  loadData();
  animation();
};

$(() => {
  const bodyClass = '.' + 'oneDayOnePerson';
  if ($(bodyClass).length != 0){
    console.log('{0} page'.format(bodyClass));
    main(bodyClass);
  }
});
