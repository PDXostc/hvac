/*
 * Copyright (c) 2014, Intel Corporation, Jaguar Land Rover
 *
 * This program is licensed under the terms and conditions of the
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */

/*global Bootstrap, hvacControler*/
var debug = false;


/**
 * Heat, Ventilation and Air Conditioning provides UI controls to operate this subystem of the car from 
 * [tizen.vehicle API](https://raw.github.com/otcshare/automotive-message-broker/master/docs/amb.idl).
 * Uses mainly {{#crossLink "CarIndicator"}}{{/crossLink}} module from {{#crossLink "Bootstrap/carIndicator:property"}}{{/crossLink}}.
 *
 * Application directly controls following AMB properties:
 *
 * * WindowStatus
 *   * FrontDefrost
 *   * RearDefrost
 * * HVAC
 *   * FanSpeed
 *   * TargetTemperatureRight
 *   * TargetTemperatureLeft
 *   * SeatHeaterRight
 *   * SeatHeaterLeft
 *   * AirConditioning
 *   * AirRecirculation
 *   * AirflowDirection
 * * LightStatus
 *   * Hazard
 * * DirectionIndicationINST
 * * DirectionIndicationMS
 * * ACCommand
 * * RecircReq
 * * FrontTSetRightCmd
 * * FrontTSetLeftCmd
 * * FrontBlwrSpeedCmd
 * * HeatedSeatFRModeRequest
 * * HeatedSeatFRRequest
 * * HeatedSeatFLModeRequest
 * * HeatedSeatFLRequest
 * * FLHSDistrCmd
 * * FRHSDistrCmd
 *
 * Additionaly HVAC application implements following scenarios:
 *
 * * Automatic AC mode - Sets Fan Speed to zero, Airflow direction to OFF, Air recirculation to off and both target temperatures to 22 degrees. 
 * Turning off Automatic AC mode will set all properties to their previous values. If any of properties are set separately Automatic AC mode is 
 * turned off.
 * * Max defrost mode - Maximum defrost mode sets Fan speed to maximum value, Airflow direction to Screen and resets Left target temperature 
 * within range 16 to 28 degrees. If any of properties are set separately Max defrost mode is turned off. 
 *
 * Hover and click on elements in images below to navigate to components of HVAC application.
 *
 * <img id="Image-Maps_1201312180420487" src="../assets/img/hvac.png" usemap="#Image-Maps_1201312180420487" border="0" width="649" height="1152" alt="" />
 *   <map id="_Image-Maps_1201312180420487" name="Image-Maps_1201312180420487">
 *     <area shape="rect" coords="0,0,573,78" href="../classes/TopBarIcons.html" alt="Top bar icons" title="Top bar icons" />
 *     <area shape="rect" coords="0,994,644,1147" href="../classes/BottomPanel.html" alt="bottom panel" title="Bottom panel" />
 *     <area shape="rect" coords="573,1,644,76" href="../modules/Settings.html" alt="Settings" title="Settings" />
 *     <area  shape="rect" coords="138,103,513,176" alt="Hazard button" title="Hazard button" target="_self" href="../classes/hvacControler.html#method_onHazardChanged"     >
 *     <area  shape="rect" coords="13,197,99,653" alt="Left target temperature" title="Left target temperature" target="_self" href="../classes/hvacControler.html#method_onTargetTemperatureLeftChanged"     >
 *     <area  shape="rect" coords="551,194,637,650" alt="Right target temperature" title="Right target temperature" target="_self" href="../classes/hvacControler.html#method_onTargetTemperatureRightChanged"     >
 *     <area  shape="rect" coords="369,403,512,612" alt="Right target temperature indicator" title="Right target temperature indicator" target="_self" href="../classes/hvacControler.html#method_onTargetTemperatureRightChanged"     >
 *     <area  shape="rect" coords="135,404,278,614" alt="Left target temperature indicator" title="Left target temperature indicator" target="_self" href="../classes/hvacControler.html#method_onTargetTemperatureLeftChanged"     >
 *     <area  shape="rect" coords="137,252,278,368" alt="Left seat heater" title="Left seat heater" target="_self" href="../classes/hvacControler.html#method_onSeatHeaterLeftChanged"     >
 *     <area  shape="rect" coords="370,252,511,368" alt="Right seat heater" title="Right seat heater" target="_self" href="../classes/hvacControler.html#method_onSeatHeaterRightChanged"     >
 *     <area  shape="rect" coords="391,780,491,860" alt="Air recirculation" title="Air recirculation" target="_self" href="../classes/hvacControler.html#method_onAirRecirculationChanged"     >
 *     <area  shape="rect" coords="157,780,257,860" alt="Fan status" title="Fan status" target="_self" href="../classes/hvacControler.html#method_onFanChanged"     >
 *     <area  shape="rect" coords="273,781,373,861" alt="Automatic AC mode" title="Automatic AC mode" target="_self" href="../classes/HVAC.html"     >
 *     <area  shape="rect" coords="151,653,498,764" alt="Fan speed" title="Fan speed" target="_self" href="../classes/hvacControler.html#method_onFanSpeedChanged"     >
 *     <area  shape="rect" coords="17,672,135,961" alt="Airflow direction" title="Airflow direction" target="_self" href="../classes/hvacControler.html#method_onAirflowDirectionChanged"     >
 *     <area  shape="rect" coords="516,781,626,859" alt="Rear defrost" title="Rear defrost" target="_self" href="../classes/hvacControler.html#method_onRearDefrostChanged"     >
 *     <area  shape="rect" coords="518,876,627,956" alt="Front defrost" title="Front defrost" target="_self" href="../classes/hvacControler.html#method_onFrontDefrostChanged"     >
 *     <area  shape="rect" coords="515,676,627,764" alt="Max defrost mode" title="Max defrost mode" target="_self" href="../classes/HVAC.html"     >
 *     <area shape="rect" coords="646,1150,648,1152" alt="Image Map" title="Image Map" href="http://www.image-maps.com/index.php?aff=mapped_users_0" >
 *  </map>
 * </img>
 *
 * @module HVACApplication
 * @main HVACApplication
 * @class HVAC
 **/

