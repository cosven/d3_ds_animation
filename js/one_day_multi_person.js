import $ from "jquery";
import d3 from 'd3';
// import * as timepicker from './jquery.timepicker'
import * as ui from 'jquery-ui'
import {get_width, get_height} from './consts';
import {oneDayMultiPersonData} from './data';
import {getEventColor} from './utils'


class Axis {
    constructor(bodyClass) {
        this.bodyClass = bodyClass;
        this.wholeDay = [new Date(2016, 1, 1), new Date(2016, 1, 2)];

        this.xWidth = 960;

        this.xScale = d3.time.scale()
          .domain(this.wholeDay)
          .range([0, this.xWidth]);

        this._yScale = null;

        this.xAxis = d3.svg.axis()
          .scale(this.xScale)
          .ticks(d3.time.hour, 3)
          .orient('bottom');
    }

    yScale(persons) {
      let index = d3.range(0, persons.length);
      let ordinal = d3.scale.ordinal()
        .domain(index)
        .range(persons);
      this._yScale = ordinal;
      return this._yScalea;
    }
}


let main = (bodyClass) => {
  bodyClass = bodyClass + '-div';
  let axis = new Axis(bodyClass);

  let width = axis.xWidth;  // equal to xAxis width
  let height = 600;
  let axisMargin = [40, 40, 40, 40];
  let axisPos = {x: axisMargin[3], y: axisMargin[0]};

  let loadData = (data=oneDayMultiPersonData) => {
    let index = 0;
    for (let person of oneDayMultiPersonData) {
      let groupHeight = 20; 
      let yRectMargin = 5;

      let y = axisPos.y + 20 + index*groupHeight + (index+1)*yRectMargin;
      let x = axisPos.x;

      let rectsGroup = SVG.append('g')
        .attr('class', 'events-rect')
        .attr('transform', 'translate({0}, {1})'
              .format(x, y));

      rectsGroup.append('rect')
        .attr('class', 'rect-container')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width)
        .attr('height', groupHeight)
        .attr('fill', '#444');

      rectsGroup.selectAll('.rect-content')
        .data(person.events)
        .enter()
        .append('rect')
        .attr('class', 'rect-content')
        .attr('x', (d) => {
          return axis.xScale(d.timestamp);
        })
        .attr('y', 0)
        .attr('width', () => {
          return Math.floor(Math.random() * 40);
        })
        .attr('height', groupHeight)
        .attr('fill', (d) => {
          return getEventColor(d);
        })
        .append('title')
        .text((d) => {
          return d.detail;
        });

      rectsGroup.selectAll('.rect-name')
        .data(oneDayMultiPersonData)
        .enter()
        .append('text')
        .attr('class', 'rect-name')
        .attr('x', 10)
        .attr('y', 13)
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .text(() => {
          return person.name;
        })
        .attr('fill', '#CCC')
        .on('mouseover', (d, i) => {
          let ele = rectsGroup.selectAll('.rect-name')[0][i];
          d3.select(ele).attr('fill', 'white')
            .style('cursor', 'pointer');
        })
        .on('mouseout', (d, i) => {
          let ele = rectsGroup.selectAll('.rect-name')[0][i];
          d3.select(ele).attr('fill', '#CCC')
            .style('cursor', 'normal');
        });
  
        index += 1;
    } 
    
  };

  
  let SVG = d3.select($(bodyClass)[0])
    .append('svg')
    .attr('width', width + axisMargin[1])
    .attr('height', height);

  SVG.append('g')
    .attr('class', 'axis-odmp')
    .attr('transform', 'translate({0}, {1})'
          .format(axisPos.x, axisPos.y))
    .call(axis.xAxis);
  
  loadData();
  $('.datepick').datepicker({
    dateFormat: "yy-mm-dd",
    minDate: new Date(2016, 1 - 1, 1),
    maxDate: new Date(2016, 2 - 1, 1)
  });
  $('.datepick').datepicker('setDate', new Date(2016, 1 - 1, 1));
};

$(() => {
  const bodyClass = '.' + 'oneDayMultiPerson';
  if ($(bodyClass).length != 0){
    console.log('{0} page'.format(bodyClass));
    main(bodyClass);
  }
});
