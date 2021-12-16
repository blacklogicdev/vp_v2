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
    'text!vp_base/html/fileNavigation.html!strip',
    'css!vp_base/css/fileNavigation.css',
    'vp_base/js/com/com_String',
    'vp_base/js/com/component/Component',
    'vp_base/js/com/com_Kernel'
], function(fileNaviHtml, fileNaviCss, com_String, Component, com_Kernel) {
    // Temporary constant data
    const NAVIGATION_DIRECTION_TYPE = {
        TOP: 0,
        TO: 1,
        PREV: 2,
        INIT: 3
    }

    /**
     * FileNavigation
     */
    class FileNavigation extends Component {
        /**
         * Constructor
         * @param {Object} state { type, extensions, finish ... }
         */
        constructor(state) {
            super($('#site'), state);
            /**
             * state.type           open / save
             * state.extensions     extensions list
             * state.finish         callback function after selection
             * - example form : function (status, filesPath, result, error) { }
             * - status       : boolean => true for success / false for error
             * - filesPath    : list    => list of Object [ { file: '', path: '' } ]
             * - result       : string  => file read result data / no data for save type
             * - error        : if there's error, return its content
             * ---------------------------------------------------------------
             * state.multiSelect    (optional)
             * state.showAll        (optional)
             */
            vpLog.display(VP_LOG_TYPE.DEVELOP, 'FileNavigation created', state);
        }
        _init() {
            super._init();
            /** Write codes executed before rendering */
            // state types
            this.state = {
                direction: '',
                type: '',           // open / save
                filePath: '',
                fileName: '',
                extensions: [],     // extensions list ex) png, jpg, gif
                multiSelect: false, // multi selection
                showAll: false,     // show other extension files also
                finsh: null,        // callback after selection
                ...this.state
            };
            this.currentPath = '';
            this.pathStack = [];
            this.currentFileList = [];
        }

        _bindEvent() {
            var that = this;
            $(this.wrapSelector('.fileNavigationPage-closedBtn')).on('click', function() {
                that.close();
            });
        }

        template() {
            /** Implement generating template */
            return fileNaviHtml;
        }

        /**
         * render file list based on currentFileList
         */
        renderFileList() {

        }

        render() {
            super.render();
            /** Implement after rendering */

            // render file list
            this.renderFileList();
        }

        open() {
            $(this.wrapSelector()).show();
        }

        close() {
            $(this.wrapSelector()).remove();
        }

        //============================================================================
        // Use kernels
        //============================================================================

        getFileList(path) {
            
        }

        //============================================================================
        // Set states
        //============================================================================

        setExtensions = function(arr) {
            this.state.extensions = arr;
        }
    }

    return FileNavigation;
});