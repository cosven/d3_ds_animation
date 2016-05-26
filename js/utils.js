import d3 from 'd3';


String.prototype.format = function() {
  var args = arguments;
  return this.replace(/{(\d+)}/g, function(match, number) { 
    return typeof args[number] != 'undefined'
      ? args[number]
      : match
    ;
  });
};


export let getEventColor = (event) => {
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

