# ReceiptBanker-Extension
Receipt Banker is a Chrome extension that allows you to add invoices and receipts to Receipt Bank with one click.

Clicking the Receipt Banker button will do the following:

- In Gmail when an attachment is included on the visible email, clicking the button will send the attachment to Receipt Bank;
- On other web pages, clicking the button will send the content of the page to Receipt Bank;
- When viewing a PDF, clicking the button will send the PDF content to Receipt Bank.

When dealing with HTML content, Receipt Banker pre-processes the content to ensure

- ```<link>``` tags are replaced with ```<style>``` tags;

- ```<img>``` tags have their sources set to base64 versions of the image content;

- CSS ```url()``` values have their sources set to base64 versions of the image content.

The content (HTML or PDF) is then uploaded to a server via HTTPS and the server-side process emails it to your Receipt Bank email address. The source for the server is also available on [GitHub](https://github.com/cpwood/ReceiptBanker-Server/).
