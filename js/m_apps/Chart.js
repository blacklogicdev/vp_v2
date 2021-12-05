/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : Chart.js
 *    Author          : Black Logic
 *    Note            : Apps > Chart
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] Chart
//============================================================================
define([
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_setting',
    'vp_base/js/com/component/PopupComponent'
], function(com_util, com_Const, com_String, com_setting, PopupComponent) {

    /**
     * Chart
     */
    class Chart extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.dataview = false;
            
            this.packageList = [
                { library: 'numpy',     alias:'np'}
                , { library: 'pandas',  alias:'pd'}
                , { 
                    library: 'matplotlib.pyplot', alias:'plt' 
                    , include: [
                        '%matplotlib inline'
                    ]
                }
                , { library: 'seaborn', alias:'sns'}
            ];
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
        }

        templateForBody() {
            /** Implement generating template */
            var page = new com_String();
            
            return page.toString();
        }

        generateCode() {
            return 'test import';
        }

    }

    return Chart;
});