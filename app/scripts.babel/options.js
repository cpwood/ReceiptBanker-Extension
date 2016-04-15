'use strict';

var emailRegex = /^[A-Za-z0-9\._%\+\-]+@[A-Za-z0-9\.\-]+\.[A-Za-z]{2,4}$/;

$('#save').click(function() {
  var email = $('#email').val();

  if (emailRegex.test(email + '@receiptbank.me'))
  {
    chrome.storage.sync.set({
      email: email
    }, function() {
      $('#status').fadeIn().delay(3000).fadeOut();
    });
  }
  else
  {
    $('#fail').fadeIn().delay(3000).fadeOut();
  }


});

$( document ).ready(function() {
  chrome.storage.sync.get({
    email: ''
  }, function(items) {
    $('#email').val(items.email);
  });
});