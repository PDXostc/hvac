/*
 * Copyright (c) 2013, Intel Corporation, Jaguar Land Rover
 *
 * This program is licensed under the terms and conditions of the
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */

/*global loadScript, Configuration */

/** 
 * @module Services
 */

 /** 
 * This class provides unified way to access available themes, detection of theme changes and method of updating selected theme. This component is usually initialized by
 * {{#crossLink "Bootstrap"}}{{/crossLink}} class and can be later accessed using {{#crossLink "Bootstrap/themeEngine:property"}}{{/crossLink}} object. Component uses
 * {{#crossLink "Configuration"}}{{/crossLink}} class to persist selected theme in key specified by {{#crossLink "ThemeEngine/selectedThemeKey:property"}}{{/crossLink}}.
 *
 * List of available themes is stored in {{#crossLink "ThemeEngine/_themes:property"}}{{/crossLink}} property; new theme can be set using 
 * {{#crossLink "ThemeEngine/setUserTheme:method"}}{{/crossLink}} method.
 * 
 * To attach to signal indicating update of currencly selected theme use {{#crossLink "ThemeEngine/addStatusListener:method"}}{{/crossLink}} method, e.g.:
 * 
 *     var listenerId = bootstrap.themeEngine.addStatusListener(function(themeId) { 
 *        // Process theme update
 *     });
 * 
 * @class ThemeEngine
 * @constructor
 */

var ThemeEngine = (function() {
    "use strict";
    function ThemeEngine() {
        console.info("Starting up service ThemeEngine");
    }

    /** 
     * Defines configuration property storing currently selected theme.
     * @property selectedThemeKey
     * @type String
     */
    ThemeEngine.prototype.selectedThemeKey = "selectedTheme";

    /** 
     * Contains array of attached callbacks.
     * @property _reloadCallbacks
     * @private
     * @type Array
     */
    ThemeEngine.prototype._reloadCallbacks = [];

    /** 
     * Contains array of available themes.
     * @property _themes
     * @private
     * @type Array
     */
    ThemeEngine.prototype._themes = [
    {
        "id": "http://com.intel.tizen/blue",
        "name": "Blue theme",
        "type": "user",
        "version": "0.5.1354227499444",
        "selected": true,
        "icon": "icon.png",
        "iconUrl": "./css/user/blue/icon.png",
        "_dir": "blue"
    }, {
        "id": "http://com.intel.tizen/green",
        "name": "Green theme",
        "type": "user",
        "version": "0.5.0",
        "icon": "icon.png",
        "iconUrl": "./css/user/green/icon.png",
        "selected": false,
        "_dir": "green"
    }];

    /** 
     * This method initialize theme engine from configuration object and loads default theme.
     * @method init
     * @param callback {function(error)} Callback function called after method is finished. Parameter `error` will contain any error that was intercepted.
     */
    ThemeEngine.prototype.init = function(aCallback) {
        var self = this;

        loadScript('./common/css/car/components/configuration/configuration.js', function (path, status) {
            if (status === "ok") {
                var storedTheme = Configuration.get("selectedTheme");
                self._injectHeaders(storedTheme, function() {
                    self._updateSelectedTheme();

                    Configuration.addUpdateListener(function() {
                        var id = Configuration.get("selectedTheme");
                        var selectedTheme = self.getSelectedTheme();
                        if (!selectedTheme || selectedTheme.id !== id) {
                            self._injectHeaders(id, function() {
                                self._updateSelectedTheme();

                                $(self._reloadCallbacks).each(function() {
                                    this(id);
                                });
                            });
                        }
                    });
                    aCallback();
                });
            }
            else {
                aCallback(status);
            }
        });
    };

    /** 
     * Method adds update listener which is fired after theme is changed. 
     * @method addStatusListener 
     * @param callback {function()} Callback to be invoked after theme is changed.
     * @return {Integer} ID that can be used for removal of status listener.
     */
    ThemeEngine.prototype.addStatusListener = function(callback) {
        this._reloadCallbacks.push(callback);
    };

    ThemeEngine.prototype._updateSelectedTheme = function () {
        var selectedTheme = Configuration.get(this.selectedThemeKey);

        for(var i = 0; i < this._themes.length; i++) {
            this._themes[i].selected = this._themes[i].id === Configuration.get(this.selectedThemeKey);
        }
    };

    /** 
     * Method executes callback method with array of available themes as parameter. 
     * @method getUserThemes 
     * @param callback {function(themes)} Callback with array of available themes.
     */
    ThemeEngine.prototype.getUserThemes = function(callback) {
        var self = this;
        window.setTimeout(function() {
            callback(self._themes);
        }, 200);
    };

     /** 
     * Method sets new user theme identified by theme ID in case that this theme isn't currently selected.
     * @method setUserTheme 
     * @param id {String} ID of theme that should be set.
     */
    ThemeEngine.prototype.setUserTheme = function(id) {
        var prevTheme = Configuration.get("selectedTheme");
        id = id || prevTheme;
        id = id ||  "http://com.intel.tizen/blue";

        if(prevTheme !== id) {
            Configuration.set(this.selectedThemeKey, id);
        }
    };

    /** 
     * Method returns information about one user theme identified by theme ID.
     * @method getSelectedTheme 
     * @param id {String} ID of theme that should be set.
     */
    ThemeEngine.prototype.getSelectedTheme = function() {
        for(var i = 0; i < this._themes.length; ++i) {
            if (this._themes[i].selected) {
                return this._themes[i];
            }
        }
        return null;
    };

    ThemeEngine.prototype._injectHeaders = function(id, callback) {
        callback = callback || function() {};
        var self = this;

        $(this._themes).each(function() {
            var theme = this;
            //remove all previous theme .js
            $('script[src="./common/css/user/' + theme._dir + '/user.js"]').remove();

            if (theme.id === id) {
                $("head > *").each(function() {
                    if ($(this).data("theme") === "user") {
                        $(this).remove();
                    }
                });

                $('<link data-theme="user" rel="stylesheet" href="./common/css/user/' + theme._dir + '/user.css" />').appendTo("head");

                loadScript('./common/css/user/' + theme._dir + '/user.js', function(aPath, aStatus) {
                    if (aStatus === "ok") {
                       callback(id);
                    }
                },true);
            }
        });
    };

    window.__themeengine = undefined === window.__themeengine ? new ThemeEngine() : window.__themeengine;
    return window.__themeengine;
})();
