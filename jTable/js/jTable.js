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
    //----------------- END MODULE SCOPE VARIABLES ---------------
    var configMap = {
        row_highlight_class: 'jTable-Row',
        cell_edit_class: 'jTable-Edit',
    },
    settingsMap = {
        dropDownCol: [],
        dropDownVal: []
    },
    main_HTML = String(),
    stateMap = { $container: null },
    jqueryMap = {},
    setJqueryMap, onClick, onDoubleClick, onBlur,
    objectCreate, extendObject, addSelectEdit,
    addDropDown, addDropDownValues,addEditiableDiv,
    getEditValue, initModule;
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
        var $container = stateMap.$container;
        jqueryMap.$container = $container;
    };
    // End dom method /setJqueryMap/
    // Begin dom method /addDropDown/
    addDropDown = function (columnNum, selectedValue){
        var 
            dropDown_HTML = String()
                            + '<select class="'+ configMap.cell_edit_class +'">',
            columns = settingsMap.dropDownCol,
            colIndex = settingsMap.dropDownCol.indexOf(columnNum),
            values = settingsMap.dropDownVal[colIndex]
        ;
        
        if (jQuery.inArray(columnNum, columns) > -1)
        {
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
        for (value in values){
            values_HTML += '<option value"' + values[value] + '" ' + (selectedValue == values[value] ? 'selected="true"' : '') + '>' + values[value] + '</option>';
        }
        return values_HTML;
    };
    // End dom method /addDropDownValues/

    // Begin dom method /addDropDownValues/
    addEditiableDiv = function (content) {
        return ('<div contenteditable class="' + configMap.cell_edit_class + '">' +  content + '</div>');
    };
    // End dom method /addDropDownValues/

    // Begin dom method /getEditHTML/
    getEditValue = function($container) {
        var
            nodeName = $container[0].nodeName,
            cell_edit_class = configMap.cell_edit_class
        ;
        if ($container.hasClass(cell_edit_class))
        {
            switch (nodeName)
            {
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
    //---------------------- END DOM METHODS ---------------------
    //------------------- BEGIN EVENT HANDLERS -------------------
    // Begin Event handler /onClick/
    onClick = function (e) {

        var row_highlight_class = configMap.row_highlight_class;
        jqueryMap.$container.find('.' + row_highlight_class).removeClass(row_highlight_class);
        $(this).siblings().andSelf().addClass(row_highlight_class);
    };
    // End Event handler /onClick/

    // Begin Event handler /onDoubleClick/
    onDoubleClick = function (e) {
        e.preventDefault();
        var 
            $this = $(this),
            cell_edit_class = configMap.cell_edit_class,
            $prevEditDiv = jqueryMap.$container.find('.' + cell_edit_class),
            columns = settingsMap.dropDownCol
        ;

        if ($prevEditDiv.length > 0) {
            $prevEditDiv.parent().html(getEditValue($prevEditDiv));
        }
        $this.html(jQuery.inArray($this[0].cellIndex, columns) > -1 ? addDropDown($this[0].cellIndex, $this.text()) : addEditiableDiv($this.html())) ;
        $this.find('.' + cell_edit_class).focus();
       
    };
    // End Event handler /onDoubleClick/

    // Begin Event handler /onBlur/
    onBlur = function (e) {

        var cell_edit_class = configMap.cell_edit_class,
        $this = $(this),
        $prevEditDiv = $this.find('.' + cell_edit_class);

        if ($prevEditDiv.length > 0) {
            $this.html(getEditValue($prevEditDiv));
        }

    };
    // End Event handler /onBlur/

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
    initModule = function ($container) {
        if ($container[0].nodeName == "TABLE") {
            stateMap.$container = $container;
            setJqueryMap();

            configMap.main_HTML = $container.html();

            console.log(configMap.main_HTML);

            console.log(settingsMap);

            jqueryMap.$container.find("td")
            .on('click', onClick);

            jqueryMap.$container.find("td")
            .on('dblclick', onDoubleClick);

            jqueryMap.$container.find('.' + configMap.cell_edit_class)
            .on('focusout', onBlur);

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