/**
 * Reference to instance of bootstrap class.
 * @property bootstrap {Bootstrap}
 */
var bootstrap;
var _vin = "default";
var _password = "tizen";

// All RVI subscribers to updates
var rviSubscribers = [];

/**
 * Initializes plugins and register events for HVAC app.
 * @method init
 * @static
 **/
var init = function() {
    "use strict";
    var hvacIndicator = new hvacControler();
    bootstrap = new Bootstrap(function(status) {
	$("#topBarIcons").topBarIconsPlugin('init');
	$('#bottomPanel').bottomPanel('init');

	$(".noUiSliderLeft").noUiSlider({
	    range : [ 0, 14 ],
	    step : 1,
	    start : 14,
	    handles : 1,
	    connect : "upper",
	    orientation : "vertical",
	    slide : function() {
		if ($("#defrost_max_btn").hasClass("on")) {
		    switch ($(this).val()) {
		    case 0:
			$(this).val(1);
			break;
		    case 14:
			$(this).val(13);
			break;
		    }
		}
		bootstrap.carIndicator.setStatus("targetTemperatureLeft", ($(this).val() + 29) - ($(this).val() * 2));
		bootstrap.carIndicator.setStatus("FrontTSetLeftCmd", ($(this).val() + 29) - ($(this).val() * 2));
	    }
	});

	$(".noUiSliderRight").noUiSlider({
	    range : [ 0, 14 ],
	    step : 1,
	    start : 14,
	    handles : 1,
	    connect : "upper",
	    orientation : "vertical",
	    slide : function() {
		bootstrap.carIndicator.setStatus("targetTemperatureRight", ($(this).val() + 29) - ($(this).val() * 2));
		bootstrap.carIndicator.setStatus("FrontTSetRightCmd", ($(this).val() + 29) - ($(this).val() * 2));
	    }
	});

	$(".noUiSliderFan").noUiSlider({
		range : [ 0, 7 ],   // Even though this is defined as 4 bits the car does 0..7
	    step : 1,
	    start : 0,
	    handles : 1,
	    connect : "upper",
	    orientation : "horizontal",
	    slide : function() {
		bootstrap.carIndicator.setStatus("fanSpeed", $(this).val());
		bootstrap.carIndicator.setStatus("FrontBlwrSpeedCmd", ($(this).val()));
	    }
	});

	$(".setup").click(function(ev){
		
		$("#resultMessage").hide();
		$("#setupForm").show();
		
	    
	    $("#vinNumber").val(localStorage["com.jlr.rvi.vin"]);
	    $("#password").val(localStorage["com.jlr.rvi.pin"]);
	    $("#overlay").css("display","block");
	    $("#inputBox").css("display","inline-block");
	});
	
	$("#cancel").click(function(ev){
		$("#overlay").css("display","none");
		$("#inputBox").css("display","none");
		
	});
	
	$("#submit").click(function(ev){
		submitSettings();
	});
	
	$("#resultMessage").click(function(ev){
		$("#overlay").css("display","none");
		$("#inputBox").css("display","none");
	});
	
	
	bootstrap.carIndicator.addListener({
	    onAirRecirculationChanged : function(newValue) {
		hvacIndicator.onAirRecirculationChanged(newValue);
		sendRVI("air_circ", newValue);
	    },
	    onFanChanged : function(newValue) {
		hvacIndicator.onFanChanged(newValue);
		sendRVI("fan", newValue);
	    },
	    onFanSpeedChanged : function(newValue) {
		hvacIndicator.onFanSpeedChanged(newValue);
		sendRVI("fan_speed", newValue);
	    },
	    onTargetTemperatureRightChanged : function(newValue) {
		hvacIndicator.onTargetTemperatureRightChanged(newValue);
		sendRVI("temp_right", newValue);
	    },
	    onTargetTemperatureLeftChanged : function(newValue) {
		hvacIndicator.onTargetTemperatureLeftChanged(newValue);
		sendRVI("temp_left", newValue);
	    },
	    onHazardChanged : function(newValue) {
		hvacIndicator.onHazardChanged(newValue);
		console.log("onHazardChanged: "+ newValue);
		sendRVI("hazard", newValue);
	    },
	    onSeatHeaterRightChanged : function(newValue) {
		hvacIndicator.onSeatHeaterRightChanged(newValue);
		sendRVI("seat_heat_right", newValue);
	    },
	    onSeatHeaterLeftChanged : function(newValue) {
		hvacIndicator.onSeatHeaterLeftChanged(newValue);
		sendRVI("seat_heat_left", newValue);
	    },
	    onAirflowDirectionChanged : function(newValue) {
		hvacIndicator.onAirflowDirectionChanged(newValue);
		sendRVI("airflow_direction", newValue);
	    },
	    onFrontDefrostChanged : function(newValue) {
		hvacIndicator.onFrontDefrostChanged(newValue);
		sendRVI("defrost_front", newValue);
	    },
	    onRearDefrostChanged : function(newValue) {
		hvacIndicator.onRearDefrostChanged(newValue);
		sendRVI("defrost_rear", newValue);
	    }
	});
    });

    // Setup the RVI plugin
    console.log("tizen.rvi about to be initialized: ", tizen.rvi);
    if(  tizen.rvi === undefined)
    {
	tizen.rvi = new RVI();
    	console.log("tizen.rvi initialized.");
    }

    $(".deleteButton").click(function(ev){
    	deleteCharacter(ev);
    });
    
    if (!localStorage["com.jlr.rvi.vin"]) {
	$("#resultMessage").hide();
	$("#setupForm").show();
	
	$("#vinNumber").val(localStorage["com.jlr.rvi.vin"]);
	$("#password").val(localStorage["com.jlr.rvi.pin"]);
	$("#inputBox").css("display","inline-block");
	$("#overlay").css("display","inline-block");
    }

    connectSubscribe();

};


