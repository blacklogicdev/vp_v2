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
            this.useHotkey = true;

            var that = this;

            /** GLOBAL keyBoardManager */
            this._keyManager = {
                keyCode : {
                    ctrlKey: 17,
                    cmdKey: 91,
                    shiftKey: 16,
                    altKey: 18,
                    enter: 13,
                    escKey: 27,
                    vKey: 86,
                    cKey: 67
                },
                keyCheck : {
                    ctrlKey: false,
                    shiftKey: false
                }
            };

            this._globalEvent = [
                {
                    method: 'click focus',
                    selector: document,
                    operation: (evt) => {
                        var target = evt.target;
                        // Focus recognization
                        // blurred on popup frame
                        if ($('.vp-popup-frame').has(target).length <= 0) {
                            $('#vp_wrapper').trigger({
                                type: 'blur_option_page'
                            });
                        }
                        if (!$(target).hasClass('vp-close-on-blur')) {
                            $('.vp-close-on-blur').hide();
                        }
                    }
                },
                { 
                    method: 'click', 
                    selector: '.vp-accordian', 
                    operation: (evt) => {
                        var target = evt.currentTarget;
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
                    method: 'create_option_page',
                    selector: '#vp_wrapper',
                    operation: (evt) => {
                        // blockType: block/task / menuItem: menu id / menuState: saved state
                        // TODO: rearrange mechanism
                        var { blockType, menuId, menuState, background, position } = evt;
                        let dupTask = that.mainFrame.checkDuplicatedTask(menuId);
                        if (blockType == 'task' && dupTask) {
                            // if duplicated, open its task
                            that.mainFrame.openPopup(dupTask);
                        } else {
                            that.mainFrame.createPopup(blockType, menuId, menuState, background, position);
                        }
                    }
                },
                {
                    method: 'open_option_page',
                    selector: '#vp_wrapper',
                    operation: (evt) => {
                        var { component } = evt;
                        that.mainFrame.openPopup(component);
                    }
                },
                {
                    method: 'close_option_page',
                    selector: '#vp_wrapper',
                    operation: (evt) => {
                        var { component } = evt;
                        that.mainFrame.closePopup(component);
                    }
                },
                {
                    method: 'apply_option_page',
                    selector: '#vp_wrapper',
                    operation: (evt) => {
                        var { component } = evt;
                        that.mainFrame.applyPopup(component);
                    }
                },
                {
                    method: 'focus_option_page',
                    selector: '#vp_wrapper',
                    operation: (evt) => {
                        var { component } = evt;
                        that.mainFrame.focusPopup(component);
                    }
                },
                {
                    method: 'blur_option_page',
                    selector: '#vp_wrapper',
                    operation: (evt) => {
                        var { component } = evt;
                        that.mainFrame.blurPopup(component);
                    }
                },
                {
                    method: 'remove_option_page',
                    selector: '#vp_wrapper',
                    operation: (evt) => {
                        var { component } = evt;
                        that.mainFrame.removePopup(component);
                    }
                },
                {
                    method: 'disable_vp_hotkey',
                    selector: '#vp_wrapper',
                    operation: (evt) => {
                        // disable vp hotkey
                        that.disableHotkey();
                    }
                },
                {
                    method: 'enable_vp_hotkey',
                    selector: '#vp_wrapper',
                    operation: (evt) => {
                        // enable vp hotkey
                        that.enableHotkey();
                    }
                }
            ]

            this._keyEvent = [
                {
                    method: 'keyup',
                    selector: document,
                    operation: (evt) => {
                        if (evt.keyCode == this._keyManager.keyCode.escKey) {
                            // close popup on esc
                            $('#vp_wrapper').trigger({
                                type: 'close_option_page',
                                component: that.mainFrame.focusedPage
                            });
                        }
                    }
                }
            ]

            this._loadKeyEvent();
            this._loadGlobalEvent();
        }

        _loadGlobalEvent() {
            var globalEvent = this._globalEvent;
            globalEvent.forEach(event => {
                let { method, selector, operation } = event;
                $(document).on(method, selector, operation);
            });
        }

        _loadKeyEvent() {
            var keyEvent = this._keyEvent;
            keyEvent.forEach(event => {
                let { method, selector, operation } = event;
                $(document).on(method, operation);
            });
        }   

        enableHotkey() {
            this.useHotkey = true;
        }

        disableHotkey() {
            this.useHotkey = false;
        }
    }

    return Event;
});

/* End of file */
