/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : FileNavigation.js
 *    Author          : Black Logic
 *    Note            : File navigation
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] FileNavigation
//============================================================================
define([
    'vp_base/js/com/com_String',
    'vp_base/js/com/component/Component',
    'vp_base/js/com/com_Kernel'
], function(com_String, Component, com_Kernel) {

    /**
     * FileNavigation
     */
    class FileNavigation extends Component {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            
        }

        template() {
            /** Implement generating template */
            var page = new com_String();
            
            return page.toString();
        }

        render() {
            super.render();
            /** Implement after rendering */

        }

    }

    return FileNavigation;
});