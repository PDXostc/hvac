/* Copyright (C) Jaguar Land Rover - All Rights Reserved
*
* Proprietary and confidential
* Unauthorized copying of this file, via any medium, is strictly prohibited
*
* THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY 
* KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
* IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
* PARTICULAR PURPOSE.
*
* Filename:	 header.txt
* Version:              1.0
* Date:                 January 2013
* Project:              Widget incorporation
* Contributors:         XXXXXXX
*                       xxxxxxx
*
* Incoming Code:        GStreamer 0.93, <link>
*
*/

function deleteItemClick(item) {
	console.log(item.target);
	console.log(item.data.html());
	item.data.remove();
}
// Handler function invoked from the Crosswalk extension
// when  bp.bpAsync is called.
var callback = function(response) {
console.log("bp callback js: Async>>> " + response);
};

function addItemClick(item) {
	console.log('addItemClick()');
	console.log(item);
	console.log($("input[name='item_title']").val());
	console.log($("textarea[name='item_description']").val());
	console.log($("[name='item_template']").contents());
	
	// Capture the title and description data to be sent to the extension later.
	var ti=$("input[name='item_title']").val();
	var descr=$("textarea[name='item_description']").val();
	
	var newItemTemplate = $($("[name='item_template']").html());
	console.log(newItemTemplate);
	newItemTemplate.find("td[name='item_title_field']").text($("input[name='item_title']").val());
	newItemTemplate.find("td[name='item_description_field']").text($("textarea[name='item_description']").val());
	console.log(newItemTemplate);
	var newItem = newItemTemplate.clone();
	newItem.find("input[name='delete_item']").click(newItem,deleteItemClick);
	$("tbody[name='item_list_body']").append(newItem);
	$("form[name='add_item_form']")[0].reset();
	
	// Send the title and description to the extension:
	var jsonenc = {api:"handleItem", dest:"Item Consumer", title:ti, desc:descr};
	console.log("stringify before bp.bpAsynch is "+JSON.stringify(jsonenc));
	bp.bpAsync(JSON.stringify(jsonenc), callback);
}

function themeErrorCB (msg) {
    console.log("Theme Error Callback: " + msg);
}

function smallClick(item) {
    console.log('smallClick()');

    var jsonenc = {api:"setTheme", theme:"/usr/share/weekeyboard/blue_600.edj"};
    console.log("RE: setTheme stringify: "+JSON.stringify(jsonenc));
    wkb_client.clientSync(JSON.stringify(jsonenc), themeErrorCB);
}

function bigClick(item) {
    console.log('bigClick()');

    var jsonenc = {api:"setTheme", theme:"/usr/share/weekeyboard/blue_1080.edj"};
    console.log("RE: setTheme stringify: "+JSON.stringify(jsonenc));
    wkb_client.clientSync(JSON.stringify(jsonenc), themeErrorCB);
}

/**
 * Initialize application components and register button events.
 * 
 * @method init
 * @static
 */
var hvacIndicator;
var init_hvac = function () {
	console.log("init_hvac()");

    if(!hvacIndicator)
    {
        hvacIndicator = new hvacController();

        if(!carIndicator)
            $(document).on("carIndicatorReady", setup_ui);
        else
            setup_ui();
    }
};

function setup_ui() {
    console.log("setup_ui() called!");
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
		carIndicator.setStatus("targetTemperatureLeft", ($(this).val() + 29) - ($(this).val() * 2));
		carIndicator.setStatus("FrontTSetLeftCmd", ($(this).val() + 29) - ($(this).val() * 2));
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
		carIndicator.setStatus("targetTemperatureRight", ($(this).val() + 29) - ($(this).val() * 2));
		carIndicator.setStatus("FrontTSetRightCmd", ($(this).val() + 29) - ($(this).val() * 2));
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
		carIndicator.setStatus("fanSpeed", $(this).val());
		carIndicator.setStatus("FrontBlwrSpeedCmd", ($(this).val()));
	    }
	});

    carIndicator.addListener({
	    onAirRecirculationChanged : function(newValue) {
		hvacIndicator.onAirRecirculationChanged(newValue);
	    },
	    onFanChanged : function(newValue) {
		hvacIndicator.onFanChanged(newValue);
	    },
	    onFanSpeedChanged : function(newValue) {
		hvacIndicator.onFanSpeedChanged(newValue);
	    },
	    onTargetTemperatureRightChanged : function(newValue) {
		hvacIndicator.onTargetTemperatureRightChanged(newValue);
	    },
	    onTargetTemperatureLeftChanged : function(newValue) {
		hvacIndicator.onTargetTemperatureLeftChanged(newValue);
	    },
	    onHazardChanged : function(newValue) {
		hvacIndicator.onHazardChanged(newValue);
		console.log("onHazardChanged: "+ newValue);
	    },
	    onSeatHeaterRightChanged : function(newValue) {
		hvacIndicator.onSeatHeaterRightChanged(newValue);
	    },
	    onSeatHeaterLeftChanged : function(newValue) {
		hvacIndicator.onSeatHeaterLeftChanged(newValue);
	    },
	    onAirflowDirectionChanged : function(newValue) {
		hvacIndicator.onAirflowDirectionChanged(newValue);
	    },
	    onFrontDefrostChanged : function(newValue) {
		hvacIndicator.onFrontDefrostChanged(newValue);
	    },
	    onRearDefrostChanged : function(newValue) {
		hvacIndicator.onRearDefrostChanged(newValue);
	    }
	});
}


/**
 * Calls initialization fuction after document is loaded.
 * @method $(document).ready
 * @param init {function} Callback function for initialize Store.
 * @static
 **/
$(document).ready(init_hvac);

/**
 * Applies selected theme to application icons 
 * @method setThemeImageColor
 * @static
 **/
function setThemeImageColor() {
	var imageSource;
	$('body').find('img').each(function() {
		var self = this;
		imageSource = $(this).attr('src');

	    if (typeof(imageSource) !== 'undefined' && $(this.parentElement).hasClass('themeImage') == false) {
	        console.log(imageSource);

	        var img = new Image();
	        var ctx = document.createElement('canvas').getContext('2d');

	        img.onload = function () {
	            var w = ctx.canvas.width = img.width;
	            var h = ctx.canvas.height = img.height;
	            ctx.fillStyle = ThemeKeyColor;
	            ctx.fillRect(0, 0, w, h);
	            ctx.globalCompositeOperation = 'destination-in';
	            ctx.drawImage(img, 0, 0);

	            $(self).attr('src', ctx.canvas.toDataURL());
	            $(self).hide(0, function() { $(self).show();});
	        };

	        img.src = imageSource;
	    }
	});
}

function setupSpeechRecognition() {
	console.log("Store setupSpeechRecognition");
	Speech.addVoiceRecognitionListener({
		onapplicationinstall : function() {
			console.log("Speech application install invoked");
			if (_applicationDetail.id !== undefined) {
				StoreLibrary.installApp(_applicationDetail.id);
			}
		},
		onapplicationuninstall : function() {
			console.log("Speech application uninstall invoked");
			if (_applicationDetail.id !== undefined) {
				StoreLibrary.uninstallApp(_applicationDetail.id);
			}
		}

	});
}
