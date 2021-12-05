/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : com_setting.js
 *    Author          : Black Logic
 *    Note            : Common setting function
 *    License         : GPLv3 (GNU General Public License v3.0)
 *    Date            : 2021. 08. 14
 *    Change Date     :
 */

//============================================================================
// Common setting function
//============================================================================
define([
], function() {
    'use strict'

    //========================================================================
    // Define variable
    //========================================================================
    // default settings
    var default_settings = {
        'run_code_without_asking': false,
        'change_task_without_asking': false,
        'code_insert_position': 'below',
        'api_list_sort_by': 'frequency',
        'default_variable_for_required': false,
        'auto_import_package': false
    };

    // settings description list
    var settings_description = {
        'run_code_without_asking': {
            'ko': '질의 없이 코드 수행',
            'en': 'Run code without asking'
        },
        'change_task_without_asking': {
            'ko': '질의 없이 Task 변경',
            'en': 'Change task without asking'
        },
        'code_insert_position': {
            'ko': '코드 삽입 위치 지정',
            'en': 'Code insert position'
        },
        'api_list_sort_by': {
            'ko': 'API 목록의 정렬 방식',
            'en': 'Api list sorting by...'
        },
        'default_variable_for_required': {
            'ko': '필수 입력값에 임의 변수 사용 여부',
            'en': 'Default variable for required input'
        },
        'auto_import_package': {
            'ko': '패키지 자동 import',
            'en': 'Automatically import packages'
        }
    }

    // settings option list
    var settings_options = {
        'code_insert_position': [
            { text: 'Add cell below', value: 'below'},
            { text: 'Add cell above', value: 'above'},
            { text: 'Overwrite cell', value: 'overwrite'}
        ],
        'api_list_sort_by': [
            { text: 'Frequency', value: 'frequency'},
            { text: 'Alphabet', value: 'alphabet'}
        ]
    }

    //========================================================================
    // External call function
    //========================================================================
    /**
     * Save settings to notebook config file
     * @param {*} obj 
     */
    var saveSettingsData = function(obj, configKey = 'vpcfg') {
        Jupyter.notebook.config.loaded.then(function() {
            Jupyter.notebook.config.update({[configKey]: obj});
        });
    }

    /**
     * Load settings data
     * @returns {object} key-value object
     */
    var loadSettingsData = function(configKey = 'vpcfg') {
        var newData = Jupyter.notebook.config.data[configKey];
        if (newData == undefined) {
            newData = {};
        }

        // setting value update
        var data = {...default_settings};
        Object.keys(newData).forEach(key => {
            if (key in data) {
                data[key] = newData[key];
            }
        });

        return data;
    }

    /**
     * Load settings data with additional information
     * @returns {object} list
     * { name: .., type:.., description:.., default:.., value:.., [options:..] }
     */
    var loadSettingsDataUsable = function() {
        var data = loadSettingsData();
        
        var list = [];
        Object.keys(data).forEach(key => {
            if (key in settings_options) {
                // options type
                list.push({
                    name: key,
                    type: 'options',
                    description: settings_description[key].en,
                    default: default_settings[key],
                    value: data[key],
                    options: settings_options[key]
                })
            } else {
                // checkbox type
                list.push({
                    name: key,
                    type: 'checkbox',
                    description: settings_description[key].en,
                    default: default_settings[key],
                    value: data[key]
                })
            }
        });

        return list;
    }

    /**
     * save/load user defined code
     * Jupyter.notebook.config.data['vpudf'] = {
     *  'udf-key1' : 'code...',
     *  'udf-key2' : 'code...', ...
     * }
     */

    /**
     * Save user defined code to notebook config file
     * @param {object} obj { 'udf-key': 'code...' }
     * @param {string} configKey default: vpudf
     */
    var saveUserDefinedCode = function(obj, configKey = 'vpudf') {
        Jupyter.notebook.config.loaded.then(function() {
            Jupyter.notebook.config.update({[configKey]: obj});
        });
    };

    /**
     * Load user defined code from notebook config file
     * @param {function} callback(data = { 'key': 'code' })
     * @param {string} configKey default: vpudf
     */
    var loadUserDefinedCode = function(callback, configKey = 'vpudf') {
        Jupyter.notebook.config.load();
        Jupyter.notebook.config.loaded.then(function() {
            var data = Jupyter.notebook.config.data[configKey];
            if (data == undefined) {
                data = {};
            }
            callback(data);
        });
    };

    /**
     * Load udf as list with name, code
     * @param {function} callback(data = [{ name: 'key', code: 'code', ... }])
     * @param {string} configKey default: vpudf
     */
    var loadUserDefinedCodeList = function(callback, configKey = 'vpudf') {
        var data = loadUserDefinedCode(function(data) { 
            var udfList = [];
        
            Object.keys(data).forEach(key => {
                udfList.push({ name: key, code: data[key] });
            });

            callback(udfList);
        }, configKey);
    }

    /**
     * Get udfkey value
     * @param {string} udfKey 
     * @param {*} configKey default: vpudf
     * @returns {string} code / if udfKey is not exists, returns undefined
     */
    var getUserDefinedCode = function(udfKey, configKey = 'vpudf') {
        var data = Jupyter.notebook.config.data[configKey];
        if (Object.keys(data).length > 0) {
            return data[udfKey];
        }

        return undefined;
    }

    /**
     * Remove udf key from list
     * @param {*} udfKey key to delete
     * @param {*} configKey default: vpudf
     */
    var removeUserDefinedCode = function(udfKey, configKey = 'vpudf') {
        // if set value to null, it removes from config data
        Jupyter.notebook.config.loaded.then(function() {
            Jupyter.notebook.config.update({[configKey]: {[udfKey]: null}});
        });

    }

    return {
        default_settings: default_settings,
        saveSettingsData: saveSettingsData,
        loadSettingsData: loadSettingsData,
        loadSettingsDataUsable: loadSettingsDataUsable,
        saveUserDefinedCode: saveUserDefinedCode,
        loadUserDefinedCode: loadUserDefinedCode,
        loadUserDefinedCodeList: loadUserDefinedCodeList,
        getUserDefinedCode: getUserDefinedCode,
        removeUserDefinedCode: removeUserDefinedCode
    }

}); /* function, define */

/* End of file */
