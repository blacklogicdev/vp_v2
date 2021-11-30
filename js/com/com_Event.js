/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : com_Event.js
 *    Author          : Black Logic
 *    Note            : Manage global trigger events
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 10
 *    Change Date     :
 */

//============================================================================
// [CLASS] Event
//============================================================================
define([], function() {
	'use strict';

    //========================================================================
    // Declare Class
    //========================================================================
    class Event {

        constructor() {
            this._globalEvent = [
                { 
                    method: 'click', 
                    selector: '.vp-accordian', 
                    operation: (evt) => {
                        var target = evt.currentTarget;
                        var bodyTag = $(target).parent().find('.vp-accordian-box');
                        if ($(target).hasClass('open')) {
                            // open -> close
                            $(target).removeClass('open');
                            $(target).addClass('close');

                        } else {
                            // close -> open
                            $(target).removeClass('close');
                            $(target).addClass('open');
                        }
                    }
                }
            ]

            this._loadGlobalEvent();
        }

        _loadGlobalEvent() {
            var globalEvent = this._globalEvent;
            globalEvent.forEach(event => {
                let { method, selector, operation } = event;
                $(document).on(method, selector, operation);
            });
        }
    }

    return Event;
});

/* End of file */
