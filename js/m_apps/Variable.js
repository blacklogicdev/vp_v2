/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : Variable.js
 *    Author          : Black Logic
 *    Note            : Apps > Variable
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] Variable
//============================================================================
define([
    'text!vp_base/html/m_apps/variable.html!strip',
    'css!vp_base/css/m_apps/variable.css',
    'vp_base/js/com/com_String',
    'vp_base/js/com/component/PopupComponent'
], function(varHtml, varCss, com_String, PopupComponent) {

    /**
     * Variable
     */
    class Variable extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.dataview = false;
            this.config.sizeLevel = 3;

            this.state = {
                variable: '',
                ...this.state
            }
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            let that = this;
            // load variables on refresh
            $(this.wrapSelector('#vp_varRefresh')).click(function(event) {
                event.stopPropagation();
                that.loadVariables();
            });
        }

        templateForBody() {
            /** Implement generating template */
            return varHtml;
        }

        render() {
            super.render();

            this.loadVariables();
        }

        generateCode() {
            return this.state.variable;
        }

        loadVariables() {
            var that = this;
    
            // Searchable variable types
            var types = [
                // pandas object
                'DataFrame', 'Series', 'Index', 'Period', 'GroupBy', 'Timestamp'
                // Index type object
                , 'RangeIndex', 'CategoricalIndex', 'MultiIndex', 'IntervalIndex', 'DatetimeIndex', 'TimedeltaIndex', 'PeriodIndex', 'Int64Index', 'UInt64Index', 'Float64Index'
                // GroupBy type object
                , 'DataFrameGroupBy', 'SeriesGroupBy'
                // Plot type
                , 'Figure', 'AxesSubplot'
                // Numpy
                , 'ndarray'
                // Python variable
                , 'str', 'int', 'float', 'bool', 'dict', 'list', 'tuple'
            ];
    
            var tagTable = this.wrapSelector('#vp_var_variableBox table tbody');
    
            // variable list table
            var tagDetailTable = this.wrapSelector("#vp_varDetailTable");
            
            // initialize tags
            $(tagTable).find('tr').remove();
            $(tagDetailTable).html('');
            
            // HTML rendering
            vpKernel.getDataList(types).then(function(resultObj) {
                // var jsonVars = result.replace(/'/gi, `"`);
                // var varList = JSON.parse(jsonVars);
                let varListStr = resultObj.result;
                var varList = JSON.parse(varListStr);
    
                // add variable list in table
                varList.forEach(varObj => {
                    if (types.includes(varObj.varType) && varObj.varName[0] !== '_') {
                        var tagTr = document.createElement('tr');
                        var tagTdName = document.createElement('td');
                        var tagTdType = document.createElement('td');
                        $(tagTr).attr({
                            'data-var-name': varObj.varName,
                            'data-var-type': varObj.varType,
                            'class': that.state.variable == varObj.varName?'vp-selected':''
                        });
                        tagTdName.innerText = varObj.varName;
                        tagTdType.innerText = varObj.varType;
    
                        $(tagTr).append(tagTdName);
                        $(tagTr).append(tagTdType);
    
                        // variable click
                        $(tagTr).click(function() {
                            $(this).parent().find('tr').removeClass('vp-selected');
                            $(this).addClass('vp-selected');
                            that.state.variable = varObj.varName;
    
                            // show variable information on clicking variable
                            vpKernel.execute(varObj.varName).then(function(resultObj) {
                                let { result, type, msg } = resultObj;
                                var textResult = msg.content.data["text/plain"];
                                var htmlResult = msg.content.data["text/html"];
                                var imgResult = msg.content.data["image/png"];
                                
                                $(tagDetailTable).html('');
                                if (htmlResult != undefined) {
                                    // 1. HTML tag
                                    $(tagDetailTable).append(htmlResult);
                                } else if (imgResult != undefined) {
                                    // 2. Image data (base64)
                                    var imgTag = '<img src="data:image/png;base64, ' + imgResult + '">';
                                    $(tagDetailTable).append(imgTag);
                                } else if (textResult != undefined) {
                                    // 3. Text data
                                    var preTag = document.createElement('pre');
                                    $(preTag).text(textResult);
                                    $(tagDetailTable).html(preTag);
                                } else {
                                    $(tagDetailTable).append('(Select variables to preview the data.)');
                                }
                            });
                        });
    
                        $(tagTable).append(tagTr);
                    }
                });

                // trigger click of selected variable
                $(that.wrapSelector('.vp-selected')).click();
            });
        }
    }

    return Variable;
});