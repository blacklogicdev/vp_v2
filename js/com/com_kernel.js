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
define([
    './com_Config'
], function(com_Config) {

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
        execute(command, callback) {
            
        }

        getDataList(dataTypeList) {
            return this.data;
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