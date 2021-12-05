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
    './menu/MenuFrame',
    './board/BoardFrame'
], function(vpHtml, vpCss, com_Config, com_Const, com_Event, MenuFrame, BoardFrame) {
	'use strict';

    // visualpython minimum width
    const { 
        JUPYTER_HEADER_SPACING,
        VP_MIN_WIDTH, 
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
            this._events = null;
            this._focusedPage = null;
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

                $('#vp_wrapper').css( { height: vpHeight + 'px' });
                that._resizeNotebook(vpWidth);
                // $('#vp_menuFrame').height(vpHeight);
            });

            this._events = new com_Event(this);
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
                minWidth: VP_MIN_WIDTH,
                // maxWidth: 0,
                start: function(event, ui) {
                    
                },
                resize: function(event, ui) {
                    // resize #vp_wrapper with currentWidth and resize jupyter area
                    var currentWidth = ui.size.width;
                    that._resizeVp(currentWidth);
                },
                stop: function(event, ui) {
                    $('#vp_wrapper').css({'left': ''});
                },
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
                    menuWidth -= (BOARD_MIN_WIDTH - boardWidth);
                    boardWidth = BOARD_MIN_WIDTH;
                }
            } else {
                // resize menuWidth if board is hidden
                menuWidth = currentWidth - MENU_BOARD_SPACING;
            }
            $('#vp_menuFrame').width(menuWidth);
            $('#vp_boardFrame').width(boardWidth);

            vpLog.display(VP_LOG_TYPE.DEVELOP, 'resizing wrapper to ', currentWidth, 'with', menuWidth, boardWidth);

            $('#vp_wrapper').width(currentWidth);
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

            // resize jupyterNotebook area
            let vpWidth = $('#vp_wrapper')[0].getBoundingClientRect().width;
            this._resizeNotebook(vpWidth);
            
            // load menu & board
            this._menuFrame = new MenuFrame($('#vp_wrapper'), {});
            this._boardFrame = new BoardFrame($('#vp_wrapper'));
            
            // bind event
            this._bindEvent();
            this._bindResizable();

            return this.$pageDom;
        }

        toggleVp() {
            $('#vp_wrapper').toggle();

            let vpWidth = $('#vp_wrapper')[0].clientWidth;
            this._resizeNotebook(vpWidth);

            vpLog.display(VP_LOG_TYPE.DEVELOP, 'vp toggled');
        }

        /**
         * Open menu as popup
         * @param {*} openType 
         * @param {*} menuId 
         * @param {*} menuState 
         */
        openPopup(openType, menuId, menuState) {
            // get specific menu configuration
            let menuConfig = this.menuFrame.getMenuLibrary(menuId);
            if (!menuConfig) {
                vpLog.display(VP_LOG_TYPE.ERROR, 'Menu is not found (menu id: '+menuId+')');
                return;
            }
            // open component
            require(['vp_base/js/' + menuConfig.file], function(OptionComponent) {
                // pass configuration inside state
                let state = {
                    ...menuState,
                    config: menuConfig
                }
                let option = new OptionComponent(state);
                // TODO: check if option is component class
                option.open();
                $('#vp_wrapper').trigger({
                    type: 'focus_option_page',
                    component: option
                });

            }, function (err) {
                vpLog.display(VP_LOG_TYPE.ERROR, 'Menu file is not found (menu id: '+menuId+')');
            });
        }

        closePopup(component) {
            component.close();
        }

        setFocusedPage(focusedPage) {
            this.focusedPage = focusedPage;
            // remove other focused classes
            $('.vp-popup-frame').removeClass('vp-focused');
            $('.vp-popup-frame').css({ 'z-index': 200 });
            if (focusedPage) {
                // check focused page
                $(this.focusedPage.wrapSelector()).addClass('vp-focused');
                $(this.focusedPage.wrapSelector()).css({ 'z-index': 205 }); // move forward
            }
        }

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
    }
	
    

    return MainFrame;
});

/* End of file */