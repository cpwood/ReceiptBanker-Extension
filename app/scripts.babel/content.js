// Listen for messages
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  // If the received message has the expected format...
  console.log('received message');
  if (msg.text === 'get_dom') {
    // Call the specified callback, passing
    // the web-page's DOM content as argument
    sendResponse({ head: document.getElementsByTagName('head')[0].innerHTML, body: document.body.innerHTML});
  }
});
