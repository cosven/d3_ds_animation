import $ from "jquery";
import d3 from 'd3';
import {get_width, get_height, server_api} from './consts';
import {access_data} from './data_access';
import {str_to_date, get_record_color, get_kind, kinds} from './utils';


class Axis {
  constructor(bodyClass, wholeDay) {
    this.bodyClass = bodyClass;
    this.wholeDay = wholeDay;

    this.xWidth = 720;

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

let getUserList = () => {
  $.get(server_api + '/userlist', (data, error) => {
    let userlist = data;
    for (let user of userlist){
      let option = '<option value="{0}">{0}</option>'.format(user);
      $('#did-select1').append(option);
      $('#did-select2').append(option);
    }
  });
};

let getUser = (did, callback) => {
  $.get(server_api + '/user/{0}'.format(did), (data, error) => {
    callback(data.data);
  });
}

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

  let show = (date) => {
    bodyClass = bodyClass + '-div';
    let nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);
    let axis = new Axis(bodyClass, [date, nextDate]);

    let width = axis.xWidth;  // equal to xAxis width
    let height = 500;
    let axisMargin = {left: 30, top: 10}
    let axisPos = {x: axisMargin.left, y: axisMargin.top};

    let xAxisZoom = d3.behavior.zoom()
      .x(axis.xScale)
      .scaleExtent([1, 4]);

    let SVG = d3.select($(bodyClass)[0])
      .append('svg')
      .attr('width', 800)
      .attr('height', height);

    SVG.append('g')
      .attr('class', 'axis-odmp')
      .attr('transform', 'translate({0}, {1})'
            .format(axisPos.x, axisPos.y))
      .attr('fill', 'none')
      .call(axis.xAxis);

    function loadUser1(person){
      let groupHeight = 20; 
      let yRectMargin = 5;

      let y = axisPos.y + groupHeight + yRectMargin;
      let x = axisPos.x;

      let rectsGroup = SVG.append('g')
        .datum(person)
        .attr('width', axis.xWidth)
        .attr('class', 'events-rect')
        .attr('transform', 'translate({0}, {1})'
              .format(x, y));

      let lineGroup = SVG.append('g')
        .datum(person)
        .attr('width', axis.xWidth)
        .attr('class', 'events-line')
        .attr('id', 'linegroup-1')
        .attr('transform', 'translate({0}, {1})'
              .format(x, y+groupHeight));

      let cutline = SVG.append('g')
        .datum(person)
        .attr('width', axis.xWidth)
        .attr('class', 'cutline')
        .attr('id', 'cutline-1')
        .attr('transform', 'translate({0}, {1})'
              .format(x, y+100));

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
          let cDate = str_to_date(d.timestamp);
          if (cDate >= date && cDate < nextDate){
            return true;
          }
          return false;
        })
        // .filter((d) => {
        //   if (get_kind(d) == 'unknown'){
        //     return false;
        //   }
        //   return true;
        // })
        .attr('class', 'rect-content')
        .attr('x', (d) => {
          let cDate = str_to_date(d.timestamp);
          return axis.xScale(cDate);
        })
        .attr('y', 0)
        .attr('width', () => {
          return 1;
        })
        .attr('height', groupHeight)
        .attr('fill', (d) => {
          return get_record_color(get_kind(d));
        })
        .append('title')
        .text((d) => {
          return d.asr_text;
        });
      
      let userKindsCount = {};
      let total = 0;
      for (let kind of kinds) {
        userKindsCount[kind] = 0;
      }
      for (let record of person.records){
        let cDate = str_to_date(record.timestamp);
        if (cDate >= date && cDate < nextDate){
          let kind = get_kind(record);
          userKindsCount[kind] ++;
          total ++;
        }
      }

      let widthList = [];
      for (let kind of kinds){
        let width = Math.floor(axis.xWidth * userKindsCount[kind] * 1.0 / total);
        widthList.push(width);
      }

      cutline.selectAll('.rect-cutline')
        .data(kinds)
        .enter()
        .append('rect')
        .attr('fill', (kind) => {
          return get_record_color(kind);
        })
        .attr('x', (kind, i) => {
          let x = 0;
          for (let j=0; j < i ; j++){
            x += widthList[j];
          }
          return x;
        })
        .attr('y', 0)
        .attr('width', (kind, i) => {
          return widthList[i];
        })
        .attr('height', groupHeight);
      
      let alreadyLineCount = {};
      for (let kind of kinds) {
        alreadyLineCount[kind] = 0;
      }

      lineGroup.selectAll('.line-content')
        .data(person.records)
        .enter()
        .append('line')
        .attr('class', 'line-content')
        .filter((d) => {
          let cDate = str_to_date(d.timestamp);
          if (cDate >= date && cDate < nextDate){
            return true;
          }
          return false;
        })
        .sort((a, b) => {
          return d3.ascending(str_to_date(a.timestamp), str_to_date(b.timestamp));
        })
        .attr('x1', (d) => {
          let cDate = str_to_date(d.timestamp);
          return axis.xScale(cDate);
        })
        .attr('y1', 0)
        .attr('x2', (record, i) => {
          let x = 0;
          let kind = get_kind(record);
          let k = kinds.indexOf(kind);
          for (let j=0; j < k; j++){
            x += widthList[j];
          }
          alreadyLineCount[kind] ++;
          return x + alreadyLineCount[kind];
        })
        .attr('y2', 100-groupHeight)
        .attr('stroke', (record, i) => {
          return get_record_color(get_kind(record));
        })
        .attr('stroke-opacity', 1)
        .attr('stroke-width', '1px');

    }

    function loadUser2(person){
    }

    $('#did-select1').change(function(){
      let val = $('#did-select1').val();
      getUser(val, loadUser1);
    });
    $('#did-select2').change(function(){
      let val = $('#did-select2').val();
      getUser(val, loadUser2);
    });
  };

  $('.datepick').datepicker({
    dateFormat: "yy-mm-dd",
    minDate: new Date(2016, 5 - 1, 29),
    maxDate: new Date(2016, 6 - 1, 6)
  });
  $('.datepick').change(() => {
    let date = getDate();
    show(date);
  });
  $('.datepick').datepicker('setDate', new Date(2016, 6 - 1, 1));

  getUserList();
  show(getDate());
};

$(() => {
  const bodyClass = '.' + 'oneDayMultiPerson';
  if ($(bodyClass).length != 0){
    console.log('{0} page'.format(bodyClass));
    main(bodyClass);
  }
});
