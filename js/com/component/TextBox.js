/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : TextBox.js
 *    Author          : Black Logic
 *    Note            : Render and load text box
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 09. 13
 *    Change Date     :
 */

//============================================================================
// Load extension
//============================================================================
define([], function() {
    'use strict';
    //========================================================================
    // Define Variable
    //========================================================================


    //========================================================================
    // Declare class
    //========================================================================
    /**
     * MenuItem
     */
    class MenuItem {
        constructor(menuType) {
            this.menuType = menuType;
            this.pageDom = undefined;

            // TODO: menutype
        }

        bindEvent() {

        }

        render() {
            return this.pageDom;
        }
    }

    return MenuItem;

});