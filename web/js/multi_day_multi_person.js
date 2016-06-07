import $ from "jquery";
import d3 from 'd3';
import {get_width, get_height, server_api} from './consts';
import {access_data} from './data_access';
import {str_to_date, day_to_date, get_record_color, get_kind, kinds} from './utils';

const width = 1080;
const height = 600; 
const svgMargin = {top:40, right: 40, bottom: 40, left:40};
const leftPanelWidth = 2.0/3 * width;
const leftPanelHeight = height;

function getUsersData(callback){
  $.ajax({
    type: 'GET',
    crossDomain: true,
    url: server_api + '/users?random=1',
    cache: false,
  })
  .done( (data) => {
    console.log('success.............');
    callback(data);
  })
  .fail( () => {
    console.log('fail........................')
  });
}

function show(usersData, SVG) {
  let colorCutlineMargin = {top: 20, left: 20};
  let cutlineMargin = {top: 20, left: 100};
  let cutlineAxisWidth = leftPanelWidth - 2*cutlineMargin.left;
  let eachRectWidth = cutlineAxisWidth * 1.0/kinds.length;
  let eachRectHeight = 20;
  let rectMargin = 5;

  let container = SVG.append('g')
    .attr('class', 'container')
    .attr('width', leftPanelWidth)
    .attr('height', leftPanelHeight);
  
  let cutlineScale = d3.scale.ordinal()
    .domain(kinds)
    .rangePoints([0, eachRectWidth * (kinds.length-1)]);
  let cutlineAxis = d3.svg.axis()
    .scale(cutlineScale)
    .orient('bottom');

  let cutline = container.append('g')
    .attr('class', 'axis-cutline')
    .attr('transform', 'translate({0}, {1})'.
          format(cutlineMargin.left, cutlineMargin.top))
    .attr('width', leftPanelWidth)
    .attr('height', eachRectHeight)
    .attr('fill', 'none')
    .call(cutlineAxis)
    .selectAll('text')
    .attr('transform', 'translate({0}, {1})'
          .format(eachRectWidth/2, -10));
  let maxKindCount = 0;
  let minKindCount = 100;
  let dids = [];
  let userdatas = [];
  for (let did in usersData){
    let userdata = usersData[did];
    dids.push(did)
    userdatas.push(userdata);
    for (let kind in userdata){
      if (userdata[kind] > maxKindCount){
        maxKindCount = userdata[kind];
      }
      if (userdata[kind] < minKindCount){
        minKindCount = userdata[kind];
      }
    }
  }
  let colorScale = d3.scale.linear()
    .domain([minKindCount, maxKindCount])
    .range(['white', '#FF0000']);
  let rectContainer = container.append('g')
    .attr('transform', 'translate({0}, {1})'
          .format(cutlineMargin.left, cutlineMargin.top + eachRectHeight));

  for (let i in userdatas){
    let userdata = userdatas[i];
    let text = rectContainer
      .append('text')
      .attr('class', 'did-text')
      .attr('transform', 'translate({0}, {1})'
            .format(-80, i*(rectMargin+eachRectHeight) - 5 ))
      .attr('dx', 40)
      .attr('dy', eachRectHeight)
      .attr('style', 'font-size: 12px; text-anchor: middle;')
      .text(dids[i]);
    let g = rectContainer.append('g')
      .attr('class', '.kindscount-rect-container')
      .attr('transform', 'translate({0}, {1})'
            .format(0, i * (rectMargin + eachRectHeight)));
    
    let opCounts = [];
    for (let op in userdata){
      opCounts.push(userdata[op]);
    }

    g.selectAll('.kindscount-rect')
      .data(opCounts)
      .enter()
      .append('rect')
      .attr('transform', (d, i) =>{
        return 'translate({0}, {1})'.format(i * eachRectWidth, 0);
      })
      .attr('width', eachRectWidth)
      .attr('height', eachRectHeight)
      .attr('fill', (d, i) => {
        return colorScale(d);
      })
    g.selectAll('.kindscount-text')
      .data(opCounts)
      .enter()
      .append('text')
      .attr('transform', (d, i) =>{
        return 'translate({0}, {1})'.format(i * eachRectWidth, 0);
      })
      .attr('x', 0)
      .attr('y', 0)
      .attr('dx', eachRectWidth/2)
      .attr('dy', eachRectHeight/2 + 5)
      .attr('style', 'font-size: 12px; text-anchor: middle;')
      .text((d, i) => { return d; });
  }
}

function showKeams(usersData, SVG) {
  for (let did in usersData){
    let userdata = usersData[did];
    let totalOp = 0;
    let opVecter = [];
    for (let op in userdata){
      totalOp += userdata[op];
    }
  }
}

function accessUser(userdata){
  let opCount = {};
  for (let k of kinds){
    opCount[k] = 0;
  }
  for (let record of userdata){
    let kind = get_kind(record);
    opCount[kind] += 1;
  }
  return opCount;
}

let main = (bodyClass) => {
  let divBodyClass = bodyClass + '-div';
  let SVG = d3.select($(divBodyClass)[0])
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  function loadData(data) {
    let dids = Object.keys(data);
    let usersData = {};
    console.log('total %d users data', dids.length);
    for (let did of dids){
      usersData[did] = accessUser(data[did]);
    }

    show(usersData, SVG);
    SVG.append('text')
      .attr('transform', (d, i) =>{
        return 'translate({0}, {1})'.format(leftPanelWidth, 0);
      })
      .attr('x', 0)
      .attr('y', 0)
      .attr('dx', 40)
      .attr('dy', 25)
      .attr('style', 'font-size: 14px; text-anchor: middle;')
      .text('聚类看看')
      .on('mouseover', function() {
        d3.select(this).attr('fill', '#ff4e4e')
          .style('cursor', 'pointer');
      })
      .on('mouseout', function() {
        d3.select(this).attr('fill', '#222')
          .style('cursor', 'normal');
      })
      .on('click', function(){
        console.log('clicked');
      });
  }

  getUsersData(loadData);
};


$(() => {
  const bodyClass = '.' + 'multiDayMultiPerson';
  if ($(bodyClass).length != 0){
    console.log('{0} page'.format(bodyClass));
    main(bodyClass);
  }
});
