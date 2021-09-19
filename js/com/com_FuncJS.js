/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : com_FuncJS.js
 *    Author          : Black Logic
 *    Note            : [CLASS] Function JS
 *    License         : GPLv3 (GNU General Public License v3.0)
 *    Date            : 2021. 08. 14
 *    Change Date     :
 */

//============================================================================
// [CLASS] Function JS
//============================================================================
define([
    'vp_base/js/com/com_const',
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_MetaData',

    'nbextensions/visualpython/src/common/component/vpAccordionBox',
    'nbextensions/visualpython/src/common/component/vpLineNumberTextArea',
    'nbextensions/visualpython/src/common/component/vpTableLayoutVerticalSimple',
    'nbextensions/visualpython/src/common/component/vpTableLayoutHorizontalSimple',
    'nbextensions/visualpython/src/common/component/vpMultiButtonModal',
    'nbextensions/visualpython/src/common/component/vpMultiButtonModal_new'
], function(com_const, com_util, com_MetaData,
     vpAccordionBox, vpLineNumberTextArea, vpTableLayoutVerticalSimple,
     vpTableLayoutHorizontalSimple, vpMultiButtonModal, vpMultiButtonModal_new) {
    'use strict';

    //========================================================================
    // [CLASS] com_FuncJS
    //========================================================================
    class com_FuncJS {

        /**
         * constructor
         * @param {funcOptProp} props 기본 속성
         * @param {String} uuid 고유 id
         */
        constructor(props, uuid) {
            this.setOptionProp(props);
            this.uuid = uuid;
            this.generatedCode = '';
        }

        /**
         * Set option prop
         * @param {funcOptProp} props 기본 속성
         */
        setOptionProp(props) {
            this.funcName = props.funcName;
            this.funcID = props.funcID;
        }

        /**
         * Set task index
         * @param {number} idx task sequential index
         */
        setTaskIndex(idx) {
            this.taskIdx = idx;
        }

        /**
         * Get task index
         * @returns {number} task sequential index
         */
        getTaskIndex() {
            return this.taskIdx;
        }

        /**
         * validate option
         * @param {*} args
         * @returns {boolean} check validation
         */
        optionValidation(args) {
            console.log('[com_FuncJS.optionValidation] Not developed yet. Need override on child.');
            return false;
        }

        /**
         * Python 코드 실행 후 반환 값 전달해 콜백함수 호출
         * @param {String} command 실행할 코드
         * @param {function} callback 실행 완료 후 호출될 callback
         * @param {boolean} isSilent 커널에 실행위한 신호 전달 여부 기본 false
         * @param {boolean} isStoreHistory 커널에 히스토리 채우도록 신호 기본 !isSilent
         * @param {boolean} isStopOnError 실행큐에 예외 발생시 중지 여부 기본 true
         */
        kernelExecute(command, callback, isSilent = false, isStoreHistory = !isSilent, isStopOnError = true) {
            Jupyter.notebook.kernel.execute(
                command,
                {
                    iopub: {
                        output: function (msg) {
                            var result = String(msg.content['text']);
                            if (!result || result == 'undefined') {
                                if (msg.content.data) {
                                    result = String(msg.content.data['text/plain']);
                                }
                            }

                            callback(result);
                        }
                    }
                },
                { silent: isSilent, store_history: isStoreHistory, stop_on_error: isStopOnError }
            );
        }

        /**
         * 셀에 소스 추가하고 실행.
         * @param {String} command 실행할 코드
         * @param {boolean} exec 실행여부
         * @param {String} type 셀 타입
         */
        cellExecute(command, exec, type = 'code') {
            // TODO: Validate 거칠것
            this.generatedCode = command;

            var targetCell = Jupyter.notebook.insert_cell_below(type);

            // 코드타입인 경우 시그니쳐 추가.
            if (type == 'code') {
                // command = com_util.formatString('{0}\n{1}', com_const.PREFIX_CODE_SIGNATURE, command);
                command = com_util.formatString('{0}', command);
            }
            targetCell.set_text(command);
            Jupyter.notebook.select_next();
            // this.metaSave(); 각 함수에서 호출하도록 변경.
            if (exec) {
                switch (type) {
                    case 'markdown':
                        targetCell.render();
                        break;

                    case 'code':
                    default:
                        targetCell.execute();
                }

                com_util.renderSuccessMessage('Your code has been executed');
            }
            Jupyter.notebook.scroll_to_cell(Jupyter.notebook.get_selected_index());
        }

        /**
         * 선택자 범위 uuid 안으로 감싸기
         * @param {String} selector 제한할 대상 선택자. 복수 매개 시 uuid 아래로 순서대로 제한됨
         * @returns 감싸진 선택자
         */
        wrapSelector(selector) {
            var args = Array.prototype.slice.call(arguments);
            args.unshift('.' + this.uuid);
            return com_util.wrapSelector.apply(this, args);
        }

        /**
         * Load css
         * @param {String} url style sheet url
         */
        loadCss(url) {
            try {
                var link = document.createElement('link');
                link.type = 'text/css';
                link.rel = 'stylesheet';
                link.href = requirejs.toUrl(url);
                document.getElementsByClassName(this.uuid)[0].appendChild(link);
            } catch (err) {
                console.log('[vp] Error occurred during load style sheet. Skip this time.');
                console.warn(err.message);
            }
        }

        /**
         * Execute generated code
         */
        executeGenerated() {
            if (this.generatedCode !== '')
                this.cellExecute(this.generatedCode, true);
        }

        /**
         * 파일 네비게이션에 이 코드를 사용
         * @param {String} command 실행할 코드
         * @param {function} callback 실행 완료 후 호출될 callback
         * @param {boolean} isSilent 커널에 실행위한 신호 전달 여부 기본 false
         * @param {boolean} isStoreHistory 커널에 히스토리 채우도록 신호 기본 !isSilent
         * @param {boolean} isStopOnError 실행큐에 예외 발생시 중지 여부 기본 true
         */
        kernelExecuteV2(command, callback, isSilent = false, isStoreHistory = !isSilent, isStopOnError = true) {
            Jupyter.notebook.kernel.execute(
                command,
                {
                    iopub: {
                        output: function (msg) {
                            var result = msg.content.data['text/plain']; // <- 이 부분을 개선한 kernelExecute 버전2 코드 
                            callback(result);
                        }
                    }
                },
                { silent: isSilent, store_history: isStoreHistory, stop_on_error: isStopOnError }
            );
        }

        /**
         * Initialize metadata handler
         */
        initMetaHandler() {
            if (this.mdHandler === undefined)
                this.mdHandler = new com_MetaData(this.funcID);
            return this.mdHandler;
        }

        /**
         * Generate metadata
         */
        metaGenerate() {
            if (this.package === undefined)
                return;
            var inputIdList = this.package.input.map(x => x.name);
            // inputIdList = inputIdList.concat(this.package.output.map(x => x.name));
            // inputIdList = inputIdList.concat(this.package.variable.map(x => x.name));
            // FIXME: minju : not existing object mapping error fixed
            if (this.package.output)
                inputIdList = inputIdList.concat(this.package.output.map(x => x.name));
            if (this.package.variable)
                inputIdList = inputIdList.concat(this.package.variable.map(x => x.name));
            // generate metadata
            this.initMetaHandler();

            this.metadata = this.mdHandler.generateMetadata(this, inputIdList);
        }

        /**
         * Save metadata
         */
        metaSave() {
            // generate metadata
            this.metaGenerate();
            // save metadata
            if (this.package === undefined)
                return;
            // 20210104 minju: 셀에 Metadata 저장하지 않기
            // this.mdHandler.saveMetadata();
        }

        /**
         * Load metadata
         * @param {funcJS} option
         * @param {JSON} meta
         */
        loadMeta(funcJS, meta) {
            this.initMetaHandler();

            this.mdHandler.metadata = meta;
            this.mdHandler.loadDirectMdAsTag(funcJS, meta);

            // 로드 후 작업이 바인딩 되어있으면 처리
            if (this.loadMetaExpend !== undefined && typeof this.loadMetaExpend == 'function') {
                this.loadMetaExpend(funcJS, meta);
            }
        }

        /**
         * Get Value of Metadata by option id
         * @param {string} id
         */
        getMetadata(id) {
            if (this.metadata == undefined) {
                return '';
            }
            if (this.metadata.options) {
                var len = this.metadata.options.length;
                for (var i = 0; i < len; i++) {
                    var obj = this.metadata.options[i];
                    if (obj.id == id)
                        return obj.value;
                }
            }
            return '';
        }

        /**
         * Set page
         * @param {String} content 페이지 내용
         * @param {number} pageIndex 페이지 인덱스
         */
        setPage(content, pageIndex = 0) {
            $(com_util.wrapSelector(com_util.formatString('.{0}.{1}:eq({2})', this.uuid, com_const.API_OPTION_PAGE, pageIndex))).append(content);
        }

        /**
         * prefix, postfix 입력 컨트롤 생성
         * @param {String} caption 아코디언 박스 캡션
         * @param {String} areaID textarea id
         * @param {String} content textarea content
         * @returns {String} tag string
         */
        createManualCode(caption, areaID, content) {
            var accBoxManualCode = new vpAccordionBox.vpAccordionBox(caption);
            var lineNumberTextArea = new vpLineNumberTextArea.vpLineNumberTextArea(areaID, content);

            accBoxManualCode.addClass(com_const.ACCORDION_GRAY_COLOR);
            accBoxManualCode.appendContent(lineNumberTextArea.toTagString());

            return accBoxManualCode.toTagString();
        }

        /**
         * Create prefix code
         * @param {String} content textarea content
         * @returns {String} tag string
         */
        createPrefixCode(content = '') {
            return this.createManualCode(com_const.API_OPTION_PREFIX_CAPTION, com_const.API_OPTION_PREFIX_CODE_ID, content);
        }
        /**
         * Set prefix code
         * @param {String} content textarea content
         */
        setPrefixCode(content) {
            $(this.wrapSelector(com_util.formatString('#{0}', com_const.API_OPTION_PREFIX_CODE_ID))).val(content);
        }

        /**
         * Get prefix code
         * @returns {String} textarea content
         */
        getPrefixCode() {
            return $(this.wrapSelector(com_util.formatString('#{0}', com_const.API_OPTION_PREFIX_CODE_ID))).val();
        }

        /**
         * Create postfix code
         * @param {String} content textarea content
         * @returns {String} tag string
         */
        createPostfixCode(content = '') {
            return this.createManualCode(com_const.API_OPTION_POSTFIX_CAPTION, com_const.API_OPTION_POSTFIX_CODE_ID, content);
        }

        /**
         * Set postfix code
         * @param {String} content textarea content
         */
        setPostfixCode(content) {
            $(this.wrapSelector(com_util.formatString('#{0}', com_const.API_OPTION_POSTFIX_CODE_ID))).val(content);
        }

        /**
         * Get postfix code
         * @returns {String} textarea content
         */
        getPostfixCode() {
            return $(this.wrapSelector(com_util.formatString('#{0}', com_const.API_OPTION_POSTFIX_CODE_ID))).val();
        }

        /**
         * Create option container
         * @param {String} caption 아코디언 박스 캡션
         * @returns {vpAccordionBox} 아코디언 박스
         */
        createOptionContainer(caption) {
            var accBox = new vpAccordionBox.vpAccordionBox(caption);

            return accBox;
        }

        /**
         * Create vertical simple layout
         * @param {String} thWidth 테이블 헤더(좌측 셀) 넓이
         */
        createVERSimpleLayout(thWidth) {
            var tblLayout = new vpTableLayoutVerticalSimple.vpTableLayoutVerticalSimple();
            tblLayout.setTHWidth(thWidth);

            return tblLayout;
        }

        /**
         * Create horizontal simple layout
         * @param {Array} thWidth 테이블 셀별 넓이
         */
        createHORIZSimpleLayout(thWidth) {
            var tblLayout = new vpTableLayoutHorizontalSimple.vpTableLayoutHorizontalSimple();
            // tblLayout.setTHWidth(thWidth);
            return tblLayout;
        }

        /**
         * Bind option event (컨테이너 callback 에서 호출 함)
         */
        bindOptionEvent() {
            // var that = this;
            // $(document).on(com_util.formatString('click.{0}', that.uuid), function(evt) {
            //     console.log('Test log from vp func. ' + that.uuid);
            // });
            // $(document).on(com_util.formatString('dblclick.{0}', that.uuid), function(evt) {
            //     console.log('Test log from vp func dblclick. ' + that.uuid);
            // });
        }

        /**
         * Unbind option event (컨테이너에서 로드옵션 파기될때 호출 함).
         */
        unbindOptionEvent() {
            $(document).unbind(com_util.formatString('.{0}', this.uuid));
        }
        /**
         * Open multi button modal
         * @param {String} message 모달 메시지
         * @param {Array} buttons 버튼 캡션
         * @param {function} callback 선택 콜백 함수
         */
        openMultiBtnModal(message = '', buttons = new Array(), callback) {
            var mbmModal = new vpMultiButtonModal.vpMultiButtonModal();
            mbmModal.setMessage(message);
            mbmModal.setButtons(buttons);
            mbmModal.openModal(callback);
        }

        /**
         * Open multi button new
         * @param {String} message 모달 메시지
         * @param {Array<string>} buttons 버튼 캡션
         * @param {Array<function>} callback 선택 콜백 함수
         */
        openMultiBtnModal_new(message = '', submessage, buttons = new Array(), callbackList) {
            var mbmModal = new vpMultiButtonModal_new.vpMultiButtonModal(message, submessage, buttons);
            mbmModal.openModal(callbackList);
        }
    }

    return com_FuncJS;

}); /* function, define */

/* End of file */