err_out = function(message) {
    console.log("Error: " +result);

    tizen.application.getCurrentApplication().exit();
}


function connectSubscribe(){
    if (localStorage && 
	localStorage["com.jlr.rvi.vin"] &&
	localStorage["com.jlr.rvi.pin"]) {
	
	var vin = localStorage["com.jlr.rvi.vin"];
	var pin = localStorage["com.jlr.rvi.pin"];
	var sub_service = vin + "/" + pin + "/" + "hvac/subscribe";
	var pub_service = vin + "/" + pin + "/" + "hvac/publish";
	tizen.rvi.connect("ws://127.0.0.1:8818/websession", err_out);
	console.log("connectSubscribe: registering: " + sub_service);
	console.log("connectSubscribe: registering: " + pub_service);
	tizen.rvi.register_service(sub_service, handleAddRVISubscriber);
	tizen.rvi.register_service(pub_service, handleRVIPublish);

	// Retrieve the stored list of subscribers that we had during
	// our last session.
	if (localStorage["com.jlr.rvi.subscribers"])  {
	    rviSubscribers = JSON.parse(localStorage["com.jlr.rvi.subscribers"]);
	    console.log("Stored subscriber list is: " + rviSubscribers);
	}
	else {
	    rviSubscribers = [];
	    console.log("No stored subscribers");
	}

	// Each mobile HVAC subscriber in rviSubscribers list will have their
	// publish service invoked with the key set to RENEW and value
	// set to true.
	// 
	// Each subscriber will respond by invoking the subscribe service
	// of this Tizen HVAC UI.
	//
	console.log("Sending RENEW trigger to all stored subscribers");
	sendRVI("RENEW", true);

	// Clear the subscriber list since we will ask them
	// to renew their subscription.
	localStorage["com.jlr.rvi.subscribers"] = JSON.stringify([]);
	rviSubscribers = [];


	console.log("connectSubscribe complete");
    }
}


