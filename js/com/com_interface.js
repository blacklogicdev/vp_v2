/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : com_interface.js
 *    Author          : Black Logic
 *    Note            : Interface for jupyter
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 09. 16
 *    Change Date     :
 */
define([
    './com_util',
    './com_String'
], function(com_util, com_String) {

    var getSelectedCell = function() {
        return Jupyter.notebook.get_selected_index();
    }

    var insertCell = function(type, command, exec=true) {
        var selectedIndex = getSelectedCell();
        var targetCell = Jupyter.notebook.insert_cell_below(type, selectedIndex);

        // TODO: apply to board (use com_Event)
        var appliedBlock = null;
        var appliedBlockIndex = 0;

        // TODO: render success message ref: renderSuccessMessage();

        // Add signature
        if (type == 'code') {
            // TODO:
            command = com_util.formatString('# VisualPython [{0}]\n', appliedBlockIndex) + command
        }
        targetCell.set_text(command);
        Jupyter.notebook.select_next();
        if (exec) {
            switch (type) {
                case "markdown":
                    targetCell.render();
                    break;
                case "code":
                default:
                    targetCell.execute();
            }
            executed = true;
        }
        // move to executed cell
        Jupyter.notebook.scroll_to_cell(Jupyter.notebook.get_selected_index());
        
    }

    return {
        insertCell: insertCell
    };
});