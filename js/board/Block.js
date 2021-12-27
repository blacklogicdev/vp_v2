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

    const BLOCK_PADDING = 20;
	
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

        _getMenuGroupRootType(idx=1) {
            // ex) visualpython - apps - frame -> apps
            let path = this.state.task.path;
            let pathList = path.split(' - ');
            return pathList[idx];
        }

        _getMenuGroupType() {
            // ex) visualpython - apps - frame -> apps-frame
            let path = this.state.task.path;
            let pathList = path.split(' - ');
            return pathList.slice(1, pathList.length - 1).join('-');
        }

        _init() {
            this.state = {
                isGroup: true,
                leftHolderHeight: 0,
                depth: 0,
                blockNumber: $('.vp-block.vp-block-group').length + 1,
                ...this.state
            }

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
                    $(this).removeClass('vp-focus');
                    // close task
                    $('#vp_wrapper').trigger({
                        type: 'close_option_page'
                    });
                } else {
                    // open task
                    $('.vp-block').removeClass('vp-focus');
                    $(this).addClass('vp-focus');
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

        getColorLabel() {
            let root = this._getMenuGroupRootType();
            let label = root;
            switch(root) {
                case 'logic':
                    let subRoot = this._getMenuGroupRootType(2);
                    label = 'logic-' + subRoot;
                    break;
                case 'library':
                    break;
            }

            return label;
        }

        /**
         * Generate template
         */
        template() {
            let blockType = this.blockType;
            let taskId = this.id;
            let header = this.header;
            let isGroup = this.isGroup;
            let depth = this.depth;
            let blockNumber = this.blockNumber;

            var page = new com_String();
            page.appendFormatLine('<div class="vp-block {0} {1}" style="padding-left: {2}px">'
                                , isGroup?'vp-block-group':'', blockType, depth*BLOCK_PADDING);
            page.appendFormatLine('<div class="vp-block-header">{0}</div>', header);
            page.appendFormatLine('<div class="vp-block-left-holder"></div>');
            page.appendFormatLine('<div class="vp-block-depth-info" style="left: {0}px">{1}</div>'
                                , depth*BLOCK_PADDING + BLOCK_PADDING, depth);
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

            // if markdown, set its height to fit-content
            if (this.id == 'apps_markdown') {
                $(this.wrapSelector()).addClass('vp-block-markdown');
            }

            // if viewDepthNumber, show it
            let viewDepthNumber = this.prop.parent.state.viewDepthNumber;
            if (this.depth > 0 && viewDepthNumber) {
                $(this.wrapSelector('.vp-block-depth-info')).css({ opacity: 1 });
            }
        }

        show() {
            $(this.wrapSelector()).show();
        }

        hide() {
            $(this.wrapSelector()).hide();
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
        get id() {
            return this.task.id;
        }
        get name() {
            return this.task.name;
        }
        get blockType() {
            return this.getColorLabel();
        }
        get header() {
            let header = this.name;
            // if logic, show code
            if (this._getMenuGroupRootType() == 'logic') {
                header = this.task.generateCode();
            }
            if (this.id == 'apps_markdown') {
                header = this.task.getPreview();
            }
            this.state.header = header;
            return header;
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
        get popup() {
            return this.task;
        }
        getChildDepth() {
            let depth = this.depth;
            let innerList = [
                'lgDef_class', 'lgDef_def', 
                'lgCtrl_for', 'lgCtrl_while', 'lgCtrl_if', 'lgCtrl_try'
            ];
            if (innerList.includes(this.id)) {
                return depth + 1;
            }
            return depth;
        }
        getGroupedBlocks() {
            return this.prop.parent.getGroupedBlocks(this);
        }
        setHeader(text) {
            this.state.header = text;
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
            let jsonBlock = {
                isGroup: this.isGroup,
                depth: this.depth,
                blockNumber: this.blockNumber,
                taskId: this.id,
                taskState: this.task.getState()
            };
            return jsonBlock;
        }

        fromJson(jsonObject) {
            let {
                isGroup, depth, blockNumber, taskId, taskState
            } = obj;
            this.state = {
                isGroup: isGroup,
                depth: depth,
                blockNumber: blockNumber,
                ...taskState
            };
        }
    }

    return Block;
});