function handleAddRVISubscriber(service, subscribingService) {
    console.log("addRVISubscriber(): New subscriber " + subscribingService);
    for(i = 0; i < rviSubscribers.length; ++i) {
	if (rviSubscribers[i] == subscribingService) {
	    console.log("addRVISubscriber(): "+ subscribingService + " is already a subscriber. Will only send initial values");
	    sendInitialValues(subscribingService);
	    return true;
	}
    }
    rviSubscribers.push(subscribingService);
    localStorage["com.jlr.rvi.subscribers"] = JSON.stringify(rviSubscribers);
    sendInitialValues(subscribingService);
}

function sendInitialValues(subscribingService) {
    // Setup the UI of the remote HVAC UI.

    bootstrap.carIndicator.getStatus("fanSpeed", function(val) { sendRVI("fan_speed", val);});
    bootstrap.carIndicator.getStatus("targetTemperatureRight", function(val) {  sendRVI("temp_right", val);});
    bootstrap.carIndicator.getStatus("targetTemperatureLeft", function(val) {  sendRVI("temp_left", val);});
    bootstrap.carIndicator.getStatus("hazard", function(val) {  sendRVI("hazard", val);});
    bootstrap.carIndicator.getStatus("frontDefrost", function(val) {  sendRVI("defrost_rear", val);});
    bootstrap.carIndicator.getStatus("rearDefrost", function(val) {  sendRVI("defrost_front", val);});
    bootstrap.carIndicator.getStatus("fan", function(val) {  sendRVI("fan", val);});
    bootstrap.carIndicator.getStatus("seatHeaterRight", function(val) {  sendRVI("seat_heat_right", val);});
    bootstrap.carIndicator.getStatus("seatHeaterLeft", function(val) {  sendRVI("seat_heat_left", val);});
    console.log("PRE: ");
    bootstrap.carIndicator.getStatus("airRecirculation", function(val) {  
	console.log("AIR CIRC: " + val);
	sendRVI("air_circ", val);
    });
    bootstrap.carIndicator.getStatus("airflowDirection", function(val) {  
	console.log("AIR FLOW DIRECTION: " + val);
	sendRVI("airflow_direction", val);
    });

    if ($("#defrost_max_btn").hasClass("on")) 
	sendRVI("defrost_max", true);
    else
	sendRVI("defrost_max", false);

    if ($("#fan_control_auto").hasClass("on")) 
	sendRVI("auto", true);
    else
	sendRVI("auto", false);
}

