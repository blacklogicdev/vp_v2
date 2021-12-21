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
    '../com/com_String',
    '../com/com_util',
    '../com/component/Component',
    '../com/component/FileNavigation',
    './Block',
    './BlockMenu'
], function(boardFrameHtml, boardFrameCss, com_String, com_util, Component, FileNavigation, Block, BlockMenu) {
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
            /*
             * prop.parent: MainFrame
             */
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
                boardTitle: 'Untitled',
                boardPath: null,
                copy: {
                    start: 0,
                    end: 0
                }
            }
        }

        _bindEvent() {
            let that = this;
            // board menu toggle button
            $(this.wrapSelector('.vp-board-header-button')).on('click', function() {
                $(that.wrapSelector('.vp-board-header-button-inner')).toggle();
            });
            // board menu button click
            $(this.wrapSelector('.vp-board-header-button-inner ul li')).on('click', function() {
                let menu = $(this).data('menu');
                switch (menu) {
                    case 'new':
                        that.createNewNote();
                        break;
                    case 'open':
                        that.openNote();
                        break;
                    case 'save':
                        that.saveNote();
                        break;
                    case 'save-as':
                        that.saveAsNote();
                        break;
                    case 'run-all':
                        that.runAll();
                        break;
                    case 'view-depth':
                        that.viewDepthInfo();
                        break;
                    case 'clear':
                        that.clearBoard();
                        break;
                    case 'close':
                        that.closeBoard();
                        break;
                }
            });
            // footer +code, +text button
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
            // change of boardTitle
            $(this.wrapSelector('#vp_boardTitle')).on('change', function() {
                let fileName = $(this).val();
                that.tmpState.boardTitle = fileName;
                that.tmpState.boardPath = null;
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
            return boardFrameHtml;
        }

        /**
         * Render and load on parentDom, bind events
         */
        render() {
            super.render();

            // render taskBar
            this.renderBlockList([]);
            this._bindSortable();

            this.blockMenu = new BlockMenu(this);
        }

        /**
         * Render block list
         */
        renderBlockList(blockPopupList) {
            let that = this;
            let parent = this.prop.parent;
            $('.vp-board-body').html('');
            blockPopupList && blockPopupList.forEach(task => {
                let block = new Block(this, { task: task });
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
                    let block = new Block(this, { task: popup, blockNumber: num++ });
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
        // Note control
        //========================================================================
        createNewNote() {
            // TODO: alert before closing

            // clear board before create new note
            this.clearBoard();

            // set title to Untitled
            this.tmpState.boardTitle = 'Untitled';
            // set path to empty
            this.tmpState.boardPath = null;

            // set title
            $(this.wrapSelector('#vp_boardTitle')).val('Untitled');
        }
        openNote() {
            // TODO: check save as

            let that = this;
            // open file navigation
            let fileNavi = new FileNavigation({ 
                type: 'open',
                extensions: ['vp'],
                finish: function(filesPath, status, error) {
                    // clear board before open note
                    this.clearBoard();
                    
                    let vpFilePath = filesPath[0].path;
                    let vpFileName = filesPath[0].file;
                    // read file
                    fetch(vpFilePath).then(function(file) {
                        if (file.status != 200) {
                            com_util.renderAlertModal('The file format is not valid. (file: '+file+')');
                            return;
                        }
                
                        file.text().then(function(data) {
                            // var parsedData = decodeURIComponent(data);
                            var jsonList = JSON.parse(data);
                            console.log('jsonList', jsonList);
                            // load blocks
                            that.jsonToBlock(jsonList);

                            var indexVp = vpFileName.indexOf('.vp');
                            var saveFileName = vpFileName.slice(0,indexVp);
            
                            // show title of board and path
                            $('#vp_boardTitle').val(saveFileName);
                            that.tmpState.boardTitle = saveFileName;
                            that.tmpState.boardPath = vpFilePath;

                            com_util.renderSuccessMessage('Successfully opened file. (' + vpFileName + ')');
                        });
                    });
                }
            });
            fileNavi.open();
        }
        saveNote() {
            let { boardPath, boardTitle } = this.tmpState;
            // if path exists, save note
            if (boardPath && boardPath != '') {
                // save vp file
                let idx = boardTitle.lastIndexOf('.vp');
                if (idx < 0) {
                    boardTitle += '.vp';
                }
                let saveData = this.blockToJson(this.blockList);
                let saveDataStr = JSON.stringify(saveData);
                console.log('saveData', saveDataStr);
                vpKernel.saveFile(boardTitle, boardPath, saveDataStr);
                return;
            }

            this.saveAsNote();
        }
        saveAsNote() {
            let that = this;
            // save file navigation
            let fileNavi = new FileNavigation({ 
                type: 'save',
                fileName: this.tmpState.boardTitle,
                extensions: ['vp'],
                finish: function(filesPath, status, error) {
                    let boardTitle = filesPath[0].file;
                    let boardPath = filesPath[0].path;
                    if (boardPath == '') {
                        boardPath = '.';
                    }
                    boardPath += '/';

                    // save vp file
                    let saveData = that.blockToJson(that.blockList);
                    let saveDataStr = JSON.stringify(saveData);
                    console.log('saveData', saveDataStr);
                    vpKernel.saveFile(boardTitle, boardPath, saveDataStr);

                    // save it in tmpState
                    // detach extension
                    let idx = boardTitle.lastIndexOf('.vp');
                    boardTitle = boardTitle.substring(0, idx);
                    that.tmpState.boardTitle = boardTitle;
                    that.tmpState.boardPath = boardPath;
                }
            });
            fileNavi.open();
        }
        runAll() {
            this.blockList.forEach(block => {
                block.popup.run();
            })
        }
        viewDepthInfo() {
            this.state.viewDepthNumber = true;
        }
        clearBoard() {
            // TODO: alert before clearing
            let that = this;

            // clear board
            this.blockList.forEach(block => {
                that.removeBlock(block);
            })
            this.blockList = [];
        }
        closeBoard() {
            this.createNewNote();
        }
        //========================================================================
        // Block control
        //========================================================================
        createBlock(component, state) {
            let createdBlock = new Block(this, state);
            component.setTaskItem(createdBlock);

            return createdBlock;
        }

        addBlock(block, position, isGroup) {

        }

        removeBlock(block) {
            $('#vp_wrapper').trigger({
                type: 'remove_option_page',
                component: block.popup
            });
        }

        moveBlock(block, isGroup, start, end) {

        }

        copyBlock(block) {
            // use tmpState.copy
            // TODO: copy block 
        }

        showMenu(block, left, top) {
            this.blockMenu.open(block, left, top);
        }

        //========================================================================
        // Block save/load
        //========================================================================
        blockToJson(blockList) {
            let result = [];
            blockList && blockList.forEach(block => {
                let task = block.task;
                let jsonBlock = {
                    isGroup: block.isGroup,
                    depth: block.depth,
                    blockNumber: block.blockNumber,
                    taskId: task.id,
                    taskState: task.getState()
                };
                result.push(jsonBlock);
            });
            return result;
        }

        jsonToBlock(jsonList) {
            let parent = this.prop.parent;
            jsonList && jsonList.forEach((obj, idx) => {
                let {
                    isGroup, depth, blockNumber, taskId, taskState
                } = obj;
                let state = {
                    isGroup: isGroup,
                    depth: depth,
                    blockNumber: blockNumber,
                    ...taskState
                };
                parent.createPopup('block', taskId, state, true, idx);
            });
        }
    } // class

    return BoardFrame;
});
/* End of file */