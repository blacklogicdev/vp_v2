/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : TaskBar.js
 *    Author          : Black Logic
 *    Note            : Render and load task bar
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 09. 13
 *    Change Date     :
 */

//============================================================================
// [CLASS] TaskBar
//============================================================================
define([
    '../com/com_String',
    '../com/component/Component',
    './TaskItem'
], function(com_String, Component, TaskItem) {
    'use strict';
    //========================================================================
    // Declare class
    //========================================================================
    /**
     * TaskBar
     */
    class TaskBar extends Component{

        _bindEvent() {
            let that = this;


        }

        template() {
            return '<div class="vp-menu-task-bar vp-scrollbar-horizontal"></div>';
        }

        render() {
            super.render(true);

            let taskList = this.state.taskList;
            taskList && taskList.forEach(task => {
                let taskItem = new TaskItem($(this.wrapSelector()), { task: task });
            });
        }
    }

    return TaskBar;

});

/* End of file */