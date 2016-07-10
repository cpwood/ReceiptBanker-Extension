'use strict';

var progressbar = $('#progressbar'),
  progressLabel = $('.progress-label');

progressbar.progressbar({
  value: false,
  complete: function () {
    progressLabel.text('Sent to Receipt Bank!');
  }
});


progressbar.progressbar('value', 0);

var query = { active: true, currentWindow: true };

function tabCallback(tabs) {
  chrome.runtime.sendMessage({clicked : true, tab: tabs[0]});
}

chrome.tabs.query(query, tabCallback);

chrome.runtime.onMessage.addListener( function (message) {
  if (message.progress) {
    progressbar.progressbar('value', message.progress);
  }
  else if (message.closeWindow)
  {
    window.close();
  }
  else if (message.errorMessage)
  {
    progressLabel.text(message.errorMessage)
  }
});
