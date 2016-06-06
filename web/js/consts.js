import $ from 'jquery';


export let get_width = () => {
  return 1080;
}

export let get_height = () => {
  return $(window).height();
}

export const server_api = 'http://127.0.0.1:5000/api/v1';
