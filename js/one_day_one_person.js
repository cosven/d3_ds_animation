import $ from "jquery";
import d3 from 'd3';
import {get_width, get_height} from './consts';
import {getEventColor, str_to_date} from './utils';
import {access_data} from './data_access';


class TimeAxisManager {
  constructor(bodyClass) {
    this.bodyClass = bodyClass;
    this.wholeDay = [new Date(2016, 5, 11), new Date(2016, 5, 12)];
    this.timeScale = d3.time.scale()
      .domain(this.wholeDay)
      .range([0, get_width() * 8 - 40]);
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


let main = (bodyClass) => {

  const margins = [20, 20, 20, 20];  // top, right, bottom, left
  let axisPos = [0, get_height() / 2];  // x, y
  let axisTransform = [0 - 7 * get_width(), axisPos[1]];
  let bpgAxisHMargin = 100;

  let bpgWidth = 300;
  let bpgHeight = 300;
  let bpgPosX = margins[3];
  let bpgPosXD = margins[3];
  let bpgPosY = get_height() / 2;

  let manager = new TimeAxisManager();
  let bpgOneData = {name: 'music', children: []};
  let bpgTwoData = {name: 'music', children: []};

  let oneDayOnePersonData = null;

  let getData = () => {
    if (oneDayOnePersonData)
      return oneDayOnePersonData;
    else {
      console.log('.......error........');
      return oneDayOnePersonData;
    }
  }

  let timeAxisZoomed = () => {
    let data = getData();
    SVG.select('.axis').call(manager.timeAxis);
    pointGroup.selectAll('circle')
      .data(oneDayOnePersonData.records)
      .attr('cx', (d, i) => {
        return manager.timeScale(str_to_date(d.timestamp));
      });
  };

  let timeAxisZoom = d3.behavior.zoom()
    .x(manager.timeScale)
    .scaleExtent([1, Infinity])
    .on('zoom', timeAxisZoomed);

  let loadData = (data) => {
    pointGroup.selectAll('circle')
      .data(data.records)
      .enter()
      .append('circle')
      .attr('fill', (d, i) => {
        return getEventColor(d);
      })
      .attr('cx', (d, i) => {
        return manager.timeScale(str_to_date(d.timestamp));
      })
      .attr('cy', 0)
      .attr('r', 6)
      .append('title')
      .text((d, i) => {
        return d.rec_type;
      });
  };

  let addBubblePoint = (e) => {
    let _addBubblePoint = (node, className) => {
      node.enter()
        .append('g')
        .attr('class', className)
        .attr('transform', (d) => {
          return 'translate({0}, {1})'
              .format(get_width()/2, -1 * bpgAxisHMargin);
        })
        .append('circle')
        .attr('r', (d) => {return 6;})
        .style('fill-opacity', (d, i) => {
            if (i==0)
                return 0;
            return 1;

        })
        .style('fill', (d) => {
          return getEventColor(d);
        });
      node.append('title')
        .text((d) => {
          return d.asr_text;
        });
      // node.append('text')
      //   .style('text-anchor', 'middle')
      //   .text((d) => {
      //     return d.asr_text;
      //   });
      node.transition()
        .duration(1000)
        .attr('transform', (d) => {
          return 'translate({0}, {1})'.format(d.x, d.y);
        });
      node.select('circle')
        .transition()
        .duration(1000)
        .attr('r', (d) => { return d.r; });
    }

    let addBubblePointToOne = (e) => {
      let className = 'node-one';
      bpgOneData.children.push(e);
      let node = bubblePointGroupOne.selectAll('.' + className)
        .data(bubbleOne.nodes(bpgOneData));
      _addBubblePoint(node, className);
    }

    let addBubblePointToTwo = (e) => {
      let className = 'node-two';
      bpgTwoData.children.push(e);
      let node = bubblePointGroupTwo.selectAll('.' + className)
        .data(bubbleOne.nodes(bpgTwoData));
      _addBubblePoint(node, className);
    }
   
    switch (e.rec_type) {
      case 'whether':
        addBubblePointToOne(e);
        break;
      case 'play':
        addBubblePointToTwo(e);
        break;
      case 'current_time':
        addBubblePointToOne(e);
        break;
      case 'wiki':
        addBubblePointToTwo(e);
        break;
      case 'message':
        addBubblePointToOne(e);
        break;
      default:
        addBubblePointToOne(e);
    }
  };

  let animation = () => {
    const duration = 50000;
    const easeType = 'linear';

    let timePeriod = [new Date(2016, 5, 11), new Date(2016, 5, 12)];
    let colors = ['white', '#222'];
    let textColors = [...colors].reverse();
    let colorRange = manager.colorTimeMap(colors, timePeriod);
    let textColorRange = manager.colorTimeMap(textColors, timePeriod)
    // manager.timeScale.domain(timePeriod);

    SVG.select('.axis')
      .style({'stroke': textColorRange[0], 'fill': textColorRange[0]})
      .transition().duration(duration).ease(easeType)
      .attr('transform', 'translate({0}, {1})'
        .format(axisTransform[0], axisTransform[1]))
      .style({'stroke': textColorRange[1], 'fill': textColorRange[1]})
      .call(manager.timeAxis);

    pointGroup.selectAll('circle')
      .data(oneDayOnePersonData.records)
      .attr('flag', 'false')  // automatic convert to string
      .attr('cx', (d, i) => {
        let cx = manager.timeScale(str_to_date(d.timestamp));
            return cx;
      })
      .transition().duration(duration).ease('linear')
      // .attr('transform', 'translate({0}, {1})'.format(axisTransform[0], 0))
      .attrTween('transform', function(d, i){
        let ele = d3.select(this);
        let cx = ele.attr('cx');
        return (tick) => {
          let x = axisTransform[0] * tick;
          if ((cx <= get_width() / 2 - x) && ele.attr('flag') == 'false'){
            ele.attr('flag', 'true');
            // console.log('bubble point', d.asr_text);
            addBubblePoint(d);
          }
          return 'translate({0}, 0)'.format(x);
        };
      });

    d3.select($(bodyClass)[0])
      .style('background', colorRange[0])
      .transition().duration(duration).ease(easeType)
      .style('background', colorRange[1]);

    console.log('animation finished');
  };

  let SVG = d3.select($(bodyClass)[0])
    .append('svg')
    .attr('width', get_width())
    .attr('height', get_height())
    .call(timeAxisZoom);

  let pointGroup = SVG.append('g')
    .attr('class', 'event-point')
    .attr('transform', 'translate({0}, {1})'.format(margins[3], axisPos[1]));

  let bubblePointGroupOne = SVG.append('g')
    .attr('class', 'bubble-group')
    .attr('transform', 'translate({0}, {1})'.format(bpgPosX, get_height()/2 + bpgAxisHMargin))
    .attr('width', bpgWidth)
    .attr('height', bpgHeight);

  let bubblePointGroupTwo = SVG.append('g')
    .attr('class', 'bubble-group')
    .attr('transform', 'translate({0}, {1})'
          .format(bpgPosX + bpgPosXD + bpgWidth, get_height()/ 2 + bpgAxisHMargin))
    .attr('width', bpgWidth)
    .attr('height', bpgHeight);

  let bubbleOne = d3.layout.pack()
    .sort(null)
    .size([200, 200])
    .value((d) => {
      return 2;
    })
    .padding(2);

  let bubbleTwo = d3.layout.pack()
    .sort(null)
    .size([200, 200])
    .value((d) => {
      return 2;
    })
    .padding(2);

  SVG.append('g')
    .attr('class', 'axis')
    .attr('transform', 'translate({0}, {1})'.format(
          margins[3], axisPos[1]))
    .call(manager.timeAxis);
  
  let tmp = (data) => {
    oneDayOnePersonData = data;
    loadData(data);
    animation();
  };

  access_data('010116000240.json', tmp);
};

$(() => {
  const bodyClass = '.' + 'oneDayOnePerson';
  if ($(bodyClass).length != 0){
    console.log('{0} page'.format(bodyClass));
    main(bodyClass);
  }
});
