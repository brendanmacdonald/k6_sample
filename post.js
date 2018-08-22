import http from 'k6/http';
import {
  check,
} from 'k6';

export let options = {
  thresholds: {
    http_req_duration: ['p(95)<500']
  }
};

// Data to be posted.
const form_data = {
  id: '1234'
};

export default function () {
  // Passing an object as the data parameter will automatically form-urlencode it
  let response = http.post('http://httpbin.org/post', form_data);

  // Log response to terminal.
  console.log(JSON.stringify(response.json()));

  // Verify response
  check(response, {
    "status is 200": (r) => r.status === 200,
    "has correct id": (r) => r.json().form.id === form_data.id,

    // Check response header values.
    "Header has property 'Content-Type'": (r) => r.headers.hasOwnProperty('Content-Type'),
    "Header 'Content-Type' property = 'application/json'": (r) => r.json().headers.Content - Type === 'application/json',
  });
};
