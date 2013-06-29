AsteriskAMI = function(host, port) {
	this.host = host;
	this.port = port;
	
	this.socket = null;
	
	this.readTimeout = 0;
	
	this.buffer = "";
	
	this.actionID = 0;
	
	this.debug = false;
	
	this.auto_ping = true;
	
	this.events = new Object();
	
	this.addEventListener = function(event, func) {
		if (!this.events[event]) {
			this.events[event] = new Array();
		}
		this.events[event].push(func);
	}
	
	this.triggerEvent = function(event, args) {
		if (!this.events[event]) {
			return;
		}
		
		for (var i=0; i<this.events[event].length; i++) {
			this.events[event][i].apply(this, args);
		}
	}
	
	this.Connect = function() {
		chrome.socket.create('tcp', {}, this.__onCreate.bind(this));
	}
	
	this.__onCreate = function(createInfo) {
		this.socket = createInfo;
		chrome.socket.connect(createInfo.socketId, this.host, this.port, this.__onConnected.bind(this));
	}
	
	this.__onConnected = function() {
		this.readTimeout = setInterval(this.__onReadTimer.bind(this), 1000);
	}
	
	this.__onReadTimer = function() {
		chrome.socket.read(this.socket.socketId, null, this.__onRead.bind(this));
	}
	
	this.__onRead = function(readInfo) {
		this.triggerEvent("read", [readInfo]);
		if (readInfo.resultCode > 0) {
		  	this.arrayToString(readInfo.data, this.__onReadString.bind(this));
		}
	}
	
	this.__onReadString = function(string) {
		this.buffer += string;
		this.AMItoJSON();
	}
	
	this.AMItoJSON = function() {
		this.triggerEvent("datarecv", [this.buffer]);
		if (this.buffer.substring(0, 21) == "Asterisk Call Manager") {
			console.log("Connected to "+this.buffer.trim());
			this.buffer = "";
			this.triggerEvent("connected");
		}
		
		while ((index = this.buffer.indexOf(String.fromCharCode(13, 10, 13, 10))) != -1) {
			out = new Object();
			msg = this.buffer.substring(0, index+2);
			if (this.debug) {
				console.log(msg);
			}
			while ((indexB = msg.indexOf(String.fromCharCode(13, 10))) != -1) {
				line = msg.substring(0, indexB);
				key = line.substring(0, line.indexOf(":"));
				data = line.substring(line.indexOf(":")+2);
				out[key] = data;
				msg = msg.substring(indexB+2);
			}
			this.buffer = this.buffer.substring(index+4);
			if (out.ActionID) {
				this.triggerEvent("action-"+out.ActionID, [out]);
			} else if (out.Event) {
				this.triggerEvent(out.Event, [out]);
			}
		}
	}
	
	this.arrayToString = function(buf, callback) {
		var bb = new Blob([new Uint8Array(buf)]);
		var f = new FileReader();
		f.onload = function(e) {
		  callback(e.target.result);
		};
		f.readAsText(bb);
	}
	
	this.stringToArray = function(str, callback) {
		var bb = new Blob([str]);
		var f = new FileReader();
		f.onload = function(e) {
			callback(e.target.result);
		};
		f.readAsArrayBuffer(bb);
	}
	
	this.getNextActionID = function() {
		return this.actionID++;
	}
	
	this.Send = function(string) {
		this.stringToArray(string, function(that) {
			return function(arrayBuffer) {
				chrome.socket.write(that.socket.socketId, arrayBuffer, function(that) {
					return function() {
						that.triggerEvent("write", [string]);
					}
				}(that));
			};
		}(this));
	}
	
	this.JSONtoAMI = function(json) {
		out = "";
		for (i in json) {
			out += i+": "+json[i]+String.fromCharCode(13, 10);
		}
		out += String.fromCharCode(13, 10);
		return out;
	}
	
	this.Login = function(user, pass) {
		this.Send(this.JSONtoAMI({Action: "Login", ActionID: (eid=this.getNextActionID()), Username: user, Secret: pass}));
		return eid;
	}
	
	this.Ping = function() {
		eid = this.getNextActionID();
		this.Send(this.JSONtoAMI({Action: "Ping", ActionID: eid}));
	}
	
	this.addEventListener("connected", function() {
		if (this.auto_ping) {
			this.auto_ping = setInterval(this.Ping.bind(this), 20000);
		}
	});
}
