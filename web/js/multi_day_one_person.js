import $ from "jquery";
import d3 from 'd3';
import {get_width, get_height, server_api} from './consts';
import {access_data} from './data_access';
import {str_to_date, day_to_date, get_record_color, get_kind, kinds, getParameterByName} from './utils';


class Axis {
  constructor(bodyClass, period, maxOp) {
    this.bodyClass = bodyClass;
    this.period = period;
    this.maxOp = maxOp + 30;
    this.xWidth = 960 - 100; 
    this.yHeight = 460;

    this.xScale = d3.time.scale()
      .domain(this.period)
      .range([0, this.xWidth]);

    this.xAxis = d3.svg.axis()
      .scale(this.xScale)
      .tickFormat(d3.time.format('%m.%d'))
      .orient('bottom');

    this.yScale = d3.scale.linear()
      .domain([0, this.maxOp])
      .rangeRound([this.yHeight, 0]);

    this.yAxis = d3.svg.axis()
      .scale(this.yScale)
      .orient('left');
  }

  setPeriod(period) {
    this.period = period;
    this.xScale.domain(this.period);
    this.xAxis.scale(this.xScale);
  }

}


let getUsers = (callback) => {
  $.get(server_api + '/userlist', (data, error) => {
    let ele = $('#did-select');
    let userlist = data;
    for (let user of userlist){
      let option = '<option value="{0}">{0}</option>'.format(user);
      ele.append(option);
    }
    callback();
  });
};

let getUserData = (callback) => {
  let did = getParameterByName('did');
  $.get(server_api + '/user/{0}'.format(did), (data, error) => {
    callback(data.data);
  });
};


let getPeriod = (data) => {
  let records = data.records;
  records.sort((a, b) => {
    if (a.timestamp > b.timestamp)
      return 1;
    else if (a.timestamp < b.timestamp)
      return -1;
    return 0;
  });
  let minTimeStamp = str_to_date(records[0].timestamp);
  let maxTimeStamp = str_to_date(records[records.length - 1].timestamp);
  minTimeStamp.setDate(minTimeStamp.getDate() - 1);
  maxTimeStamp.setDate(maxTimeStamp.getDate() + 1);

  // update period
  // axis.setPeriod([minTimeStamp, maxTimeStamp]);
  // SVG.select('.axis-mdop-x').call(axis.xAxis);
  return [minTimeStamp, maxTimeStamp];
}

let main = (bodyClass) => {

  let show = (data, period) => {
    bodyClass = bodyClass + '-div';
    let width = 960;
    let height = 550;  // 大于 yAxis 高度

    // access data
    let formattedData = {};
    for (let record of data.records){
      let day_str = record.timestamp.split(' ')[0];
      if (formattedData[day_str] === undefined) {
        formattedData[day_str] = []; 
      }
      formattedData[day_str].push(record);
    }
    let maxOpCount = 0;
    for (let day in formattedData){
      if (formattedData[day].length > maxOpCount){
        maxOpCount = formattedData[day].length;
      }
    }
    console.log(period, maxOpCount);

    let axis = new Axis(bodyClass, period, maxOpCount);

    let axisMargin = [40, 40, 40, 40];  // top, right, bottom, left
    let axisXPos = {x: axisMargin[3], y: (axis.yHeight + axisMargin[0])};
    let axisYPos = {x: axisMargin[3], y: axisMargin[0]};

    let SVG = d3.select($(bodyClass)[0])
      .append('svg')
      .attr('width', width + axisMargin[1])
      .attr('height', height);

    SVG.append('g')
      .attr('class', 'axis-mdop-x')
      .attr('transform', 'translate({0}, {1})'
            .format(axisXPos.x, axisXPos.y))
      .call(axis.xAxis);

    SVG.append('text')
      .attr('transform', 'translate({0}, {1})'
            .format(axisXPos.x + axis.xWidth + 10, axisXPos.y))
      .style('font-size', '13px')
      .text('时间');

    SVG.append('g')
      .attr('class', 'axis-mdop-y')
      .attr('transform', 'translate({0}, {1})'
            .format(axisYPos.x, axisYPos.y))
      .call(axis.yAxis);

    SVG.append('text')
      .attr('transform', 'translate({0}, {1})'
            .format(axisYPos.x-10, axisYPos.y-10))
      .style('font-size', '13px')
      .text('操作次数');

    let colorSigns = SVG.append('g')
      .attr('class', 'color-signs')
      .attr('transform', 'translate({0}, {1})'
            .format(axis.xWidth + axisMargin[3], axisMargin[0]));

    colorSigns.selectAll('.rect-sign')
      .data(kinds)
      .enter()
      .append('rect')
      .attr('class', 'rect-sign')
      .attr('x', 0)
      .attr('y', (d, i) => {
        return i * 25;
      })
      .attr('width', 20)
      .attr('height', 20)
      .attr('fill', (d) => {
        return get_record_color(d);
      })
    colorSigns.selectAll('.text-sign')
      .data(kinds)
      .enter()
      .append('text')
      .attr('x', 30)
      .attr('y', (d, i) => {
        return i * 25 + 12;
      })
      .style('font-size', '13px')
      .text((d) => {
        return d;
      })
      .attr('fill', '#222');

    let loadData = (data) => {
      let index = 0;
      let totalDays = Math.round((axis.period[1] - axis.period[0]) / (1000*60*60*24));
      let groupPadding = 5;
      let groupWidth = axis.xWidth / totalDays - 10;
   
      for (let k in formattedData) {
        let dayRecords = formattedData[k];
        let rectsGroup = SVG.append('g')
          .datum({k: dayRecords})
          .attr('class', 'rects-group')
          .attr('transform', () => {
            let x = axis.xScale(day_to_date(k)) + axisXPos.x;
            let y = axisXPos.y;
            return 'translate({0}, {1})'.format(x, y);
          });

        let kinds_data = {};
        for (let kind of kinds) {
          kinds_data[kind] = 0;
        }

        for (let day_record of dayRecords){
          let kind = get_kind(day_record);
          kinds_data[kind]++;
        }

        rectsGroup.selectAll('.rect-content')
          .data(kinds)
          .enter()
          .append('rect')
          .attr('class', 'rect-content')
          .attr('x', 0)
          .attr('y', (d ,i) => {
            let j = 0;
            let y = 0;
            while (j<=i){
              y += (axis.yHeight - axis.yScale(kinds_data[kinds[j]]));
              j++;
            }
            return -y;
          })
          .attr('width', groupWidth)
          .attr('height', (d) => {
            let h = axis.yScale(kinds_data[d]);
            return axis.yHeight - h;
          })
          .attr('fill', (d) => {
            return get_record_color(d);
          })
          .append('title')
          .text((d) => { return d; });
      }
    };
    loadData(data);
  }
  
  function setSelect (){
    let userId = getParameterByName('did');
    if (userId !== null){
      $('#did-select').val(userId);

      $('#did-select').change(function(){
        let val = $('#did-select').val();
        window.location = '/mdop.html?did={0}'.format(val);
      });
    }
  }

  let callback_show = (data) => {
    let period = getPeriod(data);
    show(data, period);
  }

  let callback = () => {
    setSelect();
    getUserData(callback_show);
  };

  getUsers(callback); // get user list for select
};


$(() => {
  const bodyClass = '.' + 'multiDayOnePerson';
  if ($(bodyClass).length != 0){
    console.log('{0} page'.format(bodyClass));
    main(bodyClass);
  }
});
