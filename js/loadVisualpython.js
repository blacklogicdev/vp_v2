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
    'vp_base/js/com/com_KernelJupyter',
    'vp_base/js/MainFrame'
], function (rootCss, com_Const, com_util, com_Config, com_Log, com_Kernel, com_KernelJupyter, MainFrame) {
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
        // namespace 의 경우 specifed 체크. events 에 대한 예외 발생 가능할 것으로 예상.
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
     * TODO: 하드코딩이 아닌 file read 로 변경 되어야 할듯.
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
            nav_menu: {},
            number_sections: true,
            sideBar: true,
            base_numbering: 1,
            title_cell: 'VisualPython',
            title_sidebar: 'VisualPython',
            vp_cell: false,
            vpPosition: {},
            vp_section_display: true,
            vp_window_display: false
        };
    
        // 기본설정 병합
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
     * 메타 데이터 반영
     * @param {*} key 설정 키
     * @param {*} value 설정 값
     */
    var _setVpMetaData = function (key, value) {
        // Jupyter Notebook 정상 로드된 경우
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
     * 툴바 버튼 추가
     * @param {defaultConfig} cfg 설정값
     */
    var _addToolBarVpButton = function (cfg) {
        // 툴바가 생성되기 전이라면 노트북앱 초기화 후 호출되도록 이벤트 바인딩
        if (!Jupyter.toolbar) {
            events.on('app_initialized.NotebookApp', function (evt) {
                _addToolBarVpButton(cfg);
            });
            return;
        }
        
        // 툴바 토글버튼이 존재하지 않으면 추가
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
     * vp 생성
     * @param {defaultConfig} cfg 설정값
     * @param {*} st 
     */
    var _loadVpResource = function (cfg, st) {
        if (!liveNotebook)
            cfg = $.extend(true, {}, defaultConfig, cfg);

        vpFrame = new MainFrame();
        vpFrame.loadMainFrame();

        // TODO: hotkey control -> Implement under InputComponent or Event class
        // hotkey 제어 input text 인 경우 포커스를 가지면 핫키 막고 잃으면 핫키 허용
        $(document).on('focus', com_util.wrapSelector('input[type="text"]'), function() {
            Jupyter.notebook.keyboard_manager.disable();
        });
        $(document).on('blur', com_util.wrapSelector('input[type="text"]'), function() {
            Jupyter.notebook.keyboard_manager.enable();
        });
        // minju: hotkey 제어 input number 인 경우 포커스를 가지면 핫키 막고 잃으면 핫키 허용
        $(document).on('focus', com_util.wrapSelector('input[type="number"]'), function() {
            Jupyter.notebook.keyboard_manager.disable();
        });
        $(document).on('blur', com_util.wrapSelector('input[type="number"]'), function() {
            Jupyter.notebook.keyboard_manager.enable();
        });
        // minju: textarea용 - hotkey 제어 textarea 인 경우 포커스를 가지면 핫키 막고 잃으면 핫키 허용
        $(document).on('focus', com_util.wrapSelector('textarea'), function() {
            Jupyter.notebook.keyboard_manager.disable();
        });
        $(document).on('blur', com_util.wrapSelector('textarea'), function() {
            Jupyter.notebook.keyboard_manager.enable();
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
         if (vpConfig.serverMode == VP_MODE_TYPE.DEVELOP) {
             window.vpKernel = new com_Kernel();
         } else {
             window.vpKernel = new com_KernelJupyter();
         }
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
    }
    
    //========================================================================
    // Read default config     
    //========================================================================
    _readDefaultConfig();

    return { initVisualpython: initVisualpython, readConfig: readConfig };

}); /* function, define */

/* End of file */
