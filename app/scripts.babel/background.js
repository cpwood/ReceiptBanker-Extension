'use strict';

var postUrl = 'https://receiptbanker.azurewebsites.net/api/data/';
//var postUrl = 'http://localhost:61058/api/data/';
var processing = false;
var tab = null;

const requiredConfig = {
  email: '',
  sendingService: '',
  sendgridUser: '',
  sendgridKey: '',
  emailCC: ''
}

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

// A function to use as callback
function handleDom(parts) {
  try {
    chrome.browserAction.setBadgeText({text: ''});

    if (parts != null) {
      if ($(parts.body)[0].nodeName == 'EMBED' && $(parts.body)[0].type == 'application/pdf')
      {
        processPdf($(parts.body)[0].src);
      }
      else if (tab.url.indexOf('mail.google.com') > -1 && $(parts.body).find('span[download_url]') != null) {
        var url = $($(parts.body).find('span[download_url]')).attr('download_url');
        url = url.substr(url.indexOf('http'));
        processPdf(url);
      }
      else {
        if (parts.head != null) $('#receiptbanker_head').append($($.parseHTML(parts.head)));
        if (parts.body != null) $('#receiptbanker_body').append($($.parseHTML(parts.body)));
        processHtml();
      }
    }
    else
    {
      if (tab.url.startsWith('file:'))
      {
        alert('Sorry, Receipt Banker doesn\'t work with files on your own machine. They\'ve got to be on a web site (i.e. http:// or https://).');
      }
      else {
        alert('Receipt Banker was installed or updated after this page originally loaded.\n\nPlease reload this page and then try using Receipt Banker again.');
      }

      reset();
      chrome.runtime.sendMessage({closeWindow: true});
    }
  }
  catch(ex) {
    console.log(ex);
    reset();
    alert('Oops. That didn\'t work, sorry.');
    sendError();
  }
}

chrome.runtime.onMessage.addListener( function (message) {
  if (!processing && message.clicked) {
    reset();
    tab = message.tab;
    processing = true;
    chrome.tabs.sendMessage(message.tab.id, {text: 'get_dom'}, handleDom);
  }
});

function reset() {
  processing = false;
  tab = null;
  $('#receiptbanker_head').empty();
  $('#receiptbanker_body').empty();
}


function makeImageSrcBase64(img){
  return new Promise(function(resolve, reject)
  {
    try {
      var req = new XMLHttpRequest();
      req.responseType = 'blob';
      req.onload = function() {
        if (req.status == 200)
        {
          var reader  = new FileReader();
          reader.onloadend = function () {
            img.attr('src', reader.result);
            resolve(img);
          };
          reader.readAsDataURL(req.response);
        }
        else {
          reject(Error(req.statusText));
        }
      };

      var url = img.attr('src');

      if (url.startsWith('data:'))
      {
        resolve(img);
        return;
      }
      else if (url.startsWith('//'))
      {
        url = 'http:' + url;
      }
      else if (url.startsWith('http'))
      {
        // Nothing to do
      }
      else {
        // Relative URL
        url = relativeToAbsolute(tab.url, url);
      }

      req.open('GET', url);

      req.onerror = function() {
        reject(Error('Network Error'));
      };

      req.send();
    }
    catch (ex) {
      reject(Error(ex));
    }

  });
}

