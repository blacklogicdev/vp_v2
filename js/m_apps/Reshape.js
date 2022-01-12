/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : Reshape.js
 *    Author          : Black Logic
 *    Note            : Apps > Reshape
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] Reshape
//============================================================================
define([
    'text!vp_base/html/m_apps/reshape.html!strip',
    'css!vp_base/css/m_apps/reshape.css',
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_util',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/MultiSelector'
], function(reshapeHtml, reshapeCss, com_String, com_util, PopupComponent, MultiSelector) {

    /**
     * Reshape
     */
    class Reshape extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.sizeLevel = 1;

            this.state = {
                variable: '',
                type: 'pivot',
                resetIndex: false,
                pivot: {
                    index: [],
                    columns: [],
                    values: []
                },
                melt: {
                    idVars: [],
                    ValueVars: [],
                    varName: '',
                    valueName: ''
                },
                userOption: '',
                allocateTo: '',
                ...this.state
            }
            this.popup = {
                type: '',
                targetSelector: '',
                ColSelector: undefined
            }
        }

        _unbindEvent() {
            super._unbindEvent();
            $(document).off('change', this.wrapSelector('#vp_rsDataframe'));
            $(document).off('click', this.wrapSelector('.vp-rs-df-refresh'));
            $(document).off('change', this.wrapSelector('#vp_rsType'));
            $(document).off('change', this.wrapSelector('#vp_rsIndex'));
            $(document).off('click', this.wrapSelector('#vp_rsIndexSelect'));
            $(document).off('change', this.wrapSelector('#vp_rsColumns'));
            $(document).off('click', this.wrapSelector('#vp_rsColumnsSelect'));
            $(document).off('change', this.wrapSelector('#vp_rsValues'));
            $(document).off('click', this.wrapSelector('#vp_rsValuesSelect'));
            $(document).off('change', this.wrapSelector('#vp_rsIdVars'));
            $(document).off('click', this.wrapSelector('#vp_rsIdVarsSelect'));
            $(document).off('change', this.wrapSelector('#vp_rsValueVars'));
            $(document).off('click', this.wrapSelector('#vp_rsValueVarsSelect'));
            $(document).off('change', this.wrapSelector('#vp_rsUserOption'));
            $(document).off('change', this.wrapSelector('#vp_rsAllocateTo'));
            $(document).off('change', this.wrapSelector('#vp_rsResetIndex'));
        }

        _bindEvent() {
            super._bindEvent();
            let that = this;
            //====================================================================
            // User operation Events
            //====================================================================
            // variable change event
            $(document).on('change', this.wrapSelector('#vp_rsDataframe'), function() {
                // if variable changed
                var newVal = $(this).val();
                if (newVal != that.state.variable) {
                    that.state.variable = newVal;
                    // initial child values
                    that._resetColumnSelector(that.wrapSelector('#vp_rsIndex'));
                    that._resetColumnSelector(that.wrapSelector('#vp_rsColumns'));
                    that._resetColumnSelector(that.wrapSelector('#vp_rsValues'));

                    that._resetColumnSelector(that.wrapSelector('#vp_rsIdVars'));
                    that._resetColumnSelector(that.wrapSelector('#vp_rsValueVars'));

                    that.state.pivot = {
                        index: [], columns: [], values: []
                    };
                    that.state.melt = {
                        idVars: [], valueVars: []
                    };
                }
            });

            // variable refresh event
            $(document).on('click', this.wrapSelector('.vp-rs-df-refresh'), function() {
                that.loadVariableList();
            });

            // on change event
            $(document).on('change', this.wrapSelector('#vp_rsType'), function(event) {
                var type = $(this).val();
                that.state.type = type;
                // change visibility
                if (type == 'pivot') {
                    $(that.wrapSelector('.vp-rs-type-box.melt')).hide();
                    $(that.wrapSelector('.vp-rs-type-box.pivot')).show();
                } else {
                    $(that.wrapSelector('.vp-rs-type-box.pivot')).hide();
                    $(that.wrapSelector('.vp-rs-type-box.melt')).show();
                }

                // clear user option
                $(that.wrapSelector('#vp_rsUserOption')).val('');
                that.state.userOption = '';
            });

            // index change event
            $(document).on('change', this.wrapSelector('#vp_rsIndex'), function(event) {
                var colList = event.dataList;
                that.state.pivot.index = colList;
            });

            // index select button event
            $(document).on('click', this.wrapSelector('#vp_rsIndexSelect'), function() {
                var targetVariable = [ that.state.variable ];
                var excludeList = [ ...that.state.pivot.columns, ...that.state.pivot.values ].map(obj => obj.code);
                that.openColumnSelector(targetVariable, $(that.wrapSelector('#vp_rsIndex')), 'Select columns', excludeList);
            });

            // columns change event
            $(document).on('change', this.wrapSelector('#vp_rsColumns'), function(event) {
                var colList = event.dataList;
                that.state.pivot.columns = colList;
            });

            // columns select button event
            $(document).on('click', this.wrapSelector('#vp_rsColumnsSelect'), function() {
                var targetVariable = [ that.state.variable ];
                var excludeList = [ ...that.state.pivot.index, ...that.state.pivot.values ].map(obj => obj.code);
                that.openColumnSelector(targetVariable, $(that.wrapSelector('#vp_rsColumns')), 'Select columns', excludeList);
            });

            // values change event
            $(document).on('change', this.wrapSelector('#vp_rsValues'), function(event) {
                var colList = event.dataList;
                that.state.pivot.values = colList;
            });

            // values select button event
            $(document).on('click', this.wrapSelector('#vp_rsValuesSelect'), function() {
                var targetVariable = [ that.state.variable ];
                var excludeList = [ ...that.state.pivot.index, ...that.state.pivot.columns ].map(obj => obj.code);
                that.openColumnSelector(targetVariable, $(that.wrapSelector('#vp_rsValues')), 'Select columns', excludeList);
            });

            // id vars change event
            $(document).on('change', this.wrapSelector('#vp_rsIdVars'), function(event) {
                var colList = event.dataList;
                that.state.melt.idVars = colList;
            });

            // id vars select button event
            $(document).on('click', this.wrapSelector('#vp_rsIdVarsSelect'), function() {
                var targetVariable = [ that.state.variable ];
                var excludeList = that.state.melt.valueVars.map(obj => obj.code);
                that.openColumnSelector(targetVariable, $(that.wrapSelector('#vp_rsIdVars')), 'Select columns', excludeList);
            });

            // value vars change event
            $(document).on('change', this.wrapSelector('#vp_rsValueVars'), function(event) {
                var colList = event.dataList;
                that.state.melt.valueVars = colList;
            });

            // value vars select button event
            $(document).on('click', this.wrapSelector('#vp_rsValueVarsSelect'), function() {
                var targetVariable = [ that.state.variable ];
                var excludeList = that.state.melt.idVars.map(obj => obj.code);
                that.openColumnSelector(targetVariable, $(that.wrapSelector('#vp_rsValueVars')), 'Select columns', excludeList);
            });

            // userOption event
            $(document).on('change', this.wrapSelector('#vp_rsUserOption'), function() {
                that.state.userOption = $(this).val();
            });

            // allocateTo event
            $(document).on('change', this.wrapSelector('#vp_rsAllocateTo'), function() {
                that.state.allocateTo = $(this).val();
            });
            
            // reset index checkbox event
            $(document).on('change', this.wrapSelector('#vp_rsResetIndex'), function() {
                that.state.resetIndex = $(this).prop('checked');
            });


        }

        templateForBody() {
            return reshapeHtml
        }

        templateForDataView() {
            return '';
        }

        renderDataView() {
            super.renderDataView();

            this.loadDataPage();
            $(this.wrapSelector('.vp-popup-dataview-box')).css('height', '300px');
        }

        renderDataPage(renderedText, isHtml = true) {
            var tag = new com_String();
            tag.appendFormatLine('<div class="{0} vp-close-on-blur vp-scrollbar">', 'rendered_html'); // 'rendered_html' style from jupyter output area
            if (isHtml) {
                tag.appendLine(renderedText);
            } else {
                tag.appendFormatLine('<pre>{0}</pre>', renderedText);
            }
            tag.appendLine('</div>');
            $(this.wrapSelector('.vp-popup-dataview-box')).html(tag.toString());
        }

        loadDataPage() {
            var that = this;
            var code = this.generateCode();
            // if not, get output of all data in selected pandasObject
            vpKernel.execute(code).then(function(resultObj) {
                let { msg } = resultObj;
                if (msg.content.data) {
                    var htmlText = String(msg.content.data["text/html"]);
                    var codeText = String(msg.content.data["text/plain"]);
                    if (htmlText != 'undefined') {
                        that.renderDataPage(htmlText);
                    } else if (codeText != 'undefined') {
                        // plain text as code
                        that.renderDataPage(codeText, false);
                    } else {
                        that.renderDataPage('');
                    }
                } else {
                    var errorContent = new com_String();
                    if (msg.content.ename) {
                        errorContent.appendFormatLine('<div class="{0}">', 'vp-popup-data-error-box');
                        errorContent.appendLine('<i class="fa fa-exclamation-triangle"></i>');
                        errorContent.appendFormatLine('<label class="{0}">{1}</label>',
                            'vp-popup-data-error-box-title', msg.content.ename);
                        if (msg.content.evalue) {
                            // errorContent.appendLine('<br/>');
                            errorContent.appendFormatLine('<pre>{0}</pre>', msg.content.evalue.split('\\n').join('<br/>'));
                        }
                        errorContent.appendLine('</div>');
                    }
                    that.renderDataPage(errorContent);
                }
            }).catch(function(resultObj) {
                let { msg } = resultObj;
                var errorContent = new com_String();
                if (msg.content.ename) {
                    errorContent.appendFormatLine('<div class="{0}">', 'vp-popup-data-error-box');
                    errorContent.appendLine('<i class="fa fa-exclamation-triangle"></i>');
                    errorContent.appendFormatLine('<label class="{0}">{1}</label>',
                    'vp-popup-data-error-box-title', msg.content.ename);
                    if (msg.content.evalue) {
                        // errorContent.appendLine('<br/>');
                        errorContent.appendFormatLine('<pre>{0}</pre>', msg.content.evalue.split('\\n').join('<br/>'));
                    }
                    errorContent.appendLine('</div>');
                }
                that.renderDataPage(errorContent);
            });
        }

        render() {
            super.render();

            this.loadVariableList();

            var {
                variable, type, pivot, melt, userOption, allocateTo, resetIndex
            } = this.state;

            $(this.wrapSelector('#vp_rsDataframe')).val(variable);
            $(this.wrapSelector('#vp_rsType')).val(type);
            $(this.wrapSelector('#vp_rsType')).trigger('change');

            // pivot
            this._loadColumnSelectorInput(this.wrapSelector('#vp_rsIndex'), pivot.index);
            this._loadColumnSelectorInput(this.wrapSelector('#vp_rsColumns'), pivot.columns);
            this._loadColumnSelectorInput(this.wrapSelector('#vp_rsValues'), pivot.values);

            // melt
            this._loadColumnSelectorInput(this.wrapSelector('#vp_rsIdVars'), melt.idVars);
            this._loadColumnSelectorInput(this.wrapSelector('#vp_rsValueVars'), melt.valueVars);
            $(this.wrapSelector('#vp_rsVarName')).val(melt.varName);
            $(this.wrapSelector('#vp_rsValueName')).val(melt.valueName);

            // userOption
            $(this.wrapSelector('#vp_rsUserOption')).val(userOption);

            // allocateTo
            $(this.wrapSelector('#vp_rsAllocateTo')).val(allocateTo);
            $(this.wrapSelector('#vp_rsResetIndex')).prop('checked', resetIndex);
        }

        /**
         * Render variable list (for dataframe)
         * @param {Array<object>} varList
         * @param {string} defaultValue previous value
         */
         renderVariableList(id, varList, defaultValue='') {
            var tag = new com_String();
            tag.appendFormatLine('<select id="{0}">', id);
            varList.forEach(vObj => {
                // varName, varType
                var label = vObj.varName;
                tag.appendFormatLine('<option value="{0}" data-type="{1}" {2}>{3}</option>'
                                    , vObj.varName, vObj.varType
                                    , defaultValue == vObj.varName?'selected':''
                                    , label);
            });
            tag.appendLine('</select>'); // VP_VS_VARIABLES
            $(this.wrapSelector('#' + id)).replaceWith(function() {
                return tag.toString();
            });
        }

        /**
         * Render column selector using ColumnSelector module
         * @param {Array<string>} previousList previous selected columns
         * @param {Array<string>} excludeList columns to exclude 
         */
         renderColumnSelector(targetVariable, previousList, excludeList) {
            this.popup.ColSelector = new MultiSelector(
                this.wrapSelector('.vp-inner-popup-body'), 
                { mode: 'columns', parent: targetVariable, selectedList: previousList, excludeList: excludeList }
            );
        }

        /**
         * Load variable list (dataframe)
         */
        loadVariableList() {
            var that = this;
            // load using kernel
            var dataTypes = ['DataFrame'];
            vpKernel.getDataList(dataTypes).then(function(resultObj) {
                let { result } = resultObj;
                try {
                    var varList = JSON.parse(result);
                    // render variable list
                    // get prevvalue
                    var prevValue = that.state.variable;
                    // replace
                    that.renderVariableList('vp_rsDataframe', varList, prevValue);
                    $(that.wrapSelector('#vp_rsDataframe')).trigger('change');
                } catch (ex) {
                    vpLog.display(VP_LOG_TYPE.ERROR, 'Reshape:', result);
                }
            });
        }

        generateCode() {
            var code = new com_String();
            var { variable, type, userOption, allocateTo, resetIndex, pivot, melt } = this.state;

            //====================================================================
            // Allocation
            //====================================================================
            if (allocateTo && allocateTo != '') {
                code.appendFormat('{0} = ', allocateTo);
            }

            //====================================================================
            // Dataframe variables
            //====================================================================
            code.appendFormat('{0}.{1}(', variable, type);

            var options = [];
            if (type == 'pivot') {
                //================================================================
                // pivot
                //================================================================
                // index (optional)
                if (pivot.index && pivot.index.length > 0) {
                    if (pivot.index.length == 1) {
                        options.push(com_util.formatString("index={0}", pivot.index[0].code));
                    } else {
                        options.push(com_util.formatString("index=[{0}]", pivot.index.map(col => col.code).join(',')));
                    }
                }

                // columns
                if (pivot.columns && pivot.columns.length > 0) {
                    if (pivot.columns.length == 1) {
                        options.push(com_util.formatString("columns={0}", pivot.columns[0].code));
                    } else {
                        options.push(com_util.formatString("columns=[{0}]", pivot.columns.map(col => col.code).join(',')));
                    }
                }

                // values (optional)
                if (pivot.values && pivot.values.length > 0) {
                    if (pivot.values.length == 1) {
                        options.push(com_util.formatString("values={0}", pivot.values[0].code));
                    } else {
                        options.push(com_util.formatString("values=[{0}]", pivot.values.map(col => col.code).join(',')));
                    }
                }

            } else {
                //================================================================
                // melt
                //================================================================
                // id vars (optional)
                if (melt.idVars && melt.idVars.length > 0) {
                    if (melt.idVars.length == 1) {
                        options.push(com_util.formatString("id_vars={0}", melt.idVars[0].code));
                    } else {
                        options.push(com_util.formatString("id_vars=[{0}]", melt.idVars.map(col => col.code).join(',')));
                    }
                }

                // value vars (optional)
                if (melt.valueVars && melt.valueVars.length > 0) {
                    if (melt.valueVars.length == 1) {
                        options.push(com_util.formatString("value_vars={0}", melt.valueVars[0].code));
                    } else {
                        options.push(com_util.formatString("value_vars=[{0}]", melt.valueVars.map(col => col.code).join(',')));
                    }
                }

                // var name (optional)
                if (melt.varName) {
                    options.push(com_util.formatString("var_name='{0}'", melt.varName));
                }

                // value name (optional)
                if (melt.varName) {
                    options.push(com_util.formatString("value_name='{0}'", melt.valueName));
                }
            }

            // userOption
            if (userOption && userOption != '') {
                options.push(userOption);
            }

            code.appendFormat('{0})', options.join(', '));

            //====================================================================
            // Reset index
            //====================================================================
            if (resetIndex) {
                code.append('.reset_index()');
            }

            if (allocateTo && allocateTo != '') {
                code.appendLine();
                code.append(allocateTo);
            }

            return code.toString();
        }

        loadState() {
            super.loadState();
        }

        _resetColumnSelector(target) {
            $(target).val('');
            $(target).data('list', []);
        }

        _loadColumnSelectorInput(tag, colList) {
            let colStr = colList? colList.map(col => col.code).join(','): '';
            $(tag).val(colStr);
            $(tag).data('list', colList)
        }

        /**
         * Open Inner popup page for column selection
         * @param {Object} targetSelector 
         * @param {string} title 
         * @param {Array<string>} excludeList 
         */
         openColumnSelector(targetVariable, targetSelector, title='Select columns', excludeList=[]) {
            this.popup.targetVariable = targetVariable;
            this.popup.targetSelector = targetSelector;
            var previousList = this.popup.targetSelector.data('list');
            if (previousList) {
                previousList = previousList.map(col => col.code)
            }
            this.renderColumnSelector(targetVariable, previousList, excludeList);
    
            // set title
            this.openInnerPopup(title);
        }

        handleInnerOk() {
            // ok input popup
            var dataList = this.popup.ColSelector.getDataList();

            $(this.popup.targetSelector).val(dataList.map(col => { return col.code }).join(','));
            $(this.popup.targetSelector).data('list', dataList);
            $(this.popup.targetSelector).trigger({ type: 'change', dataList: dataList });
            this.closeInnerPopup();
        }

    }

    return Reshape;
});