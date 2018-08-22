import ws from 'k6/ws';
import {
  check
} from 'k6';

export let options = {
  vus: 1,
  // duration: '5s',
  thresholds: {
    ws_connecting: ['p(95)<500'],
    ws_msgs_sent: ['1'],
    ws_msgs_received: ['1']
  }
};

export default () => {
  let url = 'wss://ws-feed.gdax.com';

  let request = {
    type: 'subscribe',
    channels: [{
      name: 'heartbeat',
      product_ids: ['ETH-EUR']
    }]
  };

  let response = ws.connect(url, null, (socket) => {
    socket.on('open', () => {
      console.log('\nConnected\n');
      socket.send(JSON.stringify(request));
    });

    socket.on('message', (message) => {
      console.log(`\nMessage response is ${message}\n`);

      // Validate response values.
      if (JSON.parse(message)['type'] == 'heartbeat') { // Ignore other messages.
        check(message, {
          "Response 'type' is set to 'heartbeat'": (r) => JSON.parse(r)['type'] === 'heartbeat',
          "Response 'product_id' is set to 'ETH-EUR'": (r) => JSON.parse(r)['product_id'] === 'ETH-EUR',
          "Response 'time' format is correct": (r) => (/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{6}Z/.test(JSON.parse(r)['time']))
        });

        // A - Leave running for 5 seconds before closing the websocket.
        // socket.setTimeout(() => {
        //   socket.close();
        // }, 5000);

        // B - or replace A with the following which will close the socket immediately.
        socket.close();
      }
    });

    socket.on('error', (error) => {
      if (error.error() != 'websocket: close sent') {
        console.log('An unexpected error occured: ', error.error());
      }
    });
  });

  // Log response to terminal.
  console.log(JSON.stringify(response));
  
  check(response, {
    "Status is 101": (r) => r && r.status === 101,
    "Response 'body' property is empty": (r) => r.body === "",
    "Response 'error' property is empty": (r) => r.error === "",
    "Response 'url' property = 'wss://ws-feed.gdax.com'": (r) => r.url === "wss://ws-feed.gdax.com",
    "Response header 'X-Content-Type-Options' property = 'nosniff'": (r) => r.headers["X-Content-Type-Options"] === "nosniff",
    "Response header 'Websocket-Server' property = 'uWebSockets'": (r) => r.headers["Websocket-Server"] === "uWebSockets",
    "Response header 'Server' property = 'cloudflare-nginx'": (r) => r.headers["Server"] === "cloudflare",
    "Response header has property 'Set-Cookie'": (r) => r.headers.hasOwnProperty("Set-Cookie"),
    "Response header 'Connection' property = 'upgrade'": (r) => r.headers["Connection"] === "upgrade",
    "Response header 'Upgrade' property = 'websocket'": (r) => r.headers["Upgrade"] === "websocket",
    "Response header 'Sec-Websocket-Version' property = '13'": (r) => r.headers["Sec-Websocket-Version"] === "13",
  });
};