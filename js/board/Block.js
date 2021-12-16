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

        _getMenuGroupRootType() {
            // ex) visualpython - apps - frame
            let path = this.state.task.path;
            let pathList = path.split(' - ');
            return pathList[1];
        }

        _getMenuGroupType() {
            // ex) visualpython - apps - frame
            let path = this.state.task.path;
            let pathList = path.split(' - ');
            return pathList.slice(1, pathList.length - 1).join('-');
        }

        _init() {
            // temporary state
            this.state = {
                isGroup: true,
                leftHolderHeight: 0,
                depth: 0,
                blockNumber: $('.vp-block.vp-block-group').length + 1,
                ...this.state
            };

            // set block to component
            this.state.task.setTaskItem(this);
        }

        _bindEvent() {
            let that = this;
            // click event - emphasize TaskItem & open/hide PopupComponent
            $(this.wrapSelector()).on('click', function(evt) {
                let isSorting = $(this).hasClass('ui-sortable-helper');
                if (isSorting) {
                    return;
                }
                let isOpen = $(this).hasClass('vp-focus');
                if (isOpen) {
                    // hide task if it's already opened
                    // open task
                    $('#vp_wrapper').trigger({
                        type: 'close_option_page'
                    });
                } else {
                    // open task
                    $('#vp_wrapper').trigger({
                        type: 'open_option_page',
                        component: that.state.task
                    });
                }
                evt.stopPropagation();
            });
        }

        checkTaskAvailable() {
            return this.state.task != undefined;
        }

        /**
         * Generate template
         */
        template() {
            let blockType = this._getMenuGroupRootType();
            let headerName = this.state.task.name;
            let isGroup = this.state.isGroup;
            let depth = this.state.depth;
            let blockNumber = this.state.blockNumber;

            var page = new com_String();
            page.appendFormatLine('<div class="vp-block {0} {1}">', isGroup?'vp-block-group':'', blockType);
            page.appendFormatLine('<div class="vp-block-header">{0}</div>', headerName);
            page.appendFormatLine('<div class="vp-block-left-holder"></div>');
            page.appendFormatLine('<div class="vp-block-depth-info" style="{0}">{1}</div>', '', depth);
            page.appendFormatLine('<div class="vp-block-num-info" {0}>{1}</div>', isGroup?'':'style="display:none;"', blockNumber);
            page.appendLine('</div>');
            return page.toString();
        }

        render() {
            super.render();

            $(this.wrapSelector()).data('block', this);

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
        // Get Set methods
        //========================================================================
        get name() {
            return this.state.task.name;
        }
        get isGroup() {
            return this.state.isGroup;
        }
        get blockNumber() {
            return this.state.blockNumber;
        }
        get depth() {
            return this.state.depth;
        }
        /**
          * @param {int} blockNumber
          */
        setNumber(blockNumber) {
            this.state.blockNumber = blockNumber;
        }
        /**
          */
        setGroupBlock() {
            this.state.isGroup = true;
            this.state.depth = 0;
        }
        /**
         * Set block as child block of given block
         */
        setChildBlock(newDepth) {
            this.state.isGroup = false;
            this.state.depth = newDepth;
        }

        //========================================================================
        // Block load/save
        //========================================================================
        toJson() {

        }

        fromJson(jsonObject) {

        }
    }

    return Block;
});