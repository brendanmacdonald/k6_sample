import http from "k6/http";
import { check, sleep } from "k6";

export let options = {
  vus: 1,
  duration: "1s",
  thresholds: {
    http_req_duration: ["p(95)<500"]
  }
};

export default function() {
  const response = http.get("https://jsonfeed.org/feed.json");
  
  check(response, {
    "Status was 200": (r) => r.status == 200,
    "Transaction time OK": (r) => r.timings.duration < 600,

    // Check response header values.
    "Header has property 'Content-Type'": (r) => r.headers.hasOwnProperty("Content-Type"),
    "Header 'Content-Type' property = 'application/json; charset=utf-8'": (r) => r.headers["Content-Type"] === "application/json; charset=utf-8",

    // Check response body values
    "JSON body has key 'title'": (r) => JSON.parse(response.body).hasOwnProperty('title'), // Check a key exists.
    "JSON 'title' value is correct": (r) => r.json().title === "JSON Feed", // Check a key has a specific value.
  });

};