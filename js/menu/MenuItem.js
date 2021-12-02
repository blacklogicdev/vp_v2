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
], function(com_Config, com_String, Component) {
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
        }

        _getColorClass(isApps=false) {
            if (isApps) {
                var color = this.state.apps.color;
                switch(color) {
                    case 0:
                        return 'preparing';
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                        return 'item' + color;
                }
            } else {
                // return color class
                return '';
            }
        }

        _bindEvent() {
            var that = this;
            this.$target.on('click', function(evt) {
                var target = evt.target;
                // click event
                if ($(target).hasClass(that.uuid)) {
                    $('#vp_wrapper').trigger({
                        type: 'open_option_page', 
                        openType: '',
                        menuId: that.state.id,
                        menuState: {}
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
                page.appendFormatLine('<img src="{0}">', apps.icon);
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