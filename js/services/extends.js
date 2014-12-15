/*
 * Copyright (c) 2013, Intel Corporation, Jaguar Land Rover
 *
 * This program is licensed under the terms and conditions of the
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */

function _extends(d, b) {
    "use strict";
    if (Object.create) {
        if (b.prototype === null) {
            console.log(d);
        }
        d.prototype = Object.create(b.prototype);

        d.prototype.constructor = d;
        return;
    }

    function Extender() {
        this.constructor = d;
    }
    Extender.prototype = b.prototype;
    d.prototype = new Extender();
}
