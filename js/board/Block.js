/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : Block.js
 *    Author          : Black Logic
 *    Note            : Render block
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 09. 13
 *    Change Date     :
 */

//============================================================================
// [CLASS] Block
//============================================================================
define([
    '../com/component/Component',
    '../com/com_String'
], function(Component, com_String) {
	'use strict';
	
    /**
     * @class Block
     * @constructor
     */
     class Block extends Component {
        constructor($target, state, prop) {
            super($target, state, prop);
        }

        _init() {
            // temporary state
            this.tmpState = {
                leftHolderHeight: 0,
                depth: 0,
                blockNumber: $('.vp-block.vp-block-group').length + 1
            };

            // set block to component
            this.state.task.setTaskItem(this);
        }

        _bindEvent() {
            let that = this;
            // click event - emphasize TaskItem & open/hide PopupComponent
            $(this.wrapSelector()).on('click', function(evt) {
                let isOpen = $(that.wrapSelector()).hasClass('vp-focus');
                if (isOpen) {
                    // hide task if it's already opened
                    // open task
                    $('#vp_wrapper').trigger({
                        type: 'blur_option_page'
                    });
                } else {
                    // open task
                    $('#vp_wrapper').trigger({
                        type: 'focus_option_page',
                        component: that.state.task
                    });
                }
                evt.stopPropagation();
            });
        }

        /**
         * Generate template
         */
        template() {
            return Block.getTemplate(this.state.task.name, this.tmpState.depth, this.tmpState.blockNumber);
        }

        render() {
            super.render();

            // emphasize it if its task is visible
            if (!this.state.task.isHidden()) {
                this.$target.find('.vp-menu-task-item').removeClass('vp-focus');
                $(this.wrapSelector()).addClass('vp-focus');
            }
        }

        focusItem() {
            this.$target.find('.vp-menu-task-item').removeClass('vp-focus');
            $(this.wrapSelector()).addClass('vp-focus');
        }

        blurItem() {
            // hide task if it's already opened
            $(this.wrapSelector()).removeClass('vp-focus');
        }

        removeItem() {
            $(this.wrapSelector()).remove();
        }

        //========================================================================
        // Block load/save
        //========================================================================
        toJson() {

        }

        fromJson(jsonObject) {

        }
    }

    Block.getTemplate = function(header, depth=0, index=0) {
        var page = new com_String();
        page.appendLine('<div class="vp-block vp-block-group">');
        page.appendFormatLine('<div class="vp-block-header">{0}</div>', header);
        page.appendFormatLine('<div class="vp-block-left-holder"></div>');
        page.appendFormatLine('<div class="vp-block-depth-info">{0}</div>', depth);
        page.appendFormatLine('<div class="vp-block-num-info">{0}</div>', index);
        page.appendLine('</div>');
        return page.toString();
    }

    return Block;
});