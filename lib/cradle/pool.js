var http = require("http");

this.Pool = function(host, port, options) {
	var that = this;

	this.options = options;
	this.host = host;
	this.port = port;

	this.client = http.createClient(this.port, this.host);
};

this.Pool.prototype = {
	dispatchRequest : function(method, path, headers) {
		var request = this._getClient().request(method, path, headers);
		return request;
	},

	_getClient : function() {
		return this.client;
	}
};