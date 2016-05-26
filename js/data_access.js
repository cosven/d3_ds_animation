import d3 from "d3";
import $ from "jquery";


let access_xls = (filename) => {
    return {};
};


$(() => {
    console.log('.......test..........');
    let result = access_xls('./datas/speech_log - 010116000240');
    console.log(result);
    console.log('...test finished....')
});
