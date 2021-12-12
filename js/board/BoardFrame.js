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
    'css!../../css/boardFrame.css'
], function(boardFrameHtml, boardFrameCss) {
	'use strict';
    //========================================================================
    // Define Variable
    //========================================================================

	
    /**
     * BoardFrame
     */
     class BoardFrame {
        //========================================================================
        // Constructor
        //========================================================================
        constructor($target) {
            this.$target = $target;
            this.$pageDom = null;

            // block list
            this.blockList = [];
            // group block list
            this.groupBlockList = [];
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

            this._bindEvent();
            this.render();
        }

        //========================================================================
        // Internal call function
        //========================================================================
        _bindEvent() {
            this.$target.on('click', function(evt) {
                // TEST: target id click event
                if (evt.target.id == 'sampleId') {
                    
                }

                // TEST: target class click event
                if ($(evt.target).hasClass('sample-class')) {
                    
                }
            });
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
        }

        /**
         * Render block list
         */
        renderBlockList() {

        }

        /**
         * Reload block list on the board
         */
        reloadBlockList() {
            
        }

        //========================================================================
        // Block control
        //========================================================================
        createBlock() {
            
        }

        addBlock(block, isGroup, position) {

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