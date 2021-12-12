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
            
        }

        _bindSortable() {
            let that = this;
            let parent = this.prop.parent;
            let position = -1;
            $('.vp-board-body').sortable({
                items: '> .vp-block',
                axis: 'y',
                scroll: true,
                start: function(evt, ui) {
                    position = ui.item.index();
                },
                stop: function(evt, ui) {
                    var spos = position;
                    var epos = ui.item.index();

                    // move list element
                    parent.moveBlock(spos, epos);
                    // render block information
                    that.renderInfo();
                }
            });
            $('.vp-board-body').disableSelection();
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
            this.$target.append(this.template());

            // render taskBar
            this.renderBlockList([]);
        }

        /**
         * Render block list
         */
        renderBlockList(blockList) {
            $('.vp-board-body').html('');
            blockList && blockList.forEach(task => {
                let block = new Block($('.vp-board-body'), { task: task });
            });
        }

        /**
         * Reload block list on the board
         */
        reloadBlockList() {
            
        }

        renderInfo() {
            let num = 1;
            $('.vp-block').each(function(i, block) {
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