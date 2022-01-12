/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : Chart.js
 *    Author          : Black Logic
 *    Note            : Apps > Chart
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] Chart
//============================================================================
define([
    'text!vp_base/html/m_apps/chart.html!strip',
    'css!vp_base/css/m_apps/chart.css',
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_generator',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/FileNavigation',
    'vp_base/js/com/component/SuggestInput'
], function(chartHTml, chartCss, com_String, com_Const, com_util, com_generator, PopupComponent, FileNavigation, SuggestInput) {

    /**
     * Chart
     */
    class Chart extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.dataview = false;
            this.config.sizeLevel = 2;
            
            this.setDefaultVariables();
            this.state = {
                kind: 'plot',
                ...this.state
            }
            this.package = this.plotPackage[this.state.kind];

        }

        _bindEvent() {
            super._bindEvent();
            let that = this;

        }

        bindEventAfterRender() {
            let that = this;
            // show option based on chart type
            $(this.wrapSelector('#vp_plotKind .vp-plot-item')).click(function() {
                // plot item
                $(this).parent().find('.vp-plot-item').removeClass('selected');
                $(this).addClass('selected');
    
                // select 태그 강제 선택
                var kind = $(this).data('kind');
                $(that.wrapSelector('#kind')).val(kind).prop('selected', true);
    
                var thisPackage = { ...that.plotPackage[kind] };          
                if (thisPackage == undefined) thisPackage = that.plotPackage['plot'];
    
                // 모두 숨기기 (단, 대상 변수 입력란과 차트 유형 선택지 제외)
                $(that.wrapSelector('table.vp-plot-setting-table tr:not(:last)')).hide();
    
                // 해당 옵션에 있는 선택지만 보이게 처리
                thisPackage.input && thisPackage.input.forEach(obj => {
                    $(that.wrapSelector('#' + obj.name)).closest('tr').show();
    
                    var label = obj.label;
                    if (label != undefined) {
                        $(that.wrapSelector('#' + obj.name)).closest('tr').find('th').removeClass('vp-orange-text');
                        if (obj.required != false) {
                            // label = "* " + obj.label;
                            $(that.wrapSelector('#' + obj.name)).closest('tr').find('th').addClass('vp-orange-text');
                        }
                        // $(that.wrapSelector("label[for='" + obj.name + "']")).text(label);
                        $(that.wrapSelector('#' + obj.name)).closest('tr').find('th').text(label);
                    }
                });
                thisPackage.variable && thisPackage.variable.forEach(obj => {
                    $(that.wrapSelector('#' + obj.name)).closest('tr').show();
                });
    
                thisPackage.input = thisPackage.input.concat(that.addOption);
                that.package = thisPackage;
            });

            // use color
            $(this.wrapSelector('#useColor')).change(function() {
                var checked = $(this).prop('checked');
                if (checked == true) {
                    // 색상 선택 가능하게
                    $(that.wrapSelector('#color')).removeAttr('disabled');
                } else {
                    $(that.wrapSelector('#color')).attr('disabled', 'true');
                }
            })

            // marker selector
            $(this.wrapSelector('#markerSelector')).change(function() {
                var selected = $(this).val();
                if (selected == "marker") {
                    $(this).parent().find('#marker').show();
                    $(this).parent().find('#marker').val('');
                } else {
                    $(this).parent().find('#marker').hide();
                    $(this).parent().find('#marker').val(selected);
                }
            });

            // select cmap
            $(this.wrapSelector('.vp-plot-cmap-wrapper')).click(function() {
                $(this).toggleClass('open');
            });

            // open file navigation
            $(this.wrapSelector('#vp_openFileNavigationBtn')).click(function() {
                let fileNavi = new FileNavigation({
                    type: 'save',
                    extensions: ['png'],
                    finish: function(filesPath, status, error) {
                        if (filesPath.length > 0) {
                            let { file, path } = filesPath[0];
                            $(that.wrapSelector('#savefigpath')).val(path);
                            $(that.wrapSelector('#fileName')).val(file);
                        }
                    }
                });
                fileNavi.open();
            });
        }

        templateForBody() {
            return chartHTml
        }

        loadState() {
            vpLog.display(VP_LOG_TYPE.DEVELOP, this.state);   

            let that = this;
            Object.keys(this.state).forEach(key => {
                if (key !== 'config') {
                    let tag = $(that.wrapSelector('#' + key));
                    let tagName = $(tag).prop('tagName');
                    let savedValue = that.state[key];
                    switch(tagName) {
                        case 'INPUT':
                            let inputType = $(tag).prop('type');
                            if (inputType == 'text' || inputType == 'number') {
                                $(tag).val(savedValue);
                                break;
                            }
                            if (inputType == 'checkbox') {
                                $(tag).prop('checked', savedValue);
                                break;
                            }
                            break;
                        case 'TEXTAREA':
                        case 'SELECT':
                        default:
                            $(tag).val(savedValue);
                            break;
                    }
                }
            });
        }

        render() {
            super.render();

            this.renderImportOptions();
            this.renderSubplotOption1();
            this.renderCmapSelector();

            // bind event
            this.bindEventAfterRender();
            this.bindVariableSelector();
        }

        renderImportOptions() {
            var that = this;
    
            //====================================================================
            // Stylesheet suggestinput
            //====================================================================
            var stylesheetTag = $(this.wrapSelector('#vp_plStyle'));
            // search available stylesheet list
            var code = new com_String(); 
            // FIXME: convert it to kernelApi
            code.appendLine('import matplotlib.pyplot as plt');
            code.appendLine('import json');
            code.append(`print(json.dumps([{ 'label': s, 'value': s } for s in plt.style.available]))`);
            vpKernel.execute(code.toString()).then(function(resultObj) {
                let { result } = resultObj;
                // get available stylesheet list
                var varList = JSON.parse(result);
                var suggestInput = new SuggestInput();
                suggestInput.setComponentID('vp_plStyle');
                suggestInput.setSuggestList(function() { return varList; });
                suggestInput.setPlaceholder('style name');
                // suggestInput.setNormalFilter(false);
                $(stylesheetTag).replaceWith(function() {
                    return suggestInput.toTagString();
                });
            });
    
            //====================================================================
            // System font suggestinput
            //====================================================================
            var fontFamilyTag = $(this.wrapSelector('#vp_plFontName'));
            // search system font list
            var code = new com_String();
            // FIXME: convert it to kernelApi
            code.appendLine('import json'); 
            code.appendLine("import matplotlib.font_manager as fm");
            code.appendLine("_ttflist = fm.fontManager.ttflist");
            code.append("print(json.dumps([{'label': f.name, 'value': f.name } for f in _ttflist]))");
            vpKernel.execute(code.toString()).then(function(resultObj) {
                let { result } = resultObj;
                // get available font list
                var varList = JSON.parse(result);
                var suggestInput = new SuggestInput();
                suggestInput.setComponentID('vp_plFontName');
                suggestInput.setSuggestList(function() { return varList; });
                suggestInput.setPlaceholder('font name');
                // suggestInput.setNormalFilter(false);
                $(fontFamilyTag).replaceWith(function() {
                    return suggestInput.toTagString();
                });
            });
    
            //====================================================================
            // Events
            //====================================================================
            $(this.wrapSelector('#vp_plImportRun')).click(function() {
                // generateImportCode
                var code = that.generateImportCode();
                // create block and run it
                $('#vp_wrapper').trigger({
                    type: 'create_option_page', 
                    blockType: 'block',
                    menuId: 'lgExe_code',
                    menuState: { taskState: { code: code } },
                    afterAction: 'run'
                });
            });
        }

        renderSubplotOption1() {
            // render kind selector
            this.renderKindSelector();
    
            // show marker image
            var optionTagList = $(this.wrapSelector('#markerSelector option'));
            // [0] : except typing tag
            for (var i = 1; i < optionTagList.length; i++) {
                // file name
                var imgFile = $(optionTagList[i]).data('img');
                // bind url
                var url = com_Const.IMAGE_PATH + 'chart/marker/' + imgFile;
                $(optionTagList[i]).attr({
                    'data-img': url
                });
            }
        }

        renderKindSelector() {
            // chart type selector
            var selector = $(this.wrapSelector('#kind'));
            var that = this;
            this.plotKind.forEach(kind => {
                var option = document.createElement('option');
                $(option).attr({
                    id: kind,
                    name: 'kind',
                    value: kind
                });
                var span = document.createElement('span');
                $(span).attr({
                    // class="vp-multilang" data-caption-id="imshow"
                    class: 'vp-multilang',
                    'data-caption-id':kind
                });
                span.append(document.createTextNode(that.plotKindLang[kind]))
                option.appendChild(span);
                selector.append(option);
            });
    
            // select chart type using metadata
            var plotType = this.state.kind;
    
            // select chart
            $(selector).val(plotType);
            $(this.wrapSelector(`#vp_plotKind .vp-plot-item[data-kind="${plotType}"]`)).addClass('selected');
            
            // hide original selector
            $(selector).hide();
    
            // initial plot chart option
            var plotPackage = { ...this.plotPackage[plotType] };
            // hide all (except allocate to, chart type selector)
            $(this.wrapSelector('table.vp-plot-setting-table tr:not(:last)')).hide();
    
            // show only options for this plot type
            plotPackage.input && plotPackage.input.forEach(obj => {
                $(this.wrapSelector('#' + obj.name)).closest('tr').show();
                var label = obj.label;
                if (label != undefined) {
                    $(this.wrapSelector('#' + obj.name)).closest('tr').find('th').removeClass('vp-orange-text');
                    if (obj.required != false) {
                        // label = "* " + obj.label;
                        $(this.wrapSelector('#' + obj.name)).closest('tr').find('th').addClass('vp-orange-text');
                    }
                    // $(this.wrapSelector("label[for='" + obj.name + "']")).text(label);
                    $(this.wrapSelector('#' + obj.name)).closest('tr').find('th').text(label);
                }
            });
            plotPackage.variable && plotPackage.variable.forEach(obj => {
                $(this.wrapSelector('#' + obj.name)).closest('tr').show();
            });
    
            plotPackage.input = plotPackage.input.concat(this.addOption);
            this.package = plotPackage;
        }

        renderCmapSelector() {
            // hide original selector
            var cmapSelector = this.wrapSelector('#cmap');
            $(cmapSelector).hide();
    
            // cmap selector
            this.cmap.forEach(ctype => {
                var option = document.createElement('option');
                $(option).attr({
                    'name': 'cmap',
                    'value': ctype
                });
                $(option).text(ctype == ''?'none':ctype);
                $(cmapSelector).append(option);
            });
    
            // dynamical div list for cmap data
            this.cmap.forEach(ctype => {
                var divColor = document.createElement('div');
                $(divColor).attr({
                    'class': 'vp-plot-cmap-item vp-scrollbar',
                    'data-cmap': ctype,
                    'data-url': 'pandas/cmap/' + ctype + '.JPG',
                    'title': ctype
                });
                $(divColor).text(ctype == ''?'none':ctype);
                
                // bind url
                var url = com_Const.IMAGE_PATH + 'chart/cmap/' + ctype + '.JPG';
                $(divColor).css({
                    'background-image' : 'url(' + url + ')'
                })
    
                var selectedCmap = this.wrapSelector('#vp_selectedCmap');
    
                // select color
                $(divColor).click(function() {
                    if (!$(this).hasClass('selected')) {
                        $(this).parent().find('.vp-plot-cmap-item.selected').removeClass('selected');
                        $(this).addClass('selected');
                        // selected cmap name
                        $(selectedCmap).text(ctype == ''?'none':ctype);
                        // selected cmap data-caption-id
                        $(selectedCmap).attr('data-caption-id', ctype);
                        // force selection
                        $(cmapSelector).val(ctype).prop('selected', true);
                    }
                });
                $(this.wrapSelector('#vp_plotCmapSelector')).append(divColor);
            });
        }

        bindVariableSelector() {
            var that = this;
            // view button click - view little popup to show variable & details
            $(this.wrapSelector('.vp-select-data')).click(function(event) {
                var axes = $(this).data('axes');
                
                if($(that.wrapSelector('#vp_varViewBox')).is(":hidden")) {
                    // refresh variables
                    that.refreshVariables(function(varList) {
                        // set position
                        var boxSize = { width: 280, height: 260 };
                        var boxPosition = { position: 'fixed', left: event.pageX - 20, top: event.pageY + 20 };
    
                        // set as center
                        boxPosition.left = 'calc(50% - 140px)';
                        boxPosition.top = 'calc(50% - 130px)';
                        $('#vp_varViewBox').css({
                            ...boxPosition
                        });
        
                        // set axes and prev code
                        $(that.wrapSelector('#vp_varViewBox')).attr({
                            'data-axes': axes
                        });
                        $(that.wrapSelector('#vp_varSelectCode')).val($(that.wrapSelector('#' + axes)).val());
        
                        // show popup area
                        $(that.wrapSelector('#vp_varViewBox')).show();
                    });
    
                } else {
                    // hide popup area
                    $(that.wrapSelector('#vp_varViewBox')).hide();
    
                    // init boxes
                    $(that.wrapSelector('#vp_varDetailColList')).html('');
                    $(that.wrapSelector('#vp_varDetailDtype')).val('');
                    $(that.wrapSelector('#vp_varDetailArray')).html('');
                }
            });
            // view close button click
            $(this.wrapSelector('.vp-close-view')).click(function(event) {
                // hide view
                // show/hide popup area
                $(that.wrapSelector('#vp_varViewBox')).toggle();
            });
    
            // view object selection
            $(document).on('click', this.wrapSelector('.vp-var-view-item'), function(event) {
                // set selection style
                // TODO: attach .selected
                $(that.wrapSelector('.vp-var-view-item')).removeClass('selected');
                $(this).addClass('selected');
    
                var varName = $(this).find('td:first').text();
                var varType = $(this).find('td:last').text();
    
                // set code
                $(that.wrapSelector('#vp_varSelectCode')).val(varName);
    
                // dataframe : columns, dtypes, array
                // series : array
                // use json.dumps to make python dict/list to become parsable with javascript JSON
                var code = new com_String();
                code.appendLine('import json');
                if (varType == 'DataFrame') {
                    code.appendFormat(`print(json.dumps([ { "colName": c, "dtype": str({0}[c].dtype), "array": str({1}[c].array) } for c in list({2}.columns) ]))`, varName, varName, varName);
                } else if (varType == 'Series') {
                    code.appendFormat(`print(json.dumps({"dtype": str({0}.dtype), "array": str({1}.array) }))`, varName, varName);
                }
    
                // get result and show on detail box
                vpKernel.execute(code.toString()).then(function(resultObj) {
                    let { result } = resultObj;
                    var varResult = JSON.parse(result);
    
                    $(that.wrapSelector('#vp_varDetailColList')).html('');
                    
                    var methodList = [];
                    // DataFrame / Series Detail
                    if (varType == 'DataFrame') {
                        if (varResult.length > 0) {
                            varResult.forEach(v => {
                                // var option = $(`<option value="${v.colName}" data-dtype="${v.dtype}" data-array="${v.array}">${v.colName}</option>`)
                                var option = $(`<div class="vp-column-select-item" 
                                                data-dtype="${v.dtype}" data-array="${v.array}" data-col="${v.colName}" title="${v.array}">
                                                    ${v.colName}</div>`);
                                $(that.wrapSelector('#vp_varDetailColList')).append(option);
                            });
    
                            // $(that.wrapSelector('#vp_varDetailDtype')).val(varResult[0].dtype);
    
                            // var array = varResult[0].array.replaceAll('/n', '\n');
                            // $(that.wrapSelector('#vp_varDetailArray')).text(array);
                        }
    
                        // method for object
                        methodList = [
                            { method: 'index', label: 'index' },
                            { method: 'columns', label: 'columns' },
                            { method: 'values', label: 'values' }
                        ]
                        var methodArrayCode = new com_String();
                        methodList.forEach(m => {
                            methodArrayCode.appendFormat('<div class="{0}" data-method="{1}">{2}</div>', 'vp-method-select-item', m.method, m.label);
                        });
                        $(that.wrapSelector('#vp_varDetailArray')).html(methodArrayCode.toString());
    
                        // show columns
                        // $(that.wrapSelector('#vp_varDetailColList')).closest('tr').show();
                        $(that.wrapSelector('#vp_varDetailColList')).attr({'disabled': false});
                    } else if (varType == 'Series') {
                        $(that.wrapSelector('#vp_varDetailDtype')).val(varResult.dtype);
                        var array = varResult.array.replaceAll('/n', '\n');
                        // $(that.wrapSelector('#vp_varDetailArray')).text(array);
    
                        // method for object
                        methodList = [
                            { method: 'index', label: 'index' },
                            { method: 'values', label: 'values' }
                        ]
                        var methodArrayCode = new com_String();
                        methodList.forEach(m => {
                            methodArrayCode.appendFormat('<div class="{0}" data-method="{1}">{2}</div>', 'vp-method-select-item', m.method, m.label);
                        });
                        $(that.wrapSelector('#vp_varDetailArray')).html(methodArrayCode.toString());
    
                        // disable columns
                        $(that.wrapSelector('#vp_varDetailColList')).attr({'disabled': true});
                    }
    
                });
            });
    
            // view column selection
            $(document).on('click', this.wrapSelector('#vp_varDetailColList .vp-column-select-item'), function() {
                var dtype = $(this).data('dtype');
                var array = $(this).data('array');
    
                var kind = $(that.wrapSelector('#kind')).val();
                var axes = $(that.wrapSelector('#vp_varViewBox')).attr('data-axes');
    
                $(this).toggleClass('selected');
    
                // if ((kind == 'plot' && axes == 'y')
                //     || (kind == 'bar' && axes == 'y')) {
                // allow multi select
                var methodArrayCode = new com_String();
                var methodList;
                // 선택된 항목들 중 categorical variable 존재하면 categorical로 분류
                var hasObject = false;
                var selectedColumnList = $(that.wrapSelector('#vp_varDetailColList .vp-column-select-item.selected'));
                if (selectedColumnList.length > 0) {
                    selectedColumnList.each((i, tag) => {
                        var tagDtype = $(tag).data('dtype');
                        if (tagDtype == 'object') {
                            hasObject = true;
                        }
                    });
                }
                if (dtype != undefined) {
                    if (hasObject == true) {
                        // categorical variable
                        methodList = that.methodList.categorical;
                    } else {
                        // numeric variable
                        methodList = that.methodList.numerical;
                    }
                    methodList = [ 
                        { method: 'index', label: 'index' },
                        { method: 'columns', label: 'columns' },
                        { method: 'values', label: 'values' },
                        ...methodList
                    ]
                    methodList.forEach(m => {
                        methodArrayCode.appendFormat('<div class="{0}" data-method="{1}">{2}</div>', 'vp-method-select-item', m.method, m.label);
                    });
                }
                $(that.wrapSelector('#vp_varDetailArray')).html(methodArrayCode.toString());
    
                // set code
                var code = that.getSelectCode();
                $(that.wrapSelector('#vp_varSelectCode')).val(code);
            });
    
            // view method selection
            $(document).on('click', this.wrapSelector('#vp_varDetailArray .vp-method-select-item'), function() {
                var method = $(this).data('method');
                var nowState = $(this).hasClass('selected');
    
                $(that.wrapSelector('#vp_varDetailArray .vp-method-select-item')).removeClass('selected');
                if (nowState == false) {
                    $(this).addClass('selected');
                }
    
                // set code
                var code = that.getSelectCode();
                $(that.wrapSelector('#vp_varSelectCode')).val(code);
            });
    
            // enter variables button 
            $(this.wrapSelector('#vp_varSelectBtn')).click(function() {
                var axes = $(that.wrapSelector('#vp_varViewBox')).attr('data-axes');
                var code = $(that.wrapSelector('#vp_varSelectCode')).val();
                
                // set code
                $(that.wrapSelector('#' + axes)).val(code);
    
                // hide view box
                $(that.wrapSelector('#vp_varViewBox')).hide();
    
                // init boxes
                $(that.wrapSelector('#vp_varDetailColList')).html('');
                $(that.wrapSelector('#vp_varDetailDtype')).val('');
                $(that.wrapSelector('#vp_varDetailArray')).html('');
            });
        }

        getSelectCode() {
            var code = new com_String();
    
            // variable
            var variable = $(this.wrapSelector('.vp-var-view-item.selected td:first')).text();
            if (variable == undefined) return "";
            
            code.append(variable);
    
            // columns
            var columnsTag = $(this.wrapSelector('.vp-column-select-item.selected'));
            if (columnsTag.length > 0) {
                if (columnsTag.length == 1) {
                    code.append('[');
                } else {
                    code.append('[[');
                }
                columnsTag.each((i, tag) => {
                    if (i > 0) {
                        code.append(', ');
                    }
                    var colName = $(tag).data('col');
                    code.append(com_util.convertToStr(colName));
                });
                if (columnsTag.length == 1) {
                    code.append(']');
                } else {
                    code.append(']]');
                }
            }
            
            // method
            var method = $(this.wrapSelector('.vp-method-select-item.selected')).data('method');
            if (method != undefined) {
                code.appendFormat('.{0}', method);
            }
    
            return code.toString();
        }

        refreshVariables (callback = undefined) {
            var that = this;

            var _DATA_TYPES_OF_INDEX = [
                'RangeIndex', 'CategoricalIndex', 'MultiIndex', 'IntervalIndex', 'DatetimeIndex', 'TimedeltaIndex', 'PeriodIndex', 'Int64Index', 'UInt64Index', 'Float64Index'
            ];
        
            var _DATA_TYPES_OF_GROUPBY = [
                'DataFrameGroupBy', 'SeriesGroupBy'
            ];
        
            var _SEARCHABLE_DATA_TYPES = [
                'DataFrame', 'Series', 'Index', 'Period', 'GroupBy', 'Timestamp'
                , ..._DATA_TYPES_OF_INDEX
                , ..._DATA_TYPES_OF_GROUPBY
            ];
    
            var types = _SEARCHABLE_DATA_TYPES;
    
            // init view
            var viewList = $(this.wrapSelector('#vp_varViewList tbody'));
            $(viewList).html('');
    
            vpKernel.getDataList(types).then(function(resultObj) {
                let { result } = resultObj;
                var jsonVars = result.replace(/'/gi, `"`);
                var varList = JSON.parse(jsonVars);
    
                var hasVariable = false;
                // variable list
                varList.forEach(varObj => {
                    if (types.includes(varObj.varType) && varObj.varName[0] !== '_') {
                        var varAttr = {
                            'data-var-name': varObj.varName,
                            'data-var-type': varObj.varType,
                            'value': varObj.varName
                        };
    
                        // Add to View Table
                        var tagRow = $(`<tr class="vp-var-view-item"><td>${varObj.varName}</td><td>${varObj.varType}</td></tr>`);
                        $(viewList).append(tagRow);
                    }
                });
                
                // callback
                if (callback != undefined) {
                    callback(varList);
                }
    
            });
        }

        simpleCodeGenerator(code, input, variable=[]) {
            var hasValue = false;
            input && input.forEach(obj => {
                var val = com_generator.vp_getTagValue(this.uuid, obj);
                if (val != '' && val != 'plt') {
                    hasValue = true;
                    if (obj.type == 'text') {
                        val = "'"+val+"'";
                    } else if (obj.type == 'list') {
                        val = '['+val+']';
                    }
                }
                code = code.split('${' + obj.name + '}').join(val);
            });
            var opt_params = '';
            variable && variable.forEach(obj => {
                var val = com_generator.vp_getTagValue(this.uuid, obj);
                if (val != '') {
                    hasValue = true;
                    if (obj.type == 'text') {
                        val = "'"+val+"'";
                    } else if (obj.type == 'list') {
                        val = '['+val+']';
                    }
                    opt_params += ', ' + obj.key + '=' + val;
                }
            });
            code = code.split('${v}').join(opt_params);
    
            code = code.split('(, ').join('(');
    
            if (!hasValue) {
                return '';
            }
    
            return code;
        }

        generateImportCode () {
            var code = new com_String();
    
            // get parameters
            var figWidth = $(this.wrapSelector('#vp_plFigureWidth')).val();
            var figHeight = $(this.wrapSelector('#vp_plFigureHeight')).val();
            var styleName = $(this.wrapSelector('#vp_plStyle')).val();
            var fontName = $(this.wrapSelector('#vp_plFontName')).val();
            var fontSize = $(this.wrapSelector('#vp_plFontSize')).val();
    
            code.appendLine('import matplotlib.pyplot as plt');
            code.appendFormatLine("plt.rc('figure', figsize=({0}, {1}))", figWidth, figHeight);
            if (styleName && styleName.length > 0) {
                code.appendFormatLine("plt.style.use('{0}')", styleName);
            }
            code.appendLine();
    
            code.appendLine('from matplotlib import rcParams');
            if (fontName && fontName.length > 0) {
                code.appendFormatLine("rcParams['font.family'] = '{0}'", fontName);
            }
            if (fontSize && fontSize.length > 0) {
                code.appendFormatLine("rcParams['font.size'] = {0}", fontSize);
            }
            code.append("rcParams['axes.unicode_minus'] = False");
    
            return code.toString();
        }
    

        generateCode() {
            try {
                var sbCode = new com_String();

                var i0Input = 'plt';
    
                // copy package
                var kind = $(this.wrapSelector('#kind')).val();
                let thisPackage = this.package;
    
                // if no color selected, not generate code
                if ($(this.wrapSelector('#useColor')).prop('checked') != true) {
                    if (thisPackage.variable != undefined) {
                        var idx = thisPackage.variable.findIndex(function(item) {return item.name === 'color'});
                        if (idx > -1) {
                            thisPackage.variable.splice(idx, 1);
                        }
                    }
                }
    
                // get user option
                var userOption = new com_String();
                var userOptValue = $(this.wrapSelector('#vp_userOption')).val();
                if (userOptValue != '') {
                    userOption.appendFormat(', {0}', userOptValue);
                }
    
                // plot component code
                var plotCode = com_generator.vp_codeGenerator(this.uuid, thisPackage, userOption.toString());
                sbCode.append(plotCode);
    
                // tail code
                if (thisPackage.tailCode != undefined) {
                    sbCode.append('\n' + thisPackage.tailCode.split('${i0}').join(i0Input));
                }
    
                // optional code
                for (var i = 0; i < this.optPackList.length; i++) {
                    var opt = this.optPackList[i];
                    // pass if no value
                    if ($(this.wrapSelector('#'+opt)).val() == '') {
                        continue;
                    }
    
                    var pack = this.optionalPackage[opt];
                    // use plt
                    var code = this.simpleCodeGenerator(pack.code2, pack.input, pack.variable);
                    if (code != '') {
                        sbCode.append('\n' + code);
                    }
                }
    
                // plt.show()
                sbCode.appendLine();
                sbCode.append('plt.show()');

            } catch (exmsg) {
                // 에러 표시
                com_util.renderAlertModal(exmsg);
            }
    
            return sbCode.toString();
        }

        setDefaultVariables() {
            this.plotPackage = {
                'plot': {
                    code: '${i0}.${kind}(${x}, ${y}${v}${etc})',
                    input: [
                        {
                            name: 'i0',
                            label: 'Axes Variable',
                            type: 'int',
                            required: false
                        },
                        {
                            name: 'kind',
                            type: 'var',
                            label: 'Chart Type'
                        },
                        {
                            name: 'x',
                            type: 'var',
                            label: 'X Value',
                            required: false
                        },
                        {
                            name: 'y',
                            type: 'var',
                            label: 'Y Value'
                        }
                    ],
                    variable: [
                        {
                            name: 'label',
                            type: 'text'
                        },
                        {
                            name: 'color', 
                            type: 'text',
                            default: '#000000'
                        },
                        {
                            name: 'marker',
                            type: 'text'
                        },
                        {
                            name: 'linestyle',
                            type: 'text',
                            component: 'option_select',
                            default: '-'
                        }
                    ]
                },
                'bar': {
                    code: '${i0}.${kind}(${x}, ${y}${v}${etc})',
                    input: [
                        {
                            name: 'i0',
                            label: 'Axes Variable',
                            type: 'int',
                            required: false
                        },
                        {
                            name: 'kind',
                            type: 'var',
                            label: 'Chart Type'
                        },
                        {
                            name: 'x',
                            type: 'var',
                            label: 'X Value'
                        },
                        {
                            name: 'y',
                            type: 'var',
                            label: 'Height'
                        }
                    ],
                    variable: [
                        {
                            name: 'label',
                            type: 'text'
                        },
                        {
                            name: 'color', 
                            type: 'text',
                            default: '#000000'
                        },
                        {
                            name: 'linestyle',
                            type: 'text',
                            component: 'option_select',
                            default: '-'
                        }
                    ]
                },
                'barh': {
                    code: '${i0}.${kind}(${x}, ${y}${v}${etc})',
                    input: [
                        {
                            name: 'i0',
                            label: 'Axes Variable',
                            type: 'int',
                            required: false
                        },
                        {
                            name: 'kind',
                            type: 'var',
                            label: 'Chart Type'
                        },
                        {
                            name: 'x',
                            type: 'var',
                            label: 'Y Value'
                        },
                        {
                            name: 'y',
                            type: 'var',
                            label: 'Width'
                        }
                    ],
                    variable: [
                        {
                            name: 'label',
                            type: 'text'
                        },
                        {
                            name: 'color', 
                            type: 'text',
                            default: '#000000'
                        },
                        {
                            name: 'linestyle',
                            type: 'text',
                            component: 'option_select',
                            default: '-'
                        }
                    ]
                },
                'hist': {
                    code: '${i0}.${kind}(${x}${v}${etc})',
                    input: [
                        {
                            name: 'i0',
                            label: 'Axes Variable',
                            type: 'int',
                            required: false
                        },
                        {
                            name: 'kind',
                            type: 'var',
                            label: 'Chart Type'
                        },
                        {
                            name: 'x',
                            type: 'var',
                            label: 'Value'
                        }
                    ],
                    variable: [
                        {
                            name: 'bins',
                            type: 'int',
                            required: true,
                            label: 'Bins'
                        },
                        {
                            name: 'label',
                            type: 'text'
                        },
                        {
                            name: 'color', 
                            type: 'text',
                            default: '#000000'
                        },
                        {
                            name: 'linestyle',
                            type: 'text',
                            component: 'option_select',
                            default: '-'
                        }
                    ]
                },
                'boxplot': {
                    code: '${i0}.${kind}(${x}, ${y}${v}${etc})',
                    input: [
                        {
                            name: 'i0',
                            label: 'Axes Variable',
                            type: 'int',
                            required: false
                        },
                        {
                            name: 'kind',
                            type: 'var',
                            label: 'Chart Type'
                        },
                        {
                            name: 'x',
                            type: 'var',
                            label: 'X Value'
                        },
                        {
                            name: 'y',
                            type: 'var',
                            label: 'Y Value'
                        }
                    ],
                    variable: [
                    ]
                },
                'stackplot': {
                    code: '${i0}.${kind}(${x}, ${y}${v}${etc})',
                    input: [
                        {
                            name: 'i0',
                            label: 'Axes Variable',
                            type: 'int',
                            required: false
                        },
                        {
                            name: 'kind',
                            type: 'var',
                            label: 'Chart Type'
                        },
                        {
                            name: 'x',
                            type: 'var',
                            label: 'X Value'
                        },
                        {
                            name: 'y',
                            type: 'var',
                            label: 'Y Value'
                        }
                    ],
                    variable: [
                        {
                            name: 'color', 
                            type: 'text',
                            default: '#000000'
                        },
                        {
                            name: 'linestyle',
                            type: 'text',
                            component: 'option_select',
                            default: '-'
                        }
                    ]
                },
                'pie': {
                    code: '${i0}.${kind}(${x}${v}${etc})',
                    tailCode: "${i0}.axis('equal')",
                    input: [
                        {
                            name: 'i0',
                            label: 'Axes Variable',
                            type: 'int',
                            required: false
                        },
                        {
                            name: 'kind',
                            type: 'var',
                            label: 'Chart Type'
                        },
                        {
                            name: 'x',
                            type: 'var',
                            label: 'Value'
                        }
                    ],
                    variable: [
                    ]
                },
                'scatter': {
                    code: '${i0}.${kind}(${x}, ${y}${v}${etc})',
                    input: [
                        {
                            name: 'i0',
                            label: 'Axes Variable',
                            type: 'int',
                            required: false
                        },
                        {
                            name: 'kind',
                            type: 'var',
                            label: 'Chart Type'
                        },
                        {
                            name: 'x',
                            type: 'var',
                            label: 'X Value'
                        },
                        {
                            name: 'y',
                            type: 'var',
                            label: 'Y Value'
                        }
                    ],
                    variable: [
                        {
                            name: 'cmap',
                            type: 'text'
                        },
                        {
                            name: 'marker',
                            type: 'text'
                        }
                    ]
                },
                'hexbin': {
                    code: '${i0}.${kind}(${x}, ${y}${v}${etc})',
                    tailCode: '${i0}.colorbar()', // color bar
                    input: [
                        {
                            name: 'i0',
                            label: 'Axes Variable',
                            type: 'int',
                            required: false
                        },
                        {
                            name: 'kind',
                            type: 'var',
                            label: 'Chart Type'
                        },
                        {
                            name: 'x',
                            type: 'var',
                            label: 'X Value'
                        },
                        {
                            name: 'y',
                            type: 'var',
                            label: 'Y Value'
                        }
                    ],
                    variable: [
                        {
                            name: 'label',
                            type: 'text'
                        },
                        {
                            name: 'color', 
                            type: 'text',
                            default: '#000000'
                        }
                    ]
                },
                'contour': {
                    code: '${i0}.${kind}(${x}, ${y}, ${z}${v}${etc})',
                    input: [
                        {
                            name: 'i0',
                            label: 'Axes Variable',
                            type: 'int',
                            required: false
                        },
                        {
                            name: 'kind',
                            type: 'var',
                            label: 'Chart Type'
                        },
                        {
                            name: 'x',
                            type: 'var',
                            label: 'X Value'
                        },
                        {
                            name: 'y',
                            type: 'var',
                            label: 'Y Value'
                        },
                        {
                            name: 'z',
                            type: 'var',
                            label: 'Z Value'
                        }
                    ],
                    variable: [
                        {
                            name: 'cmap',
                            type: 'text'
                        },
                        {
                            name: 'label',
                            type: 'text'
                        }
                    ]
                },
                'imshow': {
                    code: '${i0}.${kind}(${z}${v}${etc})',
                    input: [
                        {
                            name: 'i0',
                            label: 'Axes Variable',
                            type: 'int',
                            required: false
                        },
                        {
                            name: 'kind',
                            type: 'var',
                            label: 'Chart Type'
                        },
                        {
                            name: 'z',
                            type: 'var',
                            label: 'Value'
                        }
                    ],
                    variable: [
                        {
                            name: 'extent', // [xmin, xmax, ymin, ymax]
                            type: 'var'
                        },
                        {
                            name: 'origin',
                            type: 'text'
                        },
                        {
                            name: 'cmap',
                            type: 'text'
                        }
                    ]
                },
                'errorbar': {
                    code: '${i0}.${kind}(${x}, ${y}${v}${etc})',
                    input: [
                        {
                            name: 'i0',
                            label: 'Axes Variable',
                            type: 'int',
                            required: false
                        },
                        {
                            name: 'kind',
                            type: 'var',
                            label: 'Chart Type'
                        },
                        {
                            name: 'x',
                            type: 'var',
                            label: 'X Value'
                        },
                        {
                            name: 'y',
                            type: 'var',
                            label: 'Y Value'
                        }
                    ]
                }
            };
            
            this.optPackList = ['title', 'xlabel', 'ylabel', 'xlim', 'ylim', 'legend', 'savefig'];
            this.optionalPackage = {
                'title': {
                    code: '${i0}.set_title(${title})',
                    code2: 'plt.title(${title})',
                    input: [
                        {
                            name: 'i0',
                            type: 'var',
                            required: false
                        },
                        {
                            name: 'title',
                            type: 'text',
                            required: false
                        }
                    ]
                },
                'xlabel': {
                    code: '${i0}.set_xlabel(${xlabel})',
                    code2: 'plt.xlabel(${xlabel})',
                    input: [
                        {
                            name: 'i0',
                            type: 'var',
                            required: false
                        },
                        {
                            name: 'xlabel',
                            type: 'text',
                            required: false
                        }
                    ]
                },
                'ylabel': {
                    code: '${i0}.set_ylabel(${ylabel})',
                    code2: 'plt.ylabel(${ylabel})',
                    input: [
                        {
                            name: 'i0',
                            type: 'var',
                            required: false
                        },
                        {
                            name: 'ylabel',
                            type: 'text',
                            required: false
                        }
                    ]
                },
                'xlim': {
                    code: '${i0}.set_xlim(${xlim})',
                    code2: 'plt.xlim(${xlim})',
                    input: [
                        {
                            name: 'i0',
                            type: 'var',
                            required: false
                        },
                        {
                            name: 'xlim',
                            type: 'var',
                            required: false
                        }
                    ]
                },
                'ylim': {
                    code: '${i0}.set_ylim(${ylim})',
                    code2: 'plt.ylim(${ylim})',
                    input: [
                        {
                            name: 'i0',
                            type: 'var',
                            required: false
                        },
                        {
                            name: 'ylim',
                            type: 'var',
                            required: false
                        }
                    ]
                },
                'legend': {
                    code: '${i0}.legend(${v})',
                    code2: 'plt.legend(${v})',
                    input: [
                        {
                            name: 'i0',
                            type: 'var'
                        }
                    ],
                    variable: [
                        {
                            key: 'title',
                            name: 'legendTitle',
                            type: 'text'
                        },
                        {
                            key: 'label',
                            name: 'legendLabel',
                            type: 'var'
                        },
                        {
                            key: 'loc',
                            name: 'legendLoc',
                            type: 'text',
                            component: 'option_select',
                            default: 'best'
                        }
                    ]
                },
                'savefig': {
                    code: "${i0}.savefig('${savefigpath}')",
                    code2: "plt.savefig('${savefigpath}')",
                    input: [
                        {
                            name: 'i0',
                            type: 'var'
                        },
                        {
                            name: 'savefigpath',
                            type: 'var'
                        }
                    ],
                    variable: []
                }
            };
            this.addOption = [
                { name: 'vp_userOption', required: false },
                { name: 'title', required: false },
                { name: 'xlabel', required: false },
                { name: 'ylabel', required: false },
                { name: 'xlim', required: false },
                { name: 'ylim', required: false },
                { name: 'legendTitle', required: false },
                { name: 'legendLabel', required: false },
                { name: 'legendLoc', required: false },
                { name: 'savefigpath', required: false }
            ];
            // plot type
            this.plotKind = [
                'plot', 'bar', 'barh', 'hist', 'boxplot', 'stackplot',
                'pie', 'scatter', 'hexbin', 'contour', 'imshow', 'errorbar'
            ];
            this.plotKindLang = {
                'plot': 'Line',
                'bar': 'Bar 1',
                'barh': 'Bar 2',
                'hist': 'Histogram',
                'boxplot': 'Box',
                'stackplot': 'Stack',
                'pie': 'Pie',
                'scatter': 'Scatter',
                'hexbin': 'Hexbin',
                'contour': 'Contour',
                'imshow': 'Image',
                'errorbar': 'Error Bar'
            };
            // cmap type
            this.cmap = [
                '', 'viridis', 'plasma', 'inferno', 'magma', 'cividis'
                , 'Pastel1', 'Pastel2', 'Paired', 'Accent', 'Dark2', 'Set1', 'Set2', 'Set3', 'tab10', 'tab20', 'tab20b', 'tab20c'
            ];
            // marker type
            this.marker = {
                // 'custom': { label: 'Custom', value: 'marker' },
                'point' : { label: '.', value: '.', img: 'm00.png' }, 
                'pixel' : { label: ',', value: ',', img: 'm01.png' }, 
                'circle' : { label: 'o', value: 'o', img: 'm02.png' }, 
                'triangle_down' : { label: '▼', value: 'v', img: 'm03.png' }, 
                'triangle_up' : { label: '▲', value: '^', img: 'm04.png' }, 
                'triangle_left' : { label: '◀', value: '<', img: 'm05.png' }, 
                'triangle_right' : { label: '▶', value: '>', img: 'm06.png' }, 
                'tri_down' : { label: '┬', value: '1', img: 'm07.png' }, 
                'tri_up' : { label: '┵', value: '2', img: 'm08.png' }, 
                'tri_left' : { label: '┤', value: '3', img: 'm09.png' }, 
                'tri_right' : { label: '├', value: '4', img: 'm10.png' }, 
                'octagon' : { label: 'octagon', value: '8', img: 'm11.png' }, 
                'square' : { label: 'square', value: 's', img: 'm12.png' }, 
                'pentagon' : { label: 'pentagon', value: 'p', img: 'm13.png' }, 
                'plus (filled)' : { label: 'filled plus', value: 'P', img: 'm23.png' }, 
                'star' : { label: 'star', value: '*', img: 'm14.png' }, 
                'hexagon1' : { label: 'hexagon1', value: 'h', img: 'm15.png' }, 
                'hexagon2' : { label: 'hexagon2', value: 'H', img: 'm16.png' }, 
                'plus' : { label: 'plus', value: '+', img: 'm17.png' }, 
                'x' : { label: 'x', value: 'x', img: 'm18.png' }, 
                'x (filled)' : { label: 'filled x', value: 'X', img: 'm24.png' }, 
                'diamond' : { label: 'diamond', value: 'D', img: 'm19.png' }, 
                'thin_diamond' : { label: 'thin diamond', value: 'd', img: 'm20.png' }
            }
            // legend position
            this.legendPosition = [
                'best', 'upper right', 'upper left', 'lower left', 'lower right',
                'center left', 'center right', 'lower center', 'upper center', 'center'
            ];
            this.methodList = {
                'categorical': [
                    { label: 'count', method: 'count()' },
                    { label: 'unique count', method: 'unique()' }
                ],
                'numerical': [
                    { label: 'count', method: 'count()' },
                    { label: 'unique count', method: 'unique()' },
                    { label: 'sum', method: 'sum()' },
                    { label: 'average', method: 'mean()' },
                    { label: 'min', method: 'min()' },
                    { label: 'max', method: 'max()' }
                ]
            }
        }

    }

    return Chart;
});