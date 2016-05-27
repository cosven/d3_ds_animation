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

  switch (event.rec_type) {
    case 'unknown':
      color = eventsColor(0);
      break;
    case 'play_random':
    case 'play':
    case 'play_hot_radio':
      color = eventsColor(1);
      break;
    case 'current_time':
      color = eventsColor(2);
      break;
    case 'query':
    case 'query-alarm':
      color = eventsColor(3);
      break;
    case 'chat':
      color = eventsColor(4);
      break;
    default:
      color = eventsColor(5);
  }
  return color;
};


export let str_to_date = (str) => {
    let s_s = str.split(' ');
    let ymd = s_s[0].split('-');
    let hms = s_s[1].split(':');
    let year = parseInt(ymd[0]);
    let month = parseInt(ymd[1]);
    let day = parseInt(ymd[2]);
    let hour = parseInt(hms[0]);
    let minute = parseInt(hms[1]);
    let seconds = parseInt(hms[2]);
    let date = new Date(year, month, day, hour, minute, seconds);
    return date;
}
