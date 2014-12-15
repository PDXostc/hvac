
/*
 * Copyright (c) 2013, Intel Corporation, Jaguar Land Rover
 *
 * This program is licensed under the terms and conditions of the
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */

/** 
 * @module Services
 */

// Singleton
function RVI() {
    if (typeof RVI.instance === 'object') {
	console.log("Returning existing instance");
	return RVI.instance
    }


    console.log("Starting up service RVI 1");
    RVI.instance = this
    this.service_map = [];
    this.connect = function(address, err_cb) {
	try {
	    if (Wse.open(address))
		console.log("Connected to RVI service edge at " + address);
	    else
		err_cb("Failed to connect to RVI service edge at " + address);
	    
	} catch (err) {
	    err_cb("Exception when connecting to RVI: " + err);
	}
	// Map all incoming services to a given callback.
    }

    this.register_service = function(service, callback) {
	// Add a leading slash if necessar
	if (service[0] != '/')
	    service = '/' + service;

	Wse.start('service_edge_rpc', 'wse_register_service', [ service ]);
	console.log("Registered RVI service: " + service);
	this.service_map[service] = callback;
    }

    this.send_message = function(service, timeout, payload, calling_service) {
	console.log("Sending to             : " + service);
	console.log("Sending parameters     : " + JSON.stringify(payload) );
	console.log("Sending calling_service: " + calling_service);

	// Add a leading slash to calling service  if necessary
	if (calling_service[0] != '/')
	    calling_service = '/' + calling_service;

	Wse.start('service_edge_rpc', 'wse_message', [ service, timeout, payload, calling_service]);
    }

    this.rvi_message = function()  {
	if (this.service_map[arguments[0]]) {
	    this.service_map[arguments[0]].apply(null, arguments);
	}
	else
	    console.warn("Service: " + arguments[0] + " not mapped to any callback. Ignore");
    }
}

// "ws://10.0.0.36:1234/websession"
function message() {
    for (var i = 0; i < arguments.length; ++i) 
	console.log("message arguments[" + i + "]: " + arguments[i]);
	
    return RVI().rvi_message.apply(RVI(),arguments);
}
