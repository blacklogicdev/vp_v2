/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : SampleComponent.js
 *    Author          : Black Logic
 *    Note            : Sample Component
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] SampleComponent
//============================================================================
define([
    'vp_base/js/com/com_String',
    'vp_base/js/com/component/Component'
], function(com_String, Component) {

    /**
     * SampleComponent
     */
    class SampleComponent extends Component {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            
        }

        _bindEvent() {
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

    return SampleComponent;
});