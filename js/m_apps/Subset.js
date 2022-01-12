/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : Subset.js
 *    Author          : Black Logic
 *    Note            : Apps > Subset
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] Subset
//============================================================================
define([
    'text!vp_base/html/m_apps/subset.html!strip',
    'css!vp_base/css/m_apps/subset.css',
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_util',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/SuggestInput',
    'vp_base/js/com/component/VarSelector',
    'vp_base/js/com/component/MultiSelector'
], function(subsetHtml, subsetCss, com_String, com_util, PopupComponent, SuggestInput, VarSelector, MultiSelector) {

    /**
     * Subset
     */
    class Subset extends PopupComponent {
        _init() {
            super._init();
            this.config.sizeLevel = 3;
            /** Write codes executed before rendering */
            this.targetSelector = this.prop.targetSelector;
            this.pageThis = this.prop.pageThis;
            this.useInputVariable = this.prop.useInputVariable;
            if (this.useInputVariable) {
                this.eventTarget = this.targetSelector;
            }

            // use Run/Add cell
            this.useCell = true;

            // specify pandas object types
            this.pdObjTypes = ['DataFrame', 'Series'];

            this.stateLoaded = false;

            this.state = {
                viewAll: false,
                previewCode: '',

                // all variables list on opening popup
                dataList: [],
                allocateTo: '',
                pandasObject: '',
                dataType: 'DataFrame',
                isTimestamp: false,

                useCopy: false,
                toFrame: false,
                subsetType: 'loc',

                tabPage: 'subset',

                rowType: 'condition',
                rowList: [],
                rowPointer: { start: -1, end: -1 },
                rowPageDom: '',

                colType: 'indexing',
                columnList: [],
                colPointer: { start: -1, end: -1 },
                colPageDom: '',
                ...this.state
            };

            this._addCodemirror('previewCode', this.wrapSelector('#vp_previewCode'), 'readonly');
        }

        render() {
            super.render();
            
            this.loadVariables();
            let { subsetType, rowList, columnList } = this.state;
            // set subset type
            $(this.wrapSelector('.' + VP_DS_SUBSET_TYPE)).val(subsetType);
            // render
            this.renderRowSubsetType(subsetType);
            this.renderRowIndexing(rowList);
            this.renderRowSlicingBox(rowList);
            this.renderColumnConditionList(columnList);
            
            this.renderColumnSubsetType(subsetType);
            this.renderColumnIndexing(columnList);
            this.renderColumnSlicingBox(columnList);

            this.loadStateAfterRender();
            
            // render button
            if (this.useInputVariable) {
                // set readonly
                $(this.wrapSelector('.' + VP_DS_PANDAS_OBJECT)).attr('disabled', true);
                // render button
                this.renderButton();

                // hide allocate to
                $(this.wrapSelector('.vp-ds-allocate-to')).closest('tr').hide();
            }
        }

        generateCode() {
            return this.generateCodeForSubset();
        }

        templateForBody() {
            return subsetHtml;
        }
        templateForDataView() {
            let tag = new com_String();
            // data view type
            tag.appendFormatLine('<div class="{0} vp-close-on-blur-btn"><label><input type="checkbox" class="{1}" {2}/><span>{3}</span></label></div>',
                VP_DS_DATA_VIEW_ALL_DIV, VP_DS_DATA_VIEW_ALL, (this.state.viewAll?'checked':''), "view all");
            // data view
            tag.appendFormatLine('<div class="{0} {1} vp-scrollbar"></div>', VP_DS_DATA_VIEW_BOX,
                'rendered_html'); // 'rendered_html' style from jupyter output area
            return tag.toString();
        }
        getAllowSubsetTypes() {
            return this.pdObjTypes;
        }
        ///////////////////////// render //////////////////////////////////////////////////////
        renderButton() {
            // set button next to input tag
            var buttonTag = new com_String();
            buttonTag.appendFormat('<button type="button" class="{0} {1} {2}">{3}</button>',
                VP_DS_BTN, this.uuid, 'vp-button', 'Edit');
            if (this.pageThis) {
                $(this.targetSelector).parent().append(buttonTag.toString());
            }
        }
        renderRowSubsetType(subsetType, timestamp = false) {
            var tag = new com_String();
            tag.appendFormatLine('<select class="{0} {1}">', VP_DS_ROWTYPE, 'vp-select m');
            if (subsetType == 'loc' || subsetType == 'iloc' || this.state.dataType == 'Series') {
                tag.appendFormatLine('<option value="{0}">{1}</option>', 'indexing', 'Indexing');
            }
            tag.appendFormatLine('<option value="{0}">{1}</option>', 'slicing', 'Slicing');
            if (subsetType == 'subset' || subsetType == 'loc') {
                tag.appendFormatLine('<option value="{0}">{1}</option>', 'condition', 'Condition');
            }
            if ((subsetType == 'subset' || subsetType == 'loc') && timestamp) {
                tag.appendFormatLine('<option value="{0}">{1}</option>', 'timestamp', 'Timestamp');
            }
            tag.appendLine('</select>');
            // render
            $(this.wrapSelector('.' + VP_DS_ROWTYPE)).replaceWith(function () {
                return tag.toString();
            });
        }
        renderColumnSubsetType(subsetType) {
            var tag = new com_String();
            tag.appendFormatLine('<select class="{0} {1}">', VP_DS_COLTYPE, 'vp-select m');
            tag.appendFormatLine('<option value="{0}">{1}</option>', 'indexing', 'Indexing');
            if (subsetType == 'loc' || subsetType == 'iloc') {
                tag.appendFormatLine('<option value="{0}">{1}</option>', 'slicing', 'Slicing');
            }
            tag.appendLine('</select>');
            // render
            $(this.wrapSelector('.' + VP_DS_COLTYPE)).replaceWith(function () {
                return tag.toString();
            });
        }
        /**
         * Render row selection list
         * - search box
         * - row list box (left)
         * - buttons (add/del to right box)
         * - apply box (right)
         * @param {Array} rowList
         */
        renderRowIndexing(rowList) {
            var that = this;
            var tag = new com_String();
            tag.appendFormatLine('<div class="{0} {1}">', VP_DS_SELECT_CONTAINER, 'select-row');
            // row select - left
            tag.appendFormatLine('<div class="{0}">', VP_DS_SELECT_LEFT);
            // tag.appendFormatLine('<input type="text" class="{0}" placeholder="{1}"/>'
            //                         , VP_DS_SELECT_SEARCH, 'Search Row');
            var vpSearchSuggest = new SuggestInput();
            vpSearchSuggest.addClass(VP_DS_SELECT_SEARCH);
            vpSearchSuggest.setPlaceholder('Search Row');
            vpSearchSuggest.setSuggestList(function () { return that.state.rowList; });
            vpSearchSuggest.setSelectEvent(function (value) {
                $(this.wrapSelector()).val(value);
                $(this.wrapSelector()).trigger('change');
            });
            vpSearchSuggest.setNormalFilter(true);
            tag.appendLine(vpSearchSuggest.toTagString());

            tag.appendFormatLine('<div class="{0} {1} {2} {3}"></div>', VP_DS_SELECT_BOX, 'left', VP_DS_DROPPABLE, 'no-selection');
            tag.appendLine('</div>'); // VP_DS_SELECT_LEFT

            // row select - buttons
            tag.appendFormatLine('<div class="{0}">', VP_DS_SELECT_BTN_BOX);
            tag.appendFormatLine('<button type="button" class="{0} {1}" title="{2}">{3}</button>',
                VP_DS_SELECT_ADD_ALL_BTN, 'select-row', 'Add all items', '<img src="/nbextensions/visualpython/img/arrow_right_double.svg"/></i>');
            tag.appendFormatLine('<button type="button" class="{0} {1}">{2}</button>', VP_DS_SELECT_ADD_BTN, 'select-row', '<img src="/nbextensions/visualpython/img/arrow_right.svg"/>');
            tag.appendFormatLine('<button type="button" class="{0} {1}">{2}</button>', VP_DS_SELECT_DEL_BTN, 'select-row', '<img src="/nbextensions/visualpython/img/arrow_left.svg"/>');
            tag.appendFormatLine('<button type="button" class="{0} {1}" title="{2}">{3}</button>',
                VP_DS_SELECT_DEL_ALL_BTN, 'select-row', 'Remove all items', '<img src="/nbextensions/visualpython/img/arrow_left_double.svg"/>');
            tag.appendLine('</div>'); // VP_DS_SELECT_BTNS

            // row select - right
            tag.appendFormatLine('<div class="{0}">', VP_DS_SELECT_RIGHT);
            tag.appendFormatLine('<div class="{0} {1} {2} {3}">', VP_DS_SELECT_BOX, 'right', VP_DS_DROPPABLE, 'no-selection');
            tag.appendLine('</div>'); // VP_DS_SELECT_BOX
            tag.appendLine('</div>'); // VP_DS_SELECT_RIGHT
            tag.appendLine('</div>'); // VP_DS_SELECT_CONTAINER
            // render
            $(this.wrapSelector('.' + VP_DS_SELECT_CONTAINER + '.select-row')).replaceWith(function () {
                return tag.toString();
            });
            this.renderRowSelectionBox(rowList);
        }
        /**
         * Render row list box
         * @param {Array} rowList
         */
        renderRowSelectionBox(rowList) {
            var tag = new com_String();
            tag.appendFormatLine('<div class="{0} {1} {2} {3}">', VP_DS_SELECT_BOX, 'left', VP_DS_DROPPABLE, 'no-selection');

            // get row data and make draggable items
            rowList.forEach((row, idx) => {
                tag.appendFormatLine('<div class="{0} {1} {2}" data-idx="{3}" data-rowname="{4}" data-code="{5}" title="{6}"><span>{7}</span></div>',
                    VP_DS_SELECT_ITEM, 'select-row', VP_DS_DRAGGABLE, row.location, row.value, row.code, row.label, row.label);
            });
            tag.appendLine('</div>'); // VP_DS_SELECT_BOX
            // render
            $(this.wrapSelector('.select-row .' + VP_DS_SELECT_BOX + '.left')).replaceWith(function () {
                return tag.toString();
            });
        }
        /**
         * Render row slicing box
         * - slicing start/end with suggestInput
         * @param {Array} rowList
         */
        renderRowSlicingBox(rowList) {
            var that = this;
            var tag = new com_String();
            tag.appendFormatLine('<div class="{0}">', VP_DS_SLICING_BOX);
            var vpRowStart = new SuggestInput();
            vpRowStart.addClass(VP_DS_ROW_SLICE_START);
            vpRowStart.addClass('vp-input m');
            vpRowStart.setPlaceholder('start');
            vpRowStart.setSuggestList(function () { return rowList; });
            vpRowStart.setSelectEvent(function (value, item) {
                $(this.wrapSelector()).val(item.code);
                $(this.wrapSelector()).attr('data-code', item.code);
                // $(this.wrapSelector()).trigger('change');
                that.generateCode();
            });
            vpRowStart.setNormalFilter(false);

            var vpRowEnd = new SuggestInput();
            vpRowEnd.addClass(VP_DS_ROW_SLICE_END);
            vpRowEnd.addClass('vp-input m');
            vpRowEnd.setPlaceholder('end');
            vpRowEnd.setSuggestList(function () { return rowList; });
            vpRowEnd.setSelectEvent(function (value, item) {
                $(this.wrapSelector()).val(item.code);
                $(this.wrapSelector()).attr('data-code', item.code);
                // $(this.wrapSelector()).trigger('change');
                that.generateCode();
            });
            vpRowEnd.setNormalFilter(false);

            tag.appendLine(vpRowStart.toTagString());
            tag.appendLine(vpRowEnd.toTagString());
            tag.appendLine('</div>');
            // render
            $(this.wrapSelector('.' + VP_DS_ROWTYPE_BOX + ' .' + VP_DS_SLICING_BOX)).replaceWith(function () {
                return tag.toString();
            });
        }
        /**
         * Render column selection list
         * - search box
         * - column list box (left)
         * - buttons (add/del to right box)
         * - apply box (right)
         * @param {Array} colList
         */
        renderColumnIndexing(colList) {
            var that = this;
            var tag = new com_String();
            tag.appendFormatLine('<div class="{0} {1}">', VP_DS_SELECT_CONTAINER, 'select-col');
            // col select - left
            tag.appendFormatLine('<div class="{0}">', VP_DS_SELECT_LEFT);
            // tag.appendFormatLine('<input type="text" class="{0}" placeholder="{1}"/>'
            //                         , VP_DS_SELECT_SEARCH, 'Search Column');
            var vpSearchSuggest = new SuggestInput();
            vpSearchSuggest.addClass(VP_DS_SELECT_SEARCH);
            vpSearchSuggest.setPlaceholder('Search Column');
            vpSearchSuggest.setSuggestList(function () { return that.state.columnList; });
            vpSearchSuggest.setSelectEvent(function (value) {
                $(this.wrapSelector()).val(value);
                $(this.wrapSelector()).trigger('change');
            });
            vpSearchSuggest.setNormalFilter(true);
            tag.appendLine(vpSearchSuggest.toTagString());
            tag.appendFormatLine('<i class="fa fa-search search-icon"></i>');

            tag.appendFormatLine('<div class="{0} {1} {2} {3}"></div>', VP_DS_SELECT_BOX, 'left', VP_DS_DROPPABLE, 'no-selection');
            tag.appendLine('</div>'); // VP_DS_SELECT_LEFT

            // col select - buttons
            tag.appendFormatLine('<div class="{0}">', VP_DS_SELECT_BTN_BOX);
            tag.appendFormatLine('<button type="button" class="{0} {1}" title="{2}">{3}</button>',
                VP_DS_SELECT_ADD_ALL_BTN, 'select-col', 'Add all items', '<img src="/nbextensions/visualpython/img/arrow_right_double.svg"/></i>');
            tag.appendFormatLine('<button type="button" class="{0} {1}">{2}</button>', VP_DS_SELECT_ADD_BTN, 'select-col', '<img src="/nbextensions/visualpython/img/arrow_right.svg"/></i>');
            tag.appendFormatLine('<button type="button" class="{0} {1}">{2}</button>', VP_DS_SELECT_DEL_BTN, 'select-col', '<img src="/nbextensions/visualpython/img/arrow_left.svg"/>');
            tag.appendFormatLine('<button type="button" class="{0} {1}" title="{2}">{3}</button>',
                VP_DS_SELECT_DEL_ALL_BTN, 'select-col', 'Remove all items', '<img src="/nbextensions/visualpython/img/arrow_left_double.svg"/>');
            tag.appendLine('</div>'); // VP_DS_SELECT_BTNS

            // col select - right
            tag.appendFormatLine('<div class="{0}">', VP_DS_SELECT_RIGHT);
            tag.appendFormatLine('<div class="{0} {1} {2} {3}">', VP_DS_SELECT_BOX, 'right', VP_DS_DROPPABLE, 'no-selection');
            tag.appendLine('</div>'); // VP_DS_SELECT_BOX
            tag.appendLine('</div>'); // VP_DS_SELECT_RIGHT
            tag.appendLine('</div>'); // VP_DS_SELECT_CONTAINER
            // render
            $(this.wrapSelector('.' + VP_DS_SELECT_CONTAINER + '.select-col')).replaceWith(function () {
                return tag.toString();
            });
            this.renderColumnSelectionBox(colList);
        }
        /**
         * Render column list box
         * @param {Array} colList
         */
        renderColumnSelectionBox(colList) {
            var tag = new com_String();
            tag.appendFormatLine('<div class="{0} {1} {2} {3}">', VP_DS_SELECT_BOX, 'left', VP_DS_DROPPABLE, 'no-selection');
            // get col data and make draggable items
            colList.forEach((col, idx) => {
                // col.array parsing
                var colInfo = com_util.safeString(col.array);
                // render column box
                tag.appendFormatLine('<div class="{0} {1} {2}" data-idx="{3}" data-colname="{4}" data-dtype="{5}" data-code="{6}" title="{7}"><span>{8}</span></div>',
                    VP_DS_SELECT_ITEM, 'select-col', VP_DS_DRAGGABLE, col.location, col.value, col.dtype, col.code, col.label + ': \n' + colInfo, col.label);
            });
            tag.appendLine('</div>'); // VP_DS_SELECT_BOX
            $(this.wrapSelector('.select-col .' + VP_DS_SELECT_BOX + '.left')).replaceWith(function () {
                return tag.toString();
            });
        }
        /**
         * Render column slicing box
         * - slicing start/end with suggestInput
         * @param {Array} colList
         */
        renderColumnSlicingBox(colList) {
            var that = this;
            var tag = new com_String();
            tag.appendFormatLine('<div class="{0}">', VP_DS_SLICING_BOX);
            // tag.appendFormatLine('<label class="{0}">{1}</label>'
            //                         , '', 'Slice');
            // tag.appendFormatLine('<input type="text" class="{0} {1}" placeholder="{2}"/> : ', VP_DS_COL_SLICE_START, 'vp-input m', 'start');
            // tag.appendFormatLine('<input type="text" class="{0} {1}" placeholder="{2}"/>', VP_DS_COL_SLICE_END, 'vp-input m', 'end');
            var vpColStart = new SuggestInput();
            vpColStart.addClass(VP_DS_COL_SLICE_START);
            vpColStart.addClass('vp-input m');
            vpColStart.setPlaceholder('start');
            vpColStart.setSuggestList(function () { return colList; });
            vpColStart.setSelectEvent(function (value, item) {
                $(this.wrapSelector()).val(item.code);
                $(this.wrapSelector()).data('code', item.code);
                that.generateCode();
            });
            vpColStart.setNormalFilter(false);

            var vpColEnd = new SuggestInput();
            vpColEnd.addClass(VP_DS_COL_SLICE_END);
            vpColEnd.addClass('vp-input m');
            vpColEnd.setPlaceholder('end');
            vpColEnd.setSuggestList(function () { return colList; });
            vpColEnd.setSelectEvent(function (value, item) {
                $(this.wrapSelector()).val(item.code);
                $(this.wrapSelector()).data('code', item.code);
                that.generateCode();
            });
            vpColEnd.setNormalFilter(false);

            tag.appendLine(vpColStart.toTagString());
            tag.appendLine(vpColEnd.toTagString());
            tag.appendLine('</div>');
            $(this.wrapSelector('.' + VP_DS_COLTYPE_BOX + ' .' + VP_DS_SLICING_BOX)).replaceWith(function () {
                return tag.toString();
            });
        }
        /**
         * Render Row Condition List with columns
         * - column name
         * - operator
         * - condition string
         * - and/or connector between prev/next conditions
         * @param {Array} colList
         */
        renderColumnConditionList(colList) {
            var tag = new com_String();
            tag.appendFormatLine('<table class="{0}">', VP_DS_CONDITION_TBL);
            tag.appendLine('<tr>');
            tag.appendFormatLine('<td colspan="4"><button type="button" class="{0} {1}">{2}</button></td>',
                VP_DS_BUTTON_ADD_CONDITION, 'vp-add-col', '+ Condition');
            tag.appendLine('</tr>');
            tag.appendLine('</table>');
            $(this.wrapSelector('.' + VP_DS_CONDITION_TBL)).replaceWith(function () {
                return tag.toString();
            });
        }
        templateForConditionBox(colList) {
            var tag = new com_String();
            tag.appendLine('<tr>');
            tag.appendLine('<td>');
            // del col
            tag.appendLine('<div class="vp-icon-btn vp-del-col"></div>');

            var varList = this.state.dataList;
            tag.appendLine(this.templateForConditionVariableInput(varList, this.state.pandasObject, this.state.dataType));

            tag.appendLine('<div class="vp-td-line">');
            tag.appendLine(this.templateForConditionColumnInput(colList));
            tag.appendFormatLine('<select class="{0} {1}">', 'vp-select s', 'vp-oper-list');
            var operList = ['', '==', '!=', 'in', 'not in', '<', '<=', '>', '>='];
            operList.forEach(oper => {
                tag.appendFormatLine('<option value="{0}">{1}</option>', oper, oper);
            });
            tag.appendLine('</select>');
            tag.appendLine('<input class="vp-input m vp-condition" type="text" placeholder="Value"/>');
            tag.appendLine('</div>');

            tag.appendLine('<div class="vp-td-line">');
            tag.appendLine('<select class="vp-select s vp-oper-connect" style="display:none;">');
            tag.appendLine('<option value="&">and</option>');
            tag.appendLine('<option value="|">or</option>');
            tag.appendLine('</select>');

            // use text
            tag.appendFormatLine('<label class="{0}"><input type="checkbox" class="{1}" title="{2}"/><span>{3}</span></label>',
                'vp-condition-use-text', 'vp-cond-use-text', 'Uncheck it if you want to use variable or numeric values.', 'Text');
            tag.appendLine('</div>');

            tag.appendLine('</td>');
            tag.appendLine('</tr>');
            return tag.toString();
        }
        templateForConditionVariableInput(varList, defaultValue, defaultValuesType) {
            var dataTypes = ['DataFrame', 'Series', 'nparray', 'list', 'str'];
            var varSelector = new VarSelector(dataTypes, defaultValuesType, true, true);
            varSelector.addClass('vp-cond-var');
            varSelector.setValue(defaultValue);
            return varSelector.render();
        }
        templateForConditionColumnInput(colList) {
            var tag = new com_String();
            tag.appendFormatLine('<select class="{0} {1}">', 'vp-select m', 'vp-col-list');
            // .index
            tag.appendFormatLine('<option data-code="{0}" value="{1}">{2}</option>', '.index', '.index', 'index');
            colList.forEach(col => {
                tag.appendFormatLine('<option data-code="{0}" value="{1}">{2}</option>',
                    col.code, col.value, col.label);
            });
            tag.appendLine('</select>');
            return tag.toString();
        }
        templateForConditionCondInput(category) {
            var vpCondSuggest = new SuggestInput();
            vpCondSuggest.addClass('vp-input m vp-condition');

            if (category && category.length > 0) {
                vpCondSuggest.setPlaceholder("Categorical Dtype");
                vpCondSuggest.setSuggestList(function () { return category; });
                vpCondSuggest.setSelectEvent(function (value) {
                    $(this.wrapSelector()).val(value);
                    $(this.wrapSelector()).trigger('change');
                });
                vpCondSuggest.setNormalFilter(false);
            } else {
            }
            return vpCondSuggest.toTagString();
        }
        renderDataView() {
            super.renderDataView();

            this.loadDataPage();
            $(this.wrapSelector('.vp-popup-dataview-box')).css('height', '300px');
        }
        /**
         * Render Data Tab Page
         * @param {String} renderedText
         */
        renderDataPage(renderedText, isHtml = true) {
            var tag = new com_String();
            if (isHtml) {
                tag.appendLine(renderedText);
            } else {
                tag.appendFormatLine('<pre>{0}</pre>', renderedText);
            }
            $(this.wrapSelector('.' + VP_DS_DATA_VIEW_BOX)).html(tag.toString());
        }
        ///////////////////////// render end //////////////////////////////////////////////////////
        ///////////////////////// load ///////////////////////////////////////////////////////////
        /**
             * Load Data Tab Page
             * - execute generated current code and get html text from jupyter kernel
             * - render data page with html text (msg.content.data['text/html'])
             */
        loadDataPage() {
            var that = this;

            var code = this.state.pandasObject;

            // if view all is not checked, get current code
            if (!this.state.viewAll) {
                // get current code
                code = this.generateCodeForSubset(false, false);
            }
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
                        errorContent.appendFormatLine('<div class="{0}">', VP_DS_DATA_ERROR_BOX);
                        errorContent.appendLine('<i class="fa fa-exclamation-triangle"></i>');
                        errorContent.appendFormatLine('<label class="{0}">{1}</label>',
                            VP_DS_DATA_ERROR_BOX_TITLE, msg.content.ename);
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
                    errorContent.appendFormatLine('<div class="{0}">', VP_DS_DATA_ERROR_BOX);
                    errorContent.appendLine('<i class="fa fa-exclamation-triangle"></i>');
                    errorContent.appendFormatLine('<label class="{0}">{1}</label>',
                        VP_DS_DATA_ERROR_BOX_TITLE, msg.content.ename);
                    if (msg.content.evalue) {
                        // errorContent.appendLine('<br/>');
                        errorContent.appendFormatLine('<pre>{0}</pre>', msg.content.evalue.split('\\n').join('<br/>'));
                    }
                    errorContent.appendLine('</div>');
                }
                that.renderDataPage(errorContent);
            });
        }
        /**
         * Load pandasObject
         * - search available pandasObject list
         * - render on VP_DS_PANDAS_OBJECT
         */
        loadVariables() {
            var that = this;
            var types = that.pdObjTypes;
            var prevValue = this.state.pandasObject;

            // if get input variable through parameter
            if (this.useInputVariable && prevValue != '') {
                $(this.wrapSelector('.' + VP_DS_PANDAS_OBJECT)).val(prevValue);

                // get type of variable
                vpKernel.execute(com_util.formatString('_vp_print(_vp_get_type({0}))', prevValue)).then(function (resultObj) {
                    let { result } = resultObj;
                    try {
                        var varType = JSON.parse(result);
                        that.state.pandasObject = prevValue;
                        that.state.dataType = varType;
                        $(that.wrapSelector('.' + VP_DS_PANDAS_OBJECT_BOX)).replaceWith(function () {
                            return $(com_util.formatString('<div style="display:inline-block"><input class="{0} {1}" value="{2}" disabled /></div>',
                                'vp-input', VP_DS_PANDAS_OBJECT, prevValue));
                        });
                        if (!that.stateLoaded) {
                            that.reloadSubsetData();
                        }
                    } catch {
                        ;
                    }
                });
            } else {
                // if get input variable through user's selection
                vpKernel.getDataList(types).then(function (resultObj) {
                    let { result } = resultObj;
                    var varList = JSON.parse(result);
                    varList = varList.map(function (v) {
                        return { label: v.varName + ' (' + v.varType + ')', value: v.varName, dtype: v.varType };
                    });

                    that.state.dataList = varList;

                    // 1. Target Variable
                    var prevValue = $(that.wrapSelector('.' + VP_DS_PANDAS_OBJECT)).val();
                    $(that.wrapSelector('.' + VP_DS_PANDAS_OBJECT_BOX)).replaceWith(function () {
                        var pdVarSelect = new VarSelector(that.pdObjTypes, that.state.dataType, false, false);
                        pdVarSelect.addClass(VP_DS_PANDAS_OBJECT);
                        pdVarSelect.addBoxClass(VP_DS_PANDAS_OBJECT_BOX);
                        pdVarSelect.setValue(prevValue);
                        return pdVarSelect.render();
                    });
                    if (!that.stateLoaded) {
                        that.reloadSubsetData();
                    }
                });
            }
        }
        loadSubsetType(dataType) {
            var that = this;
            $(this.wrapSelector('.' + VP_DS_SUBSET_TYPE)).replaceWith(function () {
                return that.renderSubsetType(dataType);
            });
        }
        loadRowColumnSubsetType(subsetType, timestamp = false) {
            var that = this;
            // get current subset type of row & column
            var rowSubset = this.state.rowType;
            var colSubset = this.state.colType;

            that.renderRowSubsetType(subsetType, timestamp);
            that.renderColumnSubsetType(subsetType);

            $(this.wrapSelector('.' + VP_DS_ROWTYPE)).val(rowSubset);
            $(this.wrapSelector('.' + VP_DS_COLTYPE)).val(colSubset);

            var selectedRowType = $(this.wrapSelector('.' + VP_DS_ROWTYPE)).val();
            var selectedColType = $(this.wrapSelector('.' + VP_DS_COLTYPE)).val();

            if (selectedRowType != rowSubset) {
                $(this.wrapSelector('.' + VP_DS_ROWTYPE + ' option')).eq(0).prop('selected', true);
                this.state.rowType = $(this.wrapSelector('.' + VP_DS_ROWTYPE)).val();
            }
            if (selectedColType != colSubset) {
                $(this.wrapSelector('.' + VP_DS_COLTYPE + ' option')).eq(0).prop('selected', true);
                this.state.colType = $(this.wrapSelector('.' + VP_DS_COLTYPE)).val();
            }

            $(this.wrapSelector('.' + VP_DS_ROWTYPE)).trigger('change');
            $(this.wrapSelector('.' + VP_DS_COLTYPE)).trigger('change');
        }
        /**
         * Load Column List
         * - change state.columnList
         * - render column selection list
         * - render column slicing box
         * - render column condition list
         * @param {Array} columnList
         */
        loadColumnList(columnList) {
            var that = this;

            // if iloc
            if (this.state.subsetType == 'iloc') {
                columnList = columnList.map(function (x) {
                    return {
                        ...x,
                        label: x.location + '',
                        value: x.location + '',
                        code: x.location + '',
                    };
                });
            }

            this.state.columnList = columnList;
            this.state.colPointer = { start: -1, end: -1 };

            // column selection
            this.renderColumnIndexing(columnList);

            // column slicing
            this.renderColumnSlicingBox(columnList);

            // column condition
            this.renderColumnConditionList(columnList);
        }
        /**
             * Load Row List
             * - change state.rowList
             * - render row selection list
             * - render row slicing box
             * @param {Array} rowList
             */
        loadRowList(rowList) {
            var that = this;

            // if iloc
            if (this.state.subsetType == 'iloc') {
                rowList = rowList.map(function (x) {
                    return {
                        ...x,
                        label: x.location + '',
                        value: x.location + '',
                        code: x.location + '',
                    };
                });
            }


            this.state.rowList = rowList;
            this.state.rowPointer = { start: -1, end: -1 };

            // is timestampindex ?
            if (rowList && rowList.length > 0 && rowList[0]['index_dtype'] == 'datetime64[ns]') {
                this.state.isTimestamp = true;
            } else {
                this.state.isTimestamp = false;
            }

            // row selection
            this.renderRowIndexing(rowList);

            // row slicing
            this.renderRowSlicingBox(rowList);

            this.loadRowColumnSubsetType(this.state.subsetType, this.state.isTimestamp);
        }
        saveState() {
            // save input state
            $(this.wrapSelector('.' + VP_DS_ROWTYPE_BOX + '.' + this.state.rowType + ' input')).each(function () {
                this.defaultValue = this.value;
            });
            $(this.wrapSelector('.' + VP_DS_COLTYPE_BOX + '.' + this.state.colType + ' input')).each(function () {
                this.defaultValue = this.value;
            });

            // save checkbox state
            $(this.wrapSelector('.' + VP_DS_ROWTYPE_BOX + '.' + this.state.rowType + ' input[type="checkbox"]')).each(function () {
                if (this.checked) {
                    this.setAttribute("checked", true);
                } else {
                    this.removeAttribute("checked");
                }
            });
            $(this.wrapSelector('.' + VP_DS_COLTYPE_BOX + '.' + this.state.colType + ' input[type="checkbox"]')).each(function () {
                if (this.checked) {
                    this.setAttribute("checked", true);
                } else {
                    this.removeAttribute("checked");
                }
            });

            // save select state
            $(this.wrapSelector('.' + VP_DS_ROWTYPE_BOX + '.' + this.state.rowType + ' select > option')).each(function () {
                if (this.selected) {
                    this.setAttribute("selected", true);
                } else {
                    this.removeAttribute("selected");
                }
            });
            $(this.wrapSelector('.' + VP_DS_COLTYPE_BOX + '.' + this.state.colType + ' select > option')).each(function () {
                if (this.selected) {
                    this.setAttribute("selected", true);
                } else {
                    this.removeAttribute("selected");
                }
            });

            // save pageDom
            this.state.rowPageDom = $(this.wrapSelector('.' + VP_DS_ROWTYPE_BOX + '.' + this.state.rowType)).html();
            this.state.colPageDom = $(this.wrapSelector('.' + VP_DS_COLTYPE_BOX + '.' + this.state.colType)).html();
        }
        loadStateAfterRender() {
            var {
                dataType, pandasObject, useCopy, toFrame, subsetType, allocateTo, rowType, colType, rowPageDom, colPageDom
            } = this.state;
            // load variable
            $(this.wrapSelector('.' + VP_DS_PANDAS_OBJECT_BOX + ' .vp-vs-variables')).val(dataType);
            $(this.wrapSelector('.' + VP_DS_PANDAS_OBJECT)).val(pandasObject);
            $(this.wrapSelector('.' + VP_DS_USE_COPY)).prop('checked', useCopy);
            $(this.wrapSelector('.' + VP_DS_TO_FRAME)).prop('checked', toFrame);

            // load method
            $(this.wrapSelector('.' + VP_DS_SUBSET_TYPE)).val(subsetType);

            // load allocate to
            $(this.wrapSelector('.' + VP_DS_ALLOCATE_TO)).val(allocateTo);


            // load rowPageDom
            if (rowPageDom != '') {
                $(this.wrapSelector('.' + VP_DS_ROWTYPE_BOX + '.' + rowType)).html(rowPageDom);
            }

            // load colPageDom
            if (colPageDom != '') {
                $(this.wrapSelector('.' + VP_DS_COLTYPE_BOX + '.' + colType)).html(colPageDom);
            }

            // bind draggable
            if (rowType == 'indexing') {
                this.bindDraggable('row');
            }
            if (colType == 'indexing') {
                this.bindDraggable('col');
            }

            // load rowType
            $(this.wrapSelector('.' + VP_DS_ROWTYPE)).val(rowType);
            $(this.wrapSelector('.' + VP_DS_ROWTYPE)).trigger('change');

            // load colType
            $(this.wrapSelector('.' + VP_DS_COLTYPE)).val(colType);
            $(this.wrapSelector('.' + VP_DS_COLTYPE)).trigger('change');


            this.stateLoaded = true;

            this.generateCode();
        }
        ///////////////////////// load end ///////////////////////////////////////////////////////////
        /**
         * Bind Draggable to VP_DS_SELECT_ITEM
         * - bind draggable to VP_DS_DRAGGABLE
         * - bind droppable to VP_DS_DROPPABLE
         * @param {string} type 'row'/'col'
         */
        bindDraggable(type) {
            var that = this;
            var draggableQuery = this.wrapSelector('.' + VP_DS_DRAGGABLE + '.select-' + type);
            var droppableQuery = this.wrapSelector('.select-' + type + ' .' + VP_DS_DROPPABLE);

            $(draggableQuery).draggable({
                // containment: '.select-' + type + ' .' + VP_DS_DROPPABLE,
                // appendTo: droppableQuery,
                // snap: '.' + VP_DS_DRAGGABLE,
                revert: 'invalid',
                cursor: 'pointer',
                connectToSortable: droppableQuery + '.right',
                // cursorAt: { bottom: 5, right: 5 },
                helper: function () {
                    // selected items
                    var widthString = parseInt($(this).outerWidth()) + 'px';
                    var selectedTag = $(this).parent().find('.selected');
                    if (selectedTag.length <= 0) {
                        selectedTag = $(this);
                    }
                    return $('<div></div>').append(selectedTag.clone().addClass('moving').css({
                        width: widthString, border: '0.25px solid #C4C4C4'
                    }));
                }
            });

            $(droppableQuery).droppable({
                accept: draggableQuery,
                drop: function (event, ui) {
                    var dropped = ui.draggable;
                    var droppedOn = $(this);

                    // is dragging on same droppable container?
                    if (droppedOn.get(0) == $(dropped).parent().get(0)) {

                        that.generateCode();
                        return;
                    }

                    var dropGroup = $(dropped).parent().find('.selected:not(.moving)');
                    // if nothing selected(as orange_text), use dragging item
                    if (dropGroup.length <= 0) {
                        dropGroup = $(dropped);
                    }
                    $(dropGroup).detach().css({ top: 0, left: 0 }).appendTo(droppedOn);

                    if ($(this).hasClass('right')) {
                        // add
                        $(dropGroup).addClass('added');
                    } else {
                        // del
                        $(dropGroup).removeClass('added');
                        // sort
                        $(droppedOn).find('.' + VP_DS_SELECT_ITEM).sort(function (a, b) {
                            return ($(b).data('idx')) < ($(a).data('idx')) ? 1 : -1;
                        }).appendTo($(droppedOn));
                    }
                    // remove selection
                    $(droppableQuery).find('.selected').removeClass('selected');
                    that.state[type + 'Pointer'] = { start: -1, end: -1 };

                    that.generateCode();
                },
                over: function (event, elem) {
                },
                out: function (event, elem) {
                }
            });


        }
        _unbindEvent() {
            super._unbindEvent();
            $(document).off(this.wrapSelector('*'));

            $(document).off('var_changed change', this.wrapSelector('.' + VP_DS_PANDAS_OBJECT));
            $(document).off('change', this.wrapSelector('.' + VP_DS_USE_COPY));
            $(document).off('change', this.wrapSelector('.' + VP_DS_SUBSET_TYPE));
            $(document).off('change', this.wrapSelector('.' + VP_DS_TO_FRAME));
            $(document).off('change', this.wrapSelector('.' + VP_DS_ALLOCATE_TO));
            $(document).off('click', this.wrapSelector('.' + VP_DS_TAB_SELECTOR_BTN));
            $(document).off('change', this.wrapSelector('.' + VP_DS_DATA_VIEW_ALL));
            $(document).off('change', this.wrapSelector('.' + VP_DS_ROWTYPE));
            $(document).off('change', this.wrapSelector('.' + VP_DS_COLTYPE));
            $(document).off('change', this.wrapSelector('.' + VP_DS_INDEXING_TIMESTAMP));
            $(document).off('change', this.wrapSelector('.select-row .' + VP_DS_SELECT_SEARCH));
            $(document).off('change', this.wrapSelector('.select-col .' + VP_DS_SELECT_SEARCH));
            $(document).off('click', this.wrapSelector('.' + VP_DS_SELECT_ITEM));
            $(document).off('click', this.wrapSelector('.' + VP_DS_SELECT_ADD_ALL_BTN));
            $(document).off('click', this.wrapSelector('.' + VP_DS_SELECT_ADD_BTN));
            $(document).off('click', this.wrapSelector('.' + VP_DS_SELECT_DEL_BTN));
            $(document).off('click', this.wrapSelector('.' + VP_DS_SELECT_DEL_ALL_BTN));
            $(document).off('click', this.wrapSelector('.vp-add-col'));
            $(document).off('click', this.wrapSelector('.vp-del-col'));
            $(document).off('change', this.wrapSelector('.vp-ds-slicing-box input[type="text"]'));
            $(document).off('change var_changed', this.wrapSelector('.vp-ds-cond-tbl .vp-cond-var'));
            $(document).off('change', this.wrapSelector('.vp-ds-cond-tbl .vp-col-list'));
            $(document).off('change', this.wrapSelector('.vp-ds-cond-tbl .vp-cond-use-text'));
            $(document).off('change', this.wrapSelector('.vp-ds-cond-tbl input[type="text"]'));
            $(document).off('change', this.wrapSelector('.vp-ds-cond-tbl select'));
            $(document).off('click.' + this.uuid);

            $(document).off('keydown.' + this.uuid);
            $(document).off('keyup.' + this.uuid);
        }
        /**
         * Bind All Events
         * - pandasObject select/change
         * - use copy change
         * - subset type change
         * - tab change
         * - row/column subset type change
         * - row/column search value change
         * - row/column indexing add/del button click
         * - row/column slicing start/end value change
         * - condition values change
         * - condition add/del button click
         */
        _bindEvent() {
            super._bindEvent();
            var that = this;

            if (this.targetSelector && this.targetSelector != '') {
                // open popup
                $(document).on('click', com_util.formatString('.{0}.{1}', VP_DS_BTN, this.uuid), function (event) {
                    if (!$(this).hasClass('disabled')) {
                        that.useCell = false; // show apply button only
                        that.open();
                    }
                });
            }

            // df selection/change
            $(document).on('var_changed change', this.wrapSelector('.' + VP_DS_PANDAS_OBJECT), function (event) {
                var varName = $(that.wrapSelector('.' + VP_DS_PANDAS_OBJECT)).val();

                if (that.state.pandasObject == varName
                    && that.state.dataType == event.dataType) {
                    // if newly selected object&type is same as before, do nothing.
                    return;
                }

                that.state.pandasObject = varName;
                that.state.dataType = event.dataType ? event.dataType : that.state.dataType;
                that.state.rowList = [];
                that.state.columnList = [];
                that.state.rowPointer = { start: -1, end: -1 };
                that.state.colPointer = { start: -1, end: -1 };

                if (!varName || varName == '') {
                    that.loadRowList([]);
                    that.loadColumnList([]);
                    that.generateCode();
                    return;
                }

                // that.loadSubsetType(that.state.dataType);
                if (that.state.dataType == 'DataFrame') {
                    // get result and load column list
                    vpKernel.getColumnList(varName).then(function (resultObj) {
                        let { result } = resultObj;
                        var colList = JSON.parse(result);
                        colList = colList.map(function (x) {
                            return {
                                ...x,
                                value: x.label,
                                code: x.value
                            };
                        });
                        that.loadColumnList(colList);
                        that.bindDraggable('col');
                        that.generateCode();
                    });

                    // get result and load column list
                    vpKernel.getRowList(varName).then(function (resultObj) {
                        let { result } = resultObj;
                        var rowList = JSON.parse(result);
                        rowList = rowList.map(function (x) {
                            return {
                                ...x,
                                value: x.label,
                                code: x.value
                            };
                        });
                        that.loadRowList(rowList);
                        that.bindDraggable('row');
                        that.generateCode();
                    });

                    // show column box
                    $(that.wrapSelector('.' + VP_DS_TAB_PAGE_BOX + '.subset-column')).show();
                } else if (that.state.dataType == 'Series') {
                    // get result and load column list
                    vpKernel.getRowList(varName).then(function (resultObj) {
                        let { result } = resultObj;
                        var rowList = JSON.parse(result);
                        rowList = rowList.map(function (x) {
                            return {
                                ...x,
                                value: x.label,
                                code: x.value
                            };
                        });
                        that.loadRowList(rowList);
                        that.bindDraggable('row');
                        that.generateCode();
                    });

                    that.loadColumnList([]);

                    // hide to frame
                    $(that.wrapSelector('.' + VP_DS_TO_FRAME)).parent().hide();
                    // hide column box
                    $(that.wrapSelector('.' + VP_DS_TAB_PAGE_BOX + '.subset-column')).hide();
                }
            });

            // use copy
            $(document).on('change', this.wrapSelector('.' + VP_DS_USE_COPY), function (event) {
                var checked = $(this).prop('checked');
                that.state.useCopy = checked;

                that.generateCode();
            });

            // subset type select
            $(document).on('change', this.wrapSelector('.' + VP_DS_SUBSET_TYPE), function (event) {
                var subsetType = $(this).val();
                that.state.subsetType = subsetType;

                that.reloadSubsetData();
                // that.loadRowColumnSubsetType(subsetType, that.state.isTimestamp);
                // // data page
                // if (that.state.tabPage == 'data') {
                //     that.loadDataPage();
                // } else {
                //     that.generateCode();
                // }
            });

            // to frame
            $(document).on('change', this.wrapSelector('.' + VP_DS_TO_FRAME), function (event) {
                var checked = $(this).prop('checked');
                that.state.toFrame = checked;
                that.generateCode();
            });

            // allocate to
            $(document).on('change', this.wrapSelector('.' + VP_DS_ALLOCATE_TO), function (evt) {
                var allocateTo = $(this).val();
                that.state.allocateTo = allocateTo;
                that.generateCode();
            });

            // view all
            $(document).on('change', this.wrapSelector('.' + VP_DS_DATA_VIEW_ALL), function (event) {
                var checked = $(this).prop('checked');
                that.state.viewAll = checked;

                that.loadDataPage();
            });

            // row type selector
            $(document).on('change', this.wrapSelector('.' + VP_DS_ROWTYPE), function (event) {
                var rowType = $(this).val();
                that.state.rowType = rowType;
                // hide
                $(that.wrapSelector('.' + VP_DS_ROWTYPE_BOX)).hide();
                $(that.wrapSelector('.' + VP_DS_ROWTYPE_BOX + '.' + rowType)).show();

                that.generateCode();
            });

            // column type selector
            $(document).on('change', this.wrapSelector('.' + VP_DS_COLTYPE), function (event) {
                var colType = $(this).val();
                that.state.colType = colType;
                // hide
                $(that.wrapSelector('.' + VP_DS_COLTYPE_BOX)).hide();
                $(that.wrapSelector('.' + VP_DS_COLTYPE_BOX + '.' + colType)).show();

                that.generateCode();
            });

            // row indexing - timestamp
            $(document).on('change', this.wrapSelector('.' + VP_DS_INDEXING_TIMESTAMP), function (event) {
                that.generateCode();
            });

            // item indexing - search index
            $(document).on('change', this.wrapSelector('.select-row .' + VP_DS_SELECT_SEARCH), function (event) {
                var searchValue = $(this).val();

                // filter added rows
                var addedTags = $(that.wrapSelector('.select-row .' + VP_DS_SELECT_RIGHT + ' .' + VP_DS_SELECT_ITEM + '.added'));
                var addedRowList = [];
                for (var i = 0; i < addedTags.length; i++) {
                    var value = $(addedTags[i]).attr('data-rowname');
                    addedRowList.push(value);
                }
                var filteredRowList = that.state.rowList.filter(x => x.value.toString().includes(searchValue) && !addedRowList.includes(x.value.toString()));

                // row indexing
                that.renderRowSelectionBox(filteredRowList);

                // draggable
                that.bindDraggable('row');
            });

            // item indexing - search columns
            $(document).on('change', this.wrapSelector('.select-col .' + VP_DS_SELECT_SEARCH), function (event) {
                var searchValue = $(this).val();

                // filter added columns
                var addedTags = $(that.wrapSelector('.select-col .' + VP_DS_SELECT_RIGHT + ' .' + VP_DS_SELECT_ITEM + '.added'));
                var addedColumnList = [];
                for (var i = 0; i < addedTags.length; i++) {
                    var value = $(addedTags[i]).attr('data-colname');
                    addedColumnList.push(value);
                }
                var filteredColumnList = that.state.columnList.filter(x => x.value.includes(searchValue) && !addedColumnList.includes(x.value));

                // column indexing
                that.renderColumnSelectionBox(filteredColumnList);

                // draggable
                that.bindDraggable('col');
            });

            // item indexing
            $(document).on('click', this.wrapSelector('.' + VP_DS_SELECT_ITEM), function (event) {
                var dataIdx = $(this).attr('data-idx');
                var idx = $(this).index();
                var itemType = $(this).hasClass('select-row') ? 'row' : 'col';
                var added = $(this).hasClass('added'); // right side added item?

                var selector = '.select-' + itemType;

                // remove selection for select box on the other side
                if (added) {
                    // remove selection for left side
                    $(that.wrapSelector('.' + VP_DS_SELECT_ITEM + '.select-' + itemType + ':not(.added)')).removeClass('selected');
                    // set selector
                    selector += '.added';
                } else {
                    // remove selection for right(added) side
                    $(that.wrapSelector('.' + VP_DS_SELECT_ITEM + '.select-' + itemType + '.added')).removeClass('selected');
                    // set selector
                    selector += ':not(.added)';
                }

                if (vpEvent.keyManager.keyCheck.ctrlKey) {
                    // multi-select
                    that.state[itemType + 'Pointer'] = { start: idx, end: -1 };
                    $(this).toggleClass('selected');
                } else if (vpEvent.keyManager.keyCheck.shiftKey) {
                    // slicing
                    var startIdx = that.state[itemType + 'Pointer'].start;

                    if (startIdx == -1) {
                        // no selection
                        that.state[itemType + 'Pointer'] = { start: idx, end: -1 };
                    } else if (startIdx > idx) {
                        // add selection from idx to startIdx
                        var tags = $(that.wrapSelector('.' + VP_DS_SELECT_ITEM + selector));
                        for (var i = idx; i <= startIdx; i++) {
                            $(tags[i]).addClass('selected');
                        }
                        that.state[itemType + 'Pointer'] = { start: startIdx, end: idx };
                    } else if (startIdx <= idx) {
                        // add selection from startIdx to idx
                        var tags = $(that.wrapSelector('.' + VP_DS_SELECT_ITEM + selector));
                        for (var i = startIdx; i <= idx; i++) {
                            $(tags[i]).addClass('selected');
                        }
                        that.state[itemType + 'Pointer'] = { start: startIdx, end: idx };
                    }
                } else {
                    // single-select
                    that.state[itemType + 'Pointer'] = { start: idx, end: -1 };
                    // un-select others
                    $(that.wrapSelector('.' + VP_DS_SELECT_ITEM + selector)).removeClass('selected');
                    // select this
                    $(this).addClass('selected');
                }
            });

            // item indexing - add all
            $(document).on('click', this.wrapSelector('.' + VP_DS_SELECT_ADD_ALL_BTN), function (event) {
                var itemType = $(this).hasClass('select-row') ? 'row' : 'col';
                var selector = '.select-' + itemType;

                $(that.wrapSelector('.' + VP_DS_SELECT_BOX + '.left .' + VP_DS_SELECT_ITEM + selector)).appendTo(
                    $(that.wrapSelector(selector + ' .' + VP_DS_SELECT_BOX + '.right'))
                );
                $(that.wrapSelector(selector + ' .' + VP_DS_SELECT_BOX + ' .' + VP_DS_SELECT_ITEM)).addClass('added');
                $(that.wrapSelector('.' + VP_DS_SELECT_ITEM + '.selected')).removeClass('selected');
                that.state[itemType + 'Pointer'] = { start: -1, end: -1 };

                that.generateCode();
            });

            // item indexing - add
            $(document).on('click', this.wrapSelector('.' + VP_DS_SELECT_ADD_BTN), function (event) {
                var itemType = $(this).hasClass('select-row') ? 'row' : 'col';
                var selector = '.select-' + itemType + '.selected';

                $(that.wrapSelector('.' + VP_DS_SELECT_ITEM + selector)).appendTo(
                    $(that.wrapSelector('.select-' + itemType + ' .' + VP_DS_SELECT_BOX + '.right'))
                );
                $(that.wrapSelector('.' + VP_DS_SELECT_ITEM + selector)).addClass('added');
                $(that.wrapSelector('.' + VP_DS_SELECT_ITEM + selector)).removeClass('selected');
                that.state[itemType + 'Pointer'] = { start: -1, end: -1 };

                that.generateCode();
            });

            // item indexing - del
            $(document).on('click', this.wrapSelector('.' + VP_DS_SELECT_DEL_BTN), function (event) {
                var itemType = $(this).hasClass('select-row') ? 'row' : 'col';
                var selector = '.select-' + itemType + '.selected';
                var targetBoxQuery = that.wrapSelector('.select-' + itemType + ' .' + VP_DS_SELECT_BOX + '.left');

                var selectedTag = $(that.wrapSelector('.' + VP_DS_SELECT_ITEM + selector));
                selectedTag.appendTo(
                    $(targetBoxQuery)
                );
                // sort
                $(targetBoxQuery + ' .' + VP_DS_SELECT_ITEM).sort(function (a, b) {
                    return ($(b).data('idx')) < ($(a).data('idx')) ? 1 : -1;
                }).appendTo(
                    $(targetBoxQuery)
                );
                selectedTag.removeClass('added');
                selectedTag.removeClass('selected');
                that.state[itemType + 'Pointer'] = { start: -1, end: -1 };

                that.generateCode();
            });

            // item indexing - del all
            $(document).on('click', this.wrapSelector('.' + VP_DS_SELECT_DEL_ALL_BTN), function (event) {
                var itemType = $(this).hasClass('select-row') ? 'row' : 'col';
                var selector = '.select-' + itemType;

                var targetBoxQuery = that.wrapSelector(selector + ' .' + VP_DS_SELECT_BOX + '.left');
                $(that.wrapSelector(selector + ' .' + VP_DS_SELECT_ITEM)).appendTo(
                    $(targetBoxQuery)
                );
                // sort
                $(targetBoxQuery + ' .' + VP_DS_SELECT_ITEM).sort(function (a, b) {
                    return ($(b).data('idx')) < ($(a).data('idx')) ? 1 : -1;
                }).appendTo(
                    $(targetBoxQuery)
                );
                $(that.wrapSelector(selector + ' .' + VP_DS_SELECT_ITEM)).removeClass('added');
                $(that.wrapSelector(selector + ' .' + VP_DS_SELECT_ITEM)).removeClass('selected');
                that.state[itemType + 'Pointer'] = { start: -1, end: -1 };

                that.generateCode();
            });

            // row-column condition add
            $(document).on('click', this.wrapSelector('.vp-add-col'), function (event) {
                that.handleColumnAdd();

                that.generateCode();
            });

            // row-column condition delete
            $(document).on('click', this.wrapSelector('.vp-del-col'), function (event) {
                event.stopPropagation();

                var colList = $(that.wrapSelector('.' + VP_DS_CONDITION_TBL + ' tr td:not(:last)'));
                // clear previous one
                $(this).closest('tr').remove();
                $(that.wrapSelector('.' + VP_DS_CONDITION_TBL + ' .vp-oper-connect:last')).hide();

                that.generateCode();
            });

            // typing on slicing
            $(document).on('change', this.wrapSelector('.vp-ds-slicing-box input[type="text"]'), function () {
                $(this).data('code', $(this).val());
                that.generateCode();
            });

            // typing on condition variable
            $(document).on('change var_changed', this.wrapSelector('.vp-ds-cond-tbl .vp-cond-var'), function () {
                var varType = $(this).attr('data-type');
                var colTag = $(this).closest('td').find('.vp-col-list');
                if (varType == 'DataFrame') {
                    // pd Object selected
                    var varName = $(this).val();
                    if (varName == '') {
                        $(colTag).attr('disabled', true);
                        $(colTag).replaceWith(function () {
                            return that.templateForConditionColumnInput([]);
                        });
                        that.generateCode();
                        return;
                    }
                    // dataframe column search
                    var colCode = com_util.formatString('_vp_print(_vp_get_columns_list({0}))', varName);
                    // get result and load column list
                    vpKernel.execute(colCode).then(function (resultObj) {
                        let { result } = resultObj;
                        var colList = JSON.parse(result);
                        colList = colList.map(function (x) {
                            return {
                                ...x,
                                value: x.label,
                                code: x.value
                            };
                        });
                        $(colTag).replaceWith(function () {
                            return that.templateForConditionColumnInput(colList);
                        });
                        $(colTag).attr('disabled', false);
                        that.generateCode();
                    });
                } else {
                    $(colTag).val('');
                    $(colTag).attr('placeholder', '');
                    $(colTag).attr('disabled', true);
                    $(colTag).replaceWith(function () {
                        return that.templateForConditionColumnInput([]);
                    });
                    that.generateCode();
                }
            });

            $(document).on('change', this.wrapSelector('.vp-ds-cond-tbl .vp-col-list'), function () {
                var thisTag = $(this);
                var varName = $(this).closest('td').find('.vp-cond-var').val();
                var colName = $(this).find('option:selected').attr('data-code');

                var condTag = $(this).closest('td').find('.vp-condition');

                var code = com_util.formatString('_vp_print(_vp_get_column_category({0}, {1}))', varName, colName);
                // get result and load column list
                vpKernel.execute(code).then(function (resultObj) {
                    let { result } = resultObj;
                    var category = JSON.parse(result);
                    if (category && category.length > 0) {
                        // if it's categorical column, check 'Text' as default
                        $(thisTag).closest('td').find('.vp-cond-use-text').prop('checked', true);
                    } else {
                        $(thisTag).closest('td').find('.vp-cond-use-text').prop('checked', false);
                    }
                    $(condTag).replaceWith(function () {
                        return that.templateForConditionCondInput(category);
                    });
                    that.generateCode();
                });

            });

            // use text
            $(document).on('change', this.wrapSelector('.vp-ds-cond-tbl .vp-cond-use-text'), function () {
                that.generateCode();
            });

            // typing on condition
            $(document).on('change', this.wrapSelector('.vp-ds-cond-tbl input[type="text"]'), function () {
                that.generateCode();
            });

            $(document).on('change', this.wrapSelector('.vp-ds-cond-tbl select'), function () {
                that.generateCode();
            });
        }
        /**
         * Handle Adding Condition
         */
        handleColumnAdd() {
            var conditonBox = $(this.templateForConditionBox(this.state.columnList));

            // hide last connect operator
            conditonBox.find('.vp-oper-connect').hide();

            // show connect operator right before last one
            $(this.wrapSelector('.' + VP_DS_CONDITION_TBL + ' .vp-oper-connect:last')).show();
            conditonBox.insertBefore(this.wrapSelector('.' + VP_DS_CONDITION_TBL + ' tr:last'));
        }
        /**
         * Re-load subset data
         * - trigger dataframe change event
         */
        reloadSubsetData() {
            $(this.wrapSelector('.' + VP_DS_PANDAS_OBJECT)).trigger('var_changed');
        }
        /**
         * Generate Code
         * - default: # PREVIEW CODE
         * - get 2 types of codes
         *  1) rowSelection - indexing/slicing/condition code
         *  2) colSelection - indexing/slicing code
         * - consider 3 types of subset frame
         *  1) subset - rowSelection & colSelection using 'indexing' type
         *  2) loc - subset type 'loc'
         *  3) iloc - subset type 'iloc'
         * - consider use copy option
         */
        generateCodeForSubset(allocation = true, applyPreview = true) {
            var code = new com_String();

            // dataframe
            if (this.state.pandasObject == '') {
                // $(this.wrapSelector('.' + VP_DS_PREVIEW)).text('# PREVIEW CODE');
                this.setPreview('# Code Preview');
                return '';
            }

            // allocate to
            if (allocation && this.state.allocateTo != '') {
                code.appendFormat('{0} = ', this.state.allocateTo);
            }

            // object
            code.append(this.state.pandasObject);

            // row
            var rowSelection = new com_String();
            // depend on type
            if (this.state.rowType == 'indexing') {
                var rowTags = $(this.wrapSelector('.' + VP_DS_SELECT_ITEM + '.select-row.added:not(.moving)'));
                if (rowTags.length > 0) {
                    var rowList = [];
                    for (var i = 0; i < rowTags.length; i++) {
                        var rowValue = $(rowTags[i]).data('code');
                        if (rowValue != undefined) {
                            rowList.push(rowValue);
                        }
                    }
                    rowSelection.appendFormat('[{0}]', rowList.toString());
                } else {
                    rowSelection.append(':');
                }
            } else if (this.state.rowType == 'slicing') {
                var start = $(this.wrapSelector('.' + VP_DS_ROW_SLICE_START)).data('code');
                var end = $(this.wrapSelector('.' + VP_DS_ROW_SLICE_END)).data('code');
                rowSelection.appendFormat('{0}:{1}', start ? start : '', end ? end : '');
            } else if (this.state.rowType == 'condition') {
                // condition
                var condList = $(this.wrapSelector('.' + VP_DS_CONDITION_TBL + ' tr td:not(:last)'));
                var useCondition = false;
                for (var i = 0; i < condList.length; i++) {
                    var colTag = $(condList[i]);
                    var varName = colTag.find('.vp-cond-var').val();
                    var varType = colTag.find('.vp-cond-var').data('type');
                    var colName = colTag.find('.vp-col-list').find('option:selected').data('code');
                    colName = colName ? colName : '';
                    var oper = colTag.find('.vp-oper-list').val();
                    var useText = colTag.find('.vp-cond-use-text').prop('checked');
                    var cond = colTag.find('.vp-condition').val();
                    var connector = i > 0 ? $(condList[i - 1]).find('.vp-oper-connect').val() : undefined;

                    // if no variable selected, pass
                    if (varName == "")
                        continue;
                    if (useCondition) {
                        rowSelection.append(connector);
                    }

                    if (varType == 'DataFrame') {
                        rowSelection.appendFormat('({0}', varName);
                        if (colName && colName != '') {
                            if (colName == '.index') {
                                rowSelection.appendFormat('{0}', colName);
                            } else {
                                rowSelection.appendFormat('[{0}]', colName);
                            }
                        }
                        oper && rowSelection.appendFormat(' {0}', oper);
                        if (cond) {
                            // condition value as text
                            if (useText) {
                                rowSelection.appendFormat(" '{0}'", cond);
                            } else {
                                rowSelection.appendFormat(" {0}", cond);
                            }
                        }
                        rowSelection.append(')');
                    } else {
                        rowSelection.appendFormat('({0}', varName);
                        oper && rowSelection.appendFormat(' {0}', oper);
                        if (cond) {
                            // condition value as text
                            if (useText) {
                                rowSelection.appendFormat(" '{0}'", cond);
                            } else {
                                rowSelection.appendFormat(" {0}", cond);
                            }
                        }
                        rowSelection.append(')');
                    }
                    useCondition = true;
                }

                if (rowSelection.toString() == '') {
                    rowSelection.append(':');
                }
            } else if (this.state.rowType == 'timestamp') {
                var tsIndexing = $(this.wrapSelector('.' + VP_DS_INDEXING_TIMESTAMP)).val();
                if (tsIndexing != '') {
                    rowSelection.appendFormat("'{0}'", tsIndexing);
                } else {
                    rowSelection.appendFormat(":", tsIndexing);
                }
            } else {
                rowSelection.append(':');
            }

            // columns
            // selected colList
            var colSelection = new com_String();

            // hide to frame
            $(this.wrapSelector('.' + VP_DS_TO_FRAME)).parent().hide();
            if (this.state.dataType == 'DataFrame') {
                if (this.state.colType == 'indexing') {
                    var colTags = $(this.wrapSelector('.' + VP_DS_SELECT_ITEM + '.select-col.added:not(.moving)'));
                    if (colTags.length > 0) {
                        var colList = [];
                        for (var i = 0; i < colTags.length; i++) {
                            var colValue = $(colTags[i]).data('code');
                            if (colValue) {
                                colList.push(colValue);
                            }
                        }

                        // hide/show to frame
                        if (colList.length == 1) {
                            $(this.wrapSelector('.' + VP_DS_TO_FRAME)).parent().show();

                            // to frame
                            if (this.state.toFrame) {
                                colSelection.appendFormat('[{0}]', colList.toString());
                            } else {
                                colSelection.appendFormat('{0}', colList.toString());
                            }
                        } else {
                            colSelection.appendFormat('[{0}]', colList.toString());
                        }

                    } else {
                        colSelection.append(':');
                    }
                } else if (this.state.colType == 'slicing') {
                    var start = $(this.wrapSelector('.' + VP_DS_COL_SLICE_START)).data('code');
                    var end = $(this.wrapSelector('.' + VP_DS_COL_SLICE_END)).data('code');
                    colSelection.appendFormat('{0}:{1}', start ? start : '', end ? end : '');
                }
            }

            // use simple selection
            if (this.state.subsetType == 'subset') {
                if (rowSelection.toString() != ':' && rowSelection.toString() != '') {
                    code.appendFormat('[{0}]', rowSelection.toString());
                }
                if (colSelection.toString() != ':' && colSelection.toString() != '') {
                    code.appendFormat('[{0}]', colSelection.toString());
                }
            } else if (this.state.subsetType == 'loc') {
                if (this.state.dataType == 'DataFrame') {
                    code.appendFormat('.loc[{0}, {1}]', rowSelection.toString(), colSelection.toString());
                } else {
                    code.appendFormat('.loc[{0}]', rowSelection.toString());
                }
            } else if (this.state.subsetType == 'iloc') {
                if (this.state.dataType == 'DataFrame') {
                    code.appendFormat('.iloc[{0}, {1}]', rowSelection.toString(), colSelection.toString());
                } else {
                    code.appendFormat('.iloc[{0}]', rowSelection.toString());
                }
            }

            // use copy
            if (this.state.useCopy) {
                code.append('.copy()');
            }

            if (applyPreview) {
                this.setPreview(code.toString());
            }

            // display
            if (this.useCell) {
                if (allocation && this.state.allocateTo != '') {
                    code.appendLine();
                    code.append(this.state.allocateTo);
                }
            }
            return code.toString();
        }
        setPreview(previewCodeStr) {
            this.setCmValue('previewCode', previewCodeStr);
        }

        open() {
            super.open();

            if (this.useInputVariable) {
                this.loadVariables();
                this.reloadSubsetData();
                // show save button only
                this.setSaveOnlyMode();
            }        
            // generate code after displaying page
            // - codemirror can be set after display    
            this.generateCode();
        }

        //====================================================================
        // Button to open Subset from other popup
        //====================================================================

        hideButton() {
            if (this.useInputVariable) {
                $(this.pageThis.wrapSelector('.' + VP_DS_BTN + '.' + this.uuid)).hide();
            }
        }

        disableButton() {
            if (this.useInputVariable) {
                var buttonEle = $(this.pageThis.wrapSelector('.' + VP_DS_BTN + '.' + this.uuid));
                if (!buttonEle.hasClass('disabled')) {
                    buttonEle.addClass('disabled');
                }
            }
        }

        enableButton() {
            if (this.useInputVariable) {
                $(this.pageThis.wrapSelector('.' + VP_DS_BTN + '.' + this.uuid)).removeClass('disabled');
            }
        }
        showButton() {
            if (this.useInputVariable) {
                $(this.pageThis.wrapSelector('.' + VP_DS_BTN + '.' + this.uuid)).show();
            }
        }
    }

    // Temporary constant data
    const VP_DS_BTN = 'vp-ds-button';
    const VP_DS = 'vp-ds';
    const VP_DS_CONTAINER = 'vp-ds-container';
    const VP_DS_CLOSE = 'vp-ds-close';
    const VP_DS_TITLE = 'vp-ds-title';
    const VP_DS_BODY = 'vp-ds-body';

    const VP_DS_PREVIEW = 'vp-ds-preview';

    const VP_DS_LABEL = 'vp-ds-label';

    const VP_DS_PANDAS_OBJECT_BOX = 'vp-ds-pandas-object-box';
    const VP_DS_PANDAS_OBJECT = 'vp-ds-pandas-object';
    const VP_DS_USE_COPY = 'vp-ds-use-copy';
    
    const VP_DS_SUBSET_TYPE = 'vp-ds-subset-type';
    const VP_DS_TO_FRAME = 'vp-ds-to-frame';

    const VP_DS_ALLOCATE_TO = 'vp-ds-allocate-to';

    /** tab selector */
    const VP_DS_TAB_SELECTOR_BOX = 'vp-ds-tab-selector-box';
    const VP_DS_TAB_SELECTOR_BTN = 'vp-ds-tab-selector-btn';
    /** tab page */
    const VP_DS_TAB_PAGE = 'vp-ds-tab-page';
    const VP_DS_TAB_PAGE_BOX = 'vp-ds-tab-page-box';

    const VP_DS_ROWCOL_SUBSET_TITLE = 'vp-ds-rowcol-subset-title';

    const VP_DS_ROWTYPE = 'vp-ds-rowtype';
    const VP_DS_ROWTYPE_BOX = 'vp-ds-rowtype-box';

    /** indexing timestamp */
    const VP_DS_INDEXING_TIMESTAMP = 'vp-ds-indexing-timestamp';

    /** select */
    const VP_DS_SELECT_CONTAINER = 'vp-ds-select-container';
    const VP_DS_SELECT_LEFT = 'vp-ds-select-left';
    const VP_DS_SELECT_BTN_BOX = 'vp-ds-select-btn-box';
    const VP_DS_SELECT_RIGHT = 'vp-ds-select-right';

    const VP_DS_SELECT_BOX = 'vp-ds-select-box';
    const VP_DS_SELECT_ITEM = 'vp-ds-select-item';
    
    /** select left */
    const VP_DS_SELECT_SEARCH = 'vp-ds-select-search';
    const VP_DS_DROPPABLE = 'vp-ds-droppable';
    const VP_DS_DRAGGABLE = 'vp-ds-draggable';

    /** select btns */
    const VP_DS_SELECT_ADD_ALL_BTN = 'vp-ds-select-add-all-btn';
    const VP_DS_SELECT_ADD_BTN = 'vp-ds-select-add-btn';
    const VP_DS_SELECT_DEL_BTN = 'vp-ds-select-del-btn';
    const VP_DS_SELECT_DEL_ALL_BTN = 'vp-ds-select-del-all-btn';

    /** slicing box */
    const VP_DS_SLICING_BOX = 'vp-ds-slicing-box';

    /** row slice */
    const VP_DS_ROW_SLICE_START = 'vp-ds-row-slice-start';
    const VP_DS_ROW_SLICE_END = 'vp-ds-row-slice-end';

    /** row condition */
    const VP_DS_CONDITION_TBL = 'vp-ds-cond-tbl';
    const VP_DS_BUTTON_ADD_CONDITION = 'vp-ds-btn-add-condition';
    
    /** column selection/slicing */
    const VP_DS_COLTYPE = 'vp-ds-coltype';
    const VP_DS_COLTYPE_BOX = 'vp-ds-coltype-box';

    /** column slice */
    const VP_DS_COL_SLICE_START = 'vp-ds-col-slice-start';
    const VP_DS_COL_SLICE_END = 'vp-ds-col-slice-end';

    /** data view */
    const VP_DS_DATA = 'vp-ds-data';
    const VP_DS_DATA_TITLE = 'vp-ds-data-title';
    const VP_DS_DATA_CONTENT = 'vp-ds-data-content';

    const VP_DS_DATA_VIEW_ALL_DIV = 'vp-ds-data-view-all-div';
    const VP_DS_DATA_VIEW_ALL = 'vp-ds-data-view-all';
    const VP_DS_DATA_VIEW_BOX = 'vp-ds-data-view-box';
    const VP_DS_DATA_ERROR_BOX = 'vp-ds-data-error-box';
    const VP_DS_DATA_ERROR_BOX_TITLE = 'vp-ds-data-error-box-title';

    return Subset;
});