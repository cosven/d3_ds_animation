import d3 from "d3";
import $ from "jquery";


export let access_data = (filename, callback) => {
  d3.json('datas/' + filename, (error, data) => {
    if (error) {
      console.log('read json error');
    }
    else {
      callback(data);
    }
  });
};


$(() => {
    // console.log('.......test..........');
    // access_data('010116000240.json');
    // console.log('...test finished....')
});
