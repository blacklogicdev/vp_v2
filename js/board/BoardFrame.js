/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : BoardFrame.js
 *    Author          : Black Logic
 *    Note            : Render and load board frame
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 09. 13
 *    Change Date     :
 */

//============================================================================
// [CLASS] BoardFrame
//============================================================================
define([
    'text!../../html/boardFrame.html!strip',
    'css!../../css/boardFrame.css',
    '../com/component/Component',
    '../com/com_String',
    './Block'
], function(boardFrameHtml, boardFrameCss, Component, com_String, Block) {
	'use strict';
    //========================================================================
    // Define Variable
    //========================================================================
    const BLOCK_PADDING = 10;
	
    /**
     * BoardFrame
     */
     class BoardFrame extends Component{
        //========================================================================
        // Constructor
        //========================================================================
        constructor($target, state, prop) {
            super($target, state, prop);
            
            this._bindSortable();
        }

        //========================================================================
        // Internal call function
        //========================================================================
        _init() {
            // selected block
            this.selectedBlock = null;
            this.blockList = [];

            // state
            this.state = {
                viewDepthNumber: false
            }

            // temporary state
            this.tmpState = {
                copy: {
                    start: 0,
                    end: 0
                }
            }
        }

        _bindEvent() {
            let that = this;
            $('.vp-board-footer-buttons button').on('click', function() {
                let menu = $(this).data('menu');
                if (menu === 'code') {
                    // code
                    $('#vp_wrapper').trigger({
                        type: 'create_option_page',
                        blockType: 'block',
                        menuId: 'lgExe_code',
                        menuState: {},
                        background: true
                    });
                } else if (menu === 'text') {
                    // text
                    $('#vp_wrapper').trigger({
                        type: 'create_option_page',
                        blockType: 'block',
                        menuId: 'apps_markdown',
                        menuState: {},
                        background: true
                    });
                }
            });
        }

        _bindSortable() {
            let that = this;
            let parent = this.prop.parent;
            let position = -1;
            let parentBlock = null;
            let depth = 0;
            $('.vp-board-body').sortable({
                items: '> .vp-block',
                axis: 'y',
                scroll: true,
                revert: false,
                placeholder: {
                    element: function(currentItem) {
                        let block = currentItem.data('block');
                        if (block) {
                            let tag = new com_String();
                            tag.appendFormatLine('<div class="vp-block vp-block-group vp-sortable-placeholder {0}" style="z-index: 199;">', '');
                            tag.appendFormatLine('<div class="vp-block-header">{0}</div>', block.name);
                            tag.appendLine('</div>');
                            return tag.toString();
                        } else {
                            let header = currentItem.find('.vp-block-header').text();
                            let tag = new com_String();
                            tag.appendFormatLine('<div class="vp-block vp-block-group vp-sortable-placeholder {0}" style="z-index: 199;">', '');
                            tag.appendFormatLine('<div class="vp-block-header">{0}</div>', header);
                            tag.appendLine('</div>');
                            return tag.toString();
                        }
                    },
                    update: function(container, p) {
                        // container: container
                        // p: placeholder object
                        return;
                    }
                },
                start: function(evt, ui) {
                    position = ui.item.index();

                    // hide original item
                    ui.item.hide();
                },
                sort: function(evt, ui) {
                    let tmpPos = ui.placeholder.index();
                    let currCursorX = evt.clientX; 
                    let currCursorY = evt.clientY; 
                    let befBlockTag = $('.vp-block:not(.vp-draggable-helper):not(.vp-sortable-placeholder):nth('+(tmpPos - 1)+')');
                    if (befBlockTag && befBlockTag.length > 0) {
                        let befBlock = befBlockTag.data('block');
                        let rect = befBlockTag[0].getBoundingClientRect();
                        let befRange = rect.y + rect.height;
                        let befDepth = befBlock.depth;
                        if (currCursorY < befRange) {
                            parentBlock = befBlock;
                            depth = befDepth + 1;
                            ui.placeholder.removeClass('vp-block-group');
                            ui.placeholder.css({ 'padding-left': befDepth*BLOCK_PADDING + 'px'});
                        } else {
                            parentBlock = null;
                            if (!ui.placeholder.hasClass('vp-block-group')) {
                                ui.placeholder.addClass('vp-block-group');
                            }
                            ui.placeholder.css({ 'padding-left': 0});
                            depth = 0;
                        }

                    }
                },
                stop: function(evt, ui) {
                    var spos = position;
                    var epos = ui.item.index();

                    console.log('moves ', spos, epos);

                    if (spos != epos && epos > -1) {
                        // move list element
                        if (parentBlock) {
                            parent.moveBlock(spos, epos, parentBlock);
                            // reload block list
                            that.reloadBlockList();
                        } else {
                            parent.moveBlock(spos, epos);
                            // just render block information
                            that.renderInfo();
                        }
                    }

                    // show original item
                    ui.item.show();
                }
            }).disableSelection();
        }

        //========================================================================
        // External call function
        //========================================================================
        /**
         * Make template
         */
        template() {
            this.$pageDom = $(boardFrameHtml);
            return this.$pageDom;
        }

        /**
         * Render and load on parentDom, bind events
         */
        render() {
            super.render();

            // render taskBar
            this.renderBlockList([]);
        }

        /**
         * Render block list
         */
        renderBlockList(blockPopupList) {
            let that = this;
            let parent = this.prop.parent;
            $('.vp-board-body').html('');
            blockPopupList && blockPopupList.forEach(task => {
                let block = new Block($('.vp-board-body'), { task: task });
                that.blockList.push(block); 
            });
        }

        /**
         * Reload block list on the board
         */
        reloadBlockList() {
            let that = this;
            let parent = this.prop.parent;
            let num = 1;
            // init boardframe body
            $(this.wrapSelector('.vp-board-body')).html('');
            // render block list
            parent.blockPopupList.forEach(popup => {
                let taskItem = popup.taskItem;
                // if it's already rendered and block
                if (taskItem && taskItem instanceof Block) {
                    if (taskItem.isGroup) {
                        taskItem.setNumber(num++);
                    }
                    taskItem.render();
                } else {
                    let block = new Block($('.vp-board-body'), { task: popup, blockNumber: num++ });
                    popup.setTaskItem(block);
                    that.blockList.push(block);
                }
            })
        }

        renderInfo() {
            let num = 1;
            $('.vp-block.vp-block-group').each(function(i, block) {
                let numInfo = $(block).find('.vp-block-num-info');
                $(numInfo).html(num++);
            });
        }

        //========================================================================
        // Block control
        //========================================================================
        createBlock(component, state) {
            let prop = {
                addBlock: this.addBlock
            }
            let createdBlock = new Block($(this.wrapSelector('.vp-board-body'), state, prop));
            component.setTaskItem(createdBlock);

            return createdBlock;
        }

        addBlock(block, position, isGroup) {

        }

        removeBlock(block) {

        }

        moveBlock(block, isGroup, start, end) {

        }

        copyBlock(block) {
            // use tmpState.copy
        }

        //========================================================================
        // Block save/load
        //========================================================================
        blockToJson(blockList) {

        }

        jsonToBlock(jsonList) {

        }
    } // class

    return BoardFrame;
});
/* End of file */