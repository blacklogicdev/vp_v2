/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : loadVisualpython.js
 *    Author          : Black Logic
 *    Note            : Load Visual Python
 *    License         : GPLv3 (GNU General Public License v3.0)
 *    Date            : 2021. 08. 14
 *    Change Date     :
 */

//============================================================================
// Load Visual Python
//============================================================================
(
    require.specified('base/js/namespace')
        ? define
        : function (deps, callback) {
            'use strict';
            // if here, the Jupyter namespace hasn't been specified to be loaded.
            // This means that we're probably embedded in a page,
            // so we need to make our definition with a specific module name
            return define('vp_base/js/loadVisualpython', deps, callback);
        }
)([
    'css!vp_base/css/root.css',
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_Config',
    'vp_base/js/com/com_Log',
    'vp_base/js/com/com_Kernel',
    'vp_base/js/com/com_interface',
    'vp_base/js/MainFrame'
], function (rootCss, com_Const, com_util, com_Config, com_Log, com_Kernel, com_interface, MainFrame) {
    'use strict';

    //========================================================================
    // Define variable
    //========================================================================
    var Jupyter;
    var events;
    var liveNotebook = false;

    var defaultConfig;
    var metadataSettings;
    var vpPosition;
    var vpFrame;
    
    //========================================================================
    // Require: Jupyter & events
    //========================================================================
    try {
        // namespace's specified checking. events exception can occur
        // this will work in a live notebook because nbextensions & custom.js are loaded
        // by/after notebook.js, which requires base/js/namespace
        Jupyter = require('base/js/namespace');
        events = require('base/js/events');
        liveNotebook = true;
    } catch (err) {
        // We *are* theoretically in a non-live notebook
        console.log('[vp] working in non-live notebook'); //, err);
        // in non-live notebook, there's no event structure, so we make our own
        if (window.events === undefined) {
            var Events = function () { };
            window.events = $([new Events()]);
        }
        events = window.events;
    }

    //========================================================================
    // Event: Add browser history event
    //========================================================================
    // window.addEventListener('popstate', function (e) {
    //     if (e.state != null && e.state.back != null) {
    //         var backId = e.state.back;
    //         document.getElementById(backId).scrollIntoView(true);
    //         if (liveNotebook) {
    //             var cell = $(document.getElementById(backId)).closest('.cell').data('cell');
    //             Jupyter.notebook.select(Jupyter.notebook.find_cell_index(cell));
    //             //highlight_vp_item('vp_link_click', {cell: cell});
    //         }
    //     }
    // });

    //========================================================================
    // Internal call function
    //========================================================================
    /**
     * Read dejault config
     * FIXME: move it to com_Config
     */
    var _readDefaultConfig = function() {
        // default values for system-wide configurable parameters
        defaultConfig = {
            moveMenuLeft: true,
            navigate_menu: true,
            threshold: 4,
            widenNotebook: false
        };
        // default values for per-notebook configurable parameters
        metadataSettings = {
            base_numbering: 1,
            title_cell: 'VisualPython',
            title_sidebar: 'VisualPython',
            vp_cell: false,
            vpPosition: {},
            vp_section_display: true,
            vp_window_display: false
        };
    
        // merge default config
        $.extend(true, defaultConfig, metadataSettings);
        
        // vpPosition default also serves as the defaults for a non-live notebook
        vpPosition = {
            height: 'calc(100% - 110px)',
            width: '50%',
            right: '0px',
            top: '110px'
        };
        $.extend(true, defaultConfig.vpPosition, vpPosition);
    }

    /**
     * set metadta
     * @param {*} key
     * @param {*} value
     */
    var _setVpMetaData = function (key, value) {
        // Jupyter Notebook loaded
        if (liveNotebook) {
            var vpMetaData = Jupyter.notebook.metadata.vp;
            if (vpMetaData === undefined) {
                vpMetaData = Jupyter.notebook.metadata.vp = {};
            }
            var oldVal = vpMetaData[key];
            vpMetaData[key] = value;
            if (typeof _ !== undefined ? !_.isEqual(value, oldVal) : oldVal != value) {
                Jupyter.notebook.set_dirty();
            }
        }
        return value;
    };

    /**
     * Add toolbar button
     * @param {defaultConfig} cfg configuration
     */
    var _addToolBarVpButton = function (cfg) {
        // Call notebookApp initialize event, if toolbar is not yet ready
        if (!Jupyter.toolbar) {
            events.on('app_initialized.NotebookApp', function (evt) {
                _addToolBarVpButton(cfg);
            });
            return;
        }
        
        // Add toolbar button, if it's not existing
        if ($('#' + com_Const.TOOLBAR_BTN_INFO.ID).length === 0) {
            $(Jupyter.toolbar.add_buttons_group([
                Jupyter.keyboard_manager.actions.register({
                    'help': com_Const.TOOLBAR_BTN_INFO.HELP
                    , 'icon': com_Const.TOOLBAR_BTN_INFO.ICON
                    , 'handler': function () {
                        // Extension 버튼 클릭 시 실행
                        // _toggleVp(cfg);
                        vpFrame.toggleVp();
                    }
                }, com_Const.TOOLBAR_BTN_INFO.NAME, com_Const.TOOLBAR_BTN_INFO.PREFIX)
            ])).find('.btn').attr('id', com_Const.TOOLBAR_BTN_INFO.ID).addClass(com_Const.TOOLBAR_BTN_INFO.ICON_CONTAINER);
        }
    };

    /**
     * Create vp
     * @param {defaultConfig} cfg configuration
     * @param {*} st 
     */
    var _loadVpResource = function (cfg, st) {
        if (!liveNotebook)
            cfg = $.extend(true, {}, defaultConfig, cfg);

        vpFrame = new MainFrame();
        vpFrame.loadMainFrame();

        // TODO: hotkey control -> Implement under InputComponent or Event class
        // input:text - hotkey control
        $(document).on('focus', com_util.wrapSelector('input'), function() {
            com_interface.disableOtherShortcut();
        });
        $(document).on('blur', com_util.wrapSelector('input'), function() {
            com_interface.enableOtherShortcut();
        });
        $(document).on('focus', '.vp-popup-frame input', function() {
            com_interface.disableOtherShortcut();
        });
        $(document).on('blur', '.vp-popup-frame input', function() {
            com_interface.enableOtherShortcut();
        });
        $(document).on('focus', '#vp_fileNavigation input', function() {
            com_interface.disableOtherShortcut();
        });
        $(document).on('blur', '#vp_fileNavigation input', function() {
            com_interface.enableOtherShortcut();
        });
        // textarea - hotkey control
        $(document).on('focus', com_util.wrapSelector('.vp-popup-frame textarea'), function() {
            com_interface.disableOtherShortcut();
        });
        $(document).on('blur', com_util.wrapSelector('.vp-popup-frame textarea'), function() {
            com_interface.enableOtherShortcut();
        });
    };

    /**
     * Declare background vp functions
     */
    var _readKernelFunction = function() {
        var libraryList = [ 
            'printCommand.py',
            'fileNaviCommand.py',
            'pandasCommand.py',
            'variableCommand.py'
        ];
        libraryList.forEach(libName => {
            var libPath = com_Const.PYTHON_PATH + libName
            $.get(libPath).done(function(data) {
                var code_init = data;
                Jupyter.notebook.kernel.execute(code_init, { iopub: { output: function(data) {
                    console.log('visualpython - loaded library', data);
                } } }, { silent: false });
            }).fail(function() {
                console.log('visualpython - failed to load getPath library');
            });
        })
    }

    var _setGlobalVariables = function() {
        /**
         * visualpython log util
         * - use it instead of console.log
         * ex) vpLog.display(VP_LOG_TYPE.LOG, 'log text');
         */
        window.vpLog = new com_Log();
        /**
         * visualpython log util types
         * DEVELOP, LOG, ERROR
         */
        window.VP_LOG_TYPE = com_Log.LOG_TYPE;
        /**
         * visualpython config util
         */
        window.vpConfig = new com_Config();
        window.VP_MODE_TYPE = com_Config.MODE_TYPE;
        /**
         * visualpython kernel
         */
        window.vpKernel = new com_Kernel();
    }

    //========================================================================
    // External call function
    //========================================================================
    /**
     * Read our config from server config & notebook metadata
     * This function should only be called when both:
     * 1. the notebook (and its metadata) has fully loaded
     *  AND
     * 2. Jupyter.notebook.config.loaded has resolved
     */
    var readConfig = function () {
        var cfg = defaultConfig;

        if (!liveNotebook) {
            return cfg;
        }

        // config may be specified at system level or at document level. first, update
        // defaults with config loaded from server
        $.extend(true, cfg, Jupyter.notebook.config.data.vp);

        // ensure notebook metadata has vp object, cache old values
        var vpMetaData = Jupyter.notebook.metadata.vp || {};

        // reset notebook metadata to remove old values
        Jupyter.notebook.metadata.vp = {};

        // then update cfg with any found in current notebook metadata and save in nb
        // metadata (then can be modified per document)
        Object.keys(metadataSettings).forEach(function (key) {
            cfg[key] = Jupyter.notebook.metadata.vp[key] = (vpMetaData.hasOwnProperty(key) ? vpMetaData : cfg)[key];
        });
        
        return cfg;
    };

    /**
     * Initialize Visual Python
     * @param {defaultConfig} cfg
     * @param {*} st 
     */
    var initVisualpython = function (cfg) {
        if (cfg === undefined) {
            cfg = readConfig();
        }

        _setGlobalVariables();
        _readKernelFunction();
        _addToolBarVpButton(cfg);
        _loadVpResource(cfg);

        if (cfg.vp_section_display && vpFrame) {
            vpFrame.openVp();
        }
    }
    
    //========================================================================
    // Read default config     
    //========================================================================
    _readDefaultConfig();

    return { initVisualpython: initVisualpython, readConfig: readConfig };

}); /* function, define */

/* End of file */
