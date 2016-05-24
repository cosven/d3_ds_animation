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

        this.xAxis = d3.svg.axis()
          .scale(this.xScale)
          .ticks(d3.time.hour, 1)
          .orient('bottom');
    }
}


let main = (bodyClass) => {
};


$(() => {
  const bodyClass = '.' + 'oneDayMultiPerson';
  if ($(bodyClass).length != 0){
    console.log('{0} page'.format(bodyClass));
    main(bodyClass);
  }
});
