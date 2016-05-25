import $ from "jquery";
import d3 from 'd3';
import {get_width, get_height} from './consts';


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
          .ticks(d3.time.hour, 1)
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
  let width = 960;
  let height = 400;

  let axis = new Axis(bodyClass);
  
  let SVG = d3.select($(bodyClass)[0])
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  SVG.append('g')
    .attr('class', 'axis-odmp')
};

$(() => {
  const bodyClass = '.' + 'oneDayMultiPerson';
  if ($(bodyClass).length != 0){
    console.log('{0} page'.format(bodyClass));
    main(bodyClass);
  }
});
