/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : mainFrame.js
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
    //========================================================================
    // Define Variable
    //========================================================================
    var pageDom = '';
    var menuFrame;
    var boardFrame;
    var events;

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
	
    //========================================================================
    // Internal call function
    //========================================================================
	/**
     * Bind event for inner components under vp_wrapper
     */
     var _bindEvent = function() {

        // window resize event
        $(window).resize(function(evt){
            let vpWidth = $('#vp_wrapper')[0].getBoundingClientRect().width;
            let jupyterHeadHeight = $('#' + JUPYTER_HEADER_ID).height();
            let jupyterBodyHeight = $('#' + JUPYTER_NOTEBOOK_ID).height();

            _resizeNotebook(vpWidth);
            $('#vp_wrapper').css( { height: jupyterBodyHeight + 'px' });
            // $('#vp_menuFrame').height(vpHeight);
        });

        events = new com_Event();
    }

    /**
     * Bind $.resizable event
     * // TODO: get a param to re-position vp_wrapper to the left or right
     */
    var _bindResizable = function() {
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
                _resizeVp(currentWidth);
            },
            stop: function(event, ui) {
                $('#vp_wrapper').css({'left': ''});
            },
        });  
    }

    var _resizeVp = function(currentWidth) {
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
        _resizeNotebook(currentWidth);
    }

    /**
     * Resize jupyternotebook
     */
     var _resizeNotebook = function(vpWidth) {
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
	var loadMainFrame = function() {
        // load vp_wrapper into jupyter base
        pageDom = $(vpHtml);
        $(pageDom).prependTo(document.body);

        // resize jupyterNotebook area
        let vpWidth = $('#vp_wrapper')[0].getBoundingClientRect().width;
        _resizeNotebook(vpWidth);
        
        // load menu & board
        menuFrame = new MenuFrame($('#vp_wrapper'), {});
        boardFrame = new BoardFrame($('#vp_wrapper'));
        
        // bind event
        _bindEvent();
        _bindResizable();

        return pageDom;
    }

    var toggleVp = function() {
        $('#vp_wrapper').toggle();

        let vpWidth = $('#vp_wrapper')[0].clientWidth;
        _resizeNotebook(vpWidth);

        vpLog.display(VP_LOG_TYPE.DEVELOP, 'vp toggled');
    }

    return {
        loadMainFrame: loadMainFrame,
        toggleVp: toggleVp
    };
});

/* End of file */