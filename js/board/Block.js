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
        constructor(parent, state) {
            super($('.vp-board-body'), state, { parent: parent });
            /**
             * state.task: PopupComponent
             * prop.parent : BoardFrame
             */
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
            // set block to component
            this.task = this.state.task;
            this.task.setTaskItem(this);
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
                        component: that.task
                    });
                }
                evt.stopPropagation();
            });
            // right click event - blockMenu
            $(this.wrapSelector()).on('contextmenu', function(evt) {
                that.prop.parent.showMenu(that, evt.pageX, evt.pageY);
                evt.preventDefault();
            });
        }

        checkTaskAvailable() {
            return this.task != undefined;
        }

        /**
         * Generate template
         */
        template() {
            let blockType = this._getMenuGroupRootType();
            let taskId = this.task.id;
            let header = this.task.name;
            let isGroup = this.task.state.isGroup;
            let depth = this.task.state.depth;
            let blockNumber = this.task.state.blockNumber;

            // if logic, show code
            if (blockType == 'logic') {
                header = this.task.generateCode();
            }

            var page = new com_String();
            page.appendFormatLine('<div class="vp-block {0} {1}">', isGroup?'vp-block-group':'', blockType);
            page.appendFormatLine('<div class="vp-block-header">{0}</div>', header);
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
            if (!this.task.isHidden()) {
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
            return this.task.name;
        }
        get isGroup() {
            return this.task.isGroup;
        }
        get blockNumber() {
            return this.task.state.blockNumber;
        }
        get depth() {
            return this.task.state.depth;
        }
        get popup() {
            return this.task;
        }
        /**
          * @param {int} blockNumber
          */
        setNumber(blockNumber) {
            this.task.state.blockNumber = blockNumber;
        }
        /**
          */
        setGroupBlock() {
            this.task.state.isGroup = true;
            this.task.state.depth = 0;
        }
        /**
         * Set block as child block of given block
         */
        setChildBlock(newDepth) {
            this.task.state.isGroup = false;
            this.task.state.depth = newDepth;
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