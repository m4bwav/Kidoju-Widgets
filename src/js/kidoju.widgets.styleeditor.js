/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define){
    'use strict';
    define(['./vendor/kendo/kendo.binder', './vendor/kendo/kendo.grid', './vendor/kendo/kendo.combobox'], f);
})(function () {

    'use strict';

    (function ($, undefined) {

        var kendo = window.kendo,
            ui = kendo.ui,
            Widget = ui.Widget,
            STRING = 'string',
            CHANGE = 'change',
            KEYPRESS = 'keypress',
            NS = ".kendoStyleEditor",
            WIDGET_CLASS = 'kj-styleeditor'; // k-widget is added when initializing this.element as a grid


        /*********************************************************************************
         * Helpers
         *********************************************************************************/

        function log(message) {
            if (window.app && window.app.DEBUG && window.console && $.isFunction(window.console.log)) {
                window.console.log('kidoju.widgets.styleeditor: ' + message);
            }
        }

        /*********************************************************************************
         * Widget
         *********************************************************************************/

        /**
         * @class StyleEditor Widget (kendoStyleEditor)
         */
        var StyleEditor = Widget.extend({

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
                if ($.isFunction(ui.Grid)) {
                    that._setDataSource();
                    that._layout();
                    that._setDestroyHandler();
                    that._setKeyPressHandler();
                }
                // TODO a simple textarea would do when running kendo-core
            },

            /**
             * StyleEditor options
             * @property options
             */
            options: {
                name: 'StyleEditor',
                height: 400,
                messages: {
                    columns: {
                        name: 'Name',
                        value: 'Value'
                    },
                    toolbar: {
                        create: 'New Style',
                        destroy: 'Delete'
                    },
                    validation: {
                        name: 'Name is required',
                        value: 'Value is required'
                    }
                }
            },

            /**
             * Widget events
             * @property events
             */
            events: [
                CHANGE
            ],

            /**
             * Gets or sets the style value
             * @param value
             * @returns {string}
             */
            value: function (value) {

                /*
                // Sort function on style names
                // Sorting is not user-friendly as positions change unexpectedly in the grid
                function sort(a, b) {
                    if (a.name > b.name) {
                        return 1;
                    }
                    if (a.name < b.name) {
                        return -1;
                    }
                    // a must be equal to b
                    return 0;
                }
                */

                var that = this, i, data;
                if ($.type(value) === STRING) {
                    // Break the various style names/values  and fill the data source
                    var styles = value.split(';'); data = [];
                    for (i = 0; i < styles.length; i++) {
                        var style = styles[i].split(':');
                        if ($.isArray(style) && style.length === 2) {
                            data.push({ name: style[0].trim(), value: style[1].trim() });
                        }
                    }
                    that._dataSource.data(data); // (data.sort(sort));
                } else if ($.type(value) === 'undefined') {
                    // Convert the data source into an HTML style attribute
                    value = '';
                    data = that._dataSource.data(); //.sort(sort);
                    for (i = 0; i < data.length; i++) {
                        var name = data[i].name, val = data[i].value;
                        if ($.type(name) === STRING && $.type(val) === STRING) {
                            name = name.trim(); val = val.trim();
                            if (name.length && val.length) {
                                value += name + ':' + val + ';';
                            }
                        }
                    }
                    return value;
                } else {
                    throw new TypeError('value is expected to be a string if not undefined');
                }
            },

            /**
             * Sets the data source
             * @private
             */
            _setDataSource: function() {
                var that = this;
                // This dataSource is private to the widget
                that._dataSource = new kendo.data.DataSource({
                    autoSync: true,
                    change: function(e) {
                        // triggers the change event for MVVM
                        // that.trigger(CHANGE, { value: that.value() }); // otherwise that.value is executed twice (also by MVVM)
                        that.trigger(CHANGE);
                    },
                    data: [],
                    schema: {
                        model: {
                            id: 'name',
                            fields: {
                                name: {
                                    type: 'string',
                                    validation: {
                                        required: true
                                    }
                                },
                                value: {
                                    type: 'string',
                                    validation: {
                                        required: true
                                    }
                                }
                            }
                        }
                    }
                });
            },

            /**
             * Builds the widget layout
             * @private
             */
            _layout: function () {

                // This function is taken from http://demos.kendoui.com/web/grid/editing-custom.html
                // See also http://www.telerik.com/forums/kendo-ui-grid-s-combobox-editor-template-validation
                function cssDropDownEditor(container, options) {
                    // We cannot set the combobox name for validation before initializing the kendo ui widget
                    // See http://www.telerik.com/forums/comboxbox-in-grid-with-validation
                    //$('<input name="style_name" data-bind="value: ' + options.field + '" required data-required-msg="' + that.options.messages.validation.name + '">')
                    var combobox = $('<input data-bind="value: ' + options.field + '" required data-required-msg="' + that.options.messages.validation.name + '">')
                        .appendTo(container)
                        .kendoComboBox({
                            autoBind: false,
                            change: function(e) {
                                // The change event handler assigns a default value depending on the style name
                                if (e /*instanceof $.Event*/ && e.sender instanceof kendo.ui.ComboBox) {
                                    var dataItem = e.sender.dataItem(),
                                        // grid = container.closest('.k-grid').data('kendoGrid'),
                                        grid = that.element.data('kendoGrid'),
                                        uid = container.parent().attr(kendo.attr('uid'));
                                    if (grid instanceof kendo.ui.Grid && $.type(uid) === 'string' && $.type(dataItem) !== 'undefined') {
                                        var style = grid.dataSource.getByUid(uid);
                                        style.set('value', dataItem.get('value'));
                                    }
                                }
                            },
                            //dataSource: viewModel.css,
                            dataTextField: 'name',
                            dataValueField: 'name'
                        })
                        .data('kendoComboBox');
                    // The workaround for validation to work is to set the name after initializing the kendo ui widget
                    // TODO http://www.telerik.com/forums/how-to-enforce-validation-in-grid-sample
                    combobox.element.attr('name', 'name');
                    $('<span class="k-invalid-msg" data-for="name"></span>').appendTo(container);
                }

                var that = this;
                that.wrapper = that.element;
                that.element.addClass(WIDGET_CLASS);
                that.element.kendoGrid({
                    columns: [
                        { field: 'name', title: that.options.messages.columns.name, editor: cssDropDownEditor, template: '#=name#' },
                        { field: 'value', title: that.options.messages.columns.value }
                    ],
                    /*
                     dataBound: function (e) {
                     if (e.sender instanceof kendo.ui.Grid) {
                     var selected = e.sender.select();
                     if (selected instanceof $ && selected.length === 0) {
                     e.sender.select('tr:eq(1)');
                     e.sender.editCell('tr:eq(1) td:eq(0)');
                     }
                     }
                     },
                     */
                    dataSource: that._dataSource,
                    edit: function (e) {
                        if (e /*instanceof $.Event*/ && e.sender instanceof kendo.ui.Grid && e.container instanceof $) {
                            // Select the edited row
                            this.select(e.container.parent());
                            // Find the combobox and update dataSource
                            var comboBox = e.container.find('input:not(.k-input)').data('kendoComboBox');
                            if (comboBox instanceof kendo.ui.ComboBox) {
                                var styles = e.sender.dataSource.data(), css = [], all = [
                                    // This is where we define all style names displayed in the combo box and their respective default values
                                    {name: 'background-color', value: '#FFFFFF'},
                                    {name: 'border-color', value: '#000000'},
                                    {name: 'border-radius', value: '5px'},
                                    {name: 'border-style', value: 'solid'},
                                    {name: 'border-width', value: '1px'},
                                    {name: 'color', value: '#000000'},
                                    {name: 'font-family', value: 'Arial, Helvetica Neue, Helvetica, sans-serif'},
                                    {name: 'font-size', value: '20px'},
                                    {name: 'font-style', value: 'italic'},
                                    {name: 'font-weight', value: 'bold'},
                                    {name: 'padding', value: '10px'},
                                    {name: 'margin', value: '10px'},
                                    {name: 'text-align', value: 'center'},
                                    {name: 'text-decoration', value: 'underline'}
                                ];
                                for (var i = 0; i < all.length; i++) {
                                    var found = false;
                                    for (var j = 0; j < styles.length; j++) {
                                        if (all[i].name === styles[j].name && all[i].name !== comboBox.value()) {
                                            found = true;
                                            break;
                                        }
                                    }
                                    if (!found) {
                                        css.push(all[i]);
                                    }
                                }
                                comboBox.setDataSource(css);
                            }
                        }
                    },
                    editable: true,
                    height: that.options.height,
                    resizable: true,
                    selectable: 'row',
                    sortable: true,
                    toolbar: [
                        { name: 'create', text: that.options.messages.toolbar.create },
                        { name: 'destroy', text: that.options.messages.toolbar.destroy }
                    ]
                });
            },

            /**
             * Add a click event handler for the destroy button
             * @private
             */
            _setDestroyHandler: function() {
                var element = this.element;
                element.find('.k-grid-toolbar>.k-grid-delete').click(function(e){
                    var grid = element.data('kendoGrid');
                    if (grid instanceof kendo.ui.Grid) {
                        var selected = grid.select();
                        if (selected instanceof $ && selected.length) {
                            // allthough shorter, the following displays an alert to confirm deletion
                            // grid.removeRow(selected);
                            var uid = selected.attr(kendo.attr('uid')),
                                style = grid.dataSource.getByUid(uid);
                            grid.dataSource.remove(style);
                        }
                    }
                });
            },

            /**
             * Set a keypress event handler to prevent some unhealthy characters to be used for style names and values
             * @private
             */
            _setKeyPressHandler: function() {
                var element = this.element;
                element.find('table').on(KEYPRESS, function(e) {
                    if (e /*instanceof $.Event*/ && e.target instanceof window.HTMLElement) {
                        var input = $(e.target);
                        if (input.hasClass('k-input') && input.parent().hasClass('k-dropdown-wrap')) {
                            // the drop down with a list of style names has the focus
                            // allowed characters are a-z (96-123) and minus/hiphen/dash (45)
                            if (!(e.which === 45 || (e.which > 96 && e.which < 123))) {
                                e.preventDefault();
                            }
                        } else if (input.hasClass('k-textbox') && input.parent().hasClass('k-edit-cell')) {
                            // the textbox for style value has the focus
                            // do not allow < (60), > (62), ; (59) and " (34)
                            if (e.which === 34 || e.which === 59 || e.which === 60 || e.which === 62) {
                                e.preventDefault();
                            }
                        }
                    }
                });
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
                that.element.find('*').off();
                that.element.off();
                // remove descendants
                that.element.empty();
                that.element.removeClass(WIDGET_CLASS);
            },

            /**
             * Destroys the widget including all DOM modifications
             * @method destroy
             */
            destroy: function () {
                var that = this;
                Widget.fn.destroy.call(that);
                that._clear();
                // if ($.isFunction(that._refreshHandler)) {
                //    that.options.tools.unbind(CHANGE, that._refreshHandler);
                // }
                kendo.destroy(that.element);
            }

        });

        kendo.ui.plugin(StyleEditor);

    }(window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f){ 'use strict'; f(); });