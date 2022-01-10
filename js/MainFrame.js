/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : MainFrame.js
 *    Author          : Black Logic
 *    Note            : Render and load main frame
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 09. 13
 *    Change Date     :
 */

//============================================================================
// Load main frame
//============================================================================
define([
    'text!vp_base/html/mainFrame.html!strip',
    'css!vp_base/css/mainFrame.css',

    // load module
    './com/com_Config',
    './com/com_Const',
    './com/com_Event',
    './com/component/PopupComponent',
    './menu/MenuFrame',
    './board/BoardFrame'
], function(vpHtml, vpCss, com_Config, com_Const, com_Event, PopupComponent, 
            MenuFrame, BoardFrame) {
	'use strict';

    // visualpython minimum width
    const { 
        JUPYTER_HEADER_SPACING,
        VP_MIN_WIDTH, 
        MENU_MIN_WIDTH,
        BOARD_MIN_WIDTH,
        MENU_BOARD_SPACING
    } = com_Config;

    const { 
        TOOLBAR_BTN_INFO,
        JUPYTER_NOTEBOOK_ID,
        JUPYTER_HEADER_ID
    } = com_Const;

    class MainFrame {
        constructor() {
            this.$pageDom = null;
            this._menuFrame = null;
            this._boardFrame = null;
            this._nowTask = null;
            this._focusedPage = null;
            
            // Task bar options list
            this._taskPopupList = [];
            this._blockPopupList = [];

            // page info
            this.minWidth = VP_MIN_WIDTH;
            this.width = VP_MIN_WIDTH;
        }
        //========================================================================
        // Internal call function
        //========================================================================
        /**
         * Bind event for inner components under vp_wrapper
         */
        _bindEvent() {
            var that = this;

            // window resize event
            $(window).resize(function(evt){
                let jupyterHeadHeight = $('#' + JUPYTER_HEADER_ID).height();
                let jupyterBodyHeight = $('#' + JUPYTER_NOTEBOOK_ID).height();
                
                let vpWidth = $('#vp_wrapper')[0].getBoundingClientRect().width;
                let vpHeight = $(window).height() - jupyterHeadHeight;

                // $('#vp_wrapper').css( { height: vpHeight + 'px' });
                that._resizeNotebook(vpWidth);
            });

            window.vpEvent = new com_Event(this);
        }

        /**
         * Bind $.resizable event
         * // TODO: get a param to re-position vp_wrapper to the left or right
         */
        _bindResizable() {
            var that = this;

            // get visualpython minimum width
            // resizable setting
            // $('#vp_wrapper').resizable('disable');
            $('#vp_wrapper').resizable({
                // alsoResize: '#vp_menuFrame',
                helper: 'vp-wrapper-resizer',
                handles: 'w',
                // resizeHeight: false,
                minWidth: this.minWidth,
                // maxWidth: 0,
                start: function(event, ui) {
                    
                },
                resize: function(event, ui) {
                    // resize #vp_wrapper with currentWidth and resize jupyter area
                    var currentWidth = ui.size.width;
                    that._resizeVp(currentWidth);
                },
                stop: function(event, ui) {
                    $('#vp_wrapper').css({'left': '', 'height': ''});
                }
            });  
        }

        _resizeVp(currentWidth) {
            // calculate inner frame width
            var menuWidth = $('#vp_menuFrame').width();
            var boardWidth = 0;
            var showBoard = $('#vp_boardFrame').is(':visible');
            if (showBoard) {
                boardWidth = currentWidth - menuWidth - MENU_BOARD_SPACING;
                if (boardWidth < BOARD_MIN_WIDTH + MENU_BOARD_SPACING) {
                    boardWidth = BOARD_MIN_WIDTH;
                    menuWidth = currentWidth - (BOARD_MIN_WIDTH + MENU_BOARD_SPACING);
                }
            } else {
                // resize menuWidth if board is hidden
                menuWidth = currentWidth - MENU_BOARD_SPACING;
            }
            $('#vp_menuFrame').width(menuWidth);
            $('#vp_boardFrame').width(boardWidth);

            vpLog.display(VP_LOG_TYPE.DEVELOP, 'resizing wrapper to ', currentWidth, 'with', menuWidth, boardWidth);

            $('#vp_wrapper').width(currentWidth);

            // save current page info
            vpConfig.setMetadata({
                vp_position: { width: currentWidth },
                vp_menu_width: menuWidth,
                vp_note_width: boardWidth
            });

            this._resizeNotebook(currentWidth);
        }

        /**
         * Resize jupyternotebook
         */
        _resizeNotebook(vpWidth) {
            let baseWidth = $(window).width();

            // manual padding between notebook and visualpython area
            const DIV_PADDING = 2;
            // if vp area is available, add padding
            if (vpWidth > 0) {
                vpWidth += DIV_PADDING;
            }
            // calculate notebook resizing width
            let nbWidth = baseWidth - vpWidth;
            let nbContainerWidth = nbWidth - 60;
            // apply resized width
            $('#' + JUPYTER_NOTEBOOK_ID).css({ 'width': nbWidth + 'px' });
            $('#notebook-container').css({ 'width': nbContainerWidth + 'px' });
        }

        _getMenuGroupRootType(menu) {
            // ex) visualpython - apps - frame
            let path = menu.path;
            let pathList = path.split(' - ');
            return pathList[1];
        }

        //========================================================================
        // External call function
        //========================================================================
        /**
         * Load main frame
         */
        loadMainFrame() {
            // load vp_wrapper into jupyter base
            this.$pageDom = $(vpHtml);
            $(this.$pageDom).prependTo(document.body);

            // set vp width using metadata
            let metadata = vpConfig.getMetadata();
            let { vp_position, vp_note_display, vp_menu_width, vp_note_width } = metadata;
            if (vp_position) {
                $('#vp_wrapper').width(vp_position.width);
            }

            if (!vp_note_display) {
                this.minWidth = MENU_MIN_WIDTH + MENU_BOARD_SPACING;
            }

            // resize jupyterNotebook area
            let vpWidth = $('#vp_wrapper')[0].getBoundingClientRect().width;
            
            // load menu & board
            this._menuFrame = new MenuFrame($('#vp_wrapper'), 
                { vp_menu_width: vp_menu_width }, 
                { parent: this }
            );
            this._boardFrame = new BoardFrame($('#vp_wrapper'), 
                { vp_note_display: vp_note_display, vp_note_width: vp_note_width }, 
                { parent: this }
            );
            
            this._resizeNotebook(vpWidth);
            
            // bind event
            this._bindEvent();
            this._bindResizable();

            return this.$pageDom;
        }

        toggleVp() {
            let vpDisplay = $('#vp_wrapper').is(':visible');
            let vpWidth = $('#vp_wrapper')[0].clientWidth;

            let metadata = vpConfig.getMetadata();
            let { vp_position, vp_menu_width, vp_note_width } = metadata;
            let newMetadata = { vp_section_display: !vpDisplay };
            if (vpDisplay) {
                // hide
                vpWidth = 0;
                $('#vp_wrapper').hide();
            } else {
                // show
                vpWidth = vp_position.width;
                if (vp_position.width == 0) {
                    vpWidth = (vp_menu_width + vp_note_width + MENU_BOARD_SPACING) + 'px';
                    newMetadata['vp_position'] = { width: vpWidth };
                    $('#vp_wrapper').css({ width: vpWidth });
                }
                $('#vp_wrapper').show();
            }

            // set current width
            vpConfig.setMetadata(newMetadata);

            this._resizeNotebook(vpWidth);

            vpLog.display(VP_LOG_TYPE.DEVELOP, 'vp toggled');
        }

        openVp() {
            $('#vp_wrapper').show();

            let vpWidth = $('#vp_wrapper')[0].clientWidth;
            this._resizeNotebook(vpWidth);

            vpLog.display(VP_LOG_TYPE.DEVELOP, 'vp opened');
        }

        //========================================================================
        // Child components control function
        //========================================================================

        toggleNote() {
            let vpWidth = $('#vp_wrapper')[0].getBoundingClientRect().width;
            let newVpWidth = vpWidth;
            let menuWidth = $('#vp_menuFrame')[0].getBoundingClientRect().width;

            let isNoteVisible = $('#vp_boardFrame').is(':visible');
            if (isNoteVisible) {
                // hide note
                this.boardFrame.hide();
                newVpWidth = menuWidth + MENU_BOARD_SPACING;
                $('#vp_wrapper').width(newVpWidth);
                $('#vp_wrapper').resizable({ minWidth: MENU_MIN_WIDTH + MENU_BOARD_SPACING });
                this.menuFrame._unbindResizable();
                
            } else {
                // show note
                this.boardFrame.show();
                newVpWidth = vpWidth + BOARD_MIN_WIDTH + MENU_BOARD_SPACING;
                $('#vp_wrapper').width(newVpWidth);
                $('#vp_wrapper').resizable({ minWidth: VP_MIN_WIDTH });
                this.menuFrame._bindResizable();
            }
            // save current page info
            vpConfig.setMetadata({
                // vp_note_display: !isNoteVisible, // save in boardFrame.show/hide()
                vp_position: { width: newVpWidth },
                vp_menu_width: menuWidth
            });

            // $('#vp_wrapper').trigger('resize');
            this._resizeVp(newVpWidth);
        }

        /**
         * Create popup
         * @param {String} blockType task, block (task:TaskBlock / block:Block)
         * @param {String} menuId com_library
         * @param {Object} menuState { ...states to load }
         */
        createPopup(blockType, menuId, menuState, background=false, position=-1, createChild=true, afterAction='') {
            let that = this;
            // get specific menu configuration
            let menuConfig = this.menuFrame.getMenuLibrary(menuId);
            if (!menuConfig) {
                vpLog.display(VP_LOG_TYPE.ERROR, 'Menu is not found (menu id: '+menuId+')');
                return;
            }
            let menuGroupRootType = this._getMenuGroupRootType(menuConfig);
            try {
                // open component
                require(['vp_base/js/' + menuConfig.file], function(OptionComponent) {
                    that.callPopupComponent(blockType, OptionComponent, menuConfig, menuState, background, position, createChild, afterAction);
                }, function (err) {
                    // if it's library menu, call LibraryComponent
                    if (menuGroupRootType == 'library') {
                        menuConfig.file = 'com/component/LibraryComponent'
                        require(['vp_base/js/' + menuConfig.file], function(OptionComponent) {
                            that.callPopupComponent(blockType, OptionComponent, menuConfig, menuState, background, position, createChild, afterAction);
                        });
                    } else {
                        vpLog.display(VP_LOG_TYPE.ERROR, 'Menu file is not found. (menu id: '+menuId+')');
                    }
                });
            } catch(err) {
                ;
            }
        }

        callPopupComponent(blockType, OptionComponent, menuConfig, menuState, background, position, createChild, afterAction) {
            if (!OptionComponent) {
                vpLog.display(VP_LOG_TYPE.ERROR, 'Not implemented or available menu. (menu id: '+menuConfig.id+')');
                return;
            }
            // pass configuration inside state
            let taskState = menuState.taskState;
            let blockState = menuState.blockState;
            let state = {
                ...taskState,
                config: menuConfig
            }
            let option = new OptionComponent(state);
            let newBlock = null;
            if (blockType === 'block') {
                // add to block list
                newBlock = this.addBlock(option, position, createChild, blockState);
            } else {
                // add to task list
                this.addTask(option);
            }
            if (!background) {
                this.openPopup(option);
            }
            if (afterAction && afterAction != '') {
                switch (afterAction) {
                    case 'run':
                        option.run();
                        break;
                    case 'add':
                        option.run(false);
                        break;
                }
            }
        }
        
        /**
         * Open Popupcomponent
         * @param {PopupComponent} component 
         */
        openPopup(component) {
            if (component && component.isHidden()) {
                // hide other tasks
                this.hideAllPopup();
    
                // open it and focus it
                this._nowTask = component;
                component.open();
            }
        }

        /**
         * Close PopupComponent
         * @param {PopupComponent} component 
         */
        closePopup(component) {
            if (component) {
                component.close();
            }
        }

        /**
         * Apply task to board block
         * - remove from taskList
         * - add to blockList
         * - close component
         * @param {PopupComponent} component 
         */
        applyPopup(component) {
            let taskType = component.getTaskType();
            if (taskType == 'task') {
                // remove from taskBlockList
                this.removeTask(component);
                this.addBlock(component);
            }
            component.close();
            // render board frame
            this.boardFrame.reloadBlockList();
        }

        /**
         * Remove PopupComponent
         * @param {PopupComponent} component 
         */
        removePopup(component) {
            if (component) {
                if (component.getTaskType() === 'block') {
                    // block
                    this.boardFrame.removeBlock(component);
                } else {
                    // task
                    this.removeTask(component);
                }
                component.remove();
            } else {
                vpLog.display(VP_LOG_TYPE.WARN, 'Component to remove is not available.');
            }
        }

        /**
         * Focus on PopupComponent
         * @param {PopupComponent} component 
         */
        focusPopup(component) {
            component.focus();
            this.setFocusedPage(component);
        }

        /**
         * Blur PopupComponent
         * @param {PopupComponent} component 
         */
        blurPopup(component) {
            if (component instanceof PopupComponent) {
                component.blur();
            }
            this.setFocusedPage(null);
        }

        /**
         * Hide all PopupComponent
         */
        hideAllPopup() {
            this.taskPopupList.forEach(task => {
                task.hide();
            });
            this.blockPopupList.forEach(task => {
                task.hide();
            });
        }

        /**
         * Focus popup page using its object
         * @param {PopupComponent} focusedPage 
         */
        setFocusedPage(focusedPage) {
            this.focusedPage = focusedPage;
        }

        checkDuplicatedTask(menuId) {
            // find on task list
            let dupTask = this._taskPopupList.filter(t => t && menuId === t.id);
            if (dupTask.length > 0) {
                return dupTask[0];
            }
            // not available
            return null;
        }

        addBlock(option, position=-1, createChild=true, blockState={}) {
            this._blockPopupList.push(option);
            let newBlock = this.boardFrame.addBlock(option, position, createChild, blockState);
            // render board frame
            this.boardFrame.reloadBlockList();
            // scroll to new block
            this.boardFrame.scrollToBlock(newBlock);
            return newBlock;
        }

        /**
         * Add task to task list and render TaskBar
         * @param {PopupComponent} option 
         */
        addTask(option) {
            this._taskPopupList.push(option);

            // render task bar
            this.menuFrame.renderTaskBar(this._taskPopupList);
        }

        /**
         * Remove task from task list and render TaskBar
         * @param {PopupComponent} option 
         */
        removeTask(option) {
            const taskToRemove = this._taskPopupList.find(function(item) { return item.uuid === option.uuid });
            const taskIdx = this._taskPopupList.indexOf(taskToRemove);
            if (taskIdx > -1) {
                taskToRemove.removeBlock();
                this._taskPopupList.splice(taskIdx, 1);
                // render task bar
                this.menuFrame.renderTaskBar(this._taskPopupList);
            } else {
                vpLog.display(VP_LOG_TYPE.WARN, 'No option task to remove');
            }
        }

        //========================================================================
        // Getter Setter
        //========================================================================
        get menuFrame() {
            return this._menuFrame;
        }

        get boardFrame() {
            return this._boardFrame;
        }

        get focusedPage() {
            return this._focusedPage;
        }

        set focusedPage(component) {
            this._focusedPage = component;
        }

        get taskPopupList() {
            return this._taskPopupList;
        }

        get blockPopupList() {
            return this._blockPopupList;
        }

        
    }
	
    

    return MainFrame;
});

/* End of file */