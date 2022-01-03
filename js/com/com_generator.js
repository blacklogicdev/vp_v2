/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : com_generator.js
 *    Author          : Black Logic
 *    Note            : Generator for library options
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 12. 17
 *    Change Date     :
 */
define([
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_makeDom',
    'vp_base/js/com/component/SuggestInput'
], function (com_util, com_makeDom, SuggestInput) {
    /**
     * show result after code executed
     */
    var _VP_SHOW_RESULT = true;

     /**
     * Generate page interface based on package configuration
     * @param {*} package 
     */
    var vp_showInterfaceOnPage = function(selector, package) {

        // generate input variable tag
        var tblInput = $(selector+' #vp_inputOutputBox table');
        package.input && package.input.forEach(function(o, i) {
            var obj = JSON.parse(JSON.stringify(o));
            tblInput.append(vp_createTag(selector, obj, true, (obj.required == false? false: true)));
        });

        // generate option variable tag
        var tblOption = $(selector+' #vp_optionBox table');
        package.variable && package.variable.forEach(function(o, i) {
            // cell metadata test
            var obj = JSON.parse(JSON.stringify(o)); // deep copy
            tblOption.append(vp_createTag(selector, obj, true, (obj.required == true)));
        });

        // generate output variable tag
        var tblOutput = $(selector+' #vp_inputOutputBox table');
        package.output && package.output.forEach(function(o, i) {
            var obj = JSON.parse(JSON.stringify(o)); // deep copy
            tblOutput.append(vp_createTag(selector, obj, true, (obj.required == true)));
        });
    }

    /**
     * Generate tag using type
     * @param {object} divTag
     * @param {*} obj 
     * @param {boolean} getValue 
     * @returns {HTMLTableRowElement} tblRow (tr tag)
     */
    var vp_createTag = function(divTag, obj, getValue=false, required=false) {
        // TR tag & TD label tag
        var tblRow = document.createElement('tr');
        var tblLabel = document.createElement('td');
        var tblInput = document.createElement('td');

        var lbl = document.createElement('label');
        var requiredFontStyle = required? 'vp-orange-text' : '';
        $(lbl).attr({
            'for': obj.name,
            'class': requiredFontStyle,
            'title': '(' + obj.name + ')'
        });
        lbl.innerText = obj.label;
        tblLabel.appendChild(lbl);

        // create as component type
        switch (obj.component) {
            case 'bool_checkbox':
                // FIXME: True False select box
                var select = $(`<select id="${obj.name}" class="vp-select vp-state"><option value="">Default</option></select>`);
                select.append($('<option value="True">True</option>'))
                    .append($('<option value="False">False</option>'));
                $(tblInput).append(select);
                break;
            case 'option_select':
                var optSlct = document.createElement('select');
                $(optSlct).attr({
                    'class':'vp-select option-select vp-state',
                    'id':obj.name
                });
                // if required, no default option
                if (required != true) {
                    $(optSlct).append($('<option value="">Default</option>'));
                }
                obj.options.forEach((opt, idx, arr) => {
                    var label = (obj.options_label != undefined? obj.options_label[idx]:opt);
                    var option = document.createElement('option');
                    $(option).attr({
                        // 'id':opt,
                        'index':obj.index,
                        'name':obj.name,
                        'value':opt
                    });
                    // cell metadata test
                    if (getValue && obj.value != undefined) {
                        // set as saved value
                        if (obj.value == opt) {
                            $(option).attr({
                                'selected':'selected'
                            });
                        }
                    }
                    option.append(document.createTextNode(label));
                    optSlct.appendChild(option);
                });
                tblInput.appendChild(optSlct);
                break;
            case 'var_select':
                // suggest input tag
                var tag = document.createElement('input');
                $(tag).attr({
                    'type': 'text',
                    'id': obj.name,
                    'class': 'vp-input vp-state'
                });
                vp_generateVarSuggestInput(divTag, obj);
                tblInput.appendChild(tag);
                break;
            case 'var_multi':
                // select tag with multiple selection
                var tag = document.createElement('select');
                $(tag).attr({
                    'id': obj.name,
                    'class': 'vp-select var-multi vp-state',
                    // multiple selection true
                    'multiple': true
                });
                vp_generateVarSelect(tag, obj.var_type, obj.value);
                tblInput.appendChild(tag);
                break;
            case 'textarea':
                var textarea = $(`<textarea id="${obj.name}" class="vp-textarea vp-state">${(obj.default==undefined?'':obj.default)}</textarea>`);
                // cell metadata test
                if (getValue && obj.value != undefined) {
                    // set as saved value
                    textarea.val(obj.value);
                }
                $(tblInput).append(textarea);
                break;
            case 'table':
                // break;
            case 'file':
                // break;
            // default : input_single
            default:
                // FIXME: use makedom
                var input = com_makeDom.renderInput({
                    'type':'text',
                    'class':'vp-input input-single vp-state',
                    'id':obj.name,
                    'placeholder':(obj.placeholder==undefined?'':obj.placeholder),
                    'value':(obj.default==undefined?'':obj.default),
                    'title':(obj.help==undefined?'':obj.help)
                });
                // cell metadata test
                if (getValue && obj.value != undefined) {
                    // set as saved value
                    input.attr({
                        'value': obj.value
                    });
                }
                $(tblInput).append(input);
        }
        tblRow.appendChild(tblLabel);
        tblRow.appendChild(tblInput);
        
        return tblRow;
    }

    /**
     * Generate suggest input
     * @param {object} obj
     */
    var vp_generateVarSuggestInput = function(divTag, obj) {
        var types = obj.var_type;
        var defaultValue = obj.value;

        // Include various index types for Index type
        var INDEX_TYPES = ['RangeIndex', 'CategoricalIndex', 'MultiIndex', 'IntervalIndex', 'DatetimeIndex', 'TimedeltaIndex', 'PeriodIndex', 'Int64Index', 'UInt64Index', 'Float64Index'];
        // Include various groupby types for Groupby type
        var GROUPBY_TYPES = ['DataFrameGroupBy', 'SeriesGroupBy']
        if (types.indexOf('Index') >= 0) {
            types = types.concat(INDEX_TYPES);
        }
        if (types.indexOf('GroupBy') >= 0) {
            types = types.concat(GROUPBY_TYPES);
        }

        vpKernel.getDataList(types).then((resultObj) => {
            let { result, type, msg } = resultObj;
            var varList = JSON.parse(result);
            varList = varList.map(function(v) {
                return { label: v.varName + ' (' + v.varType + ')', value: v.varName, dtype: v.varType };
            });
            // 1. Target Variable
            var suggestInput = new SuggestInput();
            suggestInput.setComponentID(obj.name);
            suggestInput.addClass('vp-input vp-state');
            suggestInput.setSuggestList(function() { return varList; });
            suggestInput.setNormalFilter(false);
            suggestInput.setValue($(divTag + ' #' + obj.name).val());
            suggestInput.setSelectEvent(function(selectedValue) {
                // trigger change
                $(divTag + ' #' + obj.name).val(selectedValue);
                $(divTag + ' #' + obj.name).trigger('select_suggestvalue');
            });
            $(divTag + ' #' + obj.name).replaceWith(function() {
                return suggestInput.toTagString();
            });
        }).catch(err => {
            vpLog.display(VP_LOG_TYPE.ERROR, 'Error on generating var suggest input', err);
        });
    }

    /**
     * Generate variable select tag
     * @param {object} tag 
     * @param {Array<string>} types 
     * @param {string} defaultValue 
     */
    var vp_generateVarSelect = function(tag, types, defaultValue = '') {
        // Include various index types for Index type
        var INDEX_TYPES = ['RangeIndex', 'CategoricalIndex', 'MultiIndex', 'IntervalIndex', 'DatetimeIndex', 'TimedeltaIndex', 'PeriodIndex', 'Int64Index', 'UInt64Index', 'Float64Index'];
        // Include various groupby types for Groupby type
        var GROUPBY_TYPES = ['DataFrameGroupBy', 'SeriesGroupBy']
        if (types.indexOf('Index') >= 0) {
            types = types.concat(INDEX_TYPES);
        }
        if (types.indexOf('GroupBy') >= 0) {
            types = types.concat(GROUPBY_TYPES);
        }

        vpKernel.getDataList(types).then(function(resultObj) {
            let { result, type, msg } = resultObj;
            var jsonVars = result.replace(/'/gi, `"`);
            var varList = JSON.parse(jsonVars);
            
            // option tags
            varList.forEach(listVar => {
                if (types.includes(listVar.varType) && listVar.varName[0] !== '_') {
                    var option = document.createElement('option');
                    $(option).attr({
                        'value':listVar.varName,
                        'text':listVar.varName,
                        'data-type':listVar.varType
                    });
                    // cell metadata test : defaultValue as selected
                    if (listVar.varName == defaultValue) {
                        $(option).prop('selected', true);
                    }
                    option.append(document.createTextNode(listVar.varName));
                    $(tag).append(option);
                }
            });

            // val-multi(select multiple) value list registration
            var classname = $(tag).attr('class');
            if (classname == 'var-multi') {
                $(tag).val(defaultValue);
            }

            // trigger change
            $(tag).trigger('change');
        }).catch(err => {
            vpLog.display(VP_LOG_TYPE.ERROR, 'Error on generating var selector', err);
        });
    }

    /**
     * pageId wrap selector
     * @param {string} pageId vp-option-page의 uuid값
     * @param {string} query 
     */
    var vp_wrapSelector = function(pageId, query) {
        return '.'+pageId+' '+query;
    }

    /**
     * Get tag value
     * @param {string} pageId vp-option-page uuid
     * @param {*} obj 
     * @returns {string} tag's value
     */
    var vp_getTagValue = function(pageId, obj) {
        var value = '';
        switch (obj.component) {
            case 'input_multi':
                value = $(vp_wrapSelector(pageId, '#'+obj.name)).val();
                break;
            case 'option_radio':
                var input = $(vp_wrapSelector(pageId, "input[name='"+obj.name+"']:checked")).val();
                // same as default
                if (input == obj.default) break;
                value = input;
                break;
            case 'option_checkbox':
                var checked = $(vp_wrapSelector(pageId, "input[name='"+obj.name+"']:checked")).val();

                for (var i = 0; i < checked.length; i++) {
                    value += "'" + $(checked[i]).val() + "',";
                }
                value = value.substr(0, value.length-1);
                break;
            case 'option_select':
                var input = $(vp_wrapSelector(pageId, '#'+obj.name)).val();
                // same as default
                if (input == obj.default) break;
                value = input;
                break;
            case 'var_select':
                value = $(vp_wrapSelector(pageId, '#'+obj.name)).val();
                break;
            case 'var_multi':
                value = $(vp_wrapSelector(pageId, '#'+obj.name)).val();
                break;
            case 'table':
            case 'file':
            default:
                var input = $(vp_wrapSelector(pageId, '#'+obj.name)).val();
                // same as default
                if (input == obj.default) break;
                value = input;
        }
        return value;
    }

    /**
     * Generate code
     * @param {string} pageId vp-option-page uuid
     * @param {Object} package 
     * @param {string} etcOptions [optional] userOptionCode addition ex) ", test='TEST'"
     * @returns {string} generated code / if error, null
     */
    var vp_codeGenerator = function(pageId, package, etcOptions = '') {
        var code = package.code;
        
        try {
            // input codes
            package.input && package.input.forEach(function(v, i) {
                var val = vp_getTagValue(pageId, v);
                var id = '${' + v.name + '}';
                if (val == undefined || val == ''){
                    if (v.required == undefined || v.required == true) {
                        // throw new Error("'" + v.label + "' is required.");
                    }
                    // if no value, replace it
                    code = code.split(id).join('');
                } else {
                    // text quotation
                    if (v.type == 'text') {
                        val = "'"+val+"'";
                    } 
                    code = code.split(id).join(val);
                }
            });

            // option codes
            var opt_params = ``;
            package.variable && package.variable.forEach(function(v, i) {
                var val = vp_getTagValue(pageId, v);
                // if required
                if (val == undefined || val == ''){
                    if (v.required == true) {
                        // throw new Error("'" + v.label + "' is required.");
                    }
                }
                else {
                    // text quotation
                    if (v.type == 'text') {
                        val = "'"+val+"'";
                    }
                    opt_params += ', '+v.name+'='+val;
                }
            })
            code = code.split('${v}').join(opt_params);

            // output codes
            package.output && package.output.forEach(function(v, i) {
                var val = vp_getTagValue(pageId, v);
                var id = '${' + v.name + '}'
                if (val == undefined || val == ''){
                    if (v.required == true) {
                        // throw new Error("'" + v.label + "' is required.");
                    }
                    // if no output exists, replace it
                    code = code.split(id).join('');
                    code = code.split(' = ').join('');
                } else {
                    // text quotation
                    if (v.type == 'text') {
                        val = "'"+val+"'";
                    }
                    code = code.split(id).join(val);
                }
            });

            // additional userOptionCode
            code = code.split('${etc}').join(etcOptions);

            // () prevent code: (, ${v})
            code = code.split('(, ').join('(');

            // show_result 
            if (_VP_SHOW_RESULT && package.output && package.output.length > 0) {
                var outputVariable = vp_getTagValue(pageId, package.output[0]);
                if (outputVariable != '') {
                    code += '\n'+ outputVariable
                }
            }

        } catch (e) {
            vpLog.display(VP_LOG_TYPE.ERROR, 'com_generator code generation error ' + e.message);
            return null;
        }
        return code;
    }

    /**
     * Bind columns source function
     * @param {object} pageThis 
     * @param {object} target 
     * @param {array} columnInputIdList 
     * Usage : 
     *  $(document).on('change', this.wrapSelector('#dataframe_tag_id'), function() {
     *      pdGen.vp_bindColumnSource(that, this, ['column_input_id']);
     *  });
     */
    var vp_bindColumnSource = function(pageThis, target, columnInputIdList) {
        var varName = $(target).val();

        if (varName === '') {
            // reset with no source
            columnInputIdList && columnInputIdList.forEach(columnInputId => {
                var suggestInputX = new SuggestInput();
                suggestInputX.setComponentID(columnInputId);
                suggestInputX.addClass('vp-input');
                suggestInputX.setNormalFilter(false);
                suggestInputX.setValue($(pageThis.wrapSelector('#' + columnInputId)).val());
                $(pageThis.wrapSelector('#' + columnInputId)).replaceWith(function() {
                    return suggestInputX.toTagString();
                });
            });
            return ;
        }
        // get result and show on detail box
        vpKernel.getColumnList(varName).then(function(resultObj) {
            try {
                let { result, type, msg } = resultObj;
                var varResult = JSON.parse(result);
    
                if (varResult.length > 0) {
                    // columns using suggestInput
                    columnInputIdList && columnInputIdList.forEach(columnInputId => {
                        var suggestInputX = new SuggestInput();
                        suggestInputX.setComponentID(columnInputId);
                        suggestInputX.addClass('vp-input');
                        suggestInputX.setPlaceholder("column name");
                        suggestInputX.setSuggestList(function() { return varResult; }); //FIXME:
                        suggestInputX.setNormalFilter(false);
                        suggestInputX.setValue($(pageThis.wrapSelector('#' + columnInputId)).val());
                        $(pageThis.wrapSelector('#' + columnInputId)).replaceWith(function() {
                            return suggestInputX.toTagString();
                        });
                    });
                }
            } catch (e) {
                vpLog.display(VP_LOG_TYPE.ERROR, 'com_generator - bindColumnSource: not supported data type. ', e);
            }
        });

    }

    return {
        vp_showInterfaceOnPage: vp_showInterfaceOnPage,
        vp_codeGenerator: vp_codeGenerator,
        vp_generateVarSelect: vp_generateVarSelect,
        vp_getTagValue: vp_getTagValue,
        vp_bindColumnSource: vp_bindColumnSource
    };
});