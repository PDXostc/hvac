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

/**
 * Speech class provides text to speech (TTS) and speech to text (STT) or speech recognition functionality utilizing 
 * [tizen.speech API](https://dvcs.w3.org/hg/speech-api/raw-file/tip/speechapi.html). 
 * This component is usually initialized by {{#crossLink "Bootstrap"}}{{/crossLink}} class and can be
 * later accessed using global {{#crossLink "Speech"}}{{/crossLink}} object.
 * 
 * Due to limitation of [tizen.speech API](https://dvcs.w3.org/hg/speech-api/raw-file/tip/speechapi.html) that allows to set
 * only one listener, class implements custom event dispatcher that provides unified way for registering listener objects to 
 * receive notification when the speech recognizer returns a result.
 * 
 * To attach to particular recognized speech commands register new callback object using {{#crossLink "Speech/addVoiceRecognitionListener:method"}}{{/crossLink}} method. 
 *
 * To execute TTS for particular sentence use {{#crossLink "Speech/vocalizeString:method"}}{{/crossLink}} method.
 * 
 * @class Speech
 * @constructor
 */
var Speech = (function() {
	"use strict";

	function Speech() {
		console.info("Starting up service Speech");

		// workaround for TTS
		this.vocalizeString("");

		// workaround for STT
		if (typeof (tizen) !== 'undefined' && typeof (tizen.content) !== 'undefined' && typeof (tizen.speech.find) !== 'undefined') {
			tizen.content.find(function(content) {
			}, function(error) {
			}, null);
		}

		this._initVoiceRecognition();
	}
/** 
* Array of registered listeners 
* @type Object
* @property _listeners
* @private
*/
	Speech.prototype._listeners = [];
/** 
 * This method initialize voice recognition , for recognition use tizen.speech.setCBListener function from tizen api.
 * @method _initVoiceRecognition
 * @private
 */
	Speech.prototype._initVoiceRecognition = function() {
		var self = this;
		console.log("Speech init voice recognition called.");
		if (typeof (tizen) !== 'undefined' && typeof (tizen.speech) !== 'undefined' && typeof (tizen.speech.setCBListener) !== 'undefined') {
			try {
				var speechEventListener = {
					onaudiostart : function() {
						console.log("Speech: onaudiostart received");
					},
					onsoundstart : function() {
						console.log("Speech: onsoundstart received");
					},
					onspeechstart : function() {
						console.log("Speech: onspeechstart received");
					},
					onspeechend : function() {
						console.log("Speech: onspeechend received");
					},
					onsoundend : function() {
						console.log("Speech: onsoundend received");
					},
					onaudioend : function() {
						console.log("Speech: onaudioend received");
					},
					onresult : function(result) {
						console.log("Speech: onresult received");
						for ( var i = 0; i < result.length; i++) {
							console.log("Speech: forloop, command = " + result[i]);
							var commandFound = false;

							switch (result[i].toString().trim().toLowerCase()) {
							case "play":
								commandFound = true;
								self._callListener("onplay");
								break;
							case "next":
								self._callListener("onnext");
								commandFound = true;
								break;
							case "previous":
								self._callListener("onprevious");
								commandFound = true;
								break;
							case "stop":
							case "pause":
								self._callListener("onstop");
								commandFound = true;
								break;
							case "launch_homescreen":
							case "launch_navigation":
							case "launch_dashboard":
							case "launch_store":
							case "launch_multimediaplayer":
							case "launch_phone":
							case "launch_hvac":
							case "launch_sdl":
							case "launch_simulator":
								var appName = result[i].toString().trim().toLowerCase().substring(7);
								if (appName === "homescreen") {
									appName = "home screen";
								} else if (appName === "multimediaplayer") {
									appName = "multimedia player";
								} else if (appName === "simulator") {
									appName = "amb simulator";
								} else if (appName === "sdl") {
									appName = "smartdevicelink";
								}
								self._callListener("onapplicationlaunch", appName);
								commandFound = true;
								break;
							case "install":
								self._callListener("onapplicationinstall");
								commandFound = true;
								break;
							case "uninstall":
								self._callListener("onapplicationuninstall");
								commandFound = true;
								break;
							case "call":
								self._callListener("oncall");
								commandFound = true;
								break;
							default:
								break;
							}

							if (commandFound) {
								break;
							}
						}
					},
					onnomatch : function(result) {
						console.log("Speech: onnomatch received ");
					},
					onerror : function(error) {
						console.log("Speech: onerror received");
					},
					onstart : function() {
						console.log("Speech: onstart received");
					},
					onend : function() {
						console.log("Speech: onend received");
					}
				};
				tizen.speech.setCBListener(speechEventListener);
			} catch (err) {
				console.log("Speech set callback listener FAILED + " + err.message);
				console.log(err);
			}
		} else {
			console.log("Speech set callback listener not supported.");
		}
	};

	/**
	 * Adds the listener object to receive notifications when the speech recognizer returns a requested speech command.
	 * Following voice commands are recognized:
	 *
	 * * `play music` - invokes method `onplay`, used in {{#crossLinkModule "MultimediaPlayerApplication"}}{{/crossLinkModule}}
     * * `pause music` - invokes method `onpause`, used in {{#crossLinkModule "MultimediaPlayerApplication"}}{{/crossLinkModule}}
     * * `play next` - invokes method `onnext`, used in {{#crossLinkModule "MultimediaPlayerApplication"}}{{/crossLinkModule}}
     * * `play previous`- invokes method `onprevious`, used in {{#crossLinkModule "MultimediaPlayerApplication"}}{{/crossLinkModule}}
     * * `stop music` - invokes method `onstop`, used in {{#crossLinkModule "MultimediaPlayerApplication"}}{{/crossLinkModule}}
     * * `install application` - invokes method `onapplicationinstall`, used in {{#crossLinkModule "StoreApplication"}}{{/crossLinkModule}}
     * * `uninstall application` - invokes method `onapplicationuninstall`, used in {{#crossLinkModule "StoreApplication"}}{{/crossLinkModule}}
     * * `call contact` - invokes method `oncall`, used in {{#crossLinkModule "PhoneApplication"}}{{/crossLinkModule}}
	 * * `launch` commands - invokes method `onapplicationlaunch` with parameter indicating application (used globally):
	 *   * `launch home screen` - Launches {{#crossLinkModule "HomeScreenApplication"}}{{/crossLinkModule}}
	 *   * `launch navigation` - Launches {{#crossLinkModule "NavigationGoogleApplication"}}{{/crossLinkModule}}
	 *   * `launch dashboard` - Launches {{#crossLinkModule "DashboardApplication"}}{{/crossLinkModule}}
	 *   * `launch store` - Launches {{#crossLinkModule "StoreApplication"}}{{/crossLinkModule}}
	 *   * `launch multimedia player` - Launches {{#crossLinkModule "MultimediaPlayerApplication"}}{{/crossLinkModule}}
	 *   * `launch phone`, `launch dialer` - Launches {{#crossLinkModule "PhoneApplication"}}{{/crossLinkModule}}
	 *   * `launch air conditioning` - Launches {{#crossLinkModule "HVACApplication"}}{{/crossLinkModule}}
	 *   * `launch smart device link` - Launches {{#crossLinkModule "SdlApplication"}}{{/crossLinkModule}}
	 *   * `launch simulator` - Launches {{#crossLinkModule "AMBSimulatorApplication"}}{{/crossLinkModule}}
	 *
	 * To attach to these commands provide listener object defining method name:
	 *
	 *     { 
	 *        onplay : function() { }, // Called when play command was identified
     *        onstop : function() { } // Called when stop command was identified 
     *        onapplicationinstall : function() { } // Called when install command was identified 
     *     }
     *     
	 * 
	 * @method addVoiceRecognitionListener
	 * @param aCallbackObject Object with callback functions to be invoked.
	 */
	Speech.prototype.addVoiceRecognitionListener = function(aCallbackObject) {
		this._listeners.push(aCallbackObject);
	};

	Speech.prototype._callListener = function(listenerName, arg) {
		for ( var i = 0; i < this._listeners.length; ++i) {
			for ( var name in this._listeners[i]) {
				if (name === listenerName) {
					this._listeners[i][name](arg);
					break;
				}
			}
		}
	};

	/**
	 * Performs text to speech synthesis of a given text. This method use api function `tizen.speech.vocalizeString` and currently 
	 * all strings are queued without option to cancel TTS before it's finalized.
	 * 
	 * @method vocalizeString
	 * @param string {String} Text to be synthetized.
	 */
	Speech.prototype.vocalizeString = function(string) {
		console.log("Speech vocalize string called.");
		if (typeof (tizen) !== 'undefined' && typeof (tizen.speech) !== 'undefined' && typeof (tizen.speech.vocalizeString) !== 'undefined') {
			try {
				tizen.speech.vocalizeString(string);
			} catch (err) {
				console.log("Speech vocalize string FAILED: " + err.message);
				console.log(err);
			}
		} else {
			console.log("Speech vocalize string not supported.");
		}
	};

	/**
	 * Performs text to speech synthesis of the current application name.
	 * 
	 * @method readCurrentAppName
	 */
	Speech.prototype.readCurrentAppName = function() {
		if (typeof (tizen) !== 'undefined') {
			var appName = tizen.application.getCurrentApplication().appInfo.name.toString().trim().toLowerCase();
			if (appName === "hvac") {
				appName = "air conditioning";
			}
			this.vocalizeString(appName);
		}
	};

	window.__speech = undefined === window.__speech ? new Speech() : window.__speech;
	return window.__speech;
})();
