/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : Except.js
 *    Author          : Black Logic
 *    Note            : Logic > except
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] Except
//============================================================================
define([
    'vp_base/js/com/com_String',
    'vp_base/js/com/component/PopupComponent'
], function(com_String, PopupComponent) {

    /**
     * Except
     */
    class Except extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.dataview = false;
            this.config.codeview = false;

            this.state = {
                ...this.state
            }
            
            this._addCodemirror('code', this.wrapSelector('#code'));
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
        }

        templateForBody() {
            return '';
        }

        generateCode() {
            return 'except';
        }

    }

    return Except;
});