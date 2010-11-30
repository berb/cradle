var http = require("http");
/**
 * Connection pooling for cradle
 * 
 * Warning: This code is experimental and not yet tested sufficiently!
 * 
 * @author Benjamin Erb
 */

this.Pool = function(host, port, options) {
	var that = this;

	this.options = options;
	this.host = host;
	this.port = port;

	// a free list of clients in the pool
	this.clients = [];

	// a queue of requests waiting for available clients
	this.queue = [];

	// disable multiple clients due to cache coherence issues when caching
	// enabled
	this.poolsize = (!!options.cache) ? 1 : options.poolsize || 32;

	for ( var x = 0; x < this.poolsize; x++) {
		this.clients.push(http.createClient(this.port, this.host));
	}

};

this.Pool.prototype = {

	dispatchRequest : function(method, path, headers, requestCallback) {
		var that = this;

		var acquireClient = function(client) {
			headers["Connection"] = "Keep-Alive";
			request = client.request(method.toUpperCase(), path, headers);
			request.on('response', function(response) {
				response.on('end', function() {
					// release client
					var q = that.queue.pop()
					if (q) {
						// execute next request from queue...
						q(response.client);
					}
					else {
						// ...or enqueue to free workers
						that.clients.unshift(response.client);

					}
				});
			});
			requestCallback(request);
		};

		var client = this.clients.pop();
		if (client) {
			// execute directly...
			acquireClient(client);
		}
		else {
			// ...or enqueue
			that.queue.unshift(function(client) {
				acquireClient(client);
			});
		}
	}

};
