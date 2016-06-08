import $ from "jquery";
import d3 from 'd3';
import {get_width, get_height, server_api} from './consts';
import {get_record_color, get_kind, str_to_date, getParameterByName, kinds} from './utils';
import {access_data} from './data_access';

const svgWidth = 960;
let gloDuration = 100 * 60 *24;


class TimeAxisManager {
  constructor(bodyClass, wholeDay) {
    this.bodyClass = bodyClass;
    this.wholeDay = wholeDay;
    this.timeScale = d3.time.scale()
      .domain(this.wholeDay)
      .range([0, svgWidth * 7 - 2*20]);
    this.timeAxis = d3.svg.axis()
      .scale(this.timeScale)
      .ticks(d3.time.minute, 30)
      .orient('bottom');

    // ... maybe unneeded
    this._timeScale = d3.time.scale()
      .domain(this.wholeDay)
      .range([0, 1]);
  }

  colorTimeMap(colors, period){
    let colorScale = d3.scale.linear()
      .domain([0, 1])
      .range(colors);
    let start = this._timeScale(period[0]);
    let end = this._timeScale(period[1]);
    return [colorScale(start), colorScale(end)];
  }
}

let getUserData = (callback) => {
  let did = getParameterByName('did');
  $.get(server_api + '/user/{0}'.format(did), (data, error) => {
    callback(data.data);
  });
};


let setAsrText = (text) => {
  let ele = $('#asrtext')
  let origin = ele.text();
  ele.text(origin + text + '\n');
  let st = ele.prop('scrollHeight') - ele.height();
  ele.animate({scrollTop: st + 'px'}, 200);
}

let setTimeLabel = (text) => {
  text = text * (60 * 1000 * 60 * 24 / gloDuration)
  let m = Math.floor(text / (1000 * 60));
  let h = Math.floor(m / 60);
  m = Math.floor(m % 60);
  if (m < 10){
    m = '0' + m;
  }
  if (h < 10){
    h = '0' + h;
  }
  if (h <= 12){
    $('#time-label').text(h + ':' + m + ' am');
  } else {
    $('#time-label').text(24-h + ':' + m + ' pm');
  }
};

let setHint = (text) => {
  $('#hint').text(text);
  setTimeout(() => {
    $('#hint').text('');
  }, 3000)
};

