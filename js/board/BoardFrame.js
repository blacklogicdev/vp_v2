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
    '../com/com_Config',
    '../com/com_String',
    '../com/com_util',
    '../com/com_interface',
    '../com/component/Component',
    '../com/component/FileNavigation',
    './Block',
    './BlockMenu'
], function(boardFrameHtml, boardFrameCss, com_Config, com_String, com_util, com_interface, Component, FileNavigation, Block, BlockMenu) {
	'use strict';
    //========================================================================
    // Define Variable
    //========================================================================
    const BLOCK_PADDING = 20;
	
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
             * state.vp_note_display
             * state.vp_note_width
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
                vp_note_display: true,
                viewDepthNumber: false,
                indentCount: 4,
                ...this.state
            };

            // temporary state
            this.tmpState = {
                boardTitle: 'Untitled',
                boardPath: null,
                copy: {
                    start: 0,
                    end: 0
                }
            }

            this.headBlocks = ['lgCtrl_if', 'lgCtrl_for', 'lgCtrl_try'];
            this.subBlocks = ['lgCtrl_elif', 'lgCtrl_else', 'lgCtrl_except', 'lgCtrl_finally'];
        }

        _bindEvent() {
            let that = this;
            // board menu toggle button
            $(this.wrapSelector('.vp-board-header-button')).on('click', function(evt) {
                $(that.wrapSelector('.vp-board-header-button-inner')).toggle();
                evt.stopPropagation();
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
                        menuState: {}
                    });
                } else if (menu === 'text') {
                    // text
                    $('#vp_wrapper').trigger({
                        type: 'create_option_page',
                        blockType: 'block',
                        menuId: 'apps_markdown',
                        menuState: {}
                    });
                }
            });
            // change of boardTitle
            $(this.wrapSelector('#vp_boardTitle')).on('change', function() {
                let fileName = $(this).val();
                that.tmpState.boardTitle = fileName;
                that.tmpState.boardPath = null;
            });
            // click board - blur block
            $(this.wrapSelector()).on('click', function() {
                that.blurAllblock();
            });
        }

        _bindSortable() {
            let that = this;
            let parent = this.prop.parent;
            let position = -1;
            let targetBlock = null;
            let targetId = '';
            let groupedBlocks = null;
            let parentBlock = null;
            let depth = 0;
            let revert = false;
            $('.vp-board-body').sortable({
                items: '> .vp-block',
                axis: 'y',
                scroll: true,
                revert: false,
                cursor: 'move',
                handle: '.vp-block-header',
                helper: function(evt, currentItem) {
                    let header = currentItem.data('name');
                    let tag = new com_String();
                    tag.appendLine('<div class="vp-sortable-helper" style="z-index: 199;">');
                    tag.appendFormatLine('<div>{0}</div>', header);
                    tag.appendLine('</div>');
                    return tag.toString();
                },
                placeholder: {
                    element: function(currentItem) {
                        let block = currentItem.data('block');
                        let color = currentItem.data('color');
                        targetId = currentItem.data('menu');
                        if (block) {
                            let tag = new com_String();
                            tag.appendFormatLine('<div class="vp-block vp-block-group vp-sortable-placeholder {0}" style="z-index: 199;">', block.getColorLabel());
                            tag.appendFormatLine('<div class="vp-block-header">{0}</div>', block.name);
                            tag.appendLine('</div>');
                            return tag.toString();
                        } else {
                            let header = currentItem.find('.vp-block-header').text();
                            let tag = new com_String();
                            tag.appendFormatLine('<div class="vp-block vp-block-group vp-sortable-placeholder {0}" style="z-index: 199;">', color);
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
                    targetBlock = that.blockList[position];
                    if (targetBlock) {
                        if (targetBlock.isSubBlock) {
                            revert = true;
                            return;
                        }
                        // hide grouped item
                        groupedBlocks = targetBlock.getGroupedBlocks();
                        groupedBlocks.forEach(block => {
                            block.hide();
                        });
                    } else {
                        // hide original item
                        ui.item.hide();
                    }
                },
                sort: function(evt, ui) {
                    let tmpPos = ui.placeholder.index();
                    let currCursorX = evt.clientX; 
                    let currCursorY = evt.clientY; 

                    if (position < tmpPos && groupedBlocks) {
                        tmpPos += (1 - groupedBlocks.length);
                    }

                    // sorting is not allowed for sub blocks (elif, else, except, finally)
                    if (revert) {
                        ui.placeholder.removeClass('vp-block-group');
                        ui.placeholder.insertAfter($('.vp-block:not(.vp-draggable-helper):not(.vp-sortable-placeholder):nth('+(position - 1)+')'));
                        return;
                    }

                    let befBlockTag = $('.vp-block:not(.vp-draggable-helper):not(.vp-sortable-placeholder):nth('+(tmpPos - 1)+')');
                    if (befBlockTag && befBlockTag.length > 0) {
                        let befBlock = befBlockTag.data('block');
                        let befGroupBlock = befBlock.getGroupBlock();
                        let rect = befBlockTag[0].getBoundingClientRect();
                        let befStart = rect.y;
                        let befRange = rect.y + rect.height;
                        let befGroupRange = befRange + (rect.height/2);
                        let befDepth = befBlock.getChildDepth();
                        
                        let isMarkdown = false; // if befBlock or thisBlock is markdown
                        // check if thisBlock is markdown block or befBlock is markdown block
                        if (targetId == 'apps_markdown' || (befBlock && befBlock.id == 'apps_markdown')) {
                            isMarkdown = true;
                        }
                        
                        if (isMarkdown) {
                            let befGroupedBlocks = befGroupBlock.getGroupedBlocks();
                            let befGroupLastBlock = befGroupedBlocks[befGroupedBlocks.length - 1]; // last block of previous group
                            if (!befBlock.equals(befGroupLastBlock)) {
                                ui.placeholder.insertAfter(befGroupLastBlock.getTag());
                                return;
                            }
                        }

                        if (!isMarkdown) {
                            if (befBlock.isSubBlock || (befStart < currCursorY && currCursorY < befRange)) {
                                // sort as child of befBlock (except Markdown)
                                // - if befBlock is subBlock, no group block is allowed
                                parentBlock = befBlock;
                                depth = befDepth;
                                ui.placeholder.removeClass('vp-block-group');
                                ui.placeholder.css({ 'padding-left': depth*BLOCK_PADDING + 'px'});
                                return;
                            }
                            if (befRange <= currCursorY && currCursorY < befGroupRange) {
                                // sort as child of befGroupBlock (except Markdown)
                                parentBlock = befGroupBlock;
                                depth = befGroupBlock.getChildDepth();
                                ui.placeholder.removeClass('vp-block-group');
                                ui.placeholder.css({ 'padding-left': depth*BLOCK_PADDING + 'px'});
                                return;
                            }
                        }
                        // sort after befBlock
                        parentBlock = null;
                        if (!ui.placeholder.hasClass('vp-block-group')) {
                            ui.placeholder.addClass('vp-block-group');
                        }
                        ui.placeholder.css({ 'padding-left': 0});
                        depth = 0;
                    }
                },
                stop: function(evt, ui) {
                    var spos = position;
                    var epos = ui.item.index();

                    if (revert) {
                        revert = false;
                        return;
                    }

                    if (spos < epos && groupedBlocks) {
                        epos += (1 - groupedBlocks.length);
                    }

                    if (epos > -1) {
                        // move list element
                        if (parentBlock) {
                            that.moveBlock(spos, epos, parentBlock);
                        } else {
                            that.moveBlock(spos, epos);
                        }
                    }

                    if (targetBlock && groupedBlocks) {
                        // show grouped block
                        groupedBlocks.forEach(block => {
                            block.show();
                        });
                    } else {
                        // show original item
                        ui.item.show();
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
            return boardFrameHtml;
        }

        /**
         * Render and load on parentDom, bind events
         */
        render() {
            super.render();

            // display note
            if (!this.state.vp_note_display) {
                this.hide();
            }

            // set width using metadata
            $(this.wrapSelector()).width(this.state.vp_note_width);

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
            let num = 1;
            // init boardframe body
            $(this.wrapSelector('.vp-board-body')).html('');
            // render block list
            this.blockList.forEach(block => {
                // if it's already rendered and block
                if (block && block instanceof Block) {
                    if (block.isGroup) {
                        block.setNumber(num++);
                    }
                    block.render();
                }
            })
            this.renderInfo();
        }

        renderInfo() {
            let num = 1;
            $('.vp-block.vp-block-group').each(function(i, block) {
                let numInfo = $(block).find('.vp-block-num-info');
                $(numInfo).html(num++);
            });
        }

        show() {
            // show note area
            $(this.wrapSelector()).show();
            $('#vp_toggleBoard').removeClass('vp-hide');
            // set width 
            let boardWidth = com_Config.BOARD_MIN_WIDTH;
            $(this.wrapSelector()).width(boardWidth);
            // save as metadata
            vpConfig.setMetadata({ vp_note_display: true, vp_note_width: boardWidth });
        }
        
        hide() {
            // hide note area
            $(this.wrapSelector()).hide();
            if (!$('#vp_toggleBoard').hasClass('vp-hide')) {
                $('#vp_toggleBoard').addClass('vp-hide');
            }
            // set width
            let boardWidth = 0;
            $(this.wrapSelector()).width(boardWidth);
            // save as metadata
            vpConfig.setMetadata({ vp_note_display: false, vp_note_width: boardWidth });
        }
        
        showLoadingBar() {
            $(this.wrapSelector('#vp_boardLoading')).show();
        }

        hideLoadingBar() {
            $(this.wrapSelector('#vp_boardLoading')).hide();
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
                    that.clearBoard();
                    
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

                    // save vp file
                    let saveData = that.blockToJson(that.blockList);
                    let saveDataStr = JSON.stringify(saveData);
                    vpKernel.saveFile(boardTitle, boardPath, saveDataStr);

                    // save it in tmpState
                    // detach extension
                    let idx = boardTitle.lastIndexOf('.vp');
                    boardTitle = boardTitle.substring(0, idx);
                    that.tmpState.boardTitle = boardTitle;
                    that.tmpState.boardPath = boardPath;
                    $('#vp_boardTitle').val(boardTitle);
                }
            });
            fileNavi.open();
        }
        runBlock(block, execute=true) {
            if (block.id == 'apps_markdown') {
                // if markdown, run single
                block.popup.run();
                return;
            }
            let groupedBlocks = block.getGroupedBlocks();
            let code = new com_String();
            let indentCount = this.state.indentCount;
            groupedBlocks.forEach((groupBlock, idx) => {
                let prevNewLine = idx > 0?'\n':'';
                let indent = ' '.repeat(groupBlock.depth * indentCount);
                code.appendFormat('{0}{1}{2}', prevNewLine, indent, groupBlock.popup.generateCode());
            });
            com_interface.insertCell('code', code.toString(), execute, block.blockNumber);
        }
        runAll() {
            let that = this;
            this.blockList.forEach(block => {
                if (block.isGroup) {
                    that.runBlock(block);
                }
            })
        }
        viewDepthInfo() {
            this.state.viewDepthNumber = !this.state.viewDepthNumber;

            if (this.state.viewDepthNumber) {
                $(this.wrapSelector('.vp-board-header-button-inner li[data-menu="view-depth"]')).text('Hide Depth Number');
            } else {
                $(this.wrapSelector('.vp-board-header-button-inner li[data-menu="view-depth"]')).text('View Depth Number');
            }

            // reloadBlockList
            this.reloadBlockList();
        }
        clearBoard() {
            // TODO: alert before clearing
            let that = this;

            // clear board
            this.blockList.forEach(block => {
                block.popup.remove();
            })
            this.blockList = [];
            // render block list  
            this.reloadBlockList();
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

        addBlock(option, position=-1, blockState={}) {
            let block = new Block(this, { task: option, ...blockState });
            option.setTaskItem(block);
            if (position < 0) {
                // add to the end
                this.blockList.push(block);
                position = this.blockList.length;
            } else {
                // add to specific position
                this.blockList.splice(position, 0, block);
            }
            return block;
        }

        removeBlock(blockToRemove) {
            let that = this;
            // if sub block, change group block's state
            let groupBlock = blockToRemove.getGroupBlock();
            if (blockToRemove.id === 'lgCtrl_else') {
                groupBlock.state.elseFlag = false;
            }
            if (blockToRemove.id === 'lgCtrl_finally') {
                groupBlock.state.finallyFlag = false;
            }

            // remove grouped blocks (under this depth)
            let groupedBlocks = blockToRemove.getGroupedBlocks();
            groupedBlocks.forEach(block => {
                // remove block
                if (blockToRemove.isGroup || blockToRemove.equals(block) || block.depth > blockToRemove.depth) {
                    const blockIdx = that.blockList.indexOf(block);
                    block.popup.remove();
                    that.blockList.splice(blockIdx, 1);
                }
            });
            // render block list  
            this.reloadBlockList();
        }

        /**
         * Change position of task in  blockPopupList
         * @param {int} startIdx 
         * @param {int} endIdx 
         */
        moveBlock(startIdx, endIdx, parentBlock=null) {
            var movingBlock = this.blockList[startIdx];
            if (movingBlock) {
                let groupBlocks = this.getGroupedBlocks(movingBlock);
                this.blockList.splice(startIdx, groupBlocks.length);
                this.blockList.splice(endIdx, 0, ...groupBlocks);
                // move tag
                if (parentBlock != null) {
                    // set this movingBlock as child of parentBlock
                    movingBlock.setChildBlock(parentBlock.getChildDepth());
                } else {
                    // set group block
                    movingBlock.setGroupBlock();
                }
                this.reloadBlockList();
            }
        }

        copyBlock(block) {
            const blockIdx = this.blockList.indexOf(block);
            let groupedBlocks = block.getGroupedBlocks();
            let dupPosition = blockIdx + groupedBlocks.length;
            let groupedBlockStateList = [];
            groupedBlocks.forEach((groupBlock, idx) => {
                let menuId = groupBlock.id;
                let popupState = groupBlock.popup.state;
                groupedBlockStateList.push({
                    blockType: 'block',
                    menuId: menuId,
                    menuState: { 
                        taskState: JSON.parse(JSON.stringify(popupState)),
                        blockState: {
                            isGroup: groupBlock.isGroup,
                            depth: groupBlock.depth
                        }
                    },
                    position: dupPosition + idx,
                    createChild: false
                });
            });
            this.prop.parent.createPopup(groupedBlockStateList);
        }

        showMenu(block, left, top) {
            this.blockMenu.open(block, left, top);
        }

        getGroupedBlocks(parentBlock) {
            const parentIdx = this.blockList.indexOf(parentBlock);
            let nextGroupIdx = parentIdx + 1;
            if (parentBlock.canMakeChild()) {
                while (nextGroupIdx < this.blockList.length) {
                    let block = this.blockList[nextGroupIdx];
                    let isGroup = block.isGroup;
                    if (isGroup) {
                        // find next group block
                        break;
                    }
                    let isSubBlock = (this.headBlocks.includes(parentBlock.id) && block.depth == parentBlock.depth && this.subBlocks.includes(block.id));
                    if (!parentBlock.isGroup && !isSubBlock && block.depth <= parentBlock.depth) {
                        break;
                    }
                    nextGroupIdx++;
                }
            }
            // grouped blocks (include this parentBlock)
            let groupedBlocks = this.blockList.slice(parentIdx, nextGroupIdx);
            return groupedBlocks;
        }

        getGroupBlock(thisBlock) {
            if (thisBlock.isGroup) {
                return thisBlock;
            }

            let groupBlockIdx = this.blockList.indexOf(thisBlock) - 1;
            while (groupBlockIdx > 0) {
                if (this.blockList[groupBlockIdx].isGroup) {
                    break;
                }
                groupBlockIdx--;
            }
            return this.blockList[groupBlockIdx];
        }

        blurAllblock() {
            this.blockList.forEach(block => {
                block.blurItem();
            });
        }

        scrollToBlock(block) {
            $(this.wrapSelector('#vp_boardBody')).animate({scrollTop: $(block.getTag()).position().top}, "fast");
        }
        //========================================================================
        // Block sub block control
        //========================================================================
        checkFlag(block) {
            let groupedBlocks = block.getGroupedBlocks();
            let elseBlock = groupedBlocks.filter(obj => (obj.id === 'lgCtrl_else' && obj.depth === block.depth));
            let finallyBlock = groupedBlocks.find(obj => (obj.id === 'lgCtrl_finally' && obj.depth === block.depth));
            block.state.elseFlag = elseBlock!=undefined?true:false;
            block.state.finallyFlag = finallyBlock!=undefined?true:false;
        }
        toggleElseBlock(block) {
            const blockIdx = this.blockList.indexOf(block);
            let groupedBlocks = block.getGroupedBlocks();
            let position = blockIdx + groupedBlocks.length; // add position
            // check if it has else block
            let elseFlag = block.state.elseFlag;
            if (!elseFlag) {
                // if finally is available, change add position
                if (block.state.finallyFlag) {
                    let finallyBlock = groupedBlocks.find(obj => (obj.id === 'lgCtrl_finally' && obj.depth === block.depth));
                    let finallyPosition = this.blockList.indexOf(finallyBlock);
                    position = finallyPosition;
                }
                // add else
                let blockState = {
                    isGroup: false,
                    depth: block.depth
                }
                this.prop.parent.createPopup([{ 
                    blockType: 'block', 
                    menuId: 'lgCtrl_else', 
                    menuState: { blockState: blockState }, 
                    position: position
                }]);
                block.state.elseFlag = true;
                setTimeout(function() {
                    block.focusItem();
                }, 100);
            } else {
                // remove else
                let elseBlock = groupedBlocks.filter(obj => (obj.id === 'lgCtrl_else' && obj.depth === block.depth));
                if (elseBlock.length > 0) {
                    this.removeBlock(elseBlock[0]);
                }
            }
        }

        toggleFinallyBlock(block) {
            const blockIdx = this.blockList.indexOf(block);
            let groupedBlocks = block.getGroupedBlocks();
            let position = blockIdx + groupedBlocks.length; // add position
            
            // check if it has finally block
            let finallyFlag = block.state.finallyFlag;
            if (!finallyFlag) {
                // add finally
                let blockState = {
                    isGroup: false,
                    depth: block.depth
                }
                this.prop.parent.createPopup([{
                    blockType: 'block', 
                    menuId: 'lgCtrl_finally', 
                    menuState: { blockState: blockState }, 
                    position: position
                }]);
                block.state.finallyFlag = true;
                setTimeout(function() {
                    block.focusItem();
                }, 100);
            } else {
                // remove finally
                let finallyBlock = groupedBlocks.find(obj => (obj.id === 'lgCtrl_finally' && obj.depth === block.depth));
                if (finallyBlock) {
                    this.removeBlock(finallyBlock);
                }
            }
        }

        addElifBlock(block) {
            const blockIdx = this.blockList.indexOf(block);
            let groupedBlocks = block.getGroupedBlocks();
            let position = blockIdx + groupedBlocks.length; // add position
            // if else is available, change add position
            if (block.state.elseFlag) {
                let elseBlock = groupedBlocks.find(obj => (obj.id === 'lgCtrl_else' && obj.depth === block.depth));
                let elsePosition = this.blockList.indexOf(elseBlock);
                position = elsePosition;
            }
            // add elif
            let blockState = {
                isGroup: false,
                depth: block.depth
            }
            this.prop.parent.createPopup([{
                blockType: 'block', 
                menuId: 'lgCtrl_elif', 
                menuState: { blockState: blockState },
                position: position
            }]);
            setTimeout(function() {
                block.focusItem();
            }, 100);
        }

        addExceptBlock(block) {
            const blockIdx = this.blockList.indexOf(block);
            let groupedBlocks = block.getGroupedBlocks();
            let position = blockIdx + groupedBlocks.length; // add position
            // if finally is available, change add position
            if (block.state.finallyFlag) {
                let finallyBlock = groupedBlocks.find(obj => (obj.id === 'lgCtrl_finally' && obj.depth === block.depth));
                let finallyPosition = this.blockList.indexOf(finallyBlock);
                position = finallyPosition;
            }
            // if else is available, change add position
            if (block.state.elseFlag) {
                let elseBlock = groupedBlocks.find(obj => (obj.id === 'lgCtrl_else' && obj.depth === block.depth));
                let elsePosition = this.blockList.indexOf(elseBlock);
                position = elsePosition;
            }
            // add except
            let blockState = {
                isGroup: false,
                depth: block.depth
            }
            this.prop.parent.createPopup([{
                blockType: 'block', 
                menuId: 'lgCtrl_except', 
                menuState: { blockState: blockState },
                position: position
            }]);
            setTimeout(function() {
                block.focusItem();
            }, 100);
        }

        //========================================================================
        // Block save/load
        //========================================================================
        blockToJson(blockList) {
            let result = [];
            blockList && blockList.forEach(block => {
                let jsonBlock = block.toJson();
                result.push(jsonBlock);
            });
            return result;
        }

        jsonToBlock(jsonList) {
            let parent = this.prop.parent; // MainFrame
            let blockList = [];
            jsonList && jsonList.forEach((obj, idx) => {
                let {
                    isGroup, depth, blockNumber, taskId, taskState
                } = obj;
                let state = {
                    taskState: taskState,
                    blockState: {
                        isGroup: isGroup,
                        depth: depth,
                        blockNumber: blockNumber
                    }
                };
                blockList.push({
                    blockType: 'block', 
                    menuId: taskId, 
                    menuState: state, 
                    position: idx, 
                    createChild: false
                });
            });
            parent.createPopup(blockList);
        }
    } // class

    return BoardFrame;
});
/* End of file */