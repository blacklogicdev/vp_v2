/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : SampleApp.js
 *    Author          : Black Logic
 *    Note            : Sample app
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] SampleApp
//============================================================================
define([
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/component/PopupComponent'
], function(com_util, com_Const, com_String, PopupComponent) {

    /**
     * SampleApp
     */
    class SampleApp extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            var that = this;
            this.$target.on('click', function(evt) {
                var target = evt.target;
                if ($(that.wrapSelector()).find(target).length > 0) {
                    // Sample : getDataList from Kernel
                    vpKernel.getDataList().then(function(resultObj) {
                        vpLog.display(VP_LOG_TYPE.DEVELOP, resultObj);
                    }).catch(function(err) {
                        vpLog.display(VP_LOG_TYPE.DEVELOP, err);
                    });
                }
            });
        }

        templateForBody() {
            /** Implement generating template */
            return 'This is sample.';
        }

        generateCode() {
            return "print('sample code')";
        }

    }

    return SampleApp;
});