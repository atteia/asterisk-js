/**
Change and uncomment the following:


var asterisk_ip = "10.0.5.1";
var asterisk_port = 5038;
var asterisk_user = "aster-admin";
var asterisk_pass = "asterisk!?";

var boiler_intranet = "http://boiler.bluelightstudios.com";
*/

function start() { 
  
	ami = new AsteriskAMI(asterisk_ip, asterisk_port);
	ami.addEventListener("connected", function() {
		eid = this.Login(asterisk_user, asterisk_pass);
		ami.addEventListener("action-"+eid, function(msg) {
			console.log("Login Status: "+msg.Response);
		});
		
		ami.addEventListener("Newchannel", function(msg) {
			if (msg.Exten) {
				console.log(msg);
				console.log();
				
				$.ajax({
					url: boiler_intranet+"/api/customer_contact.json?telephone="+msg.CallerIDNum,
					dataType: "json",
					success: function(data) {
						contact = null;
						for (var i=0; i<data.length; i++) {
							if (data[i].telephone == this.CallerIDNum) {
								contact = data[i];
								break;
							}
						}
						if (contact == null) {
							return;
						}
						
						var notification = webkitNotifications.createNotification(
							null,  // icon url - can be relative
							'New Call',  // notification title
							contact.firstname+" "+contact.surname+" ("+msg.CallerIDNum+")"+" is calling "+msg.Exten  // notification body text
						);
						notification.onclick = function(contact) {
							return function() {
								openTab(boiler_intranet+"/customer/"+contact.customer);
								this.close();
							}
						}(contact);
						notification.show();
					},
					context: msg
				});
			}
		});

	});
	ami.Connect();
	
	
};

function openTab(url) { 
    var a = document.createElement('a'); 
    a.href = url; 
    a.target='_blank'; 
    a.click(); 
}

start();
