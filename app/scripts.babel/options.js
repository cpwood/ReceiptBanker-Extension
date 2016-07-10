'use strict';

var emailRegex = /^[A-Za-z0-9\._%\+\-]+@[A-Za-z0-9\.\-]+\.[A-Za-z]{2,4}$/;

$('#save').click(function() {
  var email = $('#email').val();

  if (emailRegex.test(email + '@receiptbank.me'))
  {
    chrome.storage.sync.set({
      email: email,
      sendingService: $('#sendingService').val(),
      sendgridUser: $('#sendgridUser').val(),
      sendgridKey: $('#sendgridKey').val(),
      emailCC: $('#emailCC').val(),
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
    email: '',
    sendingService: '',
    sendgridUser: '',
    sendgridKey: '',
    emailCC: '',
  }, function(items) {
    $('#email').val(items.email);
    $('#sendingService').val(items.sendingService);
    $('#sendgridUser').val(items.sendgridUser);
    $('#sendgridKey').val(items.sendgridKey);
    $('#emailCC').val(items.emailCC);
  });
});