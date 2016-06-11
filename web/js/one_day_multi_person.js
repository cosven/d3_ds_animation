import $ from "jquery";
import d3 from 'd3';
import {get_width, get_height, server_api} from './consts';
import {access_data} from './data_access';
import {str_to_date, get_record_color, get_kind} from './utils';


class Axis {
  constructor(bodyClass, wholeDay) {
    this.bodyClass = bodyClass;
    this.wholeDay = wholeDay;

    this.xWidth = 800;

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

let getUsersData = (callback) => {
  console.log('get all users data');
  $.get(server_api + '/users?choices=all', (data, error) => {
    console.log(data);
    callback(data);
  });
};

let getDate = () => {
  let datestr = $('.datepick').val(); 
  let dArray = datestr.split('-');
  let y = parseInt(dArray[0]);
  let m = parseInt(dArray[1]);
  let d = parseInt(dArray[2]);
  let date  = new Date(y, m-1, d);
  return date;
};

let usersData = null;   // get users data once


let main = (bodyClass) => {

  let show = (data, date) => {
    bodyClass = bodyClass + '-div';
    let nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);
    let axis = new Axis(bodyClass, [date, nextDate]);

    let width = axis.xWidth;  // equal to xAxis width
    let height = 500;
    let axisMargin = [40, 40, 40, 100];
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
          .attr('width', axis.xWidth)
          .attr('class', 'events-rect')
          .attr('transform', 'translate({0}, {1})'
                .format(x, y));

        rectsGroup.append('rect')
          .attr('class', 'rect-container')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', width)
          .attr('height', groupHeight)
          .attr('fill', '#DDD');

        rectsGroup.selectAll('.rect-content')
          .data(person.records)
          .enter()
          .append('rect')
          .filter((d) => {
            if (get_kind(d) == 'unknown'){
              return false;
            }
            return true;
          })
          .attr('class', 'rect-content')
          .attr('x', (d) => {
            return axis.xScale(str_to_date(d.timestamp));
          })
          .attr('y', 0)
          .attr('width', () => {
            return 5;
          })
          .attr('height', groupHeight)
          .attr('fill', (d) => {
            return get_record_color(get_kind(d));
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
          .attr('x', -100)
          .style('font-size', '12px')
          .attr('y', 13)
          .text(() => {
            return person.did;
          })
          .attr('fill', '#222')
          .on('mouseover', (d, i) => {
            let ele = rectsGroup.selectAll('.rect-name')[0][i];
            d3.select(ele).attr('fill', 'blue')
              .style('cursor', 'pointer');
          })
          .on('mouseout', (d, i) => {
            let ele = rectsGroup.selectAll('.rect-name')[0][i];
            d3.select(ele).attr('fill', '#222');
          });

        index += 1;
      }

    };
    let xAxisZoom = d3.behavior.zoom()
      .x(axis.xScale)
      .scaleExtent([1, 4]);

    let SVG = d3.select($(bodyClass)[0])
      .append('svg')
      .attr('width', 960)
      .attr('height', height);

    SVG.append('g')
      .attr('class', 'axis-odmp')
      .attr('transform', 'translate({0}, {1})'
            .format(axisPos.x, axisPos.y))
      .attr('fill', 'none')
      .call(axis.xAxis);

    loadData(data);
  };

  let tmp = (data) => {
    let usersData = [];
    for (let did in data){
      usersData.push({did: did, records: data[did]});
    }
    usersData = usersData.slice(0, 9);
    show(usersData, getDate());
  };

  $('.datepick').datepicker({
    dateFormat: "yy-mm-dd",
    minDate: new Date(2016, 5 - 1, 29),
    maxDate: new Date(2016, 6 - 1, 6)
  });
  $('.datepick').change(() => {
    let date = getDate();
    show(usersData, date);
  });
  $('.datepick').datepicker('setDate', new Date(2016, 5 - 1, 1));

  getUsersData(tmp);
};

$(() => {
  const bodyClass = '.' + 'oneDayMultiPerson';
  if ($(bodyClass).length != 0){
    console.log('{0} page'.format(bodyClass));
    main(bodyClass);
  }
});
