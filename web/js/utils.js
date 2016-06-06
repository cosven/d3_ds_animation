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
    let date = new Date(year, month-1, day, hour, minute, seconds);
    return date;
}


export let day_to_date = (str) => {
  let ymd = str.split('-');
  let year = parseInt(ymd[0]);
  let month = parseInt(ymd[1]);
  let day = parseInt(ymd[2]);
  let date = new Date(year, month-1, day);
  return date;
}



export let get_record_color = (rec_type) => {
  const eventsColor = d3.scale.category10().domain(d3.range(0, 10));
  let color = eventsColor(0);
  switch (rec_type) {
  case 'music':
      color = eventsColor(1);
      break;
  case 'unknown':
      color = eventsColor(2);
      break;
  case 'time':
      color = eventsColor(3);
      break;
  case 'clock':
      color = eventsColor(4);
      break;
  case 'chat':
      color = eventsColor(5);
      break;
  case 'control':
      color = eventsColor(6);
      break;
  case 'weather':
      color = eventsColor(7);
      break;
  case 'query-other':
      color = eventsColor(8);
      break;
  case 'ignore':
      color = eventsColor(9);
      break;
  }
  return color;
};


export let kinds = ['music', 'unknown', 'time', 'clock', 'chat', 'control',
                    'weather', 'query-other', 'ignore'];


export let get_kind = (d) => {
  let type = kinds[1];
  switch (d.rec_type){
    case 'play':
    case 'play_random':
    case 'play_hot_radio':
    case 'volumemin':
    case 'volumemax':
    case 'stop':
    case 'default_singer':
    case 'default_song':
    case 'next':
    case 'volumedown':
    case 'play_by_tag':
        type = kinds[0];
        break;
    case 'current_time':
    case 'someday_date':
        type = kinds[2];
        break;
    case 'query':
        if (d.module.indexOf('weather') > -1) {
          type = kinds[6];
        }
        break;
    case '_query_alarm':
        type = kinds[3];
        break;
    case 'chat':
        type = kinds[4];
        break;
    case 'unknown':
    case 'skip':
        type = kinds[1];
        break;
    case 'devices_switch':
    case 'color_turnup':
    case 'sleep':
    case 'resume':
    case 'start_sys_upgrade':
    case 'default_style':
    case 'help':
        type = kinds[5];
        break;
    default:
        type = kinds[1];
        console.log(d.rec_type, '....error....');
        break;
  }
  return type;
}
