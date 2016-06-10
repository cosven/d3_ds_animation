import $ from "jquery";


let addLog = (text) => {
  let ele = $('#hint')
  let origin = ele.text();
  ele.text(origin + '\n|\n' + text);
  let st = ele.prop('scrollHeight') - ele.height();
  ele.animate({scrollTop: st + 'px'}, 300);
};


function main(bodyClass){
  $('#video').on('play', function(){
    console.log('video played');
  });
  
  let t1 = false;  // 3.5s
  let t2 = false;  // 8.0s 
  let t3 = false;  // 16.0s 
  $('#video').on('timeupdate', function(e){
    let currentTime = $('#video')[0].currentTime;
    if (currentTime > 3.4 && t1 == false){
      t1 = true;
      let log = 'user: 0124624245 \n' + 
                'time: 2016-6-12 07:00:00 \n' + 
                'text: 若琪，放点轻音乐把 \n' +
                'type: music \n';
      addLog(log);
    }
    if (currentTime > 7.4 && t2 == false){
      t2 = true;
      let log = 'user: 0124624245 \n' + 
                'time: 2016-6-12 07:05:00 \n' + 
                'text: 帮我把空调净化器打开。\n' +
                'type: control\n';
      addLog(log);
    }
    if (currentTime > 16.4 && t3 == false){
      t3 = true;
      let log = 'user: 0124624245 \n' + 
                'time: 2016-6-12 07:20:00 \n' + 
                'text: 股市行情怎么样?\n' +
                'type: query\n';
      addLog(log);
    }
  });
}


$(() => {
  const bodyClass = '.' + 'guide';
  if ($(bodyClass).length != 0) {
    console.log('{0} page'.format(bodyClass))
    main(bodyClass);
  }
});
