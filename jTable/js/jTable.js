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


(function ($) {
    //----------------- END MODULE SCOPE VARIABLES ---------------
    var configMap = {
        color_table: 'blue',
        color_text_active: '#000',
        color_text_inactive: '#aaa'
    },
    jqueryMap = {},
    setJqueryMap, onClickCell, onDoubleClickCell,
    objectCreate, extendObject,
    $.fn.jTable, initModule;
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

    //---------------------- END DOM METHODS ---------------------
    //------------------- BEGIN EVENT HANDLERS -------------------
    // example: onClickButton = ...
    //-------------------- END EVENT HANDLERS --------------------
    //------------------- BEGIN PUBLIC METHODS -------------------
    // Begin public method /jTable/
    // Purpose : Adjust configuration of allowed keys
    // Arguments : A map of settable keys and values
    // * color_name - color to use
    // Settings :
    // * configMap.settable_map declares allowed keys
    // Returns : true
    // Throws : none
    //
    	publicMethod = $.fn[jTable] = $[jTable] = function (options, callback) {
		var $this = this;
		
		options = options || {};
    };
    //------------------- END PUBLIC METHODS ---------------------

})(jQuery);