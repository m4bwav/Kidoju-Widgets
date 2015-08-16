/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define){
    'use strict';
    define([
        './vendor/kendo/kendo.binder',
        './vendor/kendo/kendo.dropdownlist',
        './vendor/kendo/kendo.multiselect', // required becasue of test in kendo.binder.js
        './vendor/codemirror/lib/codemirror.js',
        './vendor/codemirror/mode/javascript/javascript.js',
        './vendor/codemirror/addon/lint/lint.js',
        './vendor/codemirror/addon/lint/jshint.js',
        './vendor/codemirror/addon/lint/javascript-lint.js'
    ], f);
})(function () {

    'use strict';

    (function ($, undefined) {

        var kendo = window.kendo,
            Widget = kendo.ui.Widget,
            STRING = 'string',
            BEFORECHANGE = 'beforeChange',
            CHANGE = 'change',
            NS = '.kendoCodeEditor',
            WIDGET_CLASS = 'k-widget kj-codeeditor';

        /*********************************************************************************
         * Helpers
         *********************************************************************************/

        function log(message) {
            if (window.app && window.app.DEBUG && window.console && $.isFunction(window.console.log)) {
                window.console.log('kidoju.widgets.codeeditor: ' + message);
            }
        }

        /*********************************************************************************
         * Widget
         *********************************************************************************/

        /**
         * @class CodeEditor Widget (kendoCodeEditor)
         */
        var CodeEditor = Widget.extend({

            /**
             * Initializes the widget
             * @param element
             * @param options
             */
            init: function (element, options) {
                var that = this;
                options = options || {};
                Widget.fn.init.call(that, element, options);
                log('widget initialized');
                that._layout();
                that._dataSource();
            },

            /**
             * Widget options
             * @property options
             */
            options: {
                name: 'CodeEditor',
                autoBind: true,
                //dataSource
                custom: 'custom',
                default: 'Equal',
                solution: ''
            },

            /**
             * Widget events
             * @property events
             */
            events: [
                CHANGE
            ],

            /**
             * Value for MVVM binding
             * Returns either a JS function as a string or a library formula name
             * @param value
             */
            value: function(value) {
                var that = this;
                if ($.type(value) === STRING) {
                    that._toggle(value);
                } else if ($.type(value) === 'undefined') {
                    var formula = that.dropDownList.text();
                    if (formula === that.options.custom) {
                        return that.codeMirror.getDoc().getValue();
                    } else {
                        return '// ' + that.dropDownList.text();
                    }
                } else {
                    throw new TypeError('`value` is expected to be a string if not undefined');
                }
            },

            /**
             * toggle UI for custom vs library code
             * @param value
             * @private
             */
            _toggle: function(value) {
                var that = this;
                if ($.type(value) === STRING && that.dropDownList instanceof kendo.ui.DropDownList && that.input instanceof $ && that.codeMirror instanceof window.CodeMirror) {
                    var libraryMatches = value.match(/^\/\/ ([^\n]+)$/),
                        customMatches = value.match(/^function validate\(value, solution\) {[\s\S]+}$/);
                    if ($.isArray(libraryMatches) && libraryMatches.length === 2) {
                        // Find in the code library
                        var found = that.dropDownList.dataSource.data().filter(function(item) {
                            return item.name === libraryMatches[1];
                        });
                        found = $.isArray(found) && found.length ? libraryMatches[1] : that.options.default;
                        that.dropDownList.text(found);
                        that._onDropDownListChange();
                    } else if ($.isArray(customMatches) && customMatches.length === 1) {
                        that.codeMirror.getDoc().setValue(value);
                    } else {
                        that.dropDownList.text(that.options.default);
                        that._onDropDownListChange();
                    }
                }
            },

            /**
             * Builds the widget layout
             * @private
             */
            _layout: function () {
                var that = this;
                that.wrapper = that.element;
                that.element.addClass(WIDGET_CLASS);
                that._setHeader();
                that._setCodeMirror();
            },

            /**
             * Set drop down list with code library and value input
             * @private
             */
            _setHeader: function() {
                var that = this,
                    header = $('<div class="k-header"><div></div><div></div></div>').appendTo(that.element),
                    left = header.find('div').first(),
                    right = header.find('div').last();
                // Create the dropDownList
                that.dropDownList = $('<select/>')
                    .appendTo(left)
                    .kendoDropDownList({
                        autoBind: that.options.autoBind,
                        change: $.proxy(that._onDropDownListChange, that), // change is not triggered by dropDownList api calls incl. value(), text(), ...
                        dataTextField: "name",
                        dataValueField: "formula",
                        dataSource: that.options.dataSource
                    })
                    .data('kendoDropDownList');
                // create the input field to display solution
                that.input = $('<input class="k-textbox k-state-disabled" disabled>')
                    .appendTo(right)
                    .val(that.options.solution);
            },

            /**
             * Event handler triggered when changing the value of the drop down list in the header
             * @private
             */
            _onDropDownListChange: function() {
                if (this.dropDownList instanceof kendo.ui.DropDownList && this.input instanceof $ && this.codeMirror instanceof window.CodeMirror) {
                    this.codeMirror.getDoc().setValue(this.dropDownList.value());
                }
            },

            /**
             * Set CodeMirror editor
             * @private
             */
            _setCodeMirror: function() {
                var that = this,
                    div = $('<div class="kj-codemirror"></div>')
                        .appendTo(that.element)
                        .get(0);
                if (div instanceof window.HTMLElement) {
                    that.codeMirror = window.CodeMirror(div, {
                        gutters: ['CodeMirror-lint-markers'],
                        lineNumbers: true,
                        lint: true,
                        mode: 'javascript',
                        value: ''
                    });
                    // Prevent from modifying first lines and last line
                    that.codeMirror.on(BEFORECHANGE, function (cm, change) {
                        if (change.origin === 'setValue') {
                            return; //updated using this.value(value)
                        }
                        // if updated by typing into the code editor
                        if ((change.from.line === 0) || // prevent changing the first line
                            (change.from.line === cm.display.renderedView.length - 1) || // prevent changing the last line
                            (change.origin === '+delete' && change.to.line === cm.display.renderedView.length - 1)) { // prevent backspace on the last line or suppr on the previous line
                            // cancel change
                            change.cancel();
                        }
                    });
                    that.codeMirror.on(CHANGE, function(cm, change) {
                        if (that.dropDownList.text() !== that.options.custom) {
                            if (that.codeMirror.getDoc().getValue() !== that.dropDownList.value()) {
                                that.dropDownList.text(that.options.custom);
                            }
                        }
                        // trigger a change event for MVVM value binding
                        that.trigger(CHANGE);
                    });
                }
            },

            /**
             * _dataSource function to bind refresh to the change event
             * @private
             */
            _dataSource: function() {
                var that = this,
                    dropDownList = that.dropDownList;
                if (dropDownList instanceof kendo.ui.DropDownList && dropDownList.dataSource instanceof kendo.data.DataSource) {
                    // MVVM bindings require that.dataSource
                    that.dataSource = that.dropDownList.dataSource;
                    if (that._refreshHandler) {
                        that.dataSource.unbind(CHANGE, that._refreshHandler);
                    }
                    that._refreshHandler = $.proxy(that.refresh, that);
                    that.dataSource.bind(CHANGE, that._refreshHandler);
                }
            },

            /**
             * sets the dataSource for source binding
             * @param dataSource
             */
            setDataSource: function(dataSource) {
                var that = this,
                    dropDownList = that.dropDownList;
                if (dropDownList instanceof kendo.ui.DropDownList && dropDownList.dataSource !== dataSource ) {
                    dropDownList.setDataSource(dataSource);
                    that._dataSource();
                }
            },

            /**
             * Refresh
             * @param e
             */
            refresh: function(e) {
                this.dropDownList.refresh(e);
            },

            /**
             * Clears the widget
             * @method _clear
             * @private
             */
            _clear: function () {
                var that = this;
                // unbind kendo
                // kendo.unbind($(that.element));
                // unbind all other events
                $(that.element).find('*').off();
                $(that.element).off();
                // remove descendants
                $(that.element).empty();
                // remove element classes
                $(that.element).removeClass(WIDGET_CLASS);
            },

            /**
             * Destroys the widget including all DOM modifications
             * @method destroy
             */
            destroy: function () {
                var that = this;
                Widget.fn.destroy.call(that);
                that._clear();
                kendo.destroy(that.element);
            }

        });

        kendo.ui.plugin(CodeEditor);

    }(window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f){ 'use strict'; f(); });