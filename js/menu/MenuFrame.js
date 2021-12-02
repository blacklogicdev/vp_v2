/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : MenuFrame.js
 *    Author          : Black Logic
 *    Note            : Render and load menu frame
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 09. 13
 *    Change Date     :
 */

//============================================================================
// [CLASS] MenuFrame
//============================================================================
define([
    'text!../../html/menuFrame.html!strip',
    'css!../../css/menuFrame.css',

    '../com/com_Config',
    '../com/com_Const',
    '../com/component/Component',

    'text!../../data/libraries.json',

    './MenuGroup',
    './MenuItem'
], function(menuFrameHtml, menuFrameCss, com_Config, com_Const, Component, librariesJson, 
            MenuGroup, MenuItem) {
	'use strict';
    //========================================================================
    // Define Variable
    //========================================================================
    const {
        MENU_MIN_WIDTH,
        BOARD_MIN_WIDTH,
        MENU_BOARD_SPACING 
    } = com_Config;
    
    //========================================================================
    // Declare class
    //========================================================================
    /**
     * MenuFrame
     */
    class MenuFrame extends Component {
        //========================================================================
        // Constructor
        //========================================================================
        constructor($target, state, prop={}) {
            super($target, state, prop);
            this.xmlLibraries = undefined;
        }

        //========================================================================
        // Internal call function
        //========================================================================
        /**
         * Bind events on menuFrame
         */
        _bindEvent() {
            var that = this;
            this.$target.on('click', function(evt) {
                // Toggle board
                if (evt.target.id == 'vp_toggleBoard') {
                    $('#vp_boardFrame').toggle();
                    
                    let vpWidth = $('#vp_wrapper')[0].getBoundingClientRect().width;
                    let menuWidth = $('#vp_menuFrame')[0].getBoundingClientRect().width;
                    let showBoard = $('#vp_boardFrame').is(':visible');
                    if (showBoard) {
                        $('#vp_boardFrame').width(BOARD_MIN_WIDTH);
                        $('#vp_wrapper').width(vpWidth + BOARD_MIN_WIDTH + MENU_BOARD_SPACING);
                        that._bindResizable();
                    } else {
                        $('#vp_boardFrame').width(0);
                        $('#vp_menuFrame').width(menuWidth);
                        $('#vp_wrapper').width(menuWidth);
                        that._unbindResizable();
                    }
                    $('#vp_wrapper').trigger('resize');
                }

                // TEST: target class click event
                if ($(evt.target).hasClass('sample-class')) {
                    
                }
            });
        }

        _unbindResizable() {
            $('#vp_menuFrame').resizable('destroy');
        }

        /**
         * Bind resizable(jquery.ui)
         */
        _bindResizable() {
            // resizable
            $('#vp_menuFrame').resizable({
                // containment: 'parent',
                helper: 'vp-menuframe-resizer',
                handles: 'e',
                // resizeHeight: false,
                minWidth: MENU_MIN_WIDTH,
                // maxWidth: 0,
                start: function(event, ui) {
                    
                },
                resize: function(event, ui) {
                    var parentWidth = $('#vp_wrapper')[0].getBoundingClientRect().width;
                    var currentWidth = ui.size.width;
                    var newBoardWidth = 0;
                    
                    var showBoard = $('#vp_boardFrame').is(':visible');
                    if (showBoard) {
                        newBoardWidth = parentWidth - currentWidth - MENU_BOARD_SPACING;
    
                        // check board minimum width
                        if (newBoardWidth < BOARD_MIN_WIDTH + MENU_BOARD_SPACING) {
                            currentWidth -= (BOARD_MIN_WIDTH - newBoardWidth);
                            newBoardWidth = BOARD_MIN_WIDTH;
                            // change maxWidth
                            // $('#vp_menuFrame').resizable('option', 'maxWidth', currentWidth);
                            ui.size.width = currentWidth;
                        } 
                    }
                    // resize menu frame with current resized width
                    $('#vp_menuFrame').width(currentWidth);
                    // resize board frame with left space
                    $('#vp_boardFrame').width(newBoardWidth); 

                    vpLog.display(VP_LOG_TYPE.DEVELOP, 'resizing menuFrame');
                },
                stop: function(event, ui) {
                    
                },
            });
        }


        //========================================================================
        // External call function
        //========================================================================
        /**
         * Get menu object
         * @returns library object
         */
        getMenus() {
            var libraries = JSON.parse(librariesJson);

            if (libraries && libraries.library) {
                return libraries.library;
            }

            return {};
        }
        
        template() {
            this.$pageDom = $(menuFrameHtml);
            return this.$pageDom;
        }

        renderMenuItem(group) {
            var that = this;
            var body = group.getBody();
            var item = group.getItem();
            item && item.forEach(child => {
                if (child.type == 'package') {
                    // packages : MenuGroup
                    var menuGroup = new MenuGroup($(body), child);
                    if (child.item) {
                        that.renderMenuItem(menuGroup);
                    }
                } else {
                    // functions : MenuItem
                    var menuItem = new MenuItem($(body), child);
                }
            });
        }   

        render() {
            var that = this;

            this.$target.append(this.template());
            this._bindResizable();

            // render menuItem
            // get xml library list
            var menus = this.getMenus();
            vpLog.display(VP_LOG_TYPE.LOG, 'vp menus version : ', menus.version);

            var menuItems = menus.item;
            vpLog.display(VP_LOG_TYPE.DEVELOP, menuItems);

            menuItems && menuItems.forEach(item => {
                if (item.type == 'package') {
                    // packages : MenuGroup
                    var menuGroup = new MenuGroup($('#vp_menuBody'), item);
                    if (item.item) {
                        that.renderMenuItem(menuGroup);
                    }
                }
            });


        }
    }

    return MenuFrame;
	
});

/* End of file */