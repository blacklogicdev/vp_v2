/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : File.js
 *    Author          : Black Logic
 *    Note            : Apps > File
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] File
//============================================================================
define([
    'text!vp_base/html/m_apps/file.html!strip',
    'css!vp_base/css/m_apps/file.css',
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_Const',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/com_generator',
    'vp_base/data/m_library/pandasLibrary',
    'vp_base/js/com/component/FileNavigation',
    'vp_base/js/com/component/SuggestInput'
], function(fileHtml, fileCss, com_String, com_util, com_Const, PopupComponent
            , pdGen, pandasLibrary, FileNavigation, SuggestInput) {

    /**
     * File
     */
    class File extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.dataview = false;
            this.config.sizeLevel = 1;

            this.fileExtensions = {
                'csv': 'csv',
                'excel': 'xlsx',
                'json': 'json',
                'pickle': 'pickle'
            }
            
            this.package = {
                input: [
                    { name: 'vp_fileioType' },
                    { name: 'vp_pageDom'}
                ]
            }

            this.dataPath = window.location.origin + com_Const.DATA_PATH + "sample_csv/";

            this.state = {
                fileExtension: 'csv',
                selectedFile: '',
                selectedPath: '',
                vp_fileioType: 'Read',
                vp_pageDom: '',
                userOption: '',
                ...this.state
            }

            this.fileResultState = {
                pathInputId : this.wrapSelector('#vp_fileRead #i0'),
                fileInputId : this.wrapSelector('#vp_fileRead #fileName')
            };
    
            this.fileState = {
                'Read': {
                    fileTypeId: {
                        'csv': 'pd004',
                        'excel': 'pd123',
                        'json': 'pd076',
                        'pickle': 'pd079'
                    },
                    selectedType: 'csv',
                    package: null,
                    fileResultState: {
                        pathInputId : this.wrapSelector('#vp_fileRead #i0'),
                        fileInputId : this.wrapSelector('#vp_fileRead #fileName')
                    }
                },
                'Write': {
                    fileTypeId: {
                        'csv': 'pd005',
                        'excel': 'pd124',
                        'json': 'pd077',
                        'pickle': 'pd078'
                    },
                    selectedType: 'csv',
                    package: null,
                    fileResultState: {
                        pathInputId : this.wrapSelector('#vp_fileWrite #i1'),
                        fileInputId : this.wrapSelector('#vp_fileWrite #fileName')
                    }
                },
                'Sample': {
                    library: 'pandas',
                    code: "${vp_sampleReturn} = pd.read_csv('" + this.dataPath  + "${vp_sampleFile}'${v})",
                    input: [
                        {
                            name:'vp_sampleFile',
                            label: 'Sample File',
                            component: 'option_select',
                            options: [
                                'iris.csv', 'titanic.csv', 'fish.csv', 'campusRecruitment.csv', 
                                'houseData_500.csv', 'economic_index.csv', 'tips.csv'
                            ],
                            options_label: [
                                'iris', 'titanic', 'fish', 'campusRecruitment', 
                                'houseData_500', 'economic index', 'tips'
                            ]
                        }
                    ],
                    output: [
                        {
                            name:'vp_sampleReturn',
                            type:'var',
                            label:'Allocate to',
                            required: true
                        }
                    ]
                }
            }
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            var that = this;
            $(this.wrapSelector('#vp_fileioType')).on('change', function() {
                var pageType = $(this).val();
                that.state['vp_fileioType'] = pageType;
                $(that.wrapSelector('.vp-fileio-box')).hide();
                $(that.wrapSelector('#vp_file' + pageType)).show();
    
                //set fileExtensions
                that.fileResultState = {
                    ...that.fileState[pageType].fileResultState
                };
            });
        }

        _bindEventByType(pageType) {
            var that = this;
            var prefix = '#vp_file' + pageType + ' ';
    
            // select file type 
            $(this.wrapSelector(prefix + '#fileType')).change(function() {
                var value = $(this).val();
                that.fileState[pageType].selectedType = value;
    
                // reload
                that.renderPage(pageType);
                that._bindEventByType(pageType);
            });
    
            // open file navigation
            $(this.wrapSelector(prefix + '#vp_openFileNavigationBtn')).click(function() {
                
                let type = 'save';
                if (pageType == 'Read') {
                    type = 'open';
                }

                let fileNavi = new FileNavigation({
                    type: type,
                    extensions: [ that.state.fileExtension ],
                    finish: function(filesPath, status, error) {
                        let {file, path} = filesPath[0];
                        that.state.selectedFile = file;
                        that.state.selectedPath = path;

                        // set text
                        $(that.fileResultState.fileInputId).val(file);
                        $(that.fileResultState.pathInputId).val(path);
                    }
                });
                fileNavi.open();
            });
        }

        saveState() {
            var pageType = $(this.wrapSelector('#vp_fileioType')).val();

            // save input state
            $(this.wrapSelector('#vp_file' + pageType + ' input')).each(function () {
                this.defaultValue = this.value;
            });

            // save checkbox state
            $(this.wrapSelector('#vp_file' + pageType + ' input[type="checkbox"]')).each(function () {
                if (this.checked) {
                    this.setAttribute("checked", true);
                } else {
                    this.removeAttribute("checked");
                }
            });

            // save select state
            $(this.wrapSelector('#vp_file' + pageType + ' select > option')).each(function () {
                if (this.selected) {
                    this.setAttribute("selected", true);
                } else {
                    this.removeAttribute("selected");
                }
            });

            var pageDom = $(this.wrapSelector('#vp_file' + pageType)).html();
            this.state['vp_pageDom'] = pageDom;
        }

        loadStateAfterRender() {
            var pageType = this.state['vp_fileioType'];
            var pageDom = this.state['vp_pageDom'];

            // load pageDom
            $(this.wrapSelector('#vp_file' + pageType)).html(pageDom);

            // set page type
            $(this.wrapSelector('#vp_fileioType')).val(pageType);

            // show loaded page
            $(this.wrapSelector('.vp-fileio-box')).hide();
            $(this.wrapSelector('#vp_file' + pageType)).show();

            //set fileResultState
            this.fileResultState = {
                ...this.fileState[pageType].fileResultState
            };

            // bind event by page type
            this._bindEventByType(pageType);
        }

        templateForBody() {
            /** Implement generating template */
            return fileHtml;
        }

        renderPage(pageType) {
            var that = this;
            var prefix = '#vp_file' + pageType + ' ';
    
            // clear
            $(this.wrapSelector(prefix + '#vp_inputOutputBox table')).html('<colgroup><col width="40%"/><col width="*"/></colgroup>');
            $(this.wrapSelector(prefix + '#vp_optionBox table')).html('<colgroup><col width="40%"/><col width="*"/></colgroup>');
    
            var fileTypeObj = this.fileState[pageType]['fileTypeId'];
            var selectedType = this.fileState[pageType]['selectedType'];
            let fileId = fileTypeObj[selectedType];
            let pdLib = pandasLibrary.PANDAS_FUNCTION;
            let thisPkg = JSON.parse(JSON.stringify(pdLib[fileId]));

            this.fileState[pageType].package = thisPkg;
            this.state.fileExtension = that.fileExtensions[selectedType];
            this.fileResultState = {
                ...this.fileState[pageType].fileResultState
            };
    
            if (pageType == 'Write') {
                if (selectedType == 'json') {
                    this.fileResultState.pathInputId = this.wrapSelector(prefix + '#path_or_buf');
                }
                if (selectedType == 'pickle') {
                    this.fileResultState.pathInputId = this.wrapSelector(prefix + '#path');
                }
            }
    
            // render interface
            pdGen.vp_showInterfaceOnPage(this.wrapSelector('#vp_file' + pageType), thisPkg);
    
            // prepend file type selector
            $(this.wrapSelector(prefix + '#vp_inputOutputBox table')).prepend(
                $('<tr>').append($(`<td><label for="fileType" class="vp-orange-text">File Type</label></td>`))
                    .append($('<td><select id="fileType" class="vp-select"></select></td>'))
            );
            var fileTypeList = Object.keys(fileTypeObj);
            fileTypeList.forEach(type => {
                $(this.wrapSelector(prefix + '#fileType')).append(
                    $(`<option value="${type}">${type}</option>`)
                );
            });

            // prepend user option
            let hasAllocateTo = $(this.wrapSelector(prefix + '#o0')).length > 0;
            if (hasAllocateTo) {
                $(this.wrapSelector(prefix + '#o0')).closest('tr').before(
                    $('<tr>').append($(`<td><label for="userOption">User Option</label></td>`))
                        .append($('<td><input id="userOption" type="text" class="vp-input vp-state" placeholder="key=value, ..."/></td>'))
                )
            } else {
                $(this.wrapSelector(prefix + '#vp_inputOutputBox table')).append(
                    $('<tr>').append($(`<td><label for="userOption">User Option</label></td>`))
                        .append($('<td><input id="userOption" type="text" class="vp-input vp-state" placeholder="key=value, ..."/></td>'))
                )
            }
    
            $(this.wrapSelector(prefix + '#fileType')).val(selectedType);
    
            // add file navigation button
            if (pageType == 'Write') {
                if (selectedType == 'json') {
                    $(prefix + '#path_or_buf').parent().html(
                        com_util.formatString('<input type="text" class="vp-input input-single" id="path_or_buf" index="0" placeholder="" value="" title=""><div id="vp_openFileNavigationBtn" class="{0}"></div>'
                        , 'vp-file-browser-button')
                    );
                } else if (selectedType == 'pickle') {
                    $(prefix + '#path').parent().html(
                        com_util.formatString('<input type="text" class="vp-input input-single" id="path" index="0" placeholder="" value="" title=""><div id="vp_openFileNavigationBtn" class="{0}"></div>'
                        , 'vp-file-browser-button')
                    );
                } else {
                    $(this.fileState[pageType]['fileResultState']['pathInputId']).parent().html(
                        com_util.formatString('<input type="text" class="vp-input input-single" id="{0}" index="0" placeholder="" value="" title=""><div id="vp_openFileNavigationBtn" class="{1}"></div>'
                            , 'i1'
                            , 'vp-file-browser-button')
                    );
                }
            } else {
                $(this.fileState[pageType]['fileResultState']['pathInputId']).parent().html(
                    com_util.formatString('<input type="text" class="vp-input input-single" id="{0}" index="0" placeholder="" value="" title=""><div id="vp_openFileNavigationBtn" class="{1}"></div>'
                        , 'i0'
                        , 'vp-file-browser-button')
                );
            }
    
            // encoding suggest input
            $(this.wrapSelector('#encoding')).replaceWith(function() {
                // encoding list : utf8 cp949 ascii
                var encodingList = ['utf8', 'cp949', 'ascii'];
                var suggestInput = new SuggestInput();
                suggestInput.setComponentID('encoding');
                suggestInput.addClass('vp-input');
                suggestInput.setSuggestList(function() { return encodingList; });
                suggestInput.setPlaceholder('encoding option');
                return suggestInput.toTagString();
            });
    
            
        }

        render() {
            super.render();

            this.renderPage('Read');
            this.renderPage('Write');

            // initialize fileResultState
            this.fileResultState = {
                ...this.fileState['Read'].fileResultState
            };

            if (this.state.vp_pageDom && this.state.vp_pageDom != '') {
                this.loadStateAfterRender();
            }
            this._bindEventByType('Read');
            this._bindEventByType('Write');

        }

        generateCode() {
            var pageType = $(this.wrapSelector('#vp_fileioType')).val();
            var sbCode = new com_String;

            this.saveState();

            var prefix = '#vp_file' + pageType + ' ';
            var userOption = new com_String();
            var userOptValue = $(this.wrapSelector(prefix + '#userOption')).val();
            if (userOptValue != '') {
                userOption.appendFormat(', {0}', userOptValue);
            }

            if (pageType == 'Sample') {
                // sample csv code
                var result = pdGen.vp_codeGenerator(this.uuid + ' #vp_fileSample', { ...this.fileState[pageType] }, userOption.toString());
                sbCode.append(result);
            } else if (pageType == 'Read') {
                var thisPkg = JSON.parse(JSON.stringify(this.fileState[pageType].package));
                thisPkg.input.push({
                    name: 'fileType',
                    type: 'var'
                });
                var result = pdGen.vp_codeGenerator(this.uuid + ' #vp_fileRead', thisPkg, userOption.toString());
                sbCode.append(result);
            } else if (pageType == 'Write') {
                var thisPkg = JSON.parse(JSON.stringify(this.fileState[pageType].package));
                thisPkg.input.push({
                    name: 'fileType',
                    type: 'var'
                });
                var result = pdGen.vp_codeGenerator(this.uuid + ' #vp_fileWrite', thisPkg, userOption.toString());
                sbCode.append(result);
            }

            return sbCode.toString();
        }

    }

    return File;
});