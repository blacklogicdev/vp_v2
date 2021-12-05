/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : com_Kernel.js
 *    Author          : Black Logic
 *    Note            : Interface between vp and jupyter
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 09. 16
 *    Change Date     :
 */
//============================================================================
// [CLASS] Kernel
//============================================================================
define([
    './com_Config',
    './com_util'
], function(com_Config, com_util) {

    /**
     * Kernel interface class
     */
    class Kernel {
        /** constructor */
        constructor() {
            this.data = [
                { varName: 'df1', varType: 'DataFrame' },
                { varName: 'df2', varType: 'DataFrame' },
                { varName: 'df3', varType: 'DataFrame' },
                { varName: 's1', varType: 'Series' },
                { varName: 's2', varType: 'Series' },
                { varName: 's3', varType: 'Series' },
                { varName: 'l1', varType: 'List' },
                { varName: 'l2', varType: 'List' },
                { varName: 'l3', varType: 'List' }
            ]

            this.config = {
                'vpcfg': {

                },
                'vpudf': {

                }
            }
        }

        //====================================================================
        // Executing command api
        //====================================================================
        execute(command, isSilent = false) {
            return new Promise(function(resolve, reject) {
                Jupyter.notebook.kernel.execute(
                    command,
                    {
                        iopub: {
                            output: function (msg) {
                                if (msg.content) {
                                    if (msg.content['name'] == 'stderr') {
                                        reject(msg);
                                    } else {
                                        var result = '';
                                        var type = '';
                                        if (msg.content['text']) {
                                            result = String(msg.content['text']);
                                            type = 'text';
                                        } else if (msg.content.data) {
                                            if (msg.content.data['text/plain']) {
                                                result = String(msg.content.data['text/plain']);
                                                type = 'text/plain';
                                            } else if (msg.content.data['text/html']) {
                                                result = String(msg.content.data['text/html']);
                                                type = 'text/html';
                                            }
                                        }
                                        resolve(result, type);
                                    }
                                }
                            }
                        }
                    },
                    { silent: isSilent }
                );
            });
        }

        getDataList(dataTypeList=[]) {
            // use function command to get variable list of selected data types
            var cmdSB = '_vp_print(_vp_get_variables_list(None))';
            if (dataTypeList && dataTypeList.length > 0) {
                cmdSB = com_util.formatString('_vp_print(_vp_get_variables_list({0}))', JSON.stringify(dataTypeList));
            }
            
            var that = this;
            return new Promise(function(resolve, reject) {
                that.execute(cmdSB.toString()).then(function(result, type) {
                    // resolve
                    resolve(result, type);
                }).catch(function(err) {
                    // reject
                    reject(err);
                })
            })
        }

        getColumnList(dataframe) {
            var that = this;
            return new Promise(function(resolve, reject) {
                that.execute(com_util.formatString('_vp_print(_vp_get_columns_list({0}))', dataframe))
                .then(function(result) {
                    resolve(result);
                });
            });
        }
    
        getCommonColumnList(dataframeList) {
            var that = this;
            return new Promise(function(resolve, reject) {
                that.execute(com_util.formatString('_vp_print(_vp_get_multi_columns_list([{0}]))', dataframeList.join(',')))
                .then(function(result) {
                    resolve(result);
                });
            });
        }
    
        getRowList(dataframe) {
            var that = this;
            return new Promise(function(resolve, reject) {
                that.execute(com_util.formatString('_vp_print(_vp_get_rows_list({0}))', dataframe))
                .then(function(result) {
                    resolve(result);
                });
            });
        }
    
        getProfilingList() {
            var that = this;
            return new Promise(function(resolve, reject) {
                that.execute('_vp_print(_vp_get_profiling_list())')
                .then(function(result) {
                    resolve(result);
                });
            });
        }

        //====================================================================
        // Configuration api
        //====================================================================
        loadConfig() {

        }

        getConfig() {

        }

        setConfig() {

        }

    }

    return Kernel;
});