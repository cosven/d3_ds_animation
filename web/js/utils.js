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
  case 'wiki':
      color = eventsColor(8);
      break;
  case 'story':
      color = eventsColor(9);
      break;
  case 'help':
      color = eventsColor(10);
      break;
  }
  return color;
};


export let kinds = ['music', 'unknown', 'time', 'clock', 'chat', 'control',
                    'weather', 'wiki', 'story', 'help'];


export let get_kind = (d) => {
  let type = kinds[1];
  switch (d.rec_type){
      case 'help':
          type = kinds[9];
          break;
      default:
        switch (d.module){
            case 'com.rokid.music1':
            case 'app.music':
            case 'com.rokid.radio1':
                type = kinds[0];
                break;
            case 'com.rokid.system.idontknow':
                type = kinds[1];
                break;
            case 'com.rokid.time1':
            case 'com.rokid.calendar1':
                type = kinds[2];
                break;
            case 'com.rokid.alarm1':
                type = kinds[3];
                break;
            case 'com.rokid.system.chat':
            case 'system.chat':
                type = kinds[4];
                break;
            case 'com.rokid.system.light':
            case 'com.rokid.system.volume':
            case 'com.rokid.system.smarthome':
            case 'com.rokid.system.homebase':
            case 'com.rokid.app.smarthome':
            case 'com.rokid.system.command':
            case 'system.command':
            case 'com.rokid.system.upgrade':
            case 'com.rokid.flappybird':
            case 'com.rokid.system.power':
            case 'com.rokid.app.bugfix':
            case 'com.rokid.system.lightapp':
                type = kinds[5];
                break;
            case 'com.rokid.weather1':
            case 'app.weather':
                type = kinds[6];
                break;
            case 'com.rokid.wikiqa':
                type = kinds[7];
                break;
            case 'com.rokid.childstory':
                type = kinds[8];
                break;
            case 'com.rokid.system.functionguide':
                type = kinds[9];
                break;
            default:
                console.error('cant recogonize kind %s', d.module);
                break;
        }
  }

/*
  switch (d.rec_type){
    case 'previous':
    case 'change':
    case 'cancel_like':
    case 'play':
    case 'play_random':
    case 'like':
    case 'dislike':
    case 'play_hot_radio':
    case 'volumemin':
    case 'volumeup':
    case 'volumedown':
    case 'volumemax':
    case 'stop':
    case 'default_singer':
    case 'default_song':
    case 'next':
    case 'volumedown':
    case 'set_volume':
    case 'play_favorite':
    case 'play_by_tag':
        type = kinds[0];
        break;
    case 'current_time':
    case 'someday_date':
    case 'someday_weekday':
    case 'left_days':
    case 'judgerain':
        type = kinds[2];
        break;
    case 'query':
    case 'pm25':
        if (d.module.indexOf('weather') > -1) {
          type = kinds[6];
        }
        break;
    case '_query_alarm':
    case '_setup_alarm':
        type = kinds[3];
        break;
    case 'chat':
        type = kinds[4];
        break;
    case 'unknown':
    case 'same':
    case 'skip':
        type = kinds[1];
        break;
    case 'devices_switch':
    case 'color_turnup':
    case 'sleep':
    case 'resume':
    case 'start_sys_upgrade':
    case 'change_color':
    case 'color_turndown':
    case 'byebyesleep':
    case 'default_style':
    case 'help':
    case 'dormancy':
    case 'what_can_u_do':
    case 'play_flappybird':
    case 'next_color':
        type = kinds[5];
        break;
    case 'wiki':
    case 'wiki_tuling':
        type = kinds[7];
        break;
    case '_play_specificstory_':
    case '_stop_story':
    case '_play_random_story':
        type = kinds[8];
    default:
        type = kinds[1];
        console.log(d.rec_type, '....error....');
        break;
  }
 */
  return type;
}
