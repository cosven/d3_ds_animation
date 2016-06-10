import $ from "jquery";
import d3 from "d3";
import * as ui from 'jquery-ui';
import * as utils from "./utils";
import {test_string_format} from "./tests";
import * as guide from './guide';
import * as oneDayOnePerson from "./one_day_one_person";
import * as oneDayMultiPerson from "./one_day_multi_person";
import * as multiDayOnePerson from "./multi_day_one_person";
import * as multiDayMultiPerson from './multi_day_multi_person';
import * as data_access from './data_access';

window.$ = $;
window.jQuery = $;
window.d3 = d3;


function main(bodyClass) {

}

$(() => {
  const bodyClass = '.' + 'home';
  if ($(bodyClass).length != 0) {
    console.log('{0} page'.format(bodyClass))
    main(bodyClass);
  }
});
