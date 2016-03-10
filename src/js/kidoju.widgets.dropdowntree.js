/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define([
        './window.assert',
        './window.logger',
        './vendor/kendo/kendo.binder',
        './vendor/kendo/kendo.dropdownlist',
        './vendor/kendo/kendo.treeview'
        // './vendor/kendo/kendo.multiselect' // required because of a test in kendo.binder.js
    ], f);
})(function () {

    'use strict';

    (function ($, undefined) {

        var kendo = window.kendo;
        var data = kendo.data;
        var DataSource = data.DataSource;
        var ui = kendo.ui;
        var DropDownList = ui.DropDownList;
        var TreeView = ui.TreeView;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.widgets.dropdowntree');
        // var STRING = 'string';
        var UNDEFINED = 'undefined';
        var CHANGE = 'change';
        var DIV = '<div/>';

        /*********************************************************************************
         * Helpers
         *********************************************************************************/

        /**
         * Processes a table (dropDownList dataSource) with dataParentField into a hierarchy (Hierarchical dataSOurce for treeView)
         * Note: see also app.cache.getCategoryHierarchy
         * @param data
         * @param idField
         * @param dataParentField
         * @returns {*}
         */
        function processTable(data, idField, dataParentField) {
            var hash = {};
            for (var i = 0; i < data.length; i++) {
                var item = data[i];
                var id = item[idField];
                var parentId = item[dataParentField] || 'root';
                hash[id] = hash[id] || [];
                hash[parentId] = hash[parentId] || [];
                item.items = hash[id];
                hash[parentId].push(item);
            }
            return hash.root || [];
        }

        /*********************************************************************************
         * Widget
         * @see http://kendoui-feedback.telerik.com/forums/127393-telerik-kendo-ui-feedback/suggestions/3767009-treeview-in-combobox
         *********************************************************************************/

        var DropDownTree = DropDownList.extend({

            /**
             * Initialization
             * @param element
             * @param options
             */
            init: function (element, options) {
                var that = this;
                DropDownList.fn.init.call(that, element, options);
                that._layout();
                that.refresh();
            },

            /**
             * Options
             */
            options: {
                name: 'DropDownTree',
                dataParentField: 'parentId',
                dataImageUrlField: 'icon',
                treeTemplate: '' // tree template uses item instead of data
            },

            /**
             * Events
             */
            /*
            events: [
                CHANGE,
                DATABINDING,
                DATABOUND
            ],
            */

            /**
             * Value
             * @param value
             */
            value: function(value) {
                var that = this;
                if ($.type(value) === UNDEFINED) {
                    return DropDownList.fn.value.call(this);
                } else {
                    var options = that.options;
                    // DropDownList.fn.value.call(this, value);
                    var dataItem = that.dataSource.data().find(function (record) { return record[options.dataValueField] === value; });
                    if (dataItem) {
                        that.text(dataItem[options.dataTextField]);
                    } else {
                        that.text('');
                    }
                }
            },

            /**
             * Replace popup list with treeview
             * @private
             */
            _layout: function () {
                var that = this;
                var options = this.options;
                assert.instanceof($, that.list, kendo.format(assert.messages.instanceof.default, 'this.list', 'jQuery'));

                // Find the popup list
                var popupList = $('ul', that.list);
                if (popupList.length) {

                    // Destroy it
                    var popupListWidget = kendo.widgetInstance(popupList);
                    if (popupListWidget && $.isFunction(popupListWidget.destroy)) {
                        popupListWidget.destroy();
                    }

                    // Replace it with a div
                    var popupTreeView = $(DIV)
                        .css({ maxHeight: options.height, overflowX: 'hidden', overflowY: 'scroll' });
                    popupList.replaceWith(popupTreeView);

                    // Create the treeView
                    that.treeView = popupTreeView
                        .kendoTreeView({
                            dataSource: [],
                            dataTextField: options.dataTextField,
                            loadOnDemand: false,
                            autoBind: options.autoBind,
                            template: options.treeTemplate,
                            select: function (e) {
                                // e.preventDefault();
                                var dataItem = that.treeView.dataItem(e.node);
                                // that.text(dataItem[options.dataTextField]);
                                that.value(dataItem[options.dataValueField]);
                                that.trigger(CHANGE);
                                that.popup.canClose = true;
                                that.popup.close();
                            },
                            collapse: function () {
                                // prevent closing popup when collapsing a node
                                that.popup.canClose = false;
                            },
                            expand: function () {
                                // prevent closing popup when expanding a node
                                that.popup.canClose = false;
                            }
                        })
                        .data('kendoTreeView');

                    // Keep flag for avoiding to close the popup
                    // when expanding and collapsing nodes
                    that.popup.canClose = true;

                    // Replace _closeHandler
                    that._closeHandler = function (e) {
                        that.popup.canClose = true;
                        kendo.ui.DropDownList.fn._closeHandler.call(this, e);
                    };

                    // Bind popup open and close events
                    that.popup
                        .bind('open', function () {
                            if (that.value()) {
                                var treeview = that.treeView;
                                var selectedNode = treeview.findByText(that.text());
                                treeview.expandTo(selectedNode);
                                treeview.select(selectedNode);
                            }
                        })
                        .bind('close', function (e) {
                            if (!that.popup.canClose) {
                                e.preventDefault();
                                that.popup.canClose = true;
                            }
                        });
                }
            },

            /**
             *
             * @returns {*}
             */
            items: function() {
                // return DropDownList.fn.items.call(this);
                return this.treeView.items();
            },

            /**
             * Replace dataSource
             * @param dataSource
             */
            setDataSource: function (dataSource) {
                // TODO
                DropDownList.fn.setDataSource.call(this, dataSource);
            },

            /**
             * Initialize dataSource
             * @param dataSource
             */
            _dataSource: function () {
                var that = this;
                DropDownList.fn._dataSource.call(that);
                // bind to the change event to refresh the widget
                if (that.dataSource instanceof DataSource) {
                    if (that._refreshHandler) {
                        that.dataSource.unbind(CHANGE, that._refreshHandler);
                    }
                    that._refreshHandler = $.proxy(that.refresh, that);
                    that.dataSource.bind(CHANGE, that._refreshHandler);
                }
            },

            /**
             * Refresh
             */
            refresh: function (e) {
                var that = this;
                var options = that.options;
                DropDownList.fn.refresh.call(that, e);
                if (this.treeView instanceof TreeView) {
                    this.treeView.setDataSource(processTable(that.dataSource._pristineData, options.dataValueField, options.dataParentField));
                }
            },

            /**
             * Clear DOM
             * @private
             */
            _clear: function() {
                // TODO
            },

            /**
             * Destroy
             */
            destroy: function () {
                var that = this;
                // TODO: unbind dataSource
                this.treeView.destroy();
                DropDownList.fn.destroy.call(this);
            }
        });

        kendo.ui.plugin(DropDownTree);


    }(window.jQuery));

    return window.kendo;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });