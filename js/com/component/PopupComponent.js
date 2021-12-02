/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : PopupComponent.js
 *    Author          : Black Logic
 *    Note            : Popup Components for rendering objects
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] PopupComponent
//============================================================================
define([
    'text!vp_base/html/popupComponent.html!strip',
    'css!vp_base/css/popupComponent.css',
    '../com_util',
    '../com_Const',
    '../com_String',
    './Component'
], function(popupComponentHtml, popupComponentCss, com_util, com_Const, com_String, Component) {
    'use strict';

    //========================================================================
    // Declare variables
    //========================================================================
    const {
        VP_CONTAINER_ID
    } = com_Const;

    //========================================================================
    // Declare class
    //========================================================================
    /**
     * Component
     */
    class PopupComponent extends Component {
        constructor(state={}, prop={}) {
            super($('body'), state, prop);
            
            this._bindDraggable();
        }

        _wrapSelector(selector='') {
            var sbSelector = new com_String();
            var cnt = arguments.length;
            if (cnt < 2) {
                // if there's no more arguments
                sbSelector.appendFormat(".{0} {1}", this.uuid, selector);
            } else {
                // if there's more arguments
                sbSelector.appendFormat(".{0}", this.uuid);
                for (var idx = 0; idx < cnt; idx++) {
                    sbSelector.appendFormat(" {0}", arguments[idx]);
                }
            }
            return sbSelector.toString();
        }

        _bindEvent() {
            var that = this;
            this.$target.on('click', function(evt) {
                var target = evt.target;
                // close operation
                if ($(that._wrapSelector('.vp-popup-close')).get(0) == target 
                || $(that._wrapSelector('.vp-popup-cancel-button')).get(0) == target) {
                    // close popup
                    that.close();
                }
            });
        }

        _bindDraggable() {
            $('.' + this.uuid).draggable({
                handle: '.vp-popup-title'
            });
        }

        template() { 
            /** Implementation needed */
            this.$pageDom = $(popupComponentHtml);
            // set title
            this.$pageDom.find('.vp-popup-title').text(this.state.config.name);
            return this.$pageDom;
        }

        render() {
            super.render();
        }

        /**
         * Open popup
         */
        open() {
            vpLog.display(VP_LOG_TYPE.DEVELOP, 'open popup', this);
            $('.' + this.uuid).show();
        }

        /**
         * minimize and maximize
         */
        toggle() {

        }

        /**
         * Close popup
         * - remove popup
         * - unbind event
         */
        close() {
            vpLog.display(VP_LOG_TYPE.DEVELOP, 'close popup', this);
            $('.' + this.uuid).remove();
        }
    }

    return PopupComponent;

});

/* End of file */