function handleRVIPublish(service, key, value) {
    // A lookup table here would be nice, but we'll do that later.


    console.log("publish - CALLED: [" + key + "] [" + value + "]");

    // Manually managed through hvacIndicator.js
    if (key === "auto") {
	if (str2bool(value))   {
	    console.log("publish - auto on");
	    switchAutoACOn();
	} else {
	    console.log("publish - auto off");
	    switchAutoACOff();
	}
	return;
    }

    // Manually managed through hvacIndicator.js
    if (key === "defrost_max") {
	if (str2bool(value))  {
	    console.log("Will enable max defrost");
	    if (!$("#defrost_max_btn").hasClass("on")) 
		$("#defrost_max_btn").addClass("on");
	}
	else {
	    console.log("Will enable  defrost");
	    if ($("#defrost_max_btn").hasClass("on")) 
		$("#defrost_max_btn").removeClass("on");
	}
	return;
    }

    if (key === "air_circ") {
	bootstrap.carIndicator.setStatus("airRecirculation", str2bool(value));
	return;
    }

    if (key === "fan") {
	bootstrap.carIndicator.setStatus("fan", str2bool(value));
	return;
    }

    if (key === "fan_speed") {
	bootstrap.carIndicator.setStatus("fanSpeed", parseInt(value));
	return;
    }

    if (key === "temp_left") {
	bootstrap.carIndicator.setStatus("targetTemperatureLeft", parseInt(value));
	return;
    }

    if (key === "temp_right") {
	bootstrap.carIndicator.setStatus("targetTemperatureRight", parseInt(value));
	return;
    }

    if (key === "hazard") {
	hvacControler.prototype.onHazardChanged(str2bool(value));
	return;
    }

    if (key === "seat_heat_right") {
	bootstrap.carIndicator.setStatus("seatHeaterRight", parseInt(value));
	return;
    }

    if (key === "seat_heat_left") {
	bootstrap.carIndicator.setStatus("seatHeaterLeft", parseInt(value));
	return;
    }

    if (key === "airflow_direction") {
	bootstrap.carIndicator.setStatus("airflowDirection", parseInt(value));
	return;
    }
    if (key === "defrost_rear") {
	bootstrap.carIndicator.setStatus("rearDefrost", str2bool(value));
	return;
    }
    if (key === "defrost_front") {
	bootstrap.carIndicator.setStatus("frontDefrost", str2bool(value));
	return;
    }
}

function sendRVI(topic, value)
{
    console.log("Sending: "+ topic + " -> "+ value+ ":"+ typeof(value));
    console.log("Subs: "+ rviSubscribers);
    console.log("Subs: "+ rviSubscribers.length);
    
    for (subs in rviSubscribers) {
	console.log("    Subscriber: " + rviSubscribers[subs]);
	payload = JSON.stringify({ vin: localStorage["com.jlr.rvi.vin"], 
				   key: topic, 
				   value:value.toString() });
	console.log("    Payload: " + payload);
	tizen.rvi.send_message(rviSubscribers[subs], 5000, payload,  "hvac/publish");
    }

}

function str2bool(str) {
    
    if (str.toLowerCase() === "false" || 
	str === "0" ||
	str === 0) {
	return false;
    }
    return true;
}

function submitSettings(){
    console.log("submitSettings(): Called");

    var password = $("#password").val();
    var vin = $("#vinNumber").val();
    var server = $("#serverId").val();
    

    if (localStorage) {
	localStorage["com.jlr.rvi.vin"] = vin;
	localStorage["com.jlr.rvi.pin"] = password;
    
	$("#resultMessage").show();
	$("#setupForm").hide();
	//$("#overlay").css("display","none");
	
	connectSubscribe();
    }
}




function deleteCharacter(ev){
	
	var thisInput = $(ev.target).siblings(".inputNumber");
	var currentVal = $(thisInput).val();
	
	$(thisInput).val(currentVal.substring(0,currentVal.length-1));
	
}


function convertTopic(topic)
{
    return topic.replace("%vin", _vin).replace("%password", _password);
}

/**
 * Calls initialization fuction after document is loaded.
 * @method $(document).ready
 * @param init {function} Callback function for initialize Homescreen.
 * @static
 **/
$(function() {
	"use strict";
	// debug mode -
	if (!debug) {
		init()
	} else {
		window.setTimeout("init()", 20000);
	}
});
