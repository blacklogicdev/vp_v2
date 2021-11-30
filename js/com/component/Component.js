/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : Component.js
 *    Author          : Black Logic
 *    Note            : Base Components for rendering objects
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] Component
//============================================================================
define([
    '../com_util',
    '../com_Const',
    '../com_String'
], function(com_util, com_Const, com_String) {
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
    class Component {
        constructor($target, state, prop={}) {
            // get uuid
            this.uuid = com_util.getUUID();
            // target, pageDom query objects
            this.$target = $target;
            this.$pageDom = '';
            // save state
            this.state = state;
            // save propagation from parent
            this.prop = prop;

            this._bindEvent();
            this.render();
        }

        _wrapSelector(selector='') {
            var sbSelector = new com_String();
            var cnt = arguments.length;
            if (cnt < 2) {
                // if there's no more arguments
                sbSelector.appendFormat("#{0} .{1} {2}", VP_CONTAINER_ID, this.uuid, selector);
            } else {
                // if there's more arguments
                sbSelector.appendFormat("#{0} .{1}", VP_CONTAINER_ID, this.uuid);
                for (var idx = 0; idx < cnt; idx++) {
                    sbSelector.appendFormat(" {0}", arguments[idx]);
                }
            }
            return sbSelector.toString();
        }

        _bindEvent() {
            /** Implementation needed */
        }

        template() { 
            /** Implementation needed */
            return '';
        }

        render() {
            this.$pageDom = $(this.template());
            this.$target.append(this.$pageDom);
        }
    }

    return Component;

});

/* End of file */