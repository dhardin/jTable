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


var jTable = (function ($) {
    'use strict'
    //----------------- BEGIN MODULE SCOPE VARIABLES ---------------
    var configMap = {
        row_highlight_class: 'jTable-Row',
        cell_edit_class: 'jTable-Edit-Cell',
        cell_edited_class: 'jTable-edited',
        main_HTML: String()
                + '<div class="jTable-main">'
                    + '<div class="jTable-options">'
                        + '<a class="jTable-edit">'
                            + 'Edit'
                        + '</a>'
                        + '<a class="jTable-save">'
                            + 'Save'
                        + '</a>'
                        + '<a class="jTable-cancel">'
                            + 'Cancel'
                        + '</a>'
                    + '</div>'
                    + '<div class="jTable-content"></div>'
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
        cells_edited   : []
    },
    jqueryMap = {},
    setJqueryMap, onClick, onDoubleClick, onBlur,
    onChange, onClickEdit, onClickSave, onClickCancel,
    objectCreate, extendObject, addSelectEdit,
    addDropDown, addDropDownValues, addEditiableDiv,
    getEditValue, toggleEdit, makeEditTable,
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

    // Begin dom method /setEditMode/
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
    // End dom method /setEditMode/

    // Begin dom method /makeEditTable/
    makeEditTable = function ($table) {
        var 
            cell_edit_class = configMap.cell_edit_class,
            columns = settingsMap.dropDownCol
         ;

        $table.find('td').each(function () {
            var 
                $this = $(this),
                $text = $this.text()
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
        $('.' + configMap.cell_edited_class).removeClass('.' + configMap.cell_edited_class);

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

    // Begin Event handler /onDoubleClick/
    onDoubleClick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        var 
            $this = $(this),
            cell_edit_class = configMap.cell_edit_class,
            $prevEditDiv = jqueryMap.$contents.find('.' + cell_edit_class),
            columns = settingsMap.dropDownCol
        ;


        if ($prevEditDiv.length > 0) {
            $prevEditDiv.parent().html(getEditValue($prevEditDiv));
        }

        $this.html(jQuery.inArray($this[0].cellIndex, columns) > -1 ? addDropDown($this[0].cellIndex, $this.text()) : addEditiableDiv($this.html()));
        $this.find('.' + cell_edit_class).focus();


    };
    // End Event handler /onDoubleClick/

    // Begin Event handler /onBlur/
    onBlur = function (e) {

        var
            cell_edit_class = configMap.cell_edit_class,
            $this           = $(this),
            $prevEditDiv    = $this.find('.' + cell_edit_class)
        ;

        if ($prevEditDiv.length > 0) {
            $this.html(getEditValue($prevEditDiv));
        }

    };
    // End Event handler /onBlur/

    // Begin Event handler /onChange/
    onChange = function () {
        var $this = $(this);
        $this.addClass(configMap.cell_edited_class);
        stateMap.cells_edited.push($this)
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
        if ($table[0].nodeName == "TABLE") {
            var 
                $parent  = $table.parent(),
                $element = $(configMap.main_HTML).prependTo($parent)
            ;

            //insert the element into the parent of the table
            $table.appendTo(
                $element.find('.jTable-content')
            );

            stateMap.$container = $element;
            stateMap.$table = $table;
            setJqueryMap();

            jqueryMap.$table.find("td")
            .on('click', onClick)


            jqueryMap.$table.find("td:not(." + configMap.cell_edited_class + ")")
            .on('change', onChange);

            //            jqueryMap.$contents.find("td")
            //            .on('dblclick', onDoubleClick);

            //            jqueryMap.$contents.find("td")
            //            .on('focusout', onBlur);

            jqueryMap.$edit
            .on('click', onClickEdit);

            jqueryMap.$save
            .on('click', onClickSave);

            jqueryMap.$cancel
            .on('click', onClickCancel);

            return true;
        }
        else {
            return false;
        }
    };
    // End public method /initModule/
    // return public methods
    return {
        configModule: configModule,
        initModule: initModule
    };
    //------------------- END PUBLIC METHODS ---------------------

})(jQuery);