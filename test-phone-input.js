const PhoneInput = require('react-phone-number-input/commonjs/PhoneInput').default;
const React = require('react');
const ReactDOMServer = require('react-dom/server');

try {
  const html = ReactDOMServer.renderToString(React.createElement(PhoneInput, { value: '+1 555 0192', onChange: () => {} }));
  console.log("SUCCESS");
} catch (e) {
  console.log("ERROR WITH +1 555 0192: " + e.message);
}

try {
  const html = ReactDOMServer.renderToString(React.createElement(PhoneInput, { value: '5550192', onChange: () => {} }));
  console.log("SUCCESS");
} catch (e) {
  console.log("ERROR WITH 5550192: " + e.message);
}

try {
  const html = ReactDOMServer.renderToString(React.createElement(PhoneInput, { value: '+15550192', onChange: () => {} }));
  console.log("SUCCESS WITH +15550192");
} catch (e) {
  console.log("ERROR WITH +15550192: " + e.message);
}
