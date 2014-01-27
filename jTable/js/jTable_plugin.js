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
                     + '<div class="jTable-options">'
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
    },
    settingsMap = {
        dropDownCol: [],
        dropDownVal: []
    },
    stateMap = {
        $table         : null,
        $container     : null,
        is_edit_enabled: false,
        cells_edited: [],
        has_focus : false
    },
    jqueryMap = {},
    setJqueryMap, onClick, onDoubleClick, onBlur,
    onChange, onClickEdit, onClickSave, onClickCancel,
    onKeydown, onKeyCtrlE, onKeyCtrlS, onKeyEsc, onFocus,
    objectCreate, extendObject, addSelectEdit,
    addDropDown, addDropDownValues, addEditiableDiv,
    getEditValue, toggleEdit, makeEditTable, toggleFocus,
    removeEditTable, makeCell, configModule, initModule;

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
            $main    : $main,
            $edit    : $main.find('.jTable-edit'),
            $save    : $main.find('.jTable-save'),
            $cancel  : $main.find('.jTable-cancel'),
            $contents: $main.find('.jTable-content'),
            $table   : $table
        };
    };
    // End dom method /setJqueryMap/
    // Begin dom method /addDropDown/
    addDropDown = function (columnNum, selectedValue) {
        var 
            dropDown_HTML = String() + '<select class="' + configMap.cell_edit_class + '">',
            columns       = settingsMap.dropDownCol,
            colIndex      = settingsMap.dropDownCol.indexOf(columnNum),
            values        = settingsMap.dropDownVal[colIndex]
        ;

        if (jQuery.inArray(columnNum, columns) > -1) {
            dropDown_HTML += addDropDownValues(values, selectedValue);
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
    makeEditTable = function ($table) {
        var 
            cell_edit_class = configMap.cell_edit_class,
            columns = settingsMap.dropDownCol
         ;

        $table.find('td').each(function () {
            var 
                $this = $(this),
                $text = $this.html()
            ;
            $this.data("contents", $text);
            $this.html(jQuery.inArray($this[0].cellIndex, columns) > -1 ? addDropDown($this[0].cellIndex, $text) : addEditiableDiv($this.html()));
        });
    };
    // End dom method /makeEditTable/

    // Begin dom method /removeEditTable/
    removeEditTable = function ($table, save) {
        var 
            cell_edit_class = configMap.cell_edit_class,
            $prevEditDiv = jqueryMap.$contents.find('.' + cell_edit_class)
        ;
        
        //remove edit class from all changed cells
        $('.' + configMap.cell_edited_class).removeClass(configMap.cell_edited_class);

        $prevEditDiv.each(function () {
            var $this = $(this);
            if (save) {
                $this.parent().html(getEditValue($this));
            }
            else {
                $this.parent().html($this.parent().data("contents"));
            }
        });
    };
    // End dom method /removeEditTable/
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
            stateMap.cells_edited.push($this)
        }
    }
    // End Event handler /onChange/

    // Begin Event handler /onClickEdit/
    onClickEdit = function (e) {
        stateMap.cells_edited = [];
        toggleEdit();
        makeEditTable(jqueryMap.$table);
    };
    // End Event handler /onClickEdit/

    // Begin Event handler /onClickSave/
    onClickSave = function (e) {
        toggleEdit();
        removeEditTable(jqueryMap.$table, true);
        $.gevent.publish('jTable-saved', [stateMap.cells_edited])
    };
    // End Event handler /onClickSave/

    // Begin Event handler /onClickCancel/
    onClickCancel = function (e) {
        toggleEdit();
        removeEditTable(jqueryMap.$table, false);
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
                       
                        }
                    case (keyCodeEnum.S.value):
                        {
                            if (stateMap.is_edit_enabled) {
                                e.preventDefault();
                                onKeyCtrlS(e);
                                return false;
                            }
                        }
                    default: { break; }
                }
            }
            else if (e.which == keyCodeEnum.ESC.value) {
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
    // Begin public method /configModule/
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
    // End public method /configModule/
    // Begin public method /initModule/
    // Purpose : Initializes module
    // Arguments :
    // * $container the jquery element used by this feature
    // Returns : true
    // Throws : nonaccidental
    //
    initModule = function ($table) {
            var 
                $parent  = $table.parent(),
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
    // End public method /initModule/

    jQuery.fn.jTable = function (settings_map) {
        var $table = $(this);
        if ($table[0].nodeName == "TABLE") {
            configModule(settings_map);
            initModule($table);
        }
        return this;
    };
    // return public methods
    //return {
    //    configModule: configModule,
    //    jTable: jTable
    //};
    //------------------- END PUBLIC METHODS ---------------------

})(jQuery, document, window);