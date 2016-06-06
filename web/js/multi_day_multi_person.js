import $ from "jquery";
import d3 from 'd3';
import {get_width, get_height} from './consts';
import {access_data} from './data_access';
import {str_to_date, day_to_date, get_record_color, get_kind, kinds} from './utils';


let main = (bodyClass) => {
};


$(() => {
  const bodyClass = '.' + 'multiDayMultiPerson';
  if ($(bodyClass).length != 0){
    console.log('{0} page'.format(bodyClass));
    main(bodyClass);
  }
});
