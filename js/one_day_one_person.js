import $ from "jquery";
import d3 from 'd3';
import {get_width, get_height} from './consts';
import {oneDayOnePersonData} from './data';


class TimeAxisManager {
  constructor(bodyClass) {
    this.bodyClass = bodyClass;
    this.wholeDay = [new Date(2016, 1, 1), new Date(2016, 1, 2)];
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

let getEventColor = (event) => {
  const eventsColor = d3.scale.category10().domain(d3.range(0, 10));
  let color = eventsColor(0);

  switch (event.thing) {
    case 'whether':
      color = eventsColor(0);
      break;
    case 'music':
      color = eventsColor(1);
      break;
    case 'story':
      color = eventsColor(2);
      break;
    case 'wiki':
      color = eventsColor(3);
      break;
    case 'message':
      color = eventsColor(4);
      break;
    default:
      color = eventsColor(5);
  }
  return color;
};


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

  let timeAxisZoomed = () => {
    SVG.select('.axis').call(manager.timeAxis);
    pointGroup.selectAll('circle')
      .data(oneDayOnePersonData.events)
      .attr('cx', (d, i) => {
        return manager.timeScale(d.timestamp);
      });
  };

  let timeAxisZoom = d3.behavior.zoom()
    .x(manager.timeScale)
    .scaleExtent([1, Infinity])
    .on('zoom', timeAxisZoomed);

  let loadData = (data=oneDayOnePersonData) => {
    pointGroup.selectAll('circle')
      .data(data.events)
      .enter()
      .append('circle')
      .attr('fill', (d, i) => {
        return getEventColor(d);
      })
      .attr('cx', (d, i) => {
        return manager.timeScale(d.timestamp);
      })
      .attr('cy', 0)
      .attr('r', 6)
      .append('title')
      .text((d, i) => {
        return d.thing;
      });
  };

  let addBubblePoint = (e) => {

    let _addBubblePoint = (node, className) => {
      node.enter()
        .append('g')
        .attr('class', className)
        .attr('transform', (d) => {
          return 'translate({0}, {1})'.format(get_width()/2, -1 * bpgAxisHMargin);
        })
        .append('circle')
        .attr('r', (d) => {return 6;})
        .style('fill', (d) => {
          return getEventColor(d);
        });
      node.append('title')
        .text((d) => {
          return d.detail;
        });
      node.append('text')
        .style('text-anchor', 'middle')
        .text((d) => {
          return d.detail;
        });
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
   
    switch (e.thing) {
      case 'whether':
        addBubblePointToOne(e);
        break;
      case 'music':
        addBubblePointToTwo(e);
        break;
      case 'story':
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

    let timePeriod = [new Date(2016, 1, 1, 1), new Date(2016, 1, 1, 24)];
    let colors = ['white', '#222'];
    let textColors = [...colors].reverse();
    let colorRange = manager.colorTimeMap(colors, timePeriod);
    let textColorRange = manager.colorTimeMap(textColors, timePeriod)
    // manager.timeScale.domain(timePeriod);

    SVG.select('.axis')
      .style({'stroke': textColorRange[0], 'fill': textColorRange[0]})
      .transition().duration(duration).ease(easeType)
      .attr('transform', 'translate({0}, {1})'.format(axisTransform[0], axisTransform[1]))
      .style({'stroke': textColorRange[1], 'fill': textColorRange[1]})
      .call(manager.timeAxis);

    pointGroup.selectAll('circle')
      .data(oneDayOnePersonData.events)
      .attr('flag', 'false')  // automatic convert to string
      .transition().duration(duration).ease('linear')
      .attr('transform', 'translate({0}, {1})'.format(axisTransform[0], 0))
      .tween('progress', (d, i) => {
        let ele = pointGroup.selectAll('circle')[0][i];
        return () => {
          let cx = ele.attributes.cx.value;
          let t = d3.transform(d3.select(ele).attr('transform'));
          let x = t.translate[0];
          if ((cx <= get_width() / 2 - x) && ele.attributes.flag.value == 'false'){
            d3.select(ele).attr('flag', 'true');
            console.log('bubble point', d.detail);
            addBubblePoint(d);
          }
        };
      })
      .attr('cx', (d, i) => {
        let cx = manager.timeScale(d.timestamp);
        console.log(cx);
        return cx;
      });

    d3.select($(bodyClass)[0])
      .style('background', colorRange[0])
      .transition().duration(duration).ease(easeType)
      .style('background', colorRange[1]);
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
      return d.size;
    })
    .padding(2);

  let bubbleTwo = d3.layout.pack()
    .sort(null)
    .size([200, 200])
    .value((d) => {
      return d.size;
    })
    .padding(2);

  SVG.append('g')
    .attr('class', 'axis')
    .attr('transform', 'translate({0}, {1})'.format(
          margins[3], axisPos[1]))
    .call(manager.timeAxis);

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
