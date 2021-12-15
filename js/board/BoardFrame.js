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
    './Block'
], function(boardFrameHtml, boardFrameCss, Component, Block) {
	'use strict';
    //========================================================================
    // Define Variable
    //========================================================================

	
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
            $('.vp-board-body').sortable({
                items: '> .vp-block',
                axis: 'y',
                scroll: true,
                revert: false,
                start: function(evt, ui) {
                    position = ui.item.index();
                },
                stop: function(evt, ui) {
                    var spos = position;
                    var epos = ui.item.index();

                    if (spos != epos && epos > -1) {
                        // move list element
                        parent.moveBlock(spos, epos);
                        // render block information
                        that.renderInfo();
                    }
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