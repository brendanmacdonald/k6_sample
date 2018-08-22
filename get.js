import http from 'k6/http';
import {
  check
} from 'k6';

// Runtime options
export let options = {
  vus: 1,
  //duration: '5s',
  thresholds: {
    http_req_duration: ['p(95)<500']
  }
};

export default () => {

  // HTTP GET request.
  const response = http.get('https://api.gdax.com/products/BTC-EUR/ticker');

  // Log response to terminal.
  console.log(JSON.stringify(response.json()));

  // Execute checks on the response.
  check(response, {
    'Status was 200': (r) => r.status == 200,
    'Transaction time OK': (r) => r.timings.duration < 600,
    'Protocol is HTTP/2': (r) => r.proto == 'HTTP/2.0',

    // Check response header values.
    "Header has property 'Content-Type'": (r) => r.headers.hasOwnProperty('Content-Type'),
    "Header 'Content-Type' property = 'application/json; charset=utf-8'": (r) => r.headers['Content-Type'] === 'application/json; charset=utf-8',

    // Check response body values
    "JSON body has key 'ask'": (r) => JSON.parse(response.body).hasOwnProperty('ask'), // Check a key exists.
    "JSON 'ask' value is correct": (r) => r.json().ask === '5775.75', // Check a key has a specific value.
    "JSON 'ask' value matches a regex": (r) => (/[0-9]+.[0-9]{2}/.test(response.json().ask)) // Check a keys value matches a regex - useful if the values returned are different everytime.
  });
};