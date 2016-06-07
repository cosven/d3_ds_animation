import $ from "jquery";
import d3 from 'd3';
import {get_width, get_height, server_api} from './consts';
import {access_data} from './data_access';
import {str_to_date, day_to_date, get_record_color, get_kind, kinds, calcAngle} from './utils';

const width = 1080;
const height = 600; 
const svgMargin = {top:40, right: 40, bottom: 40, left:40};
const leftPanelWidth = 2.0/3 * width;
const leftPanelHeight = height;
let includeUnknown = false;

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
  let cutlineAxisWidth = leftPanelWidth - cutlineMargin.left;
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
    dids.push(did);
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
  let maxVectorLength = 100;
  let maxTotalOp = 0;
  let users = [];
  for (let did in usersData){
    let userdata = usersData[did];
    let totalOp = 0;
    let opNumVecter = [];
    for (let op in userdata){
      totalOp += userdata[op];
      opNumVecter.push(userdata[op]);
    }
    if (totalOp > maxTotalOp){
      maxTotalOp = totalOp;
    }
    let normalizeOpNumVecter = [];
    for (let opNum of opNumVecter){
      normalizeOpNumVecter.push((opNum*1.0 / totalOp).toFixed(2));
    }

    let d = {did: did,
             total: totalOp,
             nv: normalizeOpNumVecter}
    users.push(d);
  }

  const containerMargin = {top: 25+25};
  const maxLineLength = 200;
  // attention: same as left panel
  const eachRectHeight = 20;
  const rectMargin = 5;

  let container = SVG.append('g')
    .attr('class', 'vector-container')
    .attr('transform', 'translate({0}, {1})'
          .format(leftPanelWidth, containerMargin.top))
    .attr('width', width-leftPanelWidth)
    .attr('height', leftPanelHeight);

  container.selectAll('.vector-line-group')
    .data(users)
    .enter()
    .append('line')
    .attr('transform', (d, i) => {
      return 'translate({0}, {1})'.format(0, i*(eachRectHeight+rectMargin));
    })
    .attr('x1', 0).attr('y1', 0)
    .attr('stroke', '#222')
    .attr('stroke-width', 2)
    .attr('x2', 0).attr('y2', 0)
    .on('mouseover', function(d, i) {
      d3.select(this).attr('stroke', 'red');
    })
    .on('mouseout', function(d, i) {
      d3.select(this).attr('stroke', '#222');
    })
    .transition().duration(1000).ease('linear')
    .attr('x2', (d, i) => {
      return  maxLineLength * d.total / maxTotalOp;
    })
    .attr('y2', 0)
    // .transition().duration(500).ease('linear')
    // .delay((d,i) => {
    //   return (i+1)* 500;
    // })
    .attr('transform', (d, i) => {
      if (i == 1){
        console.log('......0............');
        return 'translate({0}, {1})'.format(20, 20);
      } else {
        let firstUser = users[1];
        let angle = calcAngle(firstUser.nv, d.nv);
        return 'translate({0}, {1})rotate({2})'.format(20, 20, angle);
      }
    });
    
    let user1 = users[Math.floor(Math.random() * (users.length - 1))];
    let user2 = users[Math.floor(Math.random() * (users.length - 1))];
    let group1 = [];
    let group2 = [];
    function getCenter(group){
      let total = [];
      for (let i of group){
        let centerUser = users[i];
        let totalAngle = 0;
        for (let j of group){
          if (i == j){
            continue;
          }
          let user = users[j];
          totalAngle += calcAngle(centerUser.nv, user.nv);
        }
        total.push(totalAngle);
      }
      let index = total.indexOf(Math.min(...total));
      return group[index];
    }

    function kmeans(user1, user2, users){
      console.log('kmeans...........')
      let group1Ids = [];
      let group2Ids = [];
      for (let i in users){
        let user = users[i];
        let angle1 = calcAngle(user1.nv, user.nv);
        let angle2 = calcAngle(user2.nv, user.nv);
        if (angle1 <= angle2){
          group1Ids.push(i);
        } else {
          group2Ids.push(i);
        }
      }
      if (group1Ids.sort().toString() == group1.sort().toString()){
        console.log('finished', group1Ids, group2Ids);
        return 0;
      } else {
        group1 = group1Ids;
        group2 = group2Ids;
        let c1 = getCenter(group1Ids);
        let c2 = getCenter(group2Ids);
        console.log(c1, c2);
        kmeans(users[c1], users[c2], users);
      }
    }
    kmeans(user1, user2, users);
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
  if (!includeUnknown){
    delete opCount.unknown;
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
    if (!includeUnknown){
      kinds.splice(1,1);
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
        showKeams(usersData, SVG);
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