function makeUrlSrcBase64(style, originalUrl){
  return new Promise(function(resolve, reject)
  {
    try {
      var req = new XMLHttpRequest();
      req.responseType = 'blob';
      req.onload = function() {
        if (req.status == 200)
        {
          var reader  = new FileReader();
          reader.onloadend = function () {
            style.parentRule.parentStyleSheet.ownerNode.innerText = style.parentRule.parentStyleSheet.ownerNode.innerText.replace(urlRegex, 'url("' + reader.result + '")');
            resolve(style);
          };
          reader.readAsDataURL(req.response);
        }
        else {
          reject(Error(req.statusText));
        }
      };

      var urlRegex = /url\(['"]?([^\)"']+)['"]?\)/g;
      var url = urlRegex.exec(style.backgroundImage)[1];

      if (url.startsWith('data:'))
      {
        resolve(style);
        return;
      }
      else if (url.startsWith('//'))
      {
        url = 'http:' + url;
      }
      else if (url.startsWith('http'))
      {
        // Nothing to do
      }
      else {
        // Relative URL
        if (originalUrl != null)
        {
          url = relativeToAbsolute(originalUrl, url);
        }
        else
        {
          url = relativeToAbsolute(tabUrl, url);
        }
      }

      req.open('GET', url);

      req.onerror = function() {
        reject(Error('Network Error'));
      };

      req.send();
    }
    catch (ex) {
      reject(Error(ex));
    }
  });
}

function makeStylesInline(link)
{
  return new Promise(function(resolve, reject)
  {
    try {
      var req = new XMLHttpRequest();
      req.responseType = 'text';
      req.onload = function() {
        if (req.status == 200) {
          link.after('<style type="text/css" data-original-url="' + url + '">' + req.response + '</style>');
          link.remove();
          resolve();
        }
        else
        {
          reject(Error(req.statusText));
        }
      };

      var url = link.attr('href');

      if (url.startsWith('data:'))
      {
        resolve(link);
        return;
      }
      else if (url.startsWith('//'))
      {
        url = 'http:' + url;
      }
      else if (url.startsWith('http'))
      {
        // Nothing to do
      }
      else {
        // Relative URL
        url = relativeToAbsolute(tab.url, url);
      }

      req.open('GET', url);

      req.onerror = function() {
        reject(Error('Network Error'));
      };

      req.send();
    }
    catch (ex) {
      reject(Error(ex));
    }
  });
}

function relativeToAbsolute(current, relative)
{
  var parser = document.createElement('a');
  parser.href = current;
  parser.href = parser.origin + parser.pathname;
  parser.href = parser.origin + parser.pathname.substr(0, parser.pathname.lastIndexOf('/'));

  if (!relative.startsWith('/'))
  {
    parser.href = parser.origin + parser.pathname + '/' + relative;
  }
  else {
    parser.href = parser.origin + relative;
  }


  return parser.origin + parser.pathname + parser.search;
}

function processHtml()
{
  var promises = [];
  var body = $('#receiptbanker_body');
  var images = body.find('img');

  images.each(function(idx, img) {
    promises.push(makeImageSrcBase64($(img)));
  });

  var links = $('#receiptbanker_head').find('link[rel="stylesheet"]');

  links.each(function(idx, link){
    promises.push(makeStylesInline($(link)));
  });

  var iframes = body.find('iframe');

  iframes.each(function(idx, iframe){
    iframe.remove();
  });

  var scripts = body.find('script');

  scripts.each(function(idx, script){
    script.remove();
  });


  Promise.all(promises).then(function() {
    // CSS URLs
    promises = [];

    for(var i=0; i<document.styleSheets.length; i++) {
      var ix, sheet = document.styleSheets[i];
      var originalUrl = sheet.ownerNode.getAttribute('data-original-url');

      for (ix=0; ix<sheet.cssRules.length; ix++) {
        if (sheet.cssRules[ix].style != null)
        {
          if (sheet.cssRules[ix].style.backgroundImage.indexOf('url(') > -1)
          {
            promises.push(makeUrlSrcBase64(sheet.cssRules[ix].style, originalUrl));
          }
        }
      }

    }

    Promise.all(promises).then(function() {
      var html = '<html>\n<head>\n' + $('#receiptbanker_head').html() + '\n</head>\n<body>' + $('#receiptbanker_body').html() + '\n</body>\n</html>';

      chrome.runtime.sendMessage({progress: 50});

      chrome.storage.sync.get(requiredConfig, function(userConfig ) {
        var data = {
          email: userConfig .email + '@receiptbank.me',
          html: html,
          attachment: null,
          filename: null
        };
        sendData(data, userConfig );
      });

    });

  }, function(err) {
    // error occurred
  });
}

function processPdf(url) {
  var req = new XMLHttpRequest();
  req.responseType = 'blob';
  req.onload = function() {
    if (req.status == 200) {
      chrome.storage.sync.get(requiredConfig, function(userConfig ) {
        chrome.runtime.sendMessage({progress: 50});

        var parser = document.createElement('a');
        parser.href = url;

        var data = {
          email: userConfig .email + '@receiptbank.me',
          html: '<p>No content</p>',
          attachment: req.response,
          filename: parser.pathname.substr(parser.pathname.lastIndexOf('/') + 1) || 'attachment.pdf'
        };
        sendData(data, userConfig );
      });
    }
  };

  req.open('GET', url);
  req.send();
}

function requireFields(userConfig, fields){
  fields.forEach(function(field){
    if (userConfig  [field] == ''){
      alert('You haven\'t configured Receipt Bank Extension yet! \n Looking for field '+field+' in config');
      reset();
      chrome.runtime.sendMessage({closeWindow: true});
      chrome.runtime.openOptionsPage();
      return;
    }
  });
}

function sendData(data, userConfig){
  console.log("about to send!")
  var sendType = userConfig .sendingService
  if(sendType ==  'apiService'){

    requireFields(userConfig  , ['email']);
    
    if(data.attachment){
      // This converts the blob to an array buffer and then encodes for
      // cpwood's API.
      var arrayBuffer;
      var fileReader = new FileReader();
      fileReader.onload = function() {
          arrayBuffer = this.result;
          var uInt8Array = new Uint8Array(data.attachment);
          var i = uInt8Array.length;
          var binaryString = new Array(i);
          while (i--){
            binaryString[i] = String.fromCharCode(uInt8Array[i]);
          }
          var temp = binaryString.join('');
          data.attachment = btoa(temp);
          $.post(postUrl, data);
          sendComplete();
          reset();
      };
      fileReader.readAsArrayBuffer(blob);
    }
    else{
      // Send right away if all is well
      // TODO: probably should have sendComplete as a callback?
      $.post(postUrl, data);
      sendComplete();
      reset();
    }
  }
  else if(sendType == 'sendgrid'){

    requireFields(userConfig, ['sendgridUser', 'sendgridKey', 'email'])

    var sendgridEndpoint = 'https://api.sendgrid.com/api/mail.send.json'
    var sendgridData = {
      api_user: userConfig  .sendgridUser,
      api_key: userConfig .sendgridKey,
      to: [data.email],
      subject: 'Invoice for processing',
      from: 'chromeextention',
      html: data.html,
    };
    var formData = new FormData();
    $.each(sendgridData, function(key, val){ formData.append(key, val); })

    //Add the attachment if there is one (already in a Blob)
    if(data.attachment){
      formData.append('files['+data.filename+']', data.attachment, data.filename);
    }

    //If the user wants everything CC'd to them
    if(userConfig .emailCC){
      formData.append('cc', [userConfig.emailCC]);
    }

    var xhr = $.ajax({
      url: sendgridEndpoint, 
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function(){
        sendComplete();
        reset();
      },
      error: sendError,
    });
  }
}

function arrayBufferToBase64( buffer ) {
  var binary = '';
  var bytes = new Uint8Array( buffer );
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode( bytes[ i ] );
  }
  return window.btoa( binary );
}

function sendComplete() {
  chrome.runtime.sendMessage({progress: 100});
  chrome.browserAction.setBadgeBackgroundColor({ color: '#00ff00'});
  chrome.browserAction.setBadgeText({text: ' '});

  setTimeout(function() {
    chrome.browserAction.setBadgeText({text: ''});
    chrome.runtime.sendMessage({closeWindow: true});
  }, 3000);
}

function sendError(message) {
  chrome.browserAction.setBadgeBackgroundColor({ color: '#ff0000'});
  chrome.browserAction.setBadgeText({text: '!'});
  chorome.runtime.sendMessage({errorMessage: message})
  setTimeout(function() {
    chrome.runtime.sendMessage({closeWindow: true});
  }, 3000);
}