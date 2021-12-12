/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : MenuItem.js
 *    Author          : Black Logic
 *    Note            : Render and load menu item
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 09. 13
 *    Change Date     :
 */

//============================================================================
// [CLASS] MenuItem
//============================================================================
define([
    '../com/com_Config',
    '../com/com_String',
    '../com/component/Component',
    '../board/Block'
], function(com_Config, com_String, Component, Block) {
    'use strict';
    //========================================================================
    // Declare class
    //========================================================================
    /**
     * MenuItem
     */
    class MenuItem extends Component{
        constructor($target, state) {
            super($target, state);

            this._bindDraggable();
        }

        _getMenuGroupRootType() {
            // ex) visualpython - apps - frame
            let path = this.state.path;
            let pathList = path.split(' - ');
            return pathList[1];
        }

        _getMenuGroupType() {
            // ex) visualpython - apps - frame
            let path = this.state.path;
            let pathList = path.split(' - ');
            return pathList.slice(1, pathList.length - 1).join('-');
        }

        /**
         * Get menu item block's background color
         * @param {*} isApps 
         * @returns 
         */
        _getColorClass(isApps=false) {
            if (isApps) {
                // For Apps menu item
                var color = this.state.apps.color;
                switch(color) {
                    case 0:
                        return 'vp-color-preparing';
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                        return 'vp-color-apps' + color;
                }
            } else {
                // return color class
                // FIXME: set detailed labels
                return 'vp-' + this._getMenuGroupRootType();
            }
        }

        _bindEvent() {
            var that = this;
            $(this.wrapSelector()).on('click', function(evt) {
                // click event
                $('#vp_wrapper').trigger({
                    type: 'open_option_page', 
                    blockType: 'task',
                    menuId: that.state.id,
                    menuState: {}
                });
            });
        }

        _bindDraggable() {
            var that = this;
            $(this.wrapSelector()).draggable({
                containment: '#vp_wrapper',
                appendTo: '.vp-board-body',
                revert: 'invalid',
                cursor: 'pointer',
                connectToSortable: '.vp-board-body',
                helper: function() {
                    let isApps = that.state.apps != undefined;
                    return Block.getTemplate(that._getColorClass(isApps), that.state.name);
                },
                start: function(event, ui) {

                },
                drag: function(event, ui) {

                },
                stop: function(event, ui) {
                    $('#vp_wrapper').trigger({
                        type: 'open_option_page', 
                        blockType: 'block',
                        menuId: that.state.id,
                        menuState: {},
                        background: true
                    });
                }
            });
        }

        template() {
            var page = new com_String();
            var { id, name, desc, apps } = this.state;
            if (apps) {
                // render apps menu item
                page.appendFormatLine('<div class="vp-menuitem apps {0}" data-menu="{1}" title="{2}">'
                            , this._getColorClass(true), id, desc);
                page.appendFormatLine('<img src="../../nbextensions/visualpython/img/{0}">', apps.icon);
                page.appendFormatLine('<div class="vp-menuitem-apps-name">{0}</div>', name);
                page.append('</div>');
            } else {
                // render normal group
                page.appendFormatLine('<div class="vp-menuitem {0}" data-menu="{1}" title="{2}">'
                            , this._getColorClass(), id, desc);
                page.appendFormatLine('<span class="vp-menuitem-name">{0}</span>', name);
                page.append('</div>');
            }
            return page.toString();
        }
    }

    return MenuItem;

});

/* End of file */