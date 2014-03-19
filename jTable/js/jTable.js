//  Author: Dustin Hardin
//
//  Description:
//  Used to display a 5 day forecast for weather by City,Location where location can be a state, province, etc.
//  Utilizes the Yahoo Query Language (yql) webservice to query for the city,location woeid and then query 
//  for the weather for the returend woied.
//  
//  References:
//  jQuery: https://jquery.com/
//  jQuery UI: https://jqueryui.com/
//  GitHub: https://github.com/dhardin/jTable


(function ($, document, window) {
    'use strict'
    //----------------- BEGIN MODULE SCOPE VARIABLES ---------------
    var configMap = {
        row_highlight_class: 'jTable-Row',
        cell_edit_class: 'jTable-Edit-Cell',
        cell_edited_class: 'jTable-edited',
        table_focus_class: 'jTable-focus',
        main_HTML: String()
                + '<div class="jTable-main">'
                    + '<div class="jTable-content"></div>'
                + '</div>',
        options_HTML: String()
                     + '<div class="jTable-options" unselectable="on">'
                        + '<div class="jTable-notify">'
                            + '<span class="jTable-notify-edit">Editing...</span>'
                            + '<span class="jTable-notify-save">Saving...</span>'
                            + '<span class="jTable-notify-cancel">Cancelling...</span>'
                        + '</div>'
                        + '<div class="jTable-menu">'
                            + '<a class="jTable-edit" title="Click to edit">'
                                + 'Edit'
                            + '</a>'
                            + '<a class="jTable-save" title="Click to save changes">'
                                + 'Save'
                            + '</a>'
                            + '<a class="jTable-cancel" title="Click to cancel changes">'
                                + 'Cancel'
                            + '</a>'
                        + '</div>'
                        + '<div style="clear: both"></div>'
                    + '</div>'
    },
    settingsMap = {
        columns: [],
        rowUniqueID: false,
        rowIDColumnIndex: -1
    },
    stateMap = {
        $table         : null,
        $container     : null,
        is_edit_enabled: false,
        cells_edited: [],
        has_focus: false,
        isEventHandlerActive : true
    },
    jqueryMap = {},
    setJqueryMap, onClick, onDoubleClick, onBlur,
    onChange, onClickEdit, onClickSave, onClickCancel,
    onKeydown, onKeyCtrlE, onKeyCtrlS, onKeyEsc, onFocus,
    objectCreate, extendObject, addSelectEdit,
    addDropDown, addDropDownValues, addEditiableDiv,
    getEditValue, toggleEdit, makeEditTable, toggleFocus,
    removeEditTable, makeCell, saveTd, cancelTd, editTd,
    configModule, initModule;

    //----------------- END MODULE SCOPE VARIABLES ---------------
    //------------------- BEGIN UTILITY METHODS ------------------
    // ** Utility function to set inheritance
    // Cross-browser method to inherit Object.create()
    // Newer js engines (v1.8.5+) support it natively
    objectCreate = function (arg) {
        if (!arg) { return {}; }
        function obj() { };
        obj.prototype = arg;
        return new obj;
    };

    Object.create = Object.create || objectCreate;

    // ** Utility function to extend an object
    extendObject = function (orig_obj, ext_obj) {
        var key_name;
        for (key_name in ext_obj) {
            if (ext_obj.hasOwnProperty(key_name)) {
                orig_obj[key_name] = ext_obj[key_name];
            }
        }
    };
    //-------------------- END UTILITY METHODS -------------------
    //--------------------- BEGIN DOM METHODS --------------------
    // Begin dom method /setJqueryMap/
    setJqueryMap = function () {
        var 
            $table = stateMap.$table,
            $main  = stateMap.$container
        ;

        jqueryMap = {
            $main: $main,
            $table: $table,
            $options: $main.find('.jTable-options'),
            $menu: $main.find('.jTable-menu'),
            $notify  : $main.find('.jTable-notify'),
            $edit    : $main.find('.jTable-edit'),
            $save    : $main.find('.jTable-save'),
            $cancel  : $main.find('.jTable-cancel'),
            $contents: $main.find('.jTable-content'),
            $editNotify: $main.find('.jTable-notify-edit'),
            $saveNotify: $main.find('.jTable-notify-save'),
            $cancelNotify: $main.find('.jTable-notify-cancel')
        };
    };
    // End dom method /setJqueryMap/
    // Begin dom method /addDropDown/
    addDropDown = function (colIndex, selectedValue) {
        var 
            dropDown_HTML = String() + '<select class="' + configMap.cell_edit_class + '">',
            columns       = settingsMap.columns
        ;

            if (columns[colIndex].inputType === $.Utils.inputType.DROPDOWN) {
                dropDown_HTML += addDropDownValues(columns[colIndex].dropDownValues, selectedValue);
        }
        dropDown_HTML += '</select>';

        return dropDown_HTML;
    };
    // Begin dom method /addDropDownValues/
    addDropDownValues = function (values, selectedValue) {
        var 
            value,
            values_HTML = String()
        ;

        if (!$.isArray(values)) {
            return false;
        }

        for (value in values) {
            values_HTML += '<option value"' + values[value] + '" ' + (selectedValue === values[value] ? 'selected="true"' : '') + '>' + values[value] + '</option>';
        }
        return values_HTML;
    };
    // End dom method /addDropDownValues/

    // Begin dom method /addDropDownValues/
    addEditiableDiv = function (content) {
        return ('<div contenteditable class="' + configMap.cell_edit_class + '">' + content + '</div>');
    };
    // End dom method /addDropDownValues/

    // Begin dom method /getEditHTML/
    getEditValue = function ($container) {
        var 
            nodeName = $container[0].nodeName,
            cell_edit_class = configMap.cell_edit_class
        ;
        if ($container.hasClass(cell_edit_class)) {
            switch (nodeName) {
                case 'DIV':
                    return $container.html();
                case 'SELECT':
                    return $container.val();
                default:
                    return false;
            }
        }
        return false;
    };
    // End dom method /getEditHTML/

    // Begin dom method /toggleEdit/
    toggleEdit = function () {
        if (!stateMap.is_edit_enabled) {
            jqueryMap.$edit.hide();
            jqueryMap.$cancel.show();
            jqueryMap.$save.show();
        }
        else {
            jqueryMap.$edit.show();
            jqueryMap.$cancel.hide();
            jqueryMap.$save.hide();
        }
        stateMap.is_edit_enabled = stateMap.is_edit_enabled ? false : true;
    };
    // End dom method /toggleEdit/

    // Begin dom method /toggleFocus/
    toggleFocus = function () {
        stateMap.has_focus = stateMap.has_focus ? false : true;
    }
    // End dom method /toggleFocus/

    // Begin dom method /makeEditTable/
    makeEditTable = function ($table, callback) {
        var 
            innerHTML,
            cell_edit_class = configMap.cell_edit_class,
            columns = settingsMap.columns            
         ;

        editTd($table.find('td'), 0, callback);
          
    };
    // End dom method /makeEditTable/
   
    // Begin dom method /removeEditTable/
    removeEditTable = function ($table, save, callback) {
        var 
            cell_edit_class = configMap.cell_edit_class,
            $prevEditDiv = jqueryMap.$contents.find('.' + cell_edit_class)
        ;
        
        //remove edit class from all changed cells
        $('.' + configMap.cell_edited_class).removeClass(configMap.cell_edited_class);

        if (save) {
            saveTd($prevEditDiv, 0, callback);
        }
        else {
            cancelTd($prevEditDiv, 0, callback);
        }
    };
    // End dom method /removeEditTable/
    saveTd = function ($tdElements, index, callback) {
        if (index < $tdElements.length) {
            var $td = $tdElements.eq(index);

            $td.parent().html(getEditValue($td));
       
                saveTd($tdElements, ++index, callback)
        }
        else if (callback){
            callback();
        }
    };

    cancelTd = function ($tdElements, index, callback) {
        if (index < $tdElements.length) {
            var $td = $tdElements.eq(index);

            $td.parent().html($td.parent().data("contents"));
           
                cancelTd($tdElements, ++index, callback);
        }
        else if (callback){
            callback();
        }
    };
   
    editTd = function ($tdElements, index, callback) {
        if (index < $tdElements.length) {
            var
               $td = $tdElements.eq(index),
               $text = $td.html(),
               inputType = settingsMap.columns[$td.index()].inputType
            ;

            $td.data("contents", $text);

            switch (inputType) {
                case $.Utils.inputType.DROPDOWN:
                    $td.html(addDropDown($td.index(), $text));
                    break;
                case $.Utils.inputType.TEXT:
                    $td.html(addEditiableDiv($td.html()));
                    break;
                default:
                    break;
            }
        
                editTd($tdElements, ++index, callback);
        }
        else if (callback) {
            callback();
        }
    };
    //---------------------- END DOM METHODS ---------------------
    //------------------- BEGIN EVENT HANDLERS -------------------
    // Begin Event handler /onFocus/
    onFocus = function (e) {
        e.stopPropagation();
        stateMap.has_focus = true;
        jqueryMap.$table.addClass(configMap.table_focus_class);
    };
    // End Event handler /onFocus/

    // Begin Event handler /onBlur/
    onBlur = function (e) {
        e.stopPropagation();
        stateMap.has_focus = false;
        jqueryMap.$table.removeClass(configMap.table_focus_class);
    };
    // End Event handler /onBlur/

    // Begin Event handler /onClick/
    onClick = function (e) {
        var 
            $this = $(this),
            row_highlight_class = configMap.row_highlight_class
        ;
        jqueryMap.$contents.find('.' + row_highlight_class).removeClass(row_highlight_class);
        $this.siblings().andSelf().addClass(row_highlight_class);
    };
    // End Event handler /onClick/

    // Begin Event handler /onChange/
    onChange = function () {
        
        var $this = $(this);
        if (!$this.hasClass(configMap.cell_edited_class)) {
            $this.addClass(configMap.cell_edited_class);
            if (stateMap.cells_edited) {
                stateMap.cells_edited.push(
                    {
                        rowID: $this.data("rowID"),
                        columnName: settingsMap.columns[$this[0].cellIndex].name,
                        value: getEditValue($this.find("." + configMap.cell_edit_class))
                    }
                );
            }
        }
    }
    // End Event handler /onChange/

    // Begin Event handler /onClickEdit/
    onClickEdit = function (e) {
        if (!stateMap.isEventHandlerActive) {
            return;
        }
        jqueryMap.$menu.children().andSelf().css("cursor", "progress");
        stateMap.isEventHandlerActive = false;
        stateMap.cells_edited = [];
        jqueryMap.$editNotify.show();

        setTimeout(function () {
            makeEditTable(jqueryMap.$table, function () {
                toggleEdit();
                jqueryMap.$editNotify.hide();
                stateMap.isEventHandlerActive = true;
                jqueryMap.$menu.children().andSelf().css("cursor", "pointer");
            });
        }, 10);
    };
    // End Event handler /onClickEdit/

    // Begin Event handler /onClickSave/
    onClickSave = function (e) {
        if (!stateMap.isEventHandlerActive) {
            return;
        }
        jqueryMap.$menu.children().andSelf().css("cursor", "progress");
        stateMap.isEventHandlerActive = false;
        jqueryMap.$saveNotify.show();
        
        setTimeout(function () {
            removeEditTable(jqueryMap.$table, true, function () {
                toggleEdit();
                jqueryMap.$saveNotify.hide();
                stateMap.isEventHandlerActive = true;
                jqueryMap.$menu.children().andSelf().css("cursor", "pointer");
            });
        }, 10);
        $.gevent.publish('jTable-saved', [stateMap.cells_edited])
    };
    // End Event handler /onClickSave/

    // Begin Event handler /onClickCancel/
    onClickCancel = function (e) {
        if (!stateMap.isEventHandlerActive) {
            return;
        }
        jqueryMap.$menu.children().andSelf().css("cursor", "progress");
        stateMap.isEventHandlerActive = false;
        jqueryMap.$cancelNotify.show();

        setTimeout(function () {
            removeEditTable(jqueryMap.$table, false, function () {
                toggleEdit();
                jqueryMap.$cancelNotify.hide();
                stateMap.isEventHandlerActive = true;
                jqueryMap.$menu.children().andSelf().css("cursor", "pointer");
            });
        }, 10);
    };
    // End Event handler /onClickCancel/

    // Begin Event handler /onKeydown/
    onKeydown = function (e) {
        if (stateMap.has_focus){
            var keyCodeEnum = {
                E: {value: 69, code: "E"},
                S: {value: 83, code: "S"},
                ESC: { value: 27, code: "ESC"}
            };
            if(e.ctrlKey) {
                switch (e.which) {
                    case (keyCodeEnum.E.value):
                        {
                            if (!stateMap.is_edit_enabled) {
                                e.preventDefault();
                                onKeyCtrlE(e);
                                return false;
                            }
                            break;
                        }
                    case (keyCodeEnum.S.value):
                        {
                            if (stateMap.is_edit_enabled) {
                                e.preventDefault();
                                onKeyCtrlS(e);
                                return false;
                            }
                            break;
                        }
                    default: { break; }
                }
            }
            else if (e.which == keyCodeEnum.ESC.value && stateMap.is_edit_enabled) {
                e.preventDefault();
                onKeyEsc(e);
                return false;
            }
        }
    }
    // End Event handler /onKeydown/

    // Begin Event handler /onKeyCtrlE/
    onKeyCtrlE = function (e) {
        onClickEdit(e);
        return false;
    }
    // End Event handler /onKeyCtrlE/
    // Begin Event handler /onKeyCtrlS/
    onKeyCtrlS = function (e) {
        onClickSave(e);
        return false;
    }
    // End Event handler /onKeyCtrlS/
    // Begin Event handler /onKeyEsc/
    onKeyEsc = function (e) {
        onClickCancel(e);
        return false;
    }
    // End Event handler /onKeyEsc/

    //-------------------- END EVENT HANDLERS --------------------
    //-------------------- BEGIN PRIVATE METHODS------------------
    // Begin private method /configModule/
    // Purpose : Adjust configuration of allowed keys
    // Arguments : A map of settable keys and values
    // * color_name - color to use
    // Settings :
    // * configMap.settable_map declares allowed keys
    // Returns : true
    // Throws : none
    //
    configModule = function (settings_map) {
        var setting;
        for (setting in settings_map) {
            if (settingsMap.hasOwnProperty(setting)) {
                settingsMap[setting] = settings_map[setting];
            }
        }
        return true;
    };
    // End private method /configModule/
    // Begin private method /initModule/
    // Purpose : Initializes module
    // Arguments :
    // * $container the jquery element used by this feature
    // Returns : true
    // Throws : nonaccidental
    //
    initModule = function ($table) {
        var
            $parent = $table.parent(),
            $element = $(configMap.main_HTML).prependTo($parent)
        ;

        if ($table.find("caption").length == 0) {
            $table.prepend("<caption></caption>");
        }

        $table.find("caption").append(configMap.options_HTML);

        //insert the element into the parent of the table
        $table.appendTo(
            $element.find('.jTable-content')
        );

        stateMap.$container = $element;
        stateMap.$table = $table;
        setJqueryMap();

        if (settingsMap.rowUniqueID && settingsMap.rowIDColumnIndex > -1) {
            $table.find('td').each(function (index) {
                var
                    $this = $(this),
                    row_index = $this.closest("tr").index(),
                    //col_index = $this.index(),
                    row_id = $this.siblings().eq(settingsMap.rowIDColumnIndex).text();
                ;

                $this.data("rowID", row_id);

            });
        }

        jqueryMap.$table.find("td")
        .on('click', onClick)
        .on('change', onChange)
        .on('input', onChange);

        jqueryMap.$table
        .on('click', onFocus);

        $(document)
        .on('click', onBlur);

        jqueryMap.$edit
        .on('click', onClickEdit);

        jqueryMap.$save
        .on('click', onClickSave);

        jqueryMap.$cancel
        .on('click', onClickCancel);

        $(document)
        .on('keydown', onKeydown);

        return true;
    };
    // End private method /initModule/
    //-------------------- END PRIVATE METHODS--------------------
    //------------------- BEGIN PUBLIC METHODS ---------------------
    $.fn.jTable = function (settings_map) {
        var $table = $(this);
        if ($table[0].nodeName == "TABLE") {
            if (settings_map){
                configModule(settings_map);
            }
            initModule($table);
        }
        return this;
    };

    $.Utils = {
        inputType: { TEXT: 0, DROPDOWN: 1, NAN: 3, LENGTH: 4 },
        makeValuePair: function (columnIndex, value) {
            var valPair = {
                columnIndex: value
            };
            return valPair;
        },
        makeColumn: function (index, name, inputTypeEnum, dropDownValues) {
            if (index < 0 && typeof index !== "Number") {
                return false;
            }
            if ( inputTypeEnum >= $.Utils.inputType.LENGTH) {
                return false;
            }
            if (inputTypeEnum === $.Utils.inputType.DROPDOWN && !$.isArray(dropDownValues)) {
                return false;
            }
            var colObject = {
                index: index,
                name: name,
                inputType: (typeof inputTypeEnum !== 'undefined' ? inputTypeEnum : $.Utils.inputType.NAN),
                dropDownValues: dropDownValues
            };
            return colObject;
        },
        initRow: function (row_id, valuePairsArray) {
            if (row_id < 0 && typeof row_id !== "Number") {
                return false;
            }
            if (!$.isArray(valuePairsArray)) {
                return false;
            }
            var rowObject = {
                row_id: row_id,
                valuePairsArray : valuePairsArray
            };
            return rowObject;
        }
    };
    // return public methods
    //return {
    //    configModule: configModule,
    //    jTable: jTable
    //};
    //------------------- END PUBLIC METHODS ---------------------

})(jQuery, document, window);