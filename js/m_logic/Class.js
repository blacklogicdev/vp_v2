/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : Class.js
 *    Author          : Black Logic
 *    Note            : Logic > class
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] Class
//============================================================================
define([
    'vp_base/js/com/com_String',
    'vp_base/js/com/component/PopupComponent'
], function(com_String, PopupComponent) {

    /**
     * Class
     */
    class Class extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.dataview = false;
            this.config.codeview = false;

            this.state = {
                code: '',
                ...this.state
            }
            
            this._addCodemirror('code');
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
        }

        templateForBody() {
            /** Implement generating template */
            var page = new com_String();
            page.appendFormatLine('<textarea name="code" class="code vp-state" id="code">{0}</textarea>'
                                , this.state.code);
            return page.toString();
        }

        generateCode() {
            return this.state.code;
        }

    }

    return Class;
});