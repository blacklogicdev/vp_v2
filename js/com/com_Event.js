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

        constructor(mainFrame) {
            this.mainFrame = mainFrame;

            var that = this;

            this._globalEvent = [
                { 
                    method: 'click', 
                    selector: '.vp-accordian', 
                    operation: (evt) => {
                        var target = evt.currentTarget;
                        var bodyTag = $(target).parent().find('.vp-accordian-box');
                        if ($(target).hasClass('vp-open')) {
                            // open -> close
                            $(target).removeClass('vp-open');
                            $(target).addClass('vp-close');

                        } else {
                            // close -> open
                            $(target).removeClass('vp-close');
                            $(target).addClass('vp-open');
                        }
                    }
                },
                {
                    method: 'open_option_page',
                    selector: '#vp_wrapper',
                    operation: (evt) => {
                        var target = evt.currentTarget;
                        // openType: newBlock/openBlock/... / menuItem: menu id / menuState: saved state
                        var { openType, menuId, menuState } = evt;
                        
                        that.mainFrame.openPopup(openType, menuId, menuState);

                    }
                },
                {
                    method: 'disable_vp_hotkey',
                    selector: '#vp_wrapper',
                    operation: (evt) => {
                        // TODO: disable vp hotkey
                    }
                },
                {
                    method: 'enable_vp_hotkey',
                    selector: '#vp_wrapper',
                    operation: (evt) => {
                        // TODO: enable vp hotkey
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
