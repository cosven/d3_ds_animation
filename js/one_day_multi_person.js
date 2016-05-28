import $ from "jquery";
import d3 from 'd3';
import {get_width, get_height} from './consts';
import {access_data} from './data_access';
import {getEventColor, str_to_date} from './utils';


class Axis {
    constructor(bodyClass) {
      this.bodyClass = bodyClass;
      this.wholeDay = [new Date(2016, 5-1, 11), new Date(2016, 5-1, 12)];

      this.xWidth = 960;

      this.xScale = d3.time.scale()
        .domain(this.wholeDay)
        .range([0, this.xWidth]);

      this._yScale = null;

      this.xAxis = d3.svg.axis()
        .scale(this.xScale)
        // .ticks(d3.time.hour, 3)
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

  let loadData = (data) => {
    let index = 0;
    for (let person of data) {
      let groupHeight = 20; 
      let yRectMargin = 5;

      let y = axisPos.y + 20 + index*groupHeight + (index+1)*yRectMargin;
      let x = axisPos.x;

      let rectsGroup = SVG.append('g')
        .datum(person)
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
        .data(person.records)
        .enter()
        .append('rect')
        .attr('class', 'rect-content')
        .attr('x', (d) => {
          return axis.xScale(str_to_date(d.timestamp));
        })
        .attr('y', 0)
        .attr('width', () => {
          return 30;
        })
        .attr('height', groupHeight)
        .attr('fill', (d) => {
          return getEventColor(d);
        })
        .append('title')
        .text((d) => {
          return d.asr_text;
        });

      rectsGroup.selectAll('.rect-name')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'rect-name')
        .attr('x', 10)
        .attr('y', 13)
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .text(() => {
          return person.did;
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

  let xAxisZoom = d3.behavior.zoom()
    .x(axis.xScale)
    .scaleExtent([1, 400]);
  
  let SVG = d3.select($(bodyClass)[0])
    .append('svg')
    .attr('width', width + axisMargin[1])
    .attr('height', height)
    .call(
      xAxisZoom.on('zoom', () => {
        let _axis = SVG.select('.axis-odmp');
        _axis.call(axis.xAxis);
        console.log(d3.event.scale);
        // if (d3.event.scale > 20){
        //     axis.xAxis.ticks(d3.time.minutes, 5);
        // } else if (d3.event.scale > 10){
        //     axis.xAxis.ticks(d3.time.minutes, 10);
        // } else if (d3.event.scale > 6){
        //     axis.xAxis.ticks(d3.time.minutes, 15);
        // } else if (d3.event.scale > 4){
        //     axis.xAxis.ticks(d3.time.minutes, 30);
        // } else if (d3.event.scale > 2){
        //     axis.xAxis.ticks(d3.time.hour, 1);
        // } else if (d3.event.scale > 1){
        //     axis.xAxis.ticks(d3.time.hour, 2);
        // } else {
        //     axis.xAxis.ticks(d3.time.hour, 1);
        // };
        let rectsGroups = d3.selectAll('.events-rect')[0];
        for (let rectsGroup of rectsGroups){
          rectsGroup = d3.select(rectsGroup);
          let person = rectsGroup.datum();
          rectsGroup.selectAll('.rect-content')
            .data(person.records)
            .attr('x', (d) => {
              return axis.xScale(str_to_date(d.timestamp));
            });
        }
      })
    )

  SVG.append('g')
    .attr('class', 'axis-odmp')
    .attr('transform', 'translate({0}, {1})'
          .format(axisPos.x, axisPos.y))
    .call(axis.xAxis);

  let tmp = (data) => {
    let persons = [data, data, data];
    loadData(persons);
  };
  access_data('010116000240.json', tmp); 

  $('.datepick').datepicker({
    dateFormat: "yy-mm-dd",
    minDate: new Date(2016, 5 - 1, 0),
    maxDate: new Date(2016, 5 - 1, 30)
  });
  $('.datepick').datepicker('setDate', new Date(2016, 5 - 1, 1));
};

$(() => {
  const bodyClass = '.' + 'oneDayMultiPerson';
  if ($(bodyClass).length != 0){
    console.log('{0} page'.format(bodyClass));
    main(bodyClass);
  }
});
