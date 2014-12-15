/*
 * Copyright (c) 2013, Intel Corporation, Jaguar Land Rover
 *
 * This program is licensed under the terms and conditions of the
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */

/*global loadScript, ThemeEngine, Configuration, CarIndicator, IncomingCall, Speech */
/** 
 * @module Services
 */

/** 
 * This class provides unified way to boot up the HTML applications by loading shared components in proper order:
 * 
 * * {{#crossLink "Configuration"}}{{/crossLink}}
 * * {{#crossLink "ThemeEngine"}}{{/crossLink}}
 * * {{#crossLink "CarIndicator"}}{{/crossLink}}
 * * {{#crossLink "Speech"}}{{/crossLink}}
 * * {{#crossLink "IncomingCall"}}{{/crossLink}}
 * 
 * To start bootstraping process in application include following snippet to your `index.html` page `<head>` section:
 * 
 *     <script type='text/javascript' src='./common/js/services/bootstrap.js'></script>
 *
 * and include following script into `document.ready()` code:
 * 
 *     $(document).ready(function() {
 *        "use strict";
 *        var bootstrap = new Bootstrap(function(status) {
 *           // Perform any additional intialization
 *        });
 *     });
 * 
 * @class Bootstrap
 * @constructor
 * @param callback {function(error)} Callback function called after whole boot up process is finished or if issue was detected during the process. Parameter `error` will contain any error that 
 * was intercepted.
 */

var Bootstrap = function(callback) {
	"use strict";
	var self = this;
	callback = callback || function() {};

	console.log("Loading Configuration object");

	loadScript('./common/css/car/components/configuration/configuration.js', function(path, status) {
		if (status === "ok") {
			Configuration.reload(function() {
				self.loadThemeEngine(callback);
			});
		} else {
			console.log("Error occured during loading of Configuration", status);
			callback(status);
		}
	});
};

/** 
 * Theme engine object; available after bootstap process is finished.
 * @property themeEngine
 * @type ThemeEngine
 */
Bootstrap.prototype.themeEngine = null;

/** 
 * Car indicators object; available after bootstap process is finished.
 * @property carIndicator
 * @type CarIndicator
 */
Bootstrap.prototype.carIndicator = null;

/** 
 * Incoming call object; available after bootstap process is finished.
 * @property incomingCall
 * @type IncomingCall
 */
Bootstrap.prototype.incomingCall = null;

/** 
 * This method initialize theme engine.
 * @method loadThemeEngine
 * @param callback {function(error)} Callback function called after method is finished. Parameter `error` will contain any error that was intercepted.
 */
Bootstrap.prototype.loadThemeEngine = function(callback) {
	"use strict";
	var self = this;

	console.log("Loading ThemeEngine object");

	loadScript('./common/js/services/themeengine.js', function(path, status) {
		if (status === "ok") {
			self.themeEngine = ThemeEngine;
			self.themeEngine.init(function(themeStatus) {
				if (!themeStatus) {
					self.initCarIndicators(callback);
				} else {
					callback(themeStatus);
				}
			});
		} else {
			console.log("Error occured during loading of Configuration", status);
			callback(status);
		}
	});
};

/** 
 * This method initialize car indicator component and attaches to AMB system.
 * @method initCarIndicators
 * @param callback {function(error)} Callback function called after method is finished. Parameter `error` will contain any error that was intercepted.
 */
Bootstrap.prototype.initCarIndicators = function(callback) {
	"use strict";
	var self = this;

	console.log("Loading CarIndicators object");

	loadScript('./common/js/services/carIndicator.js', function(path, status) {
		if (status === "ok") {
			try {
				self.carIndicator = new CarIndicator();

				self.carIndicator.addListener({
					onNightModeChanged: function(nightMode) {
						self.themeEngine.setUserTheme("http://com.intel.tizen/" + (nightMode ? "blue" : "green"));
					}
				});
				self.initSpeech(callback);
			} catch (ex) {
				console.error("Error occured during CarIndicator initialization", ex);
				callback(ex);
			}
		} else {
			console.log("Error occured during loading of Configuration", status);
			callback(status);
		}
	});
};
/** 
 * This method initialize incoming call component and attaches to incoming call signal.
 * @method initIncomingCall
 * @param callback {function(error)} Callback function called after method is finished. Parameter `error` will contain any error that was intercepted.
 */
Bootstrap.prototype.initIncomingCall = function(callback) {
	"use strict";
	var self = this;

	console.log("Loading IncomingCall object");
	loadScript('./common/css/car/components/boxCaption/boxCaption.js', function(path, status) {
		if (status === "ok") {

			loadScript('./common/css/car/components/incomingCall/incomingCall.js', function(path, status) {
				if (status === "ok") {
					try {
						self.incomingCall = new IncomingCall();
						if (typeof(tizen) !== 'undefined' && tizen.phone) {
							tizen.phone.addCallChangedListener(function(result) {
								/* global getAppByID */
								var appId = getAppByID('intelPoc15.phone');

								var contact;
								if (!!result.contact.name) {
									contact = result.contact;
								} else {
									contact = {
										phoneNumbers: [{
											/* jshint camelcase: false */
											number: tizen.phone.activeCall.line_id
											/* jshint camelcase: true */
										}]

									};
								}

								console.log("result.state " + result.state);
								switch (result.state.toLowerCase()) {
									case "DISCONNECTED".toLowerCase():
										self.incomingCall.denyCall();
										Configuration.set("acceptedCall", "false");
										break;
									case "ACTIVE".toLowerCase():
										if (Configuration._values.acceptedCall !== "true") {
											self.incomingCall.acceptIncommingCall();
											Configuration.set("acceptedCall", "true");
										}
										break;
									case "DIALING".toLowerCase():
										if (!appId.running) {
											/*global launchApplication*/
											launchApplication('intelPoc15.phone');
										}
										break;
									case "INCOMING".toLowerCase():
										self.incomingCall.show(contact);
										break;
								}
							});
						}
						callback();
					} catch (ex) {
						console.error("Error occured during IncomingCall initialization", ex);
						callback(ex);
					}
				} else {
					console.log("Error occured during loading of Configuration", status);
					callback(status);
				}
			});
		}
	});
};
/** 
 * This method initialize speech functionality.
 * @method initSpeech
 * @param callback {function(error)} Callback function called after method is finished. Parameter `error` will contain any error that was intercepted.
 */
Bootstrap.prototype.initSpeech = function(callback) {
	"use strict";
	var self = this;
	loadScript('./common/js/services/speech.js', function(path, status) {
		Speech.readCurrentAppName();
		self.reload();
		self.initIncomingCall(callback);
	});
};

/** 
 * This method reloads configuration.
 * @method reload
 */
Bootstrap.prototype.reload = function() {
	"use strict";
	document.addEventListener("webkitvisibilitychange", function() {
		Configuration.reload();
		Speech.readCurrentAppName();
	}, false);
	// workaround for webkitvisibilitychange
	setInterval(function() {
		Configuration.reload();
	}, 1000);
};
