Asterisk JS
===========

This is an open source tutorial in using Sockets, Javascript and Chrome Extensions.

Prerequisites
-------------

* An Asterisk VOIP server
* Google Chrome


Installation
------------

1) Alter the manifest file to include any external resources you may need (Like the Boiler Framework API)
2) Alter the background.js file to include the login information for your Asterisk AMI (normally port 5038).
Configuring this is out of the scope of this tutorial.
3) Add the extension either packed or unpacked to Google Chrome using the Extensions page ([chrome://extensions]),
enabling developers tools

Included Files
--------------

Manifest.json - The package for Chrome
AsteriskAMI.js - The standalone class for connecting to asterisk

background.js - The demo script, used to connect to the Boiler Framework API
jquery.js - The library used for background.js
