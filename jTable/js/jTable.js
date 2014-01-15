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
        cell_edit_class: 'jTable-Edit'
    },
    stateMap = { $container: null },
    jqueryMap = {},
    setJqueryMap, onClick, onDoubleClick,
    objectCreate, extendObject,
    publicMethod, initModule;
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
    // end dom method /setJqueryMap/
    //---------------------- END DOM METHODS ---------------------
    //------------------- BEGIN EVENT HANDLERS -------------------
    // Begin Event handler /onClick/
    onClick = function (e) {
        e.preventDefault();
        var row_highlight_class = configMap.row_highlight_class;
        jqueryMap.$container.find('.' + row_highlight_class).removeClass(row_highlight_class);
        $(this).siblings().andSelf().addClass(row_highlight_class);
    };
    // End Event handler /onClick/

    // Begin Event handler /onDoubleClick/
    onDoubleClick = function (e) {
        e.preventDefault();
        var $td = $(this),
        cell_edit_class = configMap.cell_edit_class,
        $prevEditDiv = jqueryMap.$container.find('.' + cell_edit_class);


        $prevEditDiv.parent().html($prevEditDiv.html());

        $td.html('<div contenteditable class="' + cell_edit_class + '">' + $td.html() + '</div>');
        $td.focus();
    };
    // End Event handler /onDoubleClick/
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
    configModule = function (input_map) {
        jTable.butil.setConfigMap({
            input_map: input_map,
            settable_map: configMap.settable_map,
            config_map: configMap
        });
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

            jqueryMap.$container.find("td")
            .on('click', onClick);

            jqueryMap.$container.find("td")
            .on('dblclick', onDoubleClick);

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