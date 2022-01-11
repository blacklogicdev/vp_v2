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
    '../com/component/SuggestInput',

    'text!../../data/libraries.json',

    './MenuGroup',
    './MenuItem',
    './TaskBar'
], function(menuFrameHtml, menuFrameCss, com_Config, com_Const, Component, SuggestInput, 
            librariesJson, 
            MenuGroup, MenuItem, TaskBar) {
	'use strict';
    //========================================================================
    // Define Variable
    //========================================================================
    const {
        VP_MIN_WIDTH,
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
            /**
             * state.vp_menu_width : menu width (metadata)
             * prop.parent : MainFrame
             */
        }

        //========================================================================
        // Internal call function
        //========================================================================
        _init() {
            // get json library list
            this.menuLibrariesFlatten = []; // use it for searching
            this.menuLibraries = this.getMenuLibraries();
        }
        
        /**
         * Bind events on menuFrame
         */
        _bindEvent() {
            var that = this;
            // Click extra menu button
            $(this.wrapSelector('#vp_headerExtraMenuBtn')).on('click', function(evt) {
                $('#vp_headerExtraMenu').toggle();
                evt.stopPropagation();
            });
            // Click toggle board icon
            $(this.wrapSelector('#vp_toggleBoard')).on('click', function() {
                that.prop.parent.toggleNote();
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
                            newBoardWidth = BOARD_MIN_WIDTH;
                            currentWidth = parentWidth - (BOARD_MIN_WIDTH + MENU_BOARD_SPACING);
                            // change current width
                            ui.size.width = currentWidth;
                        } 
                    } 
                    // resize menu frame with current resized width
                    $('#vp_menuFrame').width(currentWidth);
                    // resize board frame with left space
                    $('#vp_boardFrame').width(newBoardWidth); 

                    vpConfig.setMetadata({
                        vp_position: { width: parentWidth },
                        vp_menu_width: currentWidth,
                        vp_note_width: newBoardWidth
                    });

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
        getMenuLibraries() {
            var libraries = JSON.parse(librariesJson);
            if (!libraries || !libraries.library) {
                vpLog.display(VP_LOG_TYPE.ERROR, 'vp menus are not avilable!');
                return {};
            }
            vpLog.display(VP_LOG_TYPE.LOG, 'vp menus version : ', libraries.library.version);
            if (libraries && libraries.library) {
                return libraries.library.item;
            }

            return {};
        }
        
        getMenuLibrary(menuId, libraries=this.menuLibraries) {
            for (var i=0; i < libraries.length; i++) {
                var item = libraries[i];
                if (item) {
                    if (item.id === menuId) {
                        return item;
                    }
                    if (item.type === 'package') {
                        var result = this.getMenuLibrary(menuId, item.item);
                        if (result) {
                            return result;
                        }
                    }
                }
            }
            return null;
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
                    if (!child.hide) {
                        that.menuLibrariesFlatten.push(child);
                        var menuItem = new MenuItem($(body), child);
                    }
                }
            });
        }   

        renderTaskBar(taskList) {
            this.taskBar = new TaskBar($(this.wrapSelector('#vp_menuFooter')), { taskList: taskList });
        }

        render() {
            super.render(true);
            var that = this;

            this._bindResizable();

            // set width using metadata
            $(this.wrapSelector()).width(this.state.vp_menu_width);

            // render menuItem
            var menuLibraries = this.menuLibraries;
            vpLog.display(VP_LOG_TYPE.DEVELOP, menuLibraries);

            this.menuLibrariesFlatten = [];
            menuLibraries && menuLibraries.forEach(item => {
                if (item.type == 'package') {
                    // packages : MenuGroup
                    var menuGroup = new MenuGroup($('#vp_menuBody'), item);
                    if (item.item) {
                        that.renderMenuItem(menuGroup);
                    }
                }
            });

            let functionList = this.menuLibrariesFlatten.map(menu => {
                return { label: menu.name, value: menu.name, ...menu }
            });
            // render searchbox
            let searchBox = new SuggestInput();
            searchBox.setComponentID('vp_menuSearchBox');
            searchBox.addClass('vp-input vp-menu-search-box');
            searchBox.setPlaceholder('Search libraries');
            searchBox.setMinSearchLength(2);
            searchBox.setSuggestList(function () { return functionList; });
            searchBox.setSelectEvent(function (value) {
                $(this.wrapSelector()).val(value);
                $(this.wrapSelector()).trigger('change');
            });
            searchBox.setSelectEvent(function(value, item) {
                $(this.wrapSelector()).val(value);

                $('#vp_wrapper').trigger({
                    type:"create_option_page",
                    blockType: 'task',
                    menuId: item.id,
                    menuState: {},
                    afterAction: 'open'
                });
                $(this.wrapSelector()).trigger('change');
                // clear search box
                $(that.wrapSelector('#vp_menuSearchBox')).val('');
                return false;
            });
            searchBox.setNormalFilter(true);
            // replace searchbox
            $(this.wrapSelector('#vp_menuSearchBox')).replaceWith(searchBox.toTagString());

            // render taskBar
            this.renderTaskBar([]);
        }
    }

    return MenuFrame;
	
});

/* End of file */