# ReceiptBanker-Extension
Receipt Banker is a Chrome extension that allows you to add invoices and receipts to Receipt Bank with one click.

Clicking the Receipt Banker button will do the following:

- In Gmail when an attachment is included on the visible email, clicking the button will send the attachment to Receipt Bank;
- On other web pages, clicking the button will send the content of the page to Receipt Bank;
- When viewing a PDF, clicking the button will send the PDF content to Receipt Bank.

## Configuring
There are 2 built in methods of sending the content to Reciept Bank - both use the reciept-bank.me email address, but through different means.

### cpwoods hosted service
The content (HTML or PDF) is uploaded to a server via HTTPS and the server-side process emails it to your Receipt Bank email address. The source for the server is also available on [GitHub](https://github.com/cpwood/ReceiptBanker-Server/).

To configure this method you simply need to add your reciept bank email address to the configuration page and off you go.

**note** you are sending all reciepts to a third party.

### Sendgrid
In this case, your reciepts are send using the sendgrid API, for an account which you can control. You can get an account which allows you to send 10K emails/month for free on [sendgrid](https://sendgrid.com/).

Steps to set up:
1. Create a sendgrid account (including email confirmation and the extra details they ask for).
2. Add your username and password to the options page
3. Optionally add a CC email address which will allow you to send a copy of all your reiepts to another place (e.g. a folder in gmail which skips your inbox).

## How ReceiptBanker processes HMTL
When dealing with HTML content, Receipt Banker pre-processes the content to ensure

- ```<link>``` tags are replaced with ```<style>``` tags;

- ```<img>``` tags have their sources set to base64 versions of the image content;

- CSS ```url()``` values have their sources set to base64 versions of the image content.

# Development

## Development setup steps

1. Clone Repo
2. `npm install -g gulp bower`
3. `npm install`
4. `bower install`

## Running Development server

1. Load unpacked extension in chrome
2. `gulp build` (it seems that a couple of tasks are not run on `watch`?)
3. `gulp watch`

The extension will be auto reloaded in chrome when changes are detected.