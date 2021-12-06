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

            
        }

        getMode() {
            return Config.serverMode;
        }

        getData(dataKey, configKey='vpudf') {
            // get data using key
            var data = Jupyter.notebook.config.data[configKey];
            if (Object.keys(data).length > 0) {
                return data[dataKey];
            }

            return undefined;
        }

        setData(dataObj, configKey='vpudf') {
            // set data using key
            Jupyter.notebook.config.loaded.then(function() {
                Jupyter.notebook.config.update({[configKey]: dataObj});
            });
        }


    }

    //========================================================================
    // Define static variable
    //========================================================================
    /**
     * FIXME: before release, change it to _MODE_TYPE.RELEASE
     */
    Config.serverMode = _MODE_TYPE.DEVELOP;

    /**
     * Type of mode
     */
    Config.MODE_TYPE = _MODE_TYPE;

    /**
     * Frame size settings
     */
    Config.JUPYTER_HEADER_SPACING = 110;
    Config.MENU_MIN_WIDTH = 263;
    Config.BOARD_MIN_WIDTH = 263;
    Config.MENU_BOARD_SPACING = 5;
    Config.VP_MIN_WIDTH = 531; // = MENU_MIN_WIDTH + BOARD_MIN_WIDTH + MENU_BOARD_SPACING

    return Config;
});

/* End of file */