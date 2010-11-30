var http = require("http");

this.Pool = function(host, port, options) {
	var that = this;
	

	this.options = options;
	this.host = host;
	this.port = port;

	this.client = http.createClient(this.port, this.host);
	this.clients = [];
	
	//disable multiple clients due to cache coherence issues when caching enabled 
	if(!!options.cache)
	{
		this.poolsize = 1;
	}
	else
	{
		this.poolsize = options.poolsize || 32;
	}
	
	
	this.ptr = 0;
	
	for(var x = 0;x<this.poolsize;x++)
	{
		this.clients.push(http.createClient(this.port, this.host));
	}
};

this.Pool.prototype = {
	dispatchRequest : function(method, path, headers) {
		headers["Connection"] = "Keep-Alive";
		var request = this._getClient().request(method, path, headers);
		return request;
	},

	_getClient : function() {
		this.ptr = (this.ptr+1)%this.poolsize
		return this.clients[this.ptr];
	}
};