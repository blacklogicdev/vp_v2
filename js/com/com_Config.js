/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : com_Config.js
 *    Author          : Black Logic
 *    Note            : Configuration and settings control
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 09. 16
 *    Change Date     :
 */
//============================================================================
// [CLASS] Configuration
//============================================================================
define([], function() {
	'use strict';
    //========================================================================
    // Define Inner Variable
    //========================================================================
    /**
     * Type of mode
     */
    const _MODE_TYPE = {
        DEVELOP : 0,
        RELEASE : 1
    }

    //========================================================================
    // Declare Class
    //========================================================================
    /**
     * Configuration and settings
     */
    class Config {
        //========================================================================
        // Constructor
        //========================================================================
        constructor(initialData) {
            // initial configuration
            this.data = {
                // Configuration
                'vpcfg': {
                    
                },
                // User defined code for Snippets
                'vpudf': {
                    'default import': [
                        'import numpy as np',
                        'import pandas as pd',
                        'import matplotlib.pyplot as plt',
                        '%matplotlib inline',
                        'import seaborn as sns',
                        'import plotly.express as px'
                    ],
                    'matplotlib customizing': [
                        'import matplotlib.pyplot as plt',
                        '%matplotlib inline',
                        '',
                        "plt.rc('figure', figsize=(12, 8))",
                        '',
                        'from matplotlib import rcParams',
                        "rcParams['font.family'] = 'New Gulim'",
                        "rcParams['font.size'] = 10",
                        "rcParams['axes.unicode_minus'] = False"
                    ],
                    'as_float': [
                        'def as_float(x):',
                        '    """',
                        "    usage: df['col'] = df['col'].apply(as_float)",
                        '    """',
                        '    if not isinstance(x, str):',
                        '        return 0.0',
                        '    else:',
                        '        try:',
                        '            result = float(x)',
                        '            return result',
                        '        except ValueError:',
                        '            return 0.0'
                    ],
                    'as_int': [
                        'def as_int(x):',
                        '    """',
                        "    usage: df['col'] = df['col'].apply(as_int)",
                        '    """',
                        '    if not isinstance(x, str):',
                        '        return 0',
                        '    else:',
                        '        try:',
                        '            result = int(x)',
                        '            return result',
                        '        except ValueError:',
                        '            return 0.0'
                    ]
                }
            }

            this.data = {
                ...this.data,
                ...initialData
            }

            this.defaultConfig = {};
            this.metadataSettings = {};

            this._readDefaultConfig();
        }

        /**
         * Read dejault config
         */
        _readDefaultConfig() {
            // default values for system-wide configurable parameters
            this.defaultConfig = {
                indent: 4
            };
            // default values for per-notebook configurable parameters
            this.metadataSettings = {
                vp_signature: 'VisualPython',
                vp_position: {},
                vp_section_display: true,
                vp_board_display: true,
            };
            
            let vp_width = Config.MENU_MIN_WIDTH + (this.metadataSettings.vp_board_display? Config.BOARD_MIN_WIDTH: 0) + Config.MENU_BOARD_SPACING;
            this.metadataSettings['vp_position'] = {
                height: 'calc(100% - 110px)',
                width: vp_width + 'px',
                right: '0px',
                top: '110px'
            }
        
            // merge default config
            $.extend(true, this.defaultConfig, this.metadataSettings);
        }

        getMode() {
            return Config.serverMode;
        }

        /**
         * Get configuration data (on server)
         * @param {String} dataKey 
         * @param {String} configKey 
         * @returns 
         */
        getData(dataKey, configKey='vpudf') {
            // get data using key
            var data = Jupyter.notebook.config.data[configKey];
            if (Object.keys(data).length > 0) {
                return data[dataKey];
            }

            return undefined;
        }

        /**
         * Set configuration data (on server)
         * @param {Object} dataObj 
         * @param {String} configKey 
         */
        setData(dataObj, configKey='vpudf') {
            // set data using key
            Jupyter.notebook.config.loaded.then(function() {
                Jupyter.notebook.config.update({[configKey]: dataObj});
            });
        }

        /**
         * Get metadata (on jupyter file)
         * @param {String} dataKey 
         * @param {String} configKey 
         */
        getMetadata(dataKey='', configKey='vp') {
            if (dataKey == '') {
                return Jupyter.notebook.metadata[configKey];
            }
            return Jupyter.notebook.metadata[configKey][dataKey];
        }

        /**
         * Set metadata (on jupyter file)
         * @param {Object} dataObj 
         * @param {String} configKey 
         */
        setMetadata(dataObj, configKey='vp') {
            let oldData = Jupyter.notebook.metadata[configKey];
            Jupyter.notebook.metadata[configKey] = {
                ...oldData,
                ...dataObj
            };
            Jupyter.notebook.set_dirty();
        }

        /**
         * Reset metadata (on jupyter file)
         * @param {String} configKey 
         */
        resetMetadata(configKey='vp') {
            Jupyter.notebook.metadata[configKey] = {};
        }


    }

    //========================================================================
    // Define static variable
    //========================================================================
    /**
     * FIXME: before release, change it to _MODE_TYPE.RELEASE
     */
    // Config.serverMode = _MODE_TYPE.DEVELOP;
    Config.serverMode = _MODE_TYPE.RELEASE;

    /**
     * Type of mode
     */
    Config.MODE_TYPE = _MODE_TYPE;

    /**
     * Frame size settings
     */
    Config.JUPYTER_HEADER_SPACING = 110;
    Config.MENU_MIN_WIDTH = 270;
    Config.BOARD_MIN_WIDTH = 263;
    Config.MENU_BOARD_SPACING = 5;
    Config.VP_MIN_WIDTH = Config.MENU_MIN_WIDTH + Config.BOARD_MIN_WIDTH + Config.MENU_BOARD_SPACING; // = MENU_MIN_WIDTH + BOARD_MIN_WIDTH + MENU_BOARD_SPACING

    return Config;
});

/* End of file */