function show(bodyClass, date){
  // clear original svg element
  d3.select($(bodyClass + '-div')[0]).html('');

  const svgHeight = 200;
  let SVG = d3.select($(bodyClass + '-div')[0])
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', 200);

  // parse date
  let dArray = date.split('-');
  let y = parseInt(dArray[0]);
  let m = parseInt(dArray[1]);
  let d = parseInt(dArray[2]);

  let kindsCount = {};
  for (let k of kinds){
    kindsCount[k] = 0;
  }

  let wholeDay = [new Date(y, m-1, d), new Date(y, m-1, d+1)];
  let manager = new TimeAxisManager(bodyClass, wholeDay);

  const margins = [20, 40, 20, 40];  // top, right, bottom, left
  let axisPos = [0, svgHeight / 4];  // x, y
  let axisTransform = [0 - 7 * svgWidth, axisPos[1]];

  let oneDayOnePersonData = null;

  let getData = () => {
    if (oneDayOnePersonData)
      return oneDayOnePersonData;
    else {
      console.log('.......error........');
      return oneDayOnePersonData;
    }
  }

  let initKindCount = () => {
    cutlineGroup.selectAll('.cutline-count')
      .data(kinds)
      .enter()
      .append('text')
      .attr('class', 'cutline-count')
      .attr('x', (d, i) => {
        return i * 98-20;
      })
      .attr('y', 110)
      .attr('fill', 'white')
      .attr('dx', 20)
      .attr('dy', 15)
      .style('text-anchor', 'middle')
      .style('font-size', '11px')
      .text((d) => {
        return kindsCount[d];
      });
  };

  let redrawKindCount = () => {
    cutlineGroup.selectAll('.cutline-count')
      .data(kinds)
      .attr('class', 'cutline-count')
      .text((d) => {
        return kindsCount[d];
      });
  }

  let loadData = (data) => {
    pointGroup.selectAll('circle')
      .data(data.records)
      .enter()
      .append('circle')
      .filter((d) => {
        if (str_to_date(d.timestamp) >= wholeDay[0] && str_to_date(d.timestamp) <= wholeDay[1]){
          return true;
        }
        return false;
      })
      .attr('fill', (d, i) => {
        return get_record_color(get_kind(d));
      })
      .attr('cx', (d, i) => {
        return manager.timeScale(str_to_date(d.timestamp));
      })
      .attr('cy', 0)
      .attr('r', 6);

    cutlineGroup.selectAll('.cutline-circle')
      .data(kinds)
      .enter()
      .append('circle')
      .attr('class', 'cutline-circle')
      .attr('transform', (d, i) => {
        return 'translate({0}, {1})'.format(i*98, 120);
      })
      .attr('r', 15)
      .attr('fill', (d) => {
        return get_record_color(d);
      });

    cutlineGroup.selectAll('.cutline-kind')
      .data(kinds)
      .enter()
      .append('text')
      .attr('class', 'cutline-kind')
      .attr('x', (d, i) => {
        return i * 98-20;
      })
      .attr('y', 130)
      .attr('dx', 20)
      .attr('dy', 15)
      .attr('fill', '#CCC')
      .style('text-anchor', 'middle')
      .style('font-size', '11px')
      .text((d) => {
        return d;
      });
      initKindCount();
  };

  let animation = () => {
    const duration = gloDuration;
    const easeType = 'linear';

    let timePeriod = wholeDay;
    let colors = ['white', '#222'];
    let textColors = [...colors].reverse();
    let colorRange = manager.colorTimeMap(colors, timePeriod);
    let textColorRange = manager.colorTimeMap(textColors, timePeriod)
    // manager.timeScale.domain(timePeriod);
  
    SVG.select('.axis')
      .style({'stroke': textColorRange[1], 'fill': textColorRange[0]})
      .transition().duration(duration/2).ease(easeType)
      .style({'stroke': textColorRange[0], 'fill': textColorRange[1]})
      .attr('transform', 'translate({0}, {1})'
            .format(axisTransform[0]/2, axisTransform[1]))
      .transition().duration(duration/2).ease(easeType)
      .attr('transform', 'translate({0}, {1})'
            .format(axisTransform[0], axisTransform[1]))
      .style({'stroke': textColorRange[1], 'fill': textColorRange[0]})
      .call(manager.timeAxis);

    pointGroup.selectAll('circle')
      .data(oneDayOnePersonData.records)
      .attr('flag', 'false')  // automatic convert to string
      .attr('cx', (d, i) => {
        let cx = manager.timeScale(str_to_date(d.timestamp));
            return cx;
      })
      .transition().duration(duration).ease(easeType)
      .attrTween('transform', function(d, i){
        let ele = d3.select(this);
        let cx = ele.attr('cx');
        let asrText = d.asr_text;
        let timestamp = d.timestamp;
        let kind = get_kind(d);
        return (tick) => {
          let x = axisTransform[0] * tick;
          // svgWidth / 2
          if ((cx <= 0 - x) && ele.attr('flag') == 'false'){
            setAsrText(timestamp+ ' ' + asrText);
            console.log(kind);
            kindsCount[kind] ++;
            redrawKindCount();
            ele.attr('flag', 'true');
          }
          setTimeLabel(tick * duration)
          return 'translate({0}, 0)'.format(x);
        };
      });

    d3.select($(bodyClass)[0])
      .style('background', colorRange[1])
      .transition().duration(duration/4).ease(easeType)
      .style('background', colorRange[1])
      .transition().duration(duration/4).ease(easeType)
      .style('background', colorRange[0])
      .transition().duration(duration/4).ease(easeType)
      .style('background', colorRange[1])
      .transition().duration(duration/4).ease(easeType)
      .style('background', colorRange[1]);

    d3.selectAll('p')
      .style('color', colorRange[0])
      .transition().duration(duration/2).ease(easeType)
      .style('color', colorRange[1])
      .transition().duration(duration/2).ease(easeType)
      .style('color', colorRange[0]);
  };

  let pointGroup = SVG.append('g')
    .attr('class', 'event-point')
    .attr('transform', 'translate({0}, {1})'.format(margins[3], axisTransform[1]));

  let cutlineGroup = SVG.append('g')
    .attr('class', 'cutline-group')
    .attr('transform', 'translate({0}, {1})'.format(margins[3], 40));

  SVG.append('g')
    .attr('class', 'axis')
    .attr('transform', 'translate({0}, {1})'.format(
          margins[3], axisPos[1]))
    .call(manager.timeAxis);
  
  let tmp = (data) => {
    oneDayOnePersonData = {};
    oneDayOnePersonData.did = data.did;
    oneDayOnePersonData.records = [];

    for (let record of data.records){
      if (str_to_date(record.timestamp) >= wholeDay[0] && str_to_date(record.timestamp) <= wholeDay[1]){
        oneDayOnePersonData.records.push(record);
      }
    }

    let recordsLength = oneDayOnePersonData.records.length;
    console.log(recordsLength);
    if (recordsLength < 10) {
      setHint('该用户当天操作太少，请选择其他日期');
      return 0;
    }
    if (recordsLength > 200){
      gloDuration = 300 * 60 *24;
    } else if (recordsLength > 100 ) {
      gloDuration = 100 * 60 *24;
    } else {
      gloDuration = 10 * 60 *24;
    }

    setHint('该用户当天和若琪有{0}次操作, 动画速度会根据操作次数自动设置'.format(oneDayOnePersonData.records.length));
    setTimeout(() => {
      setHint('即将隐藏工具栏，动画结束后显示');
    }, 3000);
    setTimeout(() => {
      $('#op-group').hide();
      setTimeout(() => {
        $('#op-group').show();
      }, gloDuration)
    }, 6000);

    loadData(oneDayOnePersonData);
    animation();
  };
  getUserData(tmp);
}


let main = (bodyClass) => {

  $('.datepick').datepicker({
    dateFormat: "yy-mm-dd",
    minDate: new Date(2016, 5 - 1, 6),
    maxDate: new Date(2016, 6 - 1, 6)
  });

  $('#play-btn').click(() => {
    let date = $('.datepick').val();
    if (!date){
      $('.datepick').focus();
    } else {
      $('#play-btn').text('正在获取数据...');
      show(bodyClass, date);
      $('#play-btn').text('开始播放');
    }
  });
};

$(() => {
  const bodyClass = '.' + 'oneDayOnePerson';
  if ($(bodyClass).length != 0){
    console.log('{0} page'.format(bodyClass));
    main(bodyClass);
  }
});
