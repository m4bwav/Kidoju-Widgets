﻿/*
 * Copyright (c) 2013-2016 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, jquery: true */
/* globals define: false */

(function (f, define) {
    'use strict';
    define([
        './window.assert',
        './window.logger',
        './kidoju.data'
        // Note: The player does not need the assetmanager, the codeeditor and the styleeditor
        // './kidoju.widgets.assetmanager',
        // './kidoju.widgets.chargrid',
        // './kidoju.widgets.codeeditor',
        // './kidoju.widgets.codeinput',
        // './kidoju.widgets.connector',
        // './kidoju.widgets.dropzone',
        // './kidoju.widgets.mathexpression',
        // './kidoju.widgets.mediaplayer',
        // './kidoju.widgets.propertygrid',
        // './kidoju.widgets.quiz',
        // './kidoju.widgets.stage', !IMPORTANT: Stage needs to be loaded after tools
        // './kidoju.widgets.styleeditor'
    ], f);
})(function () {

    'use strict';

    /* This function has too many statements. */
    /* jshint -W071 */

    (function ($, undefined) {

        var kendo = window.kendo;
        var kidoju = window.kidoju = window.kidoju || {};
        var Model = kidoju.data.Model;
        var ObservableArray = kendo.data.ObservableArray;
        var PageComponent = kidoju.data.PageComponent;
        var Page = kidoju.data.Page;
        var assert = window.assert;
        var logger = new window.Logger('kidoju.tools');
        var OBJECT = 'object';
        var ARRAY = 'array';
        var STRING = 'string';
        var NUMBER = 'number';
        var BOOLEAN = 'boolean';
        var DATE = 'date';
        var ERROR = 'error';
        var WARNING = 'warning';
        var CURSOR_DEFAULT = 'default';
        var CURSOR_CROSSHAIR = 'crosshair';
        var REGISTER = 'register';
        var ACTIVE = 'active';
        var POINTER = 'pointer';
        var ELEMENT_CLASS = '.kj-element';
        var DIALOG_DIV = '<div class="k-popup-edit-form {0}"></div>';
        var DIALOG_CLASS = '.kj-dialog';
        var CLICK = 'click';
        var RX_HTTP_S = /^https?:\/\//;
        var RX_FONT_SIZE = /font(-size)?:[^;]*[0-9]+px/;
        var RX_AUDIO = /^(cdn|data):\/\/[\s\S]+.mp3$/i;
        var RX_COLOR = /^#[0-9a-f]{6}$/i;
        var RX_DATA = /\S+/i;
        var RX_DESCRIPTION = /\S+/i; // question
        var RX_DROPVALUE = /\S+/i;
        var RX_FORMULA = /\S+/i;
        var RX_IMAGE = /^(cdn|data):\/\/[\s\S]+.(gif|jpe?g|png|svg)$/i;
        var RX_STYLE = /^(([\w-]+)\s*:([^;<>]+);\s*)+$/i;
        var RX_SOLUTION = /\S+/i;
        var RX_TEXT = /\S+/i;
        var RX_VALIDATION = /\S+/i;
        var RX_VIDEO = /^(cdn|data):\/\/[\s\S]+.mp3$/i;
        var FORMULA = 'function validate(value, solution, all) {\n\t{0}\n}';
        var JS_COMMENT = '// ';
        var CUSTOM = {
            name: 'custom',
            formula: kendo.format(FORMULA, '// Your code should return true when value is validated against solution.')
        };

        /*********************************************************************************
         * Helpers
         *********************************************************************************/

        /**
         * Incors images for corrections
         */
        // Incors O-Collection check.svg
        // var SVG_SUCCESS = '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="1024px" height="1024px" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="nonzero" clip-rule="evenodd" viewBox="0 0 10240 10240" xmlns:xlink="http://www.w3.org/1999/xlink"><path id="curve0" fill="#76A797" d="M3840 5760l3934 -3934c124,-124 328,-124 452,0l1148 1148c124,124 124,328 0,452l-5308 5308c-124,124 -328,124 -452,0l-2748 -2748c-124,-124 -124,-328 0,-452l1148 -1148c124,-124 328,-124 452,0l1374 1374z"/></svg>';
        var SVG_SUCCESS = 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTAyNHB4IiBoZWlnaHQ9IjEwMjRweCIgc2hhcGUtcmVuZGVyaW5nPSJnZW9tZXRyaWNQcmVjaXNpb24iIHRleHQtcmVuZGVyaW5nPSJnZW9tZXRyaWNQcmVjaXNpb24iIGltYWdlLXJlbmRlcmluZz0ib3B0aW1pemVRdWFsaXR5IiBmaWxsLXJ1bGU9Im5vbnplcm8iIGNsaXAtcnVsZT0iZXZlbm9kZCIgdmlld0JveD0iMCAwIDEwMjQwIDEwMjQwIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PHBhdGggaWQ9ImN1cnZlMCIgZmlsbD0iIzc2QTc5NyIgZD0iTTM4NDAgNTc2MGwzOTM0IC0zOTM0YzEyNCwtMTI0IDMyOCwtMTI0IDQ1MiwwbDExNDggMTE0OGMxMjQsMTI0IDEyNCwzMjggMCw0NTJsLTUzMDggNTMwOGMtMTI0LDEyNCAtMzI4LDEyNCAtNDUyLDBsLTI3NDggLTI3NDhjLTEyNCwtMTI0IC0xMjQsLTMyOCAwLC00NTJsMTE0OCAtMTE0OGMxMjQsLTEyNCAzMjgsLTEyNCA0NTIsMGwxMzc0IDEzNzR6Ii8+PC9zdmc+';
        // Incors O-Collection delete.svg
        // var SVG_FAILURE = '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="1024px" height="1024px" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="nonzero" clip-rule="evenodd" viewBox="0 0 10240 10240" xmlns:xlink="http://www.w3.org/1999/xlink"><path id="curve0" fill="#E68497" d="M1273 7156l2037 -2036 -2037 -2036c-124,-125 -124,-328 0,-453l1358 -1358c125,-124 328,-124 453,0l2036 2037 2036 -2037c125,-124 328,-124 453,0l1358 1358c124,125 124,328 0,453l-2037 2036 2037 2036c124,125 124,328 0,453l-1358 1358c-125,124 -328,124 -453,0l-2036 -2037 -2036 2037c-125,124 -328,124 -453,0l-1358 -1358c-124,-125 -124,-328 0,-453z"/></svg>';
        var SVG_FAILURE = 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTAyNHB4IiBoZWlnaHQ9IjEwMjRweCIgc2hhcGUtcmVuZGVyaW5nPSJnZW9tZXRyaWNQcmVjaXNpb24iIHRleHQtcmVuZGVyaW5nPSJnZW9tZXRyaWNQcmVjaXNpb24iIGltYWdlLXJlbmRlcmluZz0ib3B0aW1pemVRdWFsaXR5IiBmaWxsLXJ1bGU9Im5vbnplcm8iIGNsaXAtcnVsZT0iZXZlbm9kZCIgdmlld0JveD0iMCAwIDEwMjQwIDEwMjQwIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PHBhdGggaWQ9ImN1cnZlMCIgZmlsbD0iI0U2ODQ5NyIgZD0iTTEyNzMgNzE1NmwyMDM3IC0yMDM2IC0yMDM3IC0yMDM2Yy0xMjQsLTEyNSAtMTI0LC0zMjggMCwtNDUzbDEzNTggLTEzNThjMTI1LC0xMjQgMzI4LC0xMjQgNDUzLDBsMjAzNiAyMDM3IDIwMzYgLTIwMzdjMTI1LC0xMjQgMzI4LC0xMjQgNDUzLDBsMTM1OCAxMzU4YzEyNCwxMjUgMTI0LDMyOCAwLDQ1M2wtMjAzNyAyMDM2IDIwMzcgMjAzNmMxMjQsMTI1IDEyNCwzMjggMCw0NTNsLTEzNTggMTM1OGMtMTI1LDEyNCAtMzI4LDEyNCAtNDUzLDBsLTIwMzYgLTIwMzcgLTIwMzYgMjAzN2MtMTI1LDEyNCAtMzI4LDEyNCAtNDUzLDBsLTEzNTggLTEzNThjLTEyNCwtMTI1IC0xMjQsLTMyOCAwLC00NTN6Ii8+PC9zdmc+';

        /**
         * All i18n messages
         */
        var i18n = {

            tool: {
                top: { title: 'Top' },
                left: { title: 'Left' },
                height: { title: 'Height' },
                width: { title: 'Width' },
                rotate: { title: 'Rotate' }
            },

            dialogs: {
                ok: { text: 'OK' },
                cancel: { text: 'Cancel' }
            },

            messages: {
                invalidAltText: 'A(n) {0} on page {1} requires some alternate text in display attributes.',
                invalidAudioFile: 'A(n) {0} on page {1} requires an mp3 file in display attributes.',
                invalidColor: 'A(n) {0} on page {1} has an invalid color in display attributes.',
                invalidData: 'A(n) {0} on page {1} requires values in display attributes.',
                invalidDescription: 'A(n) {0} named `{1}` on page {2} requires a question in test logic.',
                invalidDropValue: 'A(n) {0} on page {1} requires a drop value in test logic.',
                invalidFailure: 'A(n) {0} named `{1}` on page {2} has a failure score higher than the omit score or zero in test logic.',
                invalidFormula: 'A(n) {0} on page {1} requires a formula in display attributes.',
                invalidImageFile: 'A(n) {0} on page {1} requires an image file in display attributes.',
                invalidSolution: 'A(n) {0} named `{1}` on page {2} requires a solution in test logic.',
                invalidStyle: 'A(n) {0} on page {1} has an invalid style in display attributes.',
                invalidSuccess: 'A(n) {0} named `{1}` on page {2} has a success score lower than the omit score or zero in test logic.',
                invalidText: 'A(n) {0} on page {1} requires some text in display attributes.',
                invalidValidation: 'A(n) {0} named `{1}` on page {2} requires a validation formula in test logic.',
                invalidVideoFile: 'A(n) {0} on page {1} requires an mp4 file in display attributes.'
            },

            pointer: {
                description: 'Pointer'
            },

            audio: {
                description: 'Audio Player',
                attributes: {
                    autoplay: { title: 'Autoplay' },
                    mp3: { title: 'MP3 File' },
                    ogg: { title: 'OGG File' }
                }
            },

            chargrid: {
                description: 'Character Grid',
                attributes: {
                    blank: { title: 'Blank' },
                    columns: { title: 'Columns' },
                    layout: { title: 'Layout' },
                    rows: { title: 'Rows' },
                    whitelist: { title: 'Whitelist' },
                    gridFill: { title: 'Grid Fill' },
                    gridStroke: { title: 'Grid Stroke' },
                    // blankFill = gridStroke
                    selectedFill: { title: 'Selection Fill' },
                    lockedFill: { title: 'Locked Fill' },
                    // lockedColor = valueColor = fontColor
                    fontColor: { title: 'Font Color' }
                },
                properties: {
                    name: { title: 'Name' },
                    description: { title: 'Question' },
                    solution: { title: 'Solution' },
                    validation: { title: 'Validation' },
                    success: { title: 'Success' },
                    failure: { title: 'Failure' },
                    omit: { title: 'Omit' }
                }
            },

            chargridadapter: {
                messages: {
                    layout: '<h3>Design the grid layout</h3><p>Any character you enter in the grid is locked and cannot be changed in play mode.</p><p>Use `{0}` to blank out cells.</p>',
                    solution: '<h3>Enter the solution</h3><p>Use any whitelisted character, i.e. `{0}`.</p>'
                }
            },

            checkbox: {
                description: 'CheckBox',
                attributes: {
                    data: { title: 'Values', defaultValue: 'Option 1\nOption 2' },
                    groupStyle: { title: 'Group Style' },
                    itemStyle: { title: 'Item Style' },
                    selectedStyle: { title: 'Select. Style' }
                },
                properties: {
                    name: { title: 'Name' },
                    description: { title: 'Question' },
                    solution: { title: 'Solution' },
                    validation: { title: 'Validation' },
                    success: { title: 'Success' },
                    failure: { title: 'Failure' },
                    omit: { title: 'Omit' }
                }
            },

            connector: {
                description: 'Connector',
                attributes: {
                    color: { title: 'Color' }
                },
                properties: {
                    name: { title: 'Name' },
                    description: { title: 'Question' },
                    solution: { title: 'Solution' },
                    validation: { title: 'Validation' },
                    success: { title: 'Success' },
                    failure: { title: 'Failure' },
                    omit: { title: 'Omit' }
                }
            },

            dropzone: {
                description: 'Drop Zone',
                attributes: {
                    style: { title: 'Style' },
                    text: { title: 'Text', defaultValue: 'Please drop here.' }
                },
                properties: {
                    name: { title: 'Name' },
                    description: { title: 'Question' },
                    solution: { title: 'Solution' },
                    validation: { title: 'Validation' },
                    success: { title: 'Success' },
                    failure: { title: 'Failure' },
                    omit: { title: 'Omit' }
                }
            },

            image: {
                description: 'Image',
                attributes: {
                    alt: { title: 'Text', defaultValue: 'Image' },
                    src: { title: 'Source', defaultValue: 'cdn://images/o_collection/svg/office/painting_landscape.svg' },
                    style: { title: 'Style' }
                },
                properties: {
                    draggable: { title: 'Draggable' },
                    dropValue: { title: 'Value' }
                }
            },

            label: {
                description: 'Label',
                attributes: {
                    style: { title: 'Style' },
                    text: { title: 'Text', defaultValue: 'Label' }
                },
                properties: {
                    draggable: { title: 'Draggable' },
                    dropValue: { title: 'Value' }
                }
            },

            mathexpression: {
                description: 'Mathematic Expression',
                attributes: {
                    formula: { title: 'Formula', defaultValue: '#sum_(i=1)^n i^3=((n(n+1))/2)^2#' },
                    style: { title: 'Style' }
                }
            },

            quiz: {
                description: 'Quiz',
                attributes: {
                    data: { title: 'Values', defaultValue: 'True\nFalse' },
                    groupStyle: { title: 'Group Style' },
                    itemStyle: { title: 'Item Style' },
                    mode: { title: 'Mode' },
                    selectedStyle: { title: 'Select. Style' }
                },
                properties: {
                    name: { title: 'Name' },
                    description: { title: 'Question' },
                    solution: { title: 'Solution' },
                    validation: { title: 'Validation' },
                    success: { title: 'Success' },
                    failure: { title: 'Failure' },
                    omit: { title: 'Omit' }
                }
            },

            table: {
                description: 'Static Table',
                attributes: {
                    columns: { title: 'Columns' },
                    rows: { title: 'Rows' },
                    data: { title: 'Data' },
                    style: { title: 'Style' }
                }
            },

            textarea: {
                description: 'TextArea',
                attributes: {
                    style: { title: 'Style' }
                },
                properties: {
                    name: { title: 'Name' },
                    description: { title: 'Question' },
                    solution: { title: 'Solution' },
                    validation: { title: 'Validation' },
                    success: { title: 'Success' },
                    failure: { title: 'Failure' },
                    omit: { title: 'Omit' }
                }
            },

            textbox: {
                description: 'TextBox',
                attributes: {
                    mask: { title: 'Mask' },
                    style: { title: 'Style' }
                },
                properties: {
                    name: { title: 'Name' },
                    description: { title: 'Question' },
                    solution: { title: 'Solution' },
                    validation: { title: 'Validation' },
                    success: { title: 'Success' },
                    failure: { title: 'Failure' },
                    omit: { title: 'Omit' }
                }
            },

            video: {
                description: 'Video Player',
                attributes: {
                    autoplay: { title: 'Autoplay' },
                    toolbarHeight: { title: 'Toolbar Height' },
                    mp4: { title: 'MP4 File' },
                    ogv: { title: 'OGV File' },
                    wbem: { title: 'WBEM File' }
                }
            }

        };

        /**
         * Build a random hex string of length characters
         * @param length
         * @returns {string}
         */
        function randomString(length) {
            var s = new Array(length + 1).join('x');
            return s.replace(/x/g, function (c) {
                /* jshint -W016 */
                return (Math.random() * 16|0).toString(16);
                /* jshint +W016 */
            });
        }

        /*********************************************************************************
         * Assets
         *********************************************************************************/

        var ToolAssets = kidoju.ToolAssets = kendo.Class.extend({
            init: function (options) {
                options = options || {};
                var collections = options.collections || [];
                var extensions = options.extensions || [];
                var schemes = options.schemes || {};
                var transport = options.transport || {};
                assert.type(ARRAY, collections, kendo.format(assert.messages.type.default, 'options.collections', ARRAY));
                assert.type(ARRAY, extensions, kendo.format(assert.messages.type.default, 'options.extensions', ARRAY));
                assert.type(OBJECT, schemes, kendo.format(assert.messages.type.default, 'options.schemes', OBJECT));
                assert.type(OBJECT, transport, kendo.format(assert.messages.type.default, 'options.transport', OBJECT));
                this.collections = collections;
                this.extensions = extensions;
                this.schemes = schemes;
                this.transport = transport;
            }
        });

        var assets = kidoju.assets = {
            // Assets for the audio tool
            audio : new ToolAssets(),
            // Assets for the image tool
            image: new ToolAssets(),
            // Assets for the video tool
            video: new ToolAssets()
        };

        /*********************************************************************************
         * Generic tools
         *********************************************************************************/

        /**
         * Registry of tools
         * @type {{register: Function}}
         */
        var tools = kidoju.tools = kendo.observable({
            active: null,
            register: function (Class) {
                assert.type(OBJECT, Class.prototype, kendo.format(assert.messages.type.default, 'Class.prototype', OBJECT));
                var obj = new Class();
                assert.instanceof(Tool, obj, kendo.format(assert.messages.instanceof.default, 'obj', 'kidoju.Tool'));
                assert.type(STRING, obj.id, kendo.format(assert.messages.type.default, 'obj.id', STRING));
                obj.id = obj.id.trim();
                assert.ok(obj.id.length > 0, 'A tool cannot have an empty id');
                assert.ok(obj.id !== ACTIVE && obj.id !== REGISTER, 'A tool cannot have `active` or `register` for id');
                assert.isUndefined(this[obj.id], 'Existing tools cannot be replaced');
                this[obj.id] = obj;
                if (obj.id === POINTER) {
                    this.active = POINTER;
                }
            }
        });

        /**
         * @class kidoju.Tool
         * @type {void|*}
         */
        var Tool = kidoju.Tool = kendo.Class.extend({
            id: null,
            icon: null,
            description: null,
            cursor: null,
            weight: 0,
            height: 250,
            width: 250,
            attributes: {},
            properties: {},
            svg: {
                success: SVG_SUCCESS,
                failure: SVG_FAILURE
            },
            i18n: {
                // They are here to be translated in kidoju.messages.[locale].js
                tool: {
                    top: { title: i18n.tool.top.title },
                    left: { title: i18n.tool.left.title },
                    height: { title: i18n.tool.height.title },
                    width: { title: i18n.tool.width.title },
                    rotate: { title: i18n.tool.rotate.title }
                },
                dialogs: {
                    ok: { text: i18n.dialogs.ok.text }, // TODO : icon?
                    cancel: { text: i18n.dialogs.cancel.text }
                },
                messages: {
                    invalidAltText: i18n.messages.invalidAltText,
                    invalidAudioFile: i18n.messages.invalidAudioFile,
                    invalidColor: i18n.messages.invalidColor,
                    invalidData: i18n.messages.invalidData,
                    invalidDescription: i18n.messages.invalidDescription,
                    invalidDropValue: i18n.messages.invalidDropValue,
                    invalidFailure: i18n.messages.invalidFailure,
                    invalidFormula: i18n.messages.invalidFormula,
                    invalidImageFile: i18n.messages.invalidImageFile,
                    invalidSolution: i18n.messages.invalidSolution,
                    invalidStyle: i18n.messages.invalidStyle,
                    invalidSuccess: i18n.messages.invalidSuccess,
                    invalidText: i18n.messages.invalidText,
                    invalidValidation: i18n.messages.invalidValidation,
                    invalidVideoFile: i18n.messages.invalidVideoFile
                }
            },

            /**
             * Constructor
             * @class kidoju.Tool
             * @constructor
             * @param options
             */
            init: function (options) {

                // Extend tool with init options
                $.extend(this, options);

                // Pass solution adapter library to validation adapter, especially for the code editor
                if (this.properties && this.properties.solution instanceof BaseAdapter && this.properties.validation instanceof adapters.ValidationAdapter) {
                    this.properties.validation.library = this.properties.solution.library;
                    this.properties.validation.defaultValue = JS_COMMENT + this.properties.solution.libraryDefault;
                }

            },

            /**
             * Get a kidoju.data.Model for attributes
             * @class kidoju.Tool
             * @method _getAttributeModel
             * @returns {kidoju.data.Model}
             * @private
             */
            _getAttributeModel: function () {
                var model = { fields: {} };
                for (var attr in this.attributes) {
                    if (this.attributes.hasOwnProperty(attr)) {
                        if (this.attributes[attr] instanceof BaseAdapter) {
                            model.fields[attr] = this.attributes[attr].getField();
                        }
                    }
                }
                return Model.define(model);
            },

            /**
             * Gets property grid row specifications for attributes
             * @class kidoju.Tool
             * @method _getAttributeRows
             * @returns {Array}
             * @private
             */
            _getAttributeRows: function () {
                var rows = [];

                // Add top, left, height, width, rotation
                rows.push(new adapters.NumberAdapter({ title: this.i18n.tool.top.title }, { 'data-decimals': 0, 'data-format': 'n0' }).getRow('top'));
                rows.push(new adapters.NumberAdapter({ title: this.i18n.tool.left.title }, { 'data-decimals': 0, 'data-format': 'n0' }).getRow('left'));
                rows.push(new adapters.NumberAdapter({ title: this.i18n.tool.height.title }, { 'data-decimals': 0, 'data-format': 'n0' }).getRow('height'));
                rows.push(new adapters.NumberAdapter({ title: this.i18n.tool.width.title }, { 'data-decimals': 0, 'data-format': 'n0' }).getRow('width'));
                rows.push(new adapters.NumberAdapter({ title: this.i18n.tool.rotate.title }, { 'data-decimals': 0, 'data-format': 'n0' }).getRow('rotate'));

                // Add other attributes
                for (var attr in this.attributes) {
                    if (this.attributes.hasOwnProperty(attr)) {
                        if (this.attributes[attr] instanceof BaseAdapter) {
                            rows.push(this.attributes[attr].getRow('attributes.' + attr));
                        }
                    }
                }
                return rows;
            },

            /**
             * Get a kidoju.data.Model for properties
             * @class kidoju.Tool
             * @method _getPropertyModel
             * @returns {kidoju.data.Model}
             * @private
             */
            _getPropertyModel: function () {
                var properties = this.properties;
                var model = { fields: {} };
                for (var prop in properties) {
                    if (properties.hasOwnProperty(prop)) {
                        if (properties[prop] instanceof BaseAdapter) {
                            model.fields[prop] = properties[prop].getField();
                            if (prop === 'name') {
                                // This cannot be set as a default value on the  adapter because each instance should have a different name
                                model.fields.name.defaultValue = 'val_' + randomString(6);
                            } else if (prop === 'validation') {
                                // We need the code library otherwise we won't have code to execute when validation === '// equal' or any other library value
                                model._library = properties.validation.library;
                            }
                        }
                    }
                }
                return Model.define(model);
            },

            /**
             * Gets property grid row specifications for properties
             * @class kidoju.Tool
             * @method _getPropertyRows
             * @returns {Array}
             * @private
             */
            _getPropertyRows: function () {
                var rows = [];

                for (var prop in this.properties) {
                    if (this.properties.hasOwnProperty(prop)) {
                        if (this.properties[prop] instanceof BaseAdapter) {
                            rows.push(this.properties[prop].getRow('properties.' + prop));
                        }
                    }
                }
                return rows;
            },

            /**
             * Get Html or jQuery content
             * @class kidoju.Tool
             * @method getHtmlContent
             * @param component
             * @param mode
             * @returns {*}
             */
            getHtmlContent: function (component, mode) {
                assert.instanceof(PageComponent, component, kendo.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                assert.enum(Object.keys(kendo.ui.Stage.fn.modes), mode, kendo.format(assert.messages.enum.default, 'mode', Object.keys(kendo.ui.Stage.fn.modes)));
                var template = kendo.template(this.templates[mode] || this.templates.default);
                return template($.extend(component, { ns: kendo.ns }));
            },

            /**
             * Return the default value when playing the component as part of a test
             * @param component
             */
            getTestDefaultValue: function (component) {
                // TODO: consider removing as it seems useless
                return;
            },

            /**
             * Add the display of a success or failure icon to the corresponding stage element
             * @returns {string}
             */
            showResult: function () {
                // Contrary to https://css-tricks.com/probably-dont-base64-svg/, we need base64 encoded strings otherwise kendo templates fail
                return '<div class=".kj-element-result">' +
                    '<div data-#= ns #bind="visible: #: properties.name #.result" style="position: absolute; height: 92px; width:92px; bottom: -20px; right: -20px; background-image: url(data:image/svg+xml;base64,' + Tool.fn.svg.success + '); background-size: 92px 92px; background-repeat: no-repeat; width: 92px; height: 92px;"></div>' +
                    '<div data-#= ns #bind="invisible: #: properties.name #.result" style="position: absolute; height: 92px; width:92px; bottom: -20px; right: -20px; background-image: url(data:image/svg+xml;base64,' + Tool.fn.svg.failure + '); background-size: 92px 92px; background-repeat: no-repeat; width: 92px; height: 92px;"></div>' +
                    '</div>';
            },

            /**
             * Improved display of value in score grid
             * Note: search for getScoreArray in kidoju.data
             * @param value
             */
            value$: function (value) {
                return kendo.htmlEncode(value || '');
            },

            /**
             * Improved display of solution in score grid
             * Note: search for getScoreArray in kidoju.data
             * @param solution
             */
            solution$: function (solution) {
                return kendo.htmlEncode(solution || '');
            },

            // onEnable: function (e, component, enabled) {},
            // onMove: function (e, component) {},
            // onResize: function (e, component) {},
            // onRotate: function (e, component) {},

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Component validation
             * @param component
             * @param pageIdx
             */
            validate: function (component, pageIdx) {
                /* jshint maxcomplexity: 8 */
                assert.instanceof (PageComponent, component, kendo.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                assert.type(NUMBER, pageIdx, kendo.format(assert.messages.type.default, 'pageIdx', NUMBER));
                var ret = [];
                if (component.properties) {
                    var properties = component.properties;
                    var description = this.description; // tool description
                    var messages = this.i18n.messages;
                    var name = properties.name;
                    // TODO: test name? note that all components do not necessarily have a name
                    if (properties.draggable === true && !RX_DROPVALUE.test(properties.dropValue)) {
                        ret.push({ type: ERROR, index: pageIdx, message: kendo.format(messages.invalidDropValue, description, /*name,*/ pageIdx + 1) });
                    }
                    if ($.type(properties.description) === STRING && !RX_DESCRIPTION.test(properties.description)) {
                        ret.push({ type: ERROR, index: pageIdx, message: kendo.format(messages.invalidDescription, description, name, pageIdx + 1) });
                    }
                    if ($.type(properties.solution) === STRING && !RX_SOLUTION.test(properties.solution)) {
                        // TODO: what if solution is not a string but a number or something else ?
                        ret.push({ type: ERROR, index: pageIdx, message: kendo.format(messages.invalidSolution, description, name, pageIdx + 1) });
                    }
                    if ($.type(properties.validation) === STRING && !RX_VALIDATION.test(properties.validation)) {
                        // TODO: There is room for better validation of the validation formula
                        ret.push({ type: ERROR, index: pageIdx, message: kendo.format(messages.invalidValidation, description, name, pageIdx + 1) });
                    }
                    if ($.type(properties.failure) === NUMBER && $.type(properties.omit) === NUMBER && properties.failure > Math.min(properties.omit, 0)) {
                        ret.push({ type: WARNING, index: pageIdx, message: kendo.format(messages.invalidFailure, description, name, pageIdx + 1) });
                    }
                    if ($.type(properties.success) === NUMBER && $.type(properties.omit) === NUMBER && properties.success < Math.max(properties.omit, 0)) {
                        ret.push({ type: WARNING, index: pageIdx, message: kendo.format(messages.invalidSuccess, description, name, pageIdx + 1) });
                    }
                }
                return ret;
            }

            /* jshint +W074 */

        });

        /*******************************************************************************************
         * Adapter classes
         * Used to display values in a property grid
         *******************************************************************************************/
        var adapters = kidoju.adapters = {};

        /**
         * Base (abstract) adapter
         */
        var BaseAdapter = adapters.BaseAdapter = kendo.Class.extend({

            /**
             * Data type: string, number, boolean or date
             */
            type: undefined,

            /**
             * Constructor
             * @param options
             */
            init: function (options) {
                options = options || {};
                // this.value = options.value;

                // See http://docs.telerik.com/kendo-ui/api/javascript/data/model#methods-Model.define
                this.defaultValue = options.defaultValue;
                this.editable = options.editable;
                this.nullable = options.nullable;
                this.parse = options.parse;
                this.from = options.from;
                this.validation = options.validation;

                // See http://docs.telerik.com/kendo-ui/api/javascript/ui/grid#configuration-columns
                this.field = options.field;
                this.title = options.title;
                this.format = options.format;
                this.template = options.template;
                this.editor = options.editor;
                // TODO: HTML encode????
                this.attributes = options.attributes;
            },

            /**
             * Get a dialog window
             */
            getDialog: function () {
                var dialog = $(DIALOG_CLASS).data('kendoWindow');
                // Find or create dialog frame
                if (!(dialog instanceof kendo.ui.Window)) {
                    // Create dialog
                    dialog = $(kendo.format(DIALOG_DIV, DIALOG_CLASS.substr(1)))
                        .appendTo(document.body)
                        .kendoWindow({
                            actions: ['close'],
                            modal: true,
                            resizable: false,
                            visible: false,
                            width: 860,
                            close: function (e) {
                                // This is a reusable dialog, so we need to make sure it is ready for the next content
                                dialog.element.off(CLICK, '.k-edit-buttons>.k-button');
                                dialog.element.removeClass('no-padding');
                                // The content method destroys widgets and unbinds data
                                dialog.content('');
                                dialog.viewModel = undefined;
                            }
                        })
                        .data('kendoWindow');
                }
                return dialog;
            },

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Get a kendo.data.Model field
             * See http://docs.telerik.com/kendo-ui/api/javascript/data/model#methods-Model.define
             * @returns {{}}
             */
            getField: function () {
                var field = {};
                if ([STRING, NUMBER, BOOLEAN, DATE].indexOf(this.type) > -1) {
                    field.type = this.type;
                }
                if ($.type(this.defaultValue) === this.type ||
                    this.type === undefined) { // TODO: test that defaultValue is null or an object
                    field.defaultValue = this.defaultValue;
                }
                if ($.type(this.editable) === BOOLEAN) {
                    field.editable = this.defaultValue;
                }
                if ($.type(this.nullable) === BOOLEAN) {
                    field.nullable = this.nullable;
                }
                if ($.isFunction(this.parse)) {
                    field.parse = this.parse;
                }
                if ($.type(this.from) === STRING) {
                    field.from = this.from;
                }
                if ($.type(this.validation) === OBJECT) {
                    field.validation = this.validation;
                }
                return field;
            },

            /* jshint +W074 */

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Get a property grid row
             * See http://docs.telerik.com/kendo-ui/api/javascript/ui/grid#configuration-columns
             * @param field - This is the MVVM path to the field the data is bound to
             * @returns {{}}
             */
            getRow: function (field) {
                if ($.type(field) !== STRING || field.length === 0) {
                    throw new TypeError();
                }
                var row = {};
                row.field = field; // Mandatory
                if ($.type(this.title) === STRING) {
                    row.title = this.title;
                }
                if ($.type(this.format) === STRING) {
                    row.format = this.format;
                }
                if ($.type(this.template) === STRING) {
                    row.template = this.template;
                }
                if ($.isFunction(this.editor) ||
                    ($.type(this.editor) === STRING && (kidoju.editors === undefined || $.isFunction(kidoju.editors[this.editor])))) {
                    row.editor = this.editor;
                }
                // TODO: HTML encode????
                if ($.isPlainObject(this.attributes)) {
                    row.attributes = this.attributes;
                }
                return row;
            }

        });

        /* jshint +W074 */

        /**
         * Asset Adapter
         */
        adapters.AssetAdapter = BaseAdapter.extend({
            init: function (options) {
                var that = this;
                BaseAdapter.fn.init.call(that, options);
                that.type = STRING;
                that.defaultValue = that.defaultValue || (that.nullable ? null : '');
                // that.editor is the inline editor with a [...] button which triggers this.showDialog
                that.editor = function (container, settings) {
                    var table = $('<div/>')
                        .css({ display: 'table' })
                        .appendTo(container);
                    var cell = $('<div/>')
                        .css({
                            display: 'table-cell',
                            width: '100%',
                            paddingRight: '8px'
                        })
                        .appendTo(table);
                    var input = $('<input/>')
                        .addClass('k-textbox')
                        .css({ width: '100%' })
                        .prop({ readonly: true })
                        .attr($.extend({}, settings.attributes, { 'data-bind': 'value: ' + settings.field }))// TODO: namespace???
                        .appendTo(cell);
                    $('<button/>')
                        .text('...')
                        .addClass('k-button')
                        .css({
                            display: 'table-cell',
                            minWidth: '40px',
                            height: input.css('height'), // to match input,
                            margin: 0
                        })
                        .appendTo(table)
                        .on(CLICK, $.proxy(that.showDialog, that, settings));
                };
            },
            showDialog: function (settings) {
                var that = this;
                var dialog = that.getDialog();
                // Create viewModel (Cancel shall not save changes to main model)
                dialog.viewModel = kendo.observable({
                    url: settings.model.get(settings.field)
                });
                // Prepare UI
                dialog.title(settings.title);
                var content = '<div class="k-edit-form-container">' + // TODO namespace???
                    '<div data-role="assetmanager" data-bind="value: url"></div>' +
                    '<div class="k-edit-buttons k-state-default">' +
                    '<a class="k-primary k-button" data-command="ok" href="#">' + Tool.fn.i18n.dialogs.ok.text + '</a>' +
                    '<a class="k-button" data-command="cancel" href="#">' + Tool.fn.i18n.dialogs.cancel.text + '</a>' +
                    '</div></div>';
                dialog.content(content);
                assert.instanceof(PageComponent, settings.model, kendo.format(assert.messages.instanceof.default, 'settings.model', 'kidoju.data.PageComponent'));
                assert.instanceof(ToolAssets, assets[settings.model.tool], kendo.format(assert.messages.instanceof.default, 'assets[settings.model.tool]', 'kidoju.ToolAssets'));
                var assetManagerWidget = dialog.element.find(kendo.roleSelector('assetmanager')).kendoAssetManager(assets[settings.model.tool]).data('kendoAssetManager');
                kendo.bind(dialog.element, dialog.viewModel);
                dialog.element.addClass('no-padding');
                // Bind click handler for edit buttons
                dialog.element.on(CLICK, '.k-edit-buttons>.k-button', $.proxy(that.closeDialog, that, settings, dialog));
                // Show dialog
                assetManagerWidget.tabStrip.activateTab(0);
                dialog.center().open();
            },
            closeDialog: function (options, dialog, e) {
                var that = this;
                if (e instanceof $.Event && e.target instanceof window.HTMLElement) {
                    var command = $(e.target).attr(kendo.attr('command'));
                    if (command === 'ok') {
                        options.model.set(options.field, dialog.viewModel.get('url'));
                    }
                    dialog.close();
                }
            }
        });

        /**
         * Boolean adapter
         */
        adapters.BooleanAdapter = BaseAdapter.extend({
            init: function (options, attributes) {
                BaseAdapter.fn.init.call(this, options);
                this.type = BOOLEAN;
                this.defaultValue = this.defaultValue || (this.nullable ? null : false);
                this.editor = 'input';
                this.attributes = $.extend({}, this.attributes, attributes);
                this.attributes[kendo.attr('role')] = 'switch';
            },
            library: [
                {
                    name: 'equal',
                    formula: kendo.format(FORMULA, 'return String(value).toLowerCase() === String(solution).toLowerCase();')
                }
            ],
            libraryDefault: 'equal'
        });

        /**
         * CharGrid adapter
         */
        adapters.CharGridAdapter = BaseAdapter.extend({
            init: function (options) {
                var that = this;
                BaseAdapter.fn.init.call(that, options);
                that.type = undefined;
                that.editor = function (container, options) {
                    $('<button/>')
                        .text('...')
                        .addClass('k-button')
                        .css({ margin: 0, width: '100%' })
                        .appendTo(container)
                        .on(CLICK, $.proxy(that.showDialog, that, options));
                };
            },
            showDialog: function (options, evt) {
                var that = this;
                var dialog = that.getDialog();
                var model = options.model;
                // Build data (resize array especially after changing rows and columns)
                var columns = model.get('attributes.columns');
                var rows = model.get('attributes.rows');
                var whitelist = model.get('attributes.whitelist');
                var layout = model.get('attributes.layout');
                var data = model.get(options.field);
                // Create viewModel (Cancel shall not save changes to main model)
                dialog.viewModel = kendo.observable({
                    chargrid: kendo.ui.CharGrid._getCharGridArray(rows, columns, whitelist, layout, data)
                });
                // Prepare UI
                dialog.title(options.title);
                var content = '<div class="k-edit-form-container">' + // TODO namespace???
                    '<div>' +
                    '<div data-role="chargrid" data-bind="value: chargrid" data-scaler=".k-edit-form-container" data-container=".k-edit-form-container" ' +
                    'data-columns="' + model.get('attributes.columns') + '" data-rows="' + model.get('attributes.rows') + '" ' +
                    'data-blank="' + model.get('attributes.blank') + '" ' +
                    'data-whitelist="' + (options.field === 'properties.solution' ? model.get('attributes.whitelist') : '\\S') + '" ' +
                    (options.field === 'properties.solution' ? 'data-locked="' + kendo.htmlEncode(JSON.stringify(layout)) + '" ' : '') +
                    'data-grid-fill="' + model.get('attributes.gridFill') + '" ' +
                    'data-grid-stroke="' + model.get('attributes.gridStroke') + '" ' +
                    'data-blank-fill="' + model.get('attributes.gridStroke') + '" ' +
                    'data-selected-fill="' + model.get('attributes.selectedFill') + '" ' +
                    'data-locked-fill="' + model.get('attributes.lockedFill') + '" ' +
                    'data-locked-color="' + model.get('attributes.fontColor') + '" ' +
                    'data-value-color="' + model.get('attributes.fontColor') + '" ' +
                    'style="height:' + 0.7 * options.model.get('height') + 'px;width:' + 0.7 * options.model.get('width') + 'px;margin:20px;float:left;"></div>' +
                    '<div style="max-width:400px;margin:20px 0;float:left;">' +
                    (options.field === 'properties.solution' ? kendo.format(this.messages.solution, model.get('attributes.whitelist')) : kendo.format(this.messages.layout, model.get('attributes.blank'))) +
                    '</div>' +
                    '</div>' +
                    '<div class="k-edit-buttons k-state-default">' +
                    '<a class="k-primary k-button" data-command="ok" href="#">' + Tool.fn.i18n.dialogs.ok.text + '</a>' +
                    '<a class="k-button" data-command="cancel" href="#">' + Tool.fn.i18n.dialogs.cancel.text + '</a>' +
                    '</div></div>';
                dialog.content(content);
                kendo.bind(dialog.element, dialog.viewModel);
                dialog.element.addClass('no-padding');
                // Bind click handler for edit buttons
                dialog.element.on(CLICK, '.k-edit-buttons>.k-button', $.proxy(that.closeDialog, that, options, dialog));
                // Show dialog
                dialog.center().open();
            },
            closeDialog: function (options, dialog, e) {
                var that = this;
                if (e instanceof $.Event && e.target instanceof window.HTMLElement) {
                    var command = $(e.target).attr(kendo.attr('command'));
                    if (command === 'ok') {
                        options.model.set(options.field, dialog.viewModel.get('chargrid'));
                    }
                    dialog.close();
                }
            },
            library: [
                {
                    name: 'equal',
                    formula: kendo.format(FORMULA, 'return value && typeof value.equals === "function" && value.equals(solution);')
                }
            ],
            libraryDefault: 'equal',
            messages: {
                layout: i18n.chargridadapter.messages.layout,
                solution: i18n.chargridadapter.messages.solution
            }
        });

        /**
         * Color adapter
         */
        adapters.ColorAdapter = BaseAdapter.extend({
            init: function (options, attributes) {
                BaseAdapter.fn.init.call(this, options);
                this.type = STRING;
                this.defaultValue = this.defaultValue || (this.nullable ? null : '#000000');
                this.editor = 'input';
                this.attributes = $.extend({}, this.attributes, attributes);
                this.attributes[kendo.attr('role')] = 'colorpicker';
            },
            library: [
                {
                    name: 'equal',
                    formula: kendo.format(FORMULA, 'return String(value).trim() === String(solution).trim();')
                }
            ],
            libraryDefault: 'equal'
        });

        /**
         * Connector adapter
         */
        adapters.ConnectorAdapter = BaseAdapter.extend({
            init: function (options, attributes) {
                BaseAdapter.fn.init.call(this, options);
                this.type = STRING;
                this.defaultValue = this.defaultValue || (this.nullable ? null : '');
                // this.editor = 'input';
                // this.attributes = $.extend({}, this.attributes, { type: 'text', style: 'width: 100%;' });
                this.editor = function (container, options) {
                    var input = $('<input/>')
                        .css({ width: '100%' })
                        .attr({ 'data-bind': 'value: ' + options.field }) // TODO namespace???
                        .appendTo(container);
                    input.kendoComboBox({
                        // dataSource: { data: [''] }, // We need a non-empty dataSource otherwise open is not triggered
                        /**
                         * Fill the drop down list when opening the popup (always up-to-date when adding/removing connectors)
                         * @param e
                         */
                        open: function (e) {
                            var solutions = [];
                            // find the design (mode) stage, avoiding navigation
                            var stage = $('[' + kendo.attr('role') + '="stage"][' + kendo.attr('mode') + '="design"]');
                            // find the handle box and the selected uid which should be a connector
                            var handleBox = stage.parent().children('.kj-handle-box');
                            var uid = handleBox.attr(kendo.attr('uid'));
                            // find all unselected connectors
                            assert.instanceof (PageComponent, options.model, kendo.format(assert.messages.instanceof.default, 'options.model', 'kidoju.data.PageModel'));
                            if (options.model.parent() instanceof kendo.Observable && options.model.parent().selectedPage instanceof Page) {
                                var components = options.model.parent().selectedPage.components;
                                $.each(components.data(), function (index, component) {
                                    if (component.tool === 'connector' && component.uid !== uid) {
                                        var solution = component.get(options.field);
                                        if ($.type(solution) === STRING && solution.length && solutions.indexOf(solution) === -1) {
                                            solutions.push(solution);
                                        }
                                    }
                                });
                                solutions.sort();
                            }
                            e.sender.setDataSource(solutions);
                        }
                    });
                };
            },
            library: [
                {
                    name: 'equal',
                    formula: kendo.format(FORMULA, 'return String(value).trim() === String(solution).trim();')
                }
            ],
            libraryDefault: 'equal'
        });

        /**
         * Date adapter
         */
        adapters.DateAdapter = BaseAdapter.extend({
            init: function (options, attributes) {
                BaseAdapter.fn.init.call(this, options);
                this.type = DATE;
                this.defaultValue = this.defaultValue || (this.nullable ? null : new Date());
                this.editor = 'input';
                this.attributes = $.extend({}, this.attributes, attributes);
                this.attributes[kendo.attr('role')] = 'datepicker';
            },
            library: [
                {
                    name: 'equal',
                    // TODO: parsing raises a culture issue with MM/DD/YYYY in english and DD/MM/YYYY in french
                    // Note: new Date(1994,1,1) !== new Date(1994,1,1) as they are two different objects
                    formula: kendo.format(FORMULA, 'return new Date(value) - new Date(solution) === 0;')
                }
            ],
            libraryDefault: 'equal'
        });

        /**
         * Description Adapter
         */
        adapters.DescriptionAdapter = BaseAdapter.extend({
            init: function (options) {
                BaseAdapter.fn.init.call(this, options);
                this.type = STRING;
                this.defaultValue = this.defaultValue || (this.nullable ? null : '');
                // this.editor = 'input';
                // this.attributes = $.extend({}, this.attributes, { type: 'text', style: 'width: 100%;' });
                this.editor = function (container, options) {
                    var input = $('<input/>')
                        .css({ width: '100%' })
                        .attr({ 'data-bind': 'value: ' + options.field }) // TODO namespace???
                        .appendTo(container);
                    input.kendoComboBox({
                        // dataSource: { data: [] }, // We need a non-empty dataSource otherwise open is not triggered
                        /**
                         * Fill the drop down list when opening the popup (always up-to-date when adding/removing connectors)
                         * @param e
                         */
                        open: function (e) {
                            var texts = [];
                            // find the design (mode) stage, avoiding navigation
                            var stage = $('[' + kendo.attr('role') + '="stage"][' + kendo.attr('mode') + '="design"]');
                            // find all labels
                            var labels = stage.find('.kj-element[' + kendo.attr('tool') + '="label"]>div');
                            labels.each(function (index, label) {
                                var text = $(label).html().replace(/<br\/?>/g, ' ');
                                if ($.type(text) === STRING && text.length) {
                                    texts.push(text);
                                }
                            });
                            texts.sort();
                            e.sender.setDataSource(texts);
                        }
                    });
                };
            }
        });

        /**
         * Enum adapter
         */
        adapters.EnumAdapter = BaseAdapter.extend({
            init: function (options, attributes) {
                BaseAdapter.fn.init.call(this, options);
                this.type = STRING;
                this.defaultValue = this.defaultValue || (this.nullable ? null : '');
                this.editor = 'input';
                this.attributes = $.extend({}, this.attributes, attributes);
                this.attributes[kendo.attr('role')] = 'dropdownlist';
                this.attributes[kendo.attr('source')] = JSON.stringify(options && options.enum ? options.enum : []); // kendo.htmlEncode??
            }
        });

        /**
         * Property name adapter
         */
        adapters.NameAdapter = BaseAdapter.extend({
            init: function (options, attributes) {
                BaseAdapter.fn.init.call(this, options);
                this.type = STRING;
                this.defaultValue = this.defaultValue || (this.nullable ? null : '');
                this.editor = 'input';
                this.attributes = $.extend({}, this.attributes, attributes, { type: 'text', class: 'k-textbox',  readonly: true });
            }
        });

        /**
         * Number adapter
         */
        adapters.NumberAdapter = BaseAdapter.extend({
            init: function (options, attributes) {
                BaseAdapter.fn.init.call(this, options);
                this.type = NUMBER;
                this.defaultValue = this.defaultValue || (this.nullable ? null : 0);
                this.editor = 'input';
                this.attributes = $.extend({}, this.attributes, attributes);
                this.attributes[kendo.attr('role')] = 'numerictextbox';
            },
            library: [
                {
                    name: 'equal',
                    // TODO: parsing raises a culture issue with 5.3 in english and 5,3 in french
                    formula: kendo.format(FORMULA, 'return Number(value) === Number(solution);')
                },
                {
                    name: 'greaterThan',
                    formula: kendo.format(FORMULA, 'return Number(value) > Number(solution);')
                },
                {
                    name: 'greaterThanOrEqual',
                    formula: kendo.format(FORMULA, 'return Number(value) >= Number(solution);')
                },
                {
                    name: 'lowerThan',
                    formula: kendo.format(FORMULA, 'return Number(value) < Number(solution);')
                },
                {
                    name: 'lowerThanOrEqual',
                    formula: kendo.format(FORMULA, 'return Number(value) <= Number(solution);')
                }
            ],
            libraryDefault: 'equal'
        });

        /**
         * Quiz adapter
         */
        adapters.QuizAdapter = BaseAdapter.extend({
            init: function (options, attributes) {
                BaseAdapter.fn.init.call(this, options);
                this.type = STRING;
                this.defaultValue = this.defaultValue || (this.nullable ? null : '');
                // this.editor = 'input';
                // this.attributes = $.extend({}, this.attributes, { type: 'text', style: 'width: 100%;' });
                this.editor = function (container, options) {
                    var input = $('<input/>')
                        .css({ width: '100%' })
                        .attr({ 'data-bind': 'value: ' + options.field }) // TODO namespace???
                        .appendTo(container);
                    input.kendoComboBox({
                        // dataSource: { data: [''] }, // We need a non-empty dataSource otherwise open is not triggered
                        /**
                         * Fill the drop down list when opening the popup (always up-to-date when adding/removing connectors)
                         * @param e
                         */
                        open: function (e) {
                            var data = options.model.get('attributes.data');
                            data = $.type(data) === STRING ? data.split('\n') : [];
                            data.sort();
                            e.sender.setDataSource(data);
                        }
                    });
                };
            },
            library: [
                {
                    name: 'equal',
                    formula: kendo.format(FORMULA, 'return String(value).trim() === String(solution).trim();')
                }
            ],
            libraryDefault: 'equal'
        });

        /**
         * Score adapter
         */
        adapters.ScoreAdapter = BaseAdapter.extend({
            init: function (options, attributes) {
                BaseAdapter.fn.init.call(this, options);
                this.type = NUMBER;
                this.defaultValue = this.defaultValue || (this.nullable ? null : 0);
                this.editor = 'input';
                this.attributes = $.extend({}, this.attributes, attributes);
                this.attributes[kendo.attr('role')] = 'numerictextbox';
            }
        });

        /**
         * Spreadsheet adapter
         */
        adapters.SpreadsheetAdapter = BaseAdapter.extend({
            init: function (options) {
                var that = this;
                BaseAdapter.fn.init.call(that, options);
                that.type = undefined;
                // This is the inline editor with a [...] button which triggers this.showDialog
                that.editor = function (container, options) {
                    $('<button/>')
                        .text('...')
                        .addClass('k-button')
                        .css({ margin: 0, width: '100%' })
                        .appendTo(container)
                        .on(CLICK, $.proxy(that.showDialog, that, options));
                };
            },
            showDialog: function (options) {
                var that = this;
                var dialog = that.getDialog();
                var model = options.model;
                var columns = model.get('attributes.columns');
                var rows = model.get('attributes.rows');
                // Prepare UI
                dialog.title(options.title);
                var content = '<div class="k-edit-form-container">' + // TODO namespace???
                    '<div data-role="spreadsheet" style="width:' + (dialog.element.parent().width() - 2) + 'px;"></div>' +
                    '<div class="k-edit-buttons k-state-default">' +
                    '<a class="k-primary k-button" data-command="ok" href="#">' + Tool.fn.i18n.dialogs.ok.text + '</a>' +
                    '<a class="k-button" data-command="cancel" href="#">' + Tool.fn.i18n.dialogs.cancel.text + '</a>' +
                    '</div></div>';
                dialog.content(content);
                var spreadsheet = dialog.element.find(kendo.roleSelector('spreadsheet'));
                var spreadsheetWidget = spreadsheet.kendoSpreadsheet({
                    // sheets: [{}],
                    columns: columns,
                    rows: rows,
                    columnWidth: 100,
                    rowHeight: 45,
                    sheetsbar: false,
                    toolbar: {
                        // TODO: merge and hide not included in v1
                        home: [['bold', 'italic', 'underline'], 'backgroundColor', 'textColor', 'borders', 'fontSize', 'fontFamily', 'alignment', 'textWrap', ['formatDecreaseDecimal', 'formatIncreateDecimal'], 'format'],
                        insert: false,
                        data: false
                    }
                }).data('kendoSpreadsheet');
                // Workaround for issue described at https://github.com/telerik/kendo-ui-core/issues/1990
                dialog.bind('activate', function () {
                    kendo.resize(dialog.element);
                    spreadsheetWidget.refresh();
                });
                // Load JSON
                spreadsheetWidget.fromJSON(model.get('attributes.data'));
                // Disable context menu
                spreadsheet.find('.k-spreadsheet-fixed-container').off('contextmenu');
                // Set default font size
                var activeSheet = spreadsheetWidget.activeSheet();
                activeSheet.range('R1C1:R' + rows + 'C' + columns).forEachCell(function (rowIndex, columnIndex) {
                    var range = activeSheet.range('R' + (rowIndex + 1) + 'C' + (columnIndex + 1));
                    range.fontSize(range.fontSize() || 36);
                });
                dialog.element.addClass('no-padding');
                // Bind click handler for edit buttons
                dialog.element.on(CLICK, '.k-edit-buttons>.k-button', $.proxy(that.closeDialog, that, options, dialog));
                // Show dialog
                dialog.center().open();
            },
            closeDialog: function (options, dialog, e) {
                var that = this;
                if (e instanceof $.Event && e.target instanceof window.HTMLElement) {
                    var command = $(e.target).attr(kendo.attr('command'));
                    if (command === 'ok') {
                        var spreadsheet = dialog.element.find(kendo.roleSelector('spreadsheet'));
                        var spreadsheetWidget = spreadsheet.data('kendoSpreadsheet');
                        options.model.set(options.field, spreadsheetWidget.toJSON());
                    }
                    dialog.close();
                }
            }
        });

        /**
         * String adapter
         */
        adapters.StringAdapter = BaseAdapter.extend({
            init: function (options, attributes) {
                BaseAdapter.fn.init.call(this, options);
                this.type = STRING;
                this.defaultValue = this.defaultValue || (this.nullable ? null : '');
                this.editor = 'input';
                this.attributes = $.extend({}, this.attributes, attributes, { type: 'text', class: 'k-textbox' });
            },
            library: [
                {
                    name: 'equal',
                    formula: kendo.format(FORMULA, 'return String(value).trim() === String(solution).trim();')
                },
                {
                    name: 'ignoreCaseEqual',
                    formula: kendo.format(FORMULA, 'return String(value).trim().toUpperCase() === String(solution).trim().toUpperCase();')
                },
                {
                    name: 'ignoreCaseMatch',
                    formula: kendo.format(FORMULA, 'return (new RegExp(\'^\' + String(solution).trim() + \'$\', \'i\')).test(String(value).trim());')
                },
                {
                    name: 'ignoreDiacriticsEqual',
                    formula: kendo.format(FORMULA, 'return removeDiacritics(String(value).trim().toUpperCase()) === removeDiacritics(String(solution).trim().toUpperCase());')
                },
                {
                    name: 'match',
                    formula: kendo.format(FORMULA, 'return (new RegExp(\'^\' + String(solution).trim() + \'$\')).test(String(value).trim());')
                },
                {
                    name: 'metaphone',
                    formula: kendo.format(FORMULA, 'return metaphone(removeDiacritics(String(value).trim().toUpperCase())) === metaphone(removeDiacritics(String(solution).trim().toUpperCase()));')
                },
                {
                    name: 'soundex',
                    formula: kendo.format(FORMULA, 'return soundex(removeDiacritics(String(value).trim().toUpperCase())) === soundex(removeDiacritics(String(solution).trim().toUpperCase()));')
                }
            ],
            libraryDefault: 'equal'
        });

        /**
         * String Array adapter
         */
        adapters.StringArrayAdapter = BaseAdapter.extend({
            init: function (options, attributes) {
                BaseAdapter.fn.init.call(this, options);
                this.type = STRING;
                this.defaultValue = this.defaultValue || (this.nullable ? null : '');
                this.editor = 'textarea';
                this.attributes = $.extend({}, this.attributes, attributes);
            },
            library: [
                {
                    name: 'equal',
                    formula: kendo.format(FORMULA, '// Note: value is an array and solution is a multiline string\n\t' +
                        'return String(value.sort()) === String(solution.trim().split("\\n").sort());')
                },
                {
                    name: 'sumEqual',
                    formula: kendo.format(FORMULA, '// Note: value is an array and solution is a multiline string\n\t' +
                        'var ret = 0;\t' +
                        'value.forEach(function(val){ ret += parseFloat((val || "").trim() || 0); });\t' +
                        'return ret === parseFloat(solution.trim());')
                }
            ],
            libraryDefault: 'equal'
        });

        /**
         * Style adapter
         */
        adapters.StyleAdapter = BaseAdapter.extend({
            init: function (options) {
                var that = this;
                BaseAdapter.fn.init.call(that, options);
                that.type = STRING;
                that.defaultValue = that.defaultValue || (that.nullable ? null : '');
                // This is the inline editor with a [...] button which triggers this.showDialog
                that.editor = function (container, options) {
                    var table = $('<div/>')
                        .css({ display: 'table' })
                        .appendTo(container);
                    var cell = $('<div/>')
                        .css({
                            display: 'table-cell',
                            width: '100%',
                            paddingRight: '8px'
                        })
                        .appendTo(table);
                    var input = $('<input/>')
                        .addClass('k-textbox') // or k-input
                        .css({ width: '100%' })
                        .attr($.extend({}, options.attributes, { 'data-bind': 'value: ' + options.field })) // TODO namespace?
                        .appendTo(cell);
                    $('<button/>')
                        .text('...')
                        .addClass('k-button')
                        .css({
                            display: 'table-cell',
                            minWidth: '40px',
                            height: input.css('height'), // to match input,
                            margin: 0
                        })
                        .appendTo(table)
                        .on(CLICK, $.proxy(that.showDialog, that, options));
                };
            },
            showDialog: function (options) {
                var that = this;
                var dialog = that.getDialog();
                // Create viewModel (Cancel shall not save changes to main model)
                dialog.viewModel = kendo.observable({
                    style: options.model.get(options.field)
                });
                // Prepare UI
                dialog.title(options.title);
                var content = '<div class="k-edit-form-container">' + // TODO namespace???
                    '<div data-role="styleeditor" data-bind="value: style"></div>' +
                    '<div class="k-edit-buttons k-state-default">' +
                    '<a class="k-primary k-button" data-command="ok" href="#">' + Tool.fn.i18n.dialogs.ok.text + '</a>' +
                    '<a class="k-button" data-command="cancel" href="#">' + Tool.fn.i18n.dialogs.cancel.text + '</a>' +
                    '</div></div>';
                dialog.content(content);
                kendo.bind(dialog.element, dialog.viewModel);
                dialog.element.addClass('no-padding');
                // Bind click handler for edit buttons
                dialog.element.on(CLICK, '.k-edit-buttons>.k-button', $.proxy(that.closeDialog, that, options, dialog));
                // Show dialog
                dialog.center().open();
            },
            closeDialog: function (options, dialog, e) {
                var that = this;
                if (e instanceof $.Event && e.target instanceof window.HTMLElement) {
                    var command = $(e.target).attr(kendo.attr('command'));
                    if (command === 'ok') {
                        options.model.set(options.field, dialog.viewModel.get('style'));
                    }
                    dialog.close();
                }
            }
        });

        /**
         * Text (multiline) adapter
         */
        adapters.TextAdapter = BaseAdapter.extend({
            init: function (options, attributes) {
                BaseAdapter.fn.init.call(this, options);
                this.type = STRING;
                this.defaultValue = this.defaultValue || (this.nullable ? null : '');
                this.editor = 'textarea';
                this.attributes = $.extend({}, this.attributes, attributes);
            },
            library: [
                {
                    name: 'equal',
                    formula: kendo.format(FORMULA, 'return String(value).trim() === String(solution).trim();')
                },
                {
                    name: 'noSpaceEqual',
                    formula: kendo.format(FORMULA, 'return String(value).replace(/\s+/g, "") === String(solution).replace(/\s+/g, "");')
                },
                {
                    name: 'noPunctiationEqual',
                    formula: kendo.format(FORMULA, 'return String(value).replace(/[\.,;:\?!\'"\(\)\s]+/g, "") === String(solution).replace(/[\.,;:\?!\'"\(\)\s]+/g, "");')
                }
            ],
            libraryDefault: 'equal'
        });

        /**
         * Property validation adapter
         */
        adapters.ValidationAdapter = BaseAdapter.extend({
            init: function (options) {
                var that = this;
                BaseAdapter.fn.init.call(that, options);
                that.type = STRING;
                // this.defaultValue = this.defaultValue || (this.nullable ? null : '');
                that.editor = function (container, options) {
                    var table = $('<div/>')
                        .css({ display: 'table' })
                        .appendTo(container);
                    var cell = $('<div/>')
                        .css({
                            display: 'table-cell',
                            width: '100%',
                            paddingRight: '8px'
                        })
                        .appendTo(table);
                    var input = $('<div data-role="codeinput" />') // TODO namespace???
                    // Note: _library is added to the data bound PageComponent in its init method
                        .attr($.extend({}, options.attributes, { 'data-bind': 'value: ' + options.field + ', source: _library' })) // TODO namespace???
                        .appendTo(cell);
                    // We need a temporary textbox to calculate the height and align the button
                    var temp = $('<input type="text" class="k-textbox">')
                        .css({ visibility: 'hidden' })
                        .appendTo(cell);
                    $('<button/>')
                        .text('...')
                        .addClass('k-button')
                        .css({
                            display: 'table-cell',
                            minWidth: '40px',
                            height: temp.css('height'), // $('input.k-textbox').last().css('height'),
                            margin: 0
                        })
                        .appendTo(table)
                        .on(CLICK, $.proxy(that.showDialog, that, options));
                    temp.remove();
                };
            },
            showDialog: function (options/*,evt*/) {
                var that = this;
                var dialog = that.getDialog();
                // Create viewModel (Cancel shall not save changes to main model)
                dialog.viewModel = kendo.observable({
                    code: options.model.get(options.field),
                    library: [CUSTOM].concat(that.library)
                });
                // Prepare UI
                dialog.title(options.title);
                var content = '<div class="k-edit-form-container">' + // TODO namespace???
                    '<div data-role="codeeditor" data-bind="value: code, source: library" data-default="' + that.defaultValue + '" data-solution="' + kendo.htmlEncode(JSON.stringify(options.model.get('properties.solution'))) + '"></div>' +
                    '<div class="k-edit-buttons k-state-default">' +
                    '<a class="k-primary k-button" data-command="ok" href="#">' + Tool.fn.i18n.dialogs.ok.text + '</a>' +
                    '<a class="k-button" data-command="cancel" href="#">' + Tool.fn.i18n.dialogs.cancel.text + '</a>' +
                    '</div></div>';
                dialog.content(content);
                kendo.bind(dialog.element, dialog.viewModel);
                dialog.element.addClass('no-padding');
                // Bind click handler for edit buttons
                dialog.element.on(CLICK, '.k-edit-buttons>.k-button', $.proxy(that.closeDialog, that, options, dialog));
                // Bind window activate handler
                dialog.bind('activate', function () {
                    // IMPORTANT, we need to refresh codemirror here
                    // otherwise the open animation messes with CodeMirror calculations
                    // and gutter and line numbers are displayed at the wrong coordinates
                    var codeEditor = dialog.element
                        .find('.kj-codeeditor')
                        .data('kendoCodeEditor');
                    if (codeEditor instanceof kendo.ui.CodeEditor && codeEditor.codeMirror && $.isFunction(codeEditor.codeMirror.refresh)) {
                        codeEditor.codeMirror.refresh();
                    }
                    dialog.unbind('activate');
                });
                // Show dialog
                dialog.center().open();
            },
            closeDialog: function (options, dialog, e) {
                var that = this;
                if (e instanceof $.Event && e.target instanceof window.HTMLElement) {
                    var command = $(e.target).attr(kendo.attr('command'));
                    if (command === 'ok') {
                        options.model.set(options.field, dialog.viewModel.get('code'));
                    }
                    dialog.close();
                }
            }
        });

        /*******************************************************************************************
         * Tool classes
         *******************************************************************************************/

        /**
         * @class Pointer tool
         * @type {void|*}
         */
        var Pointer = Tool.extend({
            id: POINTER,
            icon: 'mouse_pointer',
            description: i18n.pointer.description,
            cursor: CURSOR_DEFAULT,
            height: 0,
            width: 0,
            getHtmlContent: undefined
        });
        tools.register(Pointer);

        /**
         * Audio tool
         * @class Audio
         */
        var Audio = Tool.extend({
            id: 'audio',
            icon: 'loudspeaker3',
            description: i18n.audio.description,
            cursor: CURSOR_CROSSHAIR,
            templates: {
                default: '<div data-#= ns #role="mediaplayer" data-#= ns #mode="audio" data-#= ns #autoplay="#: attributes.autoplay #" data-#= ns #files="#: attributes.files$() #"></div>'
            },
            height: 100,
            width: 400,
            attributes: {
                autoplay: new adapters.BooleanAdapter({ title: i18n.audio.attributes.autoplay.title, defaultValue: false }),
                mp3: new adapters.AssetAdapter({ title: i18n.audio.attributes.mp3.title }),
                ogg: new adapters.AssetAdapter({ title: i18n.audio.attributes.ogg.title })
            },

            /**
             * Get Html or jQuery content
             * @method getHtmlContent
             * @param component
             * @param mode
             * @returns {*}
             */
            getHtmlContent: function (component, mode) {
                var that = this;
                assert.instanceof(Audio, that, kendo.format(assert.messages.instanceof.default, 'this', 'Audio'));
                assert.instanceof(PageComponent, component, kendo.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                assert.enum(Object.keys(kendo.ui.Stage.fn.modes), mode, kendo.format(assert.messages.enum.default, 'mode', Object.keys(kendo.ui.Stage.fn.modes)));
                assert.instanceof(ToolAssets, assets.audio, kendo.format(assert.messages.instanceof.default, 'assets.audio', 'kidoju.ToolAssets'));
                var template = kendo.template(that.templates.default);
                // The files$ function resolves urls with schemes like cdn://audio.mp3 and returns a stringified array
                component.attributes.files$ = function () {
                    var mp3 = component.attributes.get('mp3');
                    var ogg = component.attributes.get('ogg');
                    var schemes = assets.audio.schemes;
                    for (var scheme in schemes) {
                        if (schemes.hasOwnProperty(scheme)) {
                            var schemeRx = new RegExp('^' + scheme + '://');
                            if (schemeRx.test(mp3)) {
                                mp3 = mp3.replace(scheme + '://', schemes[scheme]);
                            }
                            if (schemeRx.test(ogg)) {
                                ogg = ogg.replace(scheme + '://', schemes[scheme]);
                            }
                        }
                    }
                    var files = [];
                    if (RX_HTTP_S.test(mp3)) {
                        files.push(mp3);
                    }
                    if (RX_HTTP_S.test(ogg)) {
                        files.push(ogg);
                    }
                    return JSON.stringify(files);
                };
                return template($.extend(component, { ns: kendo.ns }));
            },

            /**
             * onResize Event Handler
             * @method onResize
             * @param e
             * @param component
             */
            onResize: function (e, component) {
                var stageElement = $(e.currentTarget);
                assert.ok(stageElement.is(ELEMENT_CLASS), kendo.format('e.currentTarget is expected to be a stage element'));
                assert.instanceof(PageComponent, component, kendo.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                var content = stageElement.children('div' + kendo.roleSelector('mediaplayer'));
                var widget = content.data('kendoMediaPlayer');
                if ($.type(component.width) === NUMBER) {
                    content.outerWidth(component.width);
                }
                if ($.type(component.height) === NUMBER) {
                    content.outerHeight(component.height);
                }
                widget.resize();
                // prevent any side effect
                e.preventDefault();
                // prevent event to bubble on stage
                e.stopPropagation();
            },

            /**
             * Component validation
             * @param component
             * @param pageIdx
             */
            validate: function (component, pageIdx) {
                var ret = Tool.fn.validate.call(this, component, pageIdx);
                var description = this.description; // tool description
                var messages = this.i18n.messages;
                if (component.attributes) {
                    if (!RX_AUDIO.test(component.attributes.mp3)) {
                        ret.push({
                            type: ERROR,
                            index: pageIdx,
                            message: kendo.format(messages.invalidAudioFile, description, pageIdx + 1)
                        });
                    }
                    // Note: we are not testing for an ogg file
                }
                return ret;
            }

        });
        tools.register(Audio);

        var CHARGRID = '<div data-#= ns #role="chargrid" data-#= ns #scaler=".kj-stage" data-#= ns #container=".kj-stage>div[data-role=stage]" data-#= ns #columns="#: attributes.columns #" data-#= ns #rows="#: attributes.rows #" data-#= ns #blank="#: attributes.blank #" data-#= ns #whitelist="#: attributes.whitelist #" data-#= ns #grid-fill="#: attributes.gridFill #" data-#= ns #grid-stroke="#: attributes.gridStroke #" data-#= ns #blank-fill="#: attributes.gridStroke #" data-#= ns #selected-fill="#: attributes.selectedFill #" data-#= ns #locked-fill="#: attributes.lockedFill #" data-#= ns #locked-color="#: attributes.fontColor #" data-#= ns #value-color="#: attributes.fontColor #" {0}></div>';
        /**
         * @class CharGrid tool
         * @type {void|*}
         */
        var CharGrid = Tool.extend({
            id: 'chargrid',
            icon: 'dot_matrix',
            description: i18n.chargrid.description,
            cursor: CURSOR_CROSSHAIR,
            weight: 10,
            templates: {
                design: kendo.format(CHARGRID, 'data-#= ns #value="#: JSON.stringify(attributes.layout) #" data-#= ns #locked="#: JSON.stringify(attributes.layout) #" data-#= ns #enable="false"'),
                play: kendo.format(CHARGRID, 'data-#= ns #bind="value: #: properties.name #.value" data-#= ns #locked="#: JSON.stringify(attributes.layout) #"'),
                review: kendo.format(CHARGRID, 'data-#= ns #bind="value: #: properties.name #.value" data-#= ns #locked="#: JSON.stringify(attributes.layout) #" data-#= ns #enable="false"') + Tool.fn.showResult()
            },
            height: 400,
            width: 400,
            attributes: {
                columns: new adapters.NumberAdapter({ title: i18n.chargrid.attributes.columns.title, defaultValue: 9 }, { 'data-decimals': 0, 'data-format': 'n0', 'data-min': 1, 'data-max': 20 }),
                rows: new adapters.NumberAdapter({ title: i18n.chargrid.attributes.rows.title, defaultValue: 9 }, { 'data-decimals': 0, 'data-format': 'n0', 'data-min': 1, 'data-max': 20 }),
                blank: new adapters.StringAdapter({ title: i18n.chargrid.attributes.blank.title, defaultValue: '.' }),
                whitelist: new adapters.StringAdapter({ title: i18n.chargrid.attributes.whitelist.title, defaultValue: '1-9' }),
                layout: new adapters.CharGridAdapter({ title: i18n.chargrid.attributes.layout.title, defaultValue: null }),
                gridFill: new adapters.ColorAdapter({ title: i18n.chargrid.attributes.gridFill.title, defaultValue: '#ffffff' }),
                gridStroke: new adapters.ColorAdapter({ title: i18n.chargrid.attributes.gridStroke.title, defaultValue: '#000000' }),
                // blankFill = gridStroke
                selectedFill: new adapters.ColorAdapter({ title: i18n.chargrid.attributes.selectedFill.title, defaultValue: '#ffffcc' }),
                lockedFill: new adapters.ColorAdapter({ title: i18n.chargrid.attributes.lockedFill.title, defaultValue: '#e6e6e6' }),
                // lockedColor = valueColor = fontColor
                fontColor: new adapters.ColorAdapter({ title: i18n.chargrid.attributes.fontColor.title, defaultValue: '#9999b6' })
            },
            properties: {
                name: new adapters.NameAdapter({ title: i18n.chargrid.properties.name.title }),
                description: new adapters.DescriptionAdapter({ title: i18n.chargrid.properties.description.title }),
                solution: new adapters.CharGridAdapter({ title: i18n.chargrid.properties.solution.title }),
                validation: new adapters.ValidationAdapter({ title: i18n.chargrid.properties.validation.title }),
                success: new adapters.ScoreAdapter({ title: i18n.chargrid.properties.success.title, defaultValue: 1 }),
                failure: new adapters.ScoreAdapter({ title: i18n.chargrid.properties.failure.title, defaultValue: 0 }),
                omit: new adapters.ScoreAdapter({ title: i18n.chargrid.properties.omit.title, defaultValue: 0 })
            },

            /**
             * Improved display of value in score grid
             * @param value
             */
            value$: function (value) {
                // var ret = '<table>';
                var ret = '';
                if ($.isArray(value) || value instanceof ObservableArray) {
                    for (var r = 0, rowTotal = value.length; r < rowTotal; r++) {
                        var row = value[r];
                        // ret += '<tr>';
                        for (var c = 0, colTotal = row.length; c < colTotal; c++) {
                            // ret += '<td>' + kendo.htmlEncode(row[c] || '') + '</td>';
                            ret += kendo.htmlEncode(row[c] || '') + (c === colTotal - 1 ? '' : ',');
                        }
                        // ret += '</tr>';
                        ret += '<br/>';
                    }
                }
                // ret += '</table>';
                return ret;
            },

            /**
             * Improved display of solution in score grid
             * @param solution
             */
            solution$: function (solution) {
                // var ret = '<table>';
                var ret = '';
                if ($.isArray(solution) || solution instanceof ObservableArray) {
                    for (var r = 0, rowTotal = solution.length; r < rowTotal; r++) {
                        var row = solution[r];
                        // ret += '<tr>';
                        for (var c = 0, colTotal = row.length; c < colTotal; c++) {
                            // ret += '<td>' + kendo.htmlEncode(row[c] || '') + '</td>';
                            ret += kendo.htmlEncode(row[c] || '') + (c === colTotal - 1 ? '' : ',');
                        }
                        // ret += '</tr>';
                        ret += '<br/>';
                    }
                }
                // ret += '</table>';
                return ret;
            },

            /**
             * onResize Event Handler
             * @method onResize
             * @param e
             * @param component
             */
            onResize: function (e, component) {
                var stageElement = $(e.currentTarget);
                assert.ok(stageElement.is(ELEMENT_CLASS), kendo.format('e.currentTarget is expected to be a stage element'));
                assert.instanceof(PageComponent, component, kendo.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                var content = stageElement.children('div.kj-chargrid');
                if ($.type(component.width) === NUMBER) {
                    content.outerWidth(component.width);
                }
                if ($.type(component.height) === NUMBER) {
                    content.outerHeight(component.height);
                }
                // Redraw the charGrid widget
                var charGridWidget = content.data('kendoCharGrid');
                assert.instanceof(kendo.ui.CharGrid, charGridWidget, kendo.format(assert.messages.instanceof.default, 'charGridWidget', 'kendo.ui.CharGrid'));
                charGridWidget.refresh();
                // prevent any side effect
                e.preventDefault();
                // prevent event to bubble on stage
                e.stopPropagation();
            }

        });
        tools.register(CharGrid);

        var CHECKBOX = '<div data-#= ns #role="multicheckbox" {0} data-#= ns #source="#: JSON.stringify(attributes.data.trim().split(\'\\n\')) #" style="#: attributes.groupStyle #" data-#= ns #item-style="#: attributes.itemStyle #" data-#= ns #selected-style="#: attributes.selectedStyle #"></div>';
        /**
         * Checkbox tool
         * @class CheckBox
         * @type {void|*}
         */
        var CheckBox = Tool.extend({
            id: 'checkbox',
            icon: 'checkbox',
            description: i18n.checkbox.description,
            cursor: CURSOR_CROSSHAIR,
            weight: 1,
            templates: {
                design: kendo.format(CHECKBOX, 'data-#= ns #enable="false"'),
                play: kendo.format(CHECKBOX, 'data-#= ns #bind="value: #: properties.name #.value"'),
                review: kendo.format(CHECKBOX, 'data-#= ns #bind="value: #: properties.name #.value" data-#= ns #enable="false"') + Tool.fn.showResult()
            },
            height: 200,
            width: 350,
            attributes: {
                groupStyle: new adapters.StyleAdapter({ title: i18n.checkbox.attributes.groupStyle.title, defaultValue: 'font-size: 60px;' }),
                itemStyle: new adapters.StyleAdapter({ title: i18n.checkbox.attributes.itemStyle.title }),
                selectedStyle: new adapters.StyleAdapter({ title: i18n.checkbox.attributes.selectedStyle.title }),
                data: new adapters.TextAdapter(
                    { title: i18n.checkbox.attributes.data.title, defaultValue: i18n.checkbox.attributes.data.defaultValue },
                    { rows: 4, style: 'resize:vertical; width: 100%;' }
                )
            },
            properties: {
                name: new adapters.NameAdapter({ title: i18n.checkbox.properties.name.title }),
                description: new adapters.DescriptionAdapter({ title: i18n.checkbox.properties.description.title }),
                solution: new adapters.StringArrayAdapter({ title: i18n.checkbox.properties.solution.title }),
                validation: new adapters.ValidationAdapter({ title: i18n.checkbox.properties.validation.title }),
                success: new adapters.ScoreAdapter({ title: i18n.checkbox.properties.success.title, defaultValue: 1 }),
                failure: new adapters.ScoreAdapter({ title: i18n.checkbox.properties.failure.title, defaultValue: 0 }),
                omit: new adapters.ScoreAdapter({ title: i18n.checkbox.properties.omit.title, defaultValue: 0 })
            },

            /**
             * Improved display of value in score grid
             * @param value
             */
            value$: function (value) {
                var ret = (value || []).slice();
                for (var i = 0; i < ret.length; i++) {
                    ret[i] = kendo.htmlEncode(ret[i]);
                }
                return ret.join('<br/>');
            },

            /**
             * Improved display of solution in score grid
             * @param solution
             */
            solution$: function (solution) {
                return kendo.htmlEncode(solution || '').split('\n').join('<br/>');
            },

            /**
             * onResize Event Handler
             * @method onResize
             * @param e
             * @param component
             */
            onResize: function (e, component) {
                var stageElement = $(e.currentTarget);
                assert.ok(stageElement.is(ELEMENT_CLASS), kendo.format('e.currentTarget is expected to be a stage element'));
                assert.instanceof(PageComponent, component, kendo.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                var content = stageElement.children('div').first();
                if ($.type(component.width) === NUMBER) {
                    content.outerWidth(component.width);
                }
                if ($.type(component.height) === NUMBER) {
                    content.outerHeight(component.height);
                    // if (component.attributes && !RX_FONT_SIZE.test(component.attributes.style)) {
                    //     content.css('font-size', Math.floor(0.85 * content.height()));
                    // }
                }
                // prevent any side effect
                e.preventDefault();
                // prevent event to bubble on stage
                e.stopPropagation();
            },

            /**
             * Component validation
             * @param component
             * @param pageIdx
             */
            validate: function (component, pageIdx) {
                var ret = Tool.fn.validate.call(this, component, pageIdx);
                var description = this.description; // tool description
                var messages = this.i18n.messages;
                if (component.attributes) {
                    if ((component.attributes.groupStyle && !RX_STYLE.test(component.attributes.groupStyle)) ||
                        (component.attributes.itemStyle && !RX_STYLE.test(component.attributes.itemStyle)) ||
                        (component.attributes.selectedStyle && !RX_STYLE.test(component.attributes.selectedStyle))) {
                        ret.push({
                            type: ERROR,
                            index: pageIdx,
                            message: kendo.format(messages.invalidStyle, description, pageIdx + 1)
                        });
                    }
                    if (!RX_DATA.test(component.attributes.data)) {
                        ret.push({
                            type: ERROR,
                            index: pageIdx,
                            message: kendo.format(messages.invalidData, description, pageIdx + 1)
                        });
                    }
                }
                return ret;
            }

        });
        tools.register(CheckBox);

        var CONNECTOR = '<div data-#= ns #role="connector" data-#= ns #id="#: properties.name #" data-#= ns #target-value="#: properties.solution #" data-#= ns #scaler=".kj-stage" data-#= ns #container=".kj-stage>div[data-#= ns #role=stage]" data-#= ns #color="#: attributes.color #" {0}></div>';
        /**
         * @class Connector tool
         * @type {void|*}
         */
        var Connector = Tool.extend({
            id: 'connector',
            icon: 'target',
            description: i18n.connector.description,
            cursor: CURSOR_CROSSHAIR,
            weight: 0.25,
            templates: {
                design: kendo.format(CONNECTOR, 'data-#= ns #enable="false" data-#= ns #has-surface="false"'),
                play: kendo.format(CONNECTOR, 'data-#= ns #bind="value: #: properties.name #.value, source: connections"'),
                review: kendo.format(CONNECTOR, 'data-#= ns #bind="value: #: properties.name #.value, source: connections" data-#= ns #enable="false"') + Tool.fn.showResult()
            },
            height: 70,
            width: 70,
            attributes: {
                color: new adapters.ColorAdapter({ title: i18n.connector.attributes.color.title, defaultValue: '#FF0000' })
            },
            properties: {
                name: new adapters.NameAdapter({ title: i18n.connector.properties.name.title }),
                description: new adapters.DescriptionAdapter({ title: i18n.connector.properties.description.title }),
                solution: new adapters.ConnectorAdapter({ title: i18n.connector.properties.solution.title }),
                validation: new adapters.ValidationAdapter({ title: i18n.connector.properties.validation.title }),
                success: new adapters.ScoreAdapter({ title: i18n.connector.properties.success.title, defaultValue: 0.5 }),
                failure: new adapters.ScoreAdapter({ title: i18n.connector.properties.failure.title, defaultValue: 0 }),
                omit: new adapters.ScoreAdapter({ title: i18n.connector.properties.omit.title, defaultValue: 0 })
            },

            /**
             * onResize Event Handler
             * @method onResize
             * @param e
             * @param component
             */
            onResize: function (e, component) {
                var stageElement = $(e.currentTarget);
                assert.ok(stageElement.is(ELEMENT_CLASS), kendo.format('e.currentTarget is expected to be a stage element'));
                assert.instanceof(PageComponent, component, kendo.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                var content = stageElement.children('div[' + kendo.attr('role') + '="connector"]');
                if ($.type(component.width) === NUMBER) {
                    content.outerWidth(component.width);
                }
                if ($.type(component.height) === NUMBER) {
                    content.outerHeight(component.height);
                }
                // Redraw the connector widget
                var connectorWidget = content.data('kendoConnector');
                assert.instanceof(kendo.ui.Connector, connectorWidget, kendo.format(assert.messages.instanceof.default, 'connectorWidget', 'kendo.ui.Connector'));
                connectorWidget._drawConnector();

                // prevent any side effect
                e.preventDefault();
                // prevent event to bubble on stage
                e.stopPropagation();
            },

            /**
             * Component validation
             * @param component
             * @param pageIdx
             */
            validate: function (component, pageIdx) {
                var ret = Tool.fn.validate.call(this, component, pageIdx);
                var description = this.description; // tool description
                var messages = this.i18n.messages;
                if (component.attributes) {
                    if (component.attributes.color && !RX_COLOR.test(component.attributes.color)) {
                        ret.push({
                            type: WARNING,
                            index: pageIdx,
                            message: kendo.format(messages.invalidColor, description, pageIdx + 1)
                        });
                    }
                }
                return ret;
            }

        });
        tools.register(Connector);

        var DROPZONE = '<div id="#: properties.name #" data-#= ns #role="dropzone" data-#= ns #scaler=".kj-stage" data-#= ns #container=".kj-stage>div[data-role=stage]" data-#= ns #draggable=".kj-element:has([data-draggable=true])" style="#: attributes.style #" {0}><div>#: attributes.text #</div></div>';
        /**
         * @class Connector tool
         * @type {void|*}
         */
        var DropZone = Tool.extend({
            id: 'dropzone',
            icon: 'elements_selection',
            description: i18n.dropzone.description,
            cursor: CURSOR_CROSSHAIR,
            weight: 1,
            templates: {
                design: kendo.format(DROPZONE, 'data-#= ns #enable="false"'),
                play: kendo.format(DROPZONE, 'data-#= ns #bind="value: #: properties.name #.value, source: draggables"'),
                review: kendo.format(DROPZONE, 'data-#= ns #bind="value: #: properties.name #.value, source: draggables" data-#= ns #enable="false"') + Tool.fn.showResult()
            },
            height: 250,
            width: 250,
            attributes: {
                text: new adapters.StringAdapter({ title: i18n.dropzone.attributes.text.title, defaultValue: i18n.dropzone.attributes.text.defaultValue }),
                style: new adapters.StyleAdapter({ title: i18n.dropzone.attributes.style.title, defaultValue: 'font-size: 30px; border: dashed 3px #e1e1e1;' })
            },
            properties: {
                name: new adapters.NameAdapter({ title: i18n.dropzone.properties.name.title }),
                description: new adapters.DescriptionAdapter({ title: i18n.dropzone.properties.description.title }),
                solution: new adapters.StringArrayAdapter({ title: i18n.dropzone.properties.solution.title }),
                validation: new adapters.ValidationAdapter({ title: i18n.dropzone.properties.validation.title }),
                success: new adapters.ScoreAdapter({ title: i18n.dropzone.properties.success.title, defaultValue: 1 }),
                failure: new adapters.ScoreAdapter({ title: i18n.dropzone.properties.failure.title, defaultValue: 0 }),
                omit: new adapters.ScoreAdapter({ title: i18n.dropzone.properties.omit.title, defaultValue: 0 })
            },

            /**
             * Improved display of value in score grid
             * @param value
             */
            value$: function (value) {
                var ret = (value || []).slice();
                for (var i = 0; i < ret.length; i++) {
                    ret[i] = kendo.htmlEncode(ret[i]);
                }
                return ret.join('<br/>');
            },

            /**
             * Improved display of solution in score grid
             * @param solution
             */
            solution$: function (solution) {
                return kendo.htmlEncode(solution || '').split('\n').join('<br/>');
            },

            /**
             * onResize Event Handler
             * @method onResize
             * @param e
             * @param component
             */
            onResize: function (e, component) {
                var stageElement = $(e.currentTarget);
                assert.ok(stageElement.is(ELEMENT_CLASS), kendo.format('e.currentTarget is expected to be a stage element'));
                assert.instanceof(PageComponent, component, kendo.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                var content = stageElement.children('div');
                if ($.type(component.width) === NUMBER) {
                    content.outerWidth(component.width);
                }
                if ($.type(component.height) === NUMBER) {
                    content.outerHeight(component.height);
                }
                // prevent any side effect
                e.preventDefault();
                // prevent event to bubble on stage
                e.stopPropagation();
            },

            /**
             * Component validation
             * @param component
             * @param pageIdx
             */
            validate: function (component, pageIdx) {
                var ret = Tool.fn.validate.call(this, component, pageIdx);
                var description = this.description; // tool description
                var messages = this.i18n.messages;
                if (component.attributes) {
                    // Note: any text is acceptable
                    if (component.attributes.style && !RX_STYLE.test(component.attributes.style)) {
                        ret.push({
                            type: ERROR,
                            index: pageIdx,
                            message: kendo.format(messages.invalidStyle, description, pageIdx + 1)
                        });
                    }
                }
                return ret;
            }

        });
        tools.register(DropZone);

        /**
         * @class Image tool
         * @type {void|*}
         */
        var Image = Tool.extend({
            id: 'image',
            icon: 'painting_landscape',
            description: i18n.image.description,
            cursor: CURSOR_CROSSHAIR,
            templates: {
                default: '<img src="#: attributes.src$() #" alt="#: attributes.alt #" style="#: attributes.style #" data-#= ns #id="#: properties.id$() #" data-#= ns #draggable="#: properties.draggable #" data-#= ns #drop-value="#: properties.dropValue #">'
            },
            height: 250,
            width: 250,
            attributes: {
                alt: new adapters.StringAdapter({ title: i18n.image.attributes.alt.title, defaultValue: i18n.image.attributes.alt.defaultValue }),
                src: new adapters.AssetAdapter({ title: i18n.image.attributes.src.title, defaultValue: i18n.image.attributes.src.defaultValue }),
                style: new adapters.StyleAdapter({ title: i18n.image.attributes.style.title })
            },
            properties: {
                draggable: new adapters.BooleanAdapter({ title: i18n.image.properties.draggable.title, defaultValue: false }),
                dropValue: new adapters.StringAdapter({ title: i18n.image.properties.dropValue.title })
            },

            /**
             * Get Html or jQuery content
             * @method getHtmlContent
             * @param component
             * @param mode
             * @returns {*}
             */
            getHtmlContent: function (component, mode) {
                var that = this;
                assert.instanceof(Image, that, kendo.format(assert.messages.instanceof.default, 'this', 'Image'));
                assert.instanceof(PageComponent, component, kendo.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                assert.enum(Object.keys(kendo.ui.Stage.fn.modes), mode, kendo.format(assert.messages.enum.default, 'mode', Object.keys(kendo.ui.Stage.fn.modes)));
                assert.instanceof(ToolAssets, assets.image, kendo.format(assert.messages.instanceof.default, 'assets.image', 'kidoju.ToolAssets'));
                var template = kendo.template(that.templates.default);
                // The src$ function resolves urls with schemes like cdn://sample.jpg
                component.attributes.src$ = function () {
                    var src = component.attributes.get('src');
                    var schemes = assets.image.schemes;
                    for (var scheme in schemes) {
                        if (schemes.hasOwnProperty(scheme) && (new RegExp('^' + scheme + '://')).test(src)) {
                            src = src.replace(scheme + '://', schemes[scheme]);
                            break;
                        }
                    }
                    return src;
                };
                // The id$ function returns the component id for draggable components
                component.properties.id$ = function () {
                    return component.properties.draggable && $.type(component.id) === STRING && component.id.length ? component.id : '';
                };
                return template($.extend(component, { ns: kendo.ns }));
            },

            /**
             * onResize Event Handler
             * @method onResize
             * @param e
             * @param component
             */
            onResize: function (e, component) {
                var stageElement = $(e.currentTarget);
                assert.ok(stageElement.is(ELEMENT_CLASS), kendo.format('e.currentTarget is expected to be a stage element'));
                assert.instanceof(PageComponent, component, kendo.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                var content = stageElement.children('img');
                // Assuming we can get the natural size of the image, we shall keep proportions
                var naturalHeight = content[0].naturalHeight;
                var naturalWidth = content[0].naturalWidth;
                if (naturalHeight && naturalWidth) {
                    var height = component.get('height');
                    var width = component.get('width');
                    var rectLimitedByHeight = {
                        height: Math.round(height),
                        width: Math.round(height * naturalWidth / naturalHeight)
                    };
                    /*
                     // Note: comparing rectLimitedByHeight and rectLimitedByWidth does not work because
                     // we are using the component size and not the mouse position
                     // therefore, we can only reduce the size proportionnaly, not increase it
                     var rectLimitedByWidth = {
                     height: Math.round(width * naturalHeight / naturalWidth),
                     width: Math.round(width)
                     };
                     // if (rectLimitedByHeight.height * rectLimitedByHeight.width <= rectLimitedByWidth.height * rectLimitedByWidth.width) {
                     if (rectLimitedByHeight.width <= width) {
                     */
                    if (height !== rectLimitedByHeight.height) { // avoids a stack overflow
                        component.set('height', rectLimitedByHeight.height);
                    }
                    if (width !== rectLimitedByHeight.width) { // avoids a stack overflow
                        component.set('width', rectLimitedByHeight.width);
                    }
                    /*
                     } else if(rectLimitedByWidth.height <= height) {
                     if (height !== rectLimitedByWidth.height) {
                     component.set('height', rectLimitedByWidth.height);
                     }
                     if (width !== rectLimitedByWidth.width) {
                     component.set('width', rectLimitedByWidth.width);
                     }
                     }
                     */
                }
                // Set content size
                content.outerHeight(component.get('height') - content.outerHeight(true) + content.outerHeight());
                content.outerWidth(component.get('width') - content.outerWidth(true) + content.outerWidth());
                // prevent any side effect
                e.preventDefault();
                // prevent event to bubble on stage
                e.stopPropagation();
            },

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * Component validation
             * @param component
             * @param pageIdx
             */
            validate: function (component, pageIdx) {
                /* jshint maxcomplexity: 8 */
                var ret = Tool.fn.validate.call(this, component, pageIdx);
                var description = this.description; // tool description
                var messages = this.i18n.messages;
                if (component.attributes) {
                    if ((component.attributes.alt === i18n.image.attributes.alt.defaultValue) || !RX_TEXT.test(component.attributes.alt)) {
                        ret.push({
                            type: WARNING,
                            index: pageIdx,
                            message: kendo.format(messages.invalidAltText, description, pageIdx + 1)
                        });
                    }
                    if ((component.attributes.src === i18n.image.attributes.src.defaultValue) || !RX_IMAGE.test(component.attributes.src)) {
                        ret.push({
                            type: (component.attributes.src === i18n.image.attributes.src.defaultValue) ? WARNING : ERROR,
                            index: pageIdx,
                            message: kendo.format(messages.invalidImageFile, description, pageIdx + 1)
                        });
                    }
                    if (component.attributes.style && !RX_STYLE.test(component.attributes.style)) {
                        ret.push({
                            type: ERROR,
                            index: pageIdx,
                            message: kendo.format(messages.invalidStyle, description, pageIdx + 1)
                        });
                    }
                }
                return ret;
            }

            /* jshint +W074 */

        });
        tools.register(Image);

        /**
         * @class Label tool
         * @type {void|*}
         */
        var Label = Tool.extend({
            id: 'label',
            icon: 'font',
            description: i18n.label.description,
            cursor: CURSOR_CROSSHAIR,
            templates: {
                default: '<div style="#: attributes.style #" data-#= ns #id="#: properties.id$() #" data-#= ns #draggable="#: properties.draggable #" data-#= ns #drop-value="#: properties.dropValue #">#= (kendo.htmlEncode(attributes.text) || "").replace(/\\n/g, "<br/>") #</div>'
            },
            height: 80,
            width: 300,
            attributes: {
                // text: new adapters.StringAdapter({ title: i18n.label.attributes.text.title, defaultValue: i18n.label.attributes.text.defaultValue }),
                text: new adapters.TextAdapter(
                    { title:i18n.label.attributes.text.title, defaultValue: i18n.label.attributes.text.defaultValue },
                    { rows: 2, style: 'resize:vertical; width: 100%;' }
                ),
                style: new adapters.StyleAdapter({ title: i18n.label.attributes.style.title, defaultValue: 'font-size: 60px;' })
            },
            properties: {
                draggable: new adapters.BooleanAdapter({ title: i18n.label.properties.draggable.title, defaultValue: false }),
                dropValue: new adapters.StringAdapter({ title: i18n.label.properties.dropValue.title })
            },

            /**
             * Get Html or jQuery content
             * @method getHtmlContent
             * @param component
             * @param mode
             * @returns {*}
             */
            getHtmlContent: function (component, mode) {
                var that = this;
                assert.instanceof(Label, that, kendo.format(assert.messages.instanceof.default, 'this', 'Label'));
                assert.instanceof(PageComponent, component, kendo.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                assert.enum(Object.keys(kendo.ui.Stage.fn.modes), mode, kendo.format(assert.messages.enum.default, 'mode', Object.keys(kendo.ui.Stage.fn.modes)));
                var template = kendo.template(that.templates.default);
                // The id$ function returns the component id for draggable components
                component.properties.id$ = function () {
                    return component.properties.draggable && $.type(component.id) === STRING && component.id.length ? component.id : '';
                };
                return template($.extend(component, { ns: kendo.ns }));
            },

            /**
             * onResize Event Handler
             * @method onResize
             * @param e
             * @param component
             */
            onResize: function (e, component) {
                var stageElement = $(e.currentTarget);
                assert.ok(stageElement.is(ELEMENT_CLASS), kendo.format('e.currentTarget is expected to be a stage element'));
                assert.instanceof(PageComponent, component, kendo.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                var content = stageElement.children('div');
                if ($.type(component.width) === NUMBER) {
                    content.outerWidth(component.width - content.outerWidth(true) + content.outerWidth());
                }
                if ($.type(component.height) === NUMBER) {
                    content.outerHeight(component.height - content.outerHeight(true) + content.outerHeight());
                    // if (component.attributes && !RX_FONT_SIZE.test(component.attributes.style)) {
                    /*
                     * We make a best guess for the number of lines as follows
                     * Let's suppose the height (line-height, not font-size) and width of a character are respectively y and x
                     * We have y = x * sizeRatio
                     * How many of these character rectangles (x, y) can we fit in the content div (width, height)?
                     *
                     * the label only takes 1 line, if we have:
                     * y = height and length <= width/x, that is length <= width*sizeRatio/y or y = height <= length*sizeRatio/width, which is length >= width*sizeRatio/height
                     *
                     * the label takes 2 lines, if we have:
                     * y = height/2 and length <= width/x, that is length <= 2*width*sizeRatio/y or y = height/2 <= length*sizeRatio/width, which is length >= 4*width*sizeRatio/height
                     *
                     * the label takes n lines if we have sqrt((length*height)/sizeRatio*width) <= lines < sqrt(((length + 1)*height)/sizeRatio*width)
                     *
                     */
                    // var length = component.attributes.text.length;
                    // var sizeRatio = 1.6; // font-size being the height, this is the line-height/char-width ratio
                    // var lines = Math.max(1, Math.floor(Math.sqrt((length * component.height) / (width * sizeRatio))));
                    // We can now make a best guess for the font size
                    // var fontRatio = 1.2; // this is the line-height/font-size ration
                    // content.css('font-size', Math.floor(component.height / lines / fontRatio));
                    // Note: in previous versions, we have tried to iterate through a hidden clone
                    // to find that font size that does not trigger an overflow but it is too slow
                    // }
                }
                // prevent any side effect
                e.preventDefault();
                // prevent event to bubble on stage
                e.stopPropagation();
            },

            /**
             * Component validation
             * @param component
             * @param pageIdx
             */
            validate: function (component, pageIdx) {
                var ret = Tool.fn.validate.call(this, component, pageIdx);
                var description = this.description; // tool description
                var messages = this.i18n.messages;
                if (component.attributes) {
                    if ((component.attributes.text === i18n.label.attributes.text.defaultValue) || !RX_TEXT.test(component.attributes.text)) {
                        ret.push({
                            type: WARNING,
                            index: pageIdx,
                            message: kendo.format(messages.invalidText, description, pageIdx + 1)
                        });
                    }
                    if (component.attributes.style && !RX_STYLE.test(component.attributes.style)) {
                        // TODO: test small font-size incompatible with mobile devices
                        ret.push({
                            type: ERROR,
                            index: pageIdx,
                            message: kendo.format(messages.invalidStyle, description, pageIdx + 1)
                        });
                    }
                }
                return ret;
            }

        });
        tools.register(Label);

        /**
         * @class MathExpression tool
         * @type {void|*}
         */
        var MathExpression = Tool.extend({
            id: 'mathexpression',
            icon: 'formula',
            description: i18n.mathexpression.description,
            cursor: CURSOR_CROSSHAIR,
            templates: {
                default: '<div data-#= ns #role="mathexpression" style="#: attributes.style #" data-#= ns #value="#: attributes.formula #"></div>'
            },
            height: 150,
            width: 480,
            attributes: {
                formula: new adapters.TextAdapter(
                    { title: i18n.mathexpression.attributes.formula.title, defaultValue: i18n.mathexpression.attributes.formula.defaultValue },
                    { rows: 4, style: 'resize:vertical; width: 100%;' }
                ),
                style: new adapters.StyleAdapter({ title: i18n.mathexpression.attributes.style.title, defaultValue: 'font-size: 40px;' })
            },

            /**
             * onResize Event Handler
             * @method onResize
             * @param e
             * @param component
             */
            onResize: function (e, component) {
                var stageElement = $(e.currentTarget);
                assert.ok(stageElement.is(ELEMENT_CLASS), kendo.format('e.currentTarget is expected to be a stage element'));
                assert.instanceof(PageComponent, component, kendo.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                var content = stageElement.children('div');
                if ($.type(component.width) === NUMBER) {
                    content.outerWidth(component.width - content.outerWidth(true) + content.outerWidth());
                }
                if ($.type(component.height) === NUMBER) {
                    content.outerHeight(component.height - content.outerHeight(true) + content.outerHeight());
                }
                // prevent any side effect
                e.preventDefault();
                // prevent event to bubble on stage
                e.stopPropagation();
            },

            /**
             * Component validation
             * @param component
             * @param pageIdx
             */
            validate: function (component, pageIdx) {
                var ret = Tool.fn.validate.call(this, component, pageIdx);
                var description = this.description; // tool description
                var messages = this.i18n.messages;
                if (component.attributes) {
                    if ((component.attributes.formula === i18n.mathexpression.attributes.formula.defaultValue) || !RX_FORMULA.test(component.attributes.formula)) {
                        // TODO: improve RX_FORMULA
                        ret.push({
                            type: WARNING,
                            index: pageIdx,
                            message: kendo.format(messages.invalidFormula, description, pageIdx + 1)
                        });
                    }
                    if (component.attributes.style && !RX_STYLE.test(component.attributes.style)) {
                        ret.push({
                            type: ERROR,
                            index: pageIdx,
                            message: kendo.format(messages.invalidStyle, description, pageIdx + 1)
                        });
                    }
                }
                return ret;
            }

        });
        tools.register(MathExpression);

        var QUIZ = '<div data-#= ns #role="quiz" data-#= ns #mode="#: attributes.mode #" {0} data-#= ns #source="#: JSON.stringify(attributes.data.trim().split(\'\\n\')) #" style="#: attributes.groupStyle #" data-#= ns #item-style="#: attributes.itemStyle #" data-#= ns #selected-style="#: attributes.selectedStyle #"></div>';
        /**
         * Quiz tool
         * @class Quiz
         * @type {void|*}
         */
        var Quiz = Tool.extend({
            id: 'quiz',
            icon: 'radio_button_group',
            description: i18n.quiz.description,
            cursor: CURSOR_CROSSHAIR,
            weight: 1,
            templates: {
                design: kendo.format(QUIZ, 'data-#= ns #enable="false"'),
                play: kendo.format(QUIZ, 'data-#= ns #bind="value: #: properties.name #.value"'),
                review: kendo.format(QUIZ, 'data-#= ns #bind="value: #: properties.name #.value" data-#= ns #enable="false"') + Tool.fn.showResult()
            },
            height: 200,
            width: 350,
            attributes: {
                mode: new adapters.EnumAdapter(
                    { title: i18n.quiz.attributes.mode.title, defaultValue: 'button', enum: ['button', 'dropdown', 'radio'] },
                    { style: 'width: 100%;' }
                ),
                groupStyle: new adapters.StyleAdapter({ title: i18n.quiz.attributes.groupStyle.title, defaultValue: 'font-size: 60px;' }),
                itemStyle: new adapters.StyleAdapter({ title: i18n.quiz.attributes.itemStyle.title }),
                selectedStyle: new adapters.StyleAdapter({ title: i18n.quiz.attributes.selectedStyle.title }),
                data: new adapters.TextAdapter(
                    { title: i18n.quiz.attributes.data.title, defaultValue: i18n.quiz.attributes.data.defaultValue },
                    { rows: 4, style: 'resize:vertical; width: 100%;' }
                )
            },
            properties: {
                name: new adapters.NameAdapter({ title: i18n.quiz.properties.name.title }),
                description: new adapters.DescriptionAdapter({ title: i18n.quiz.properties.description.title }),
                solution: new adapters.QuizAdapter({ title: i18n.quiz.properties.solution.title }),
                validation: new adapters.ValidationAdapter({ title: i18n.quiz.properties.validation.title }),
                success: new adapters.ScoreAdapter({ title: i18n.quiz.properties.success.title, defaultValue: 1 }),
                failure: new adapters.ScoreAdapter({ title: i18n.quiz.properties.failure.title, defaultValue: 0 }),
                omit: new adapters.ScoreAdapter({ title: i18n.quiz.properties.omit.title, defaultValue: 0 })
            },

            /* This function's cyclomatic complexity is too high. */
            /* jshint -W074 */

            /**
             * onResize Event Handler
             * @method onResize
             * @param e
             * @param component
             */
            onResize: function (e, component) {
                /* jshint maxcomplexity: 8 */
                var stageElement = $(e.currentTarget);
                assert.ok(stageElement.is(ELEMENT_CLASS), kendo.format('e.currentTarget is expected to be a stage element'));
                assert.instanceof(PageComponent, component, kendo.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                var content = stageElement.children('div' + kendo.roleSelector('quiz'));
                if ($.type(component.width) === NUMBER) {
                    content.outerWidth(component.width);
                }
                if ($.type(component.height) === NUMBER) {
                    content.outerHeight(component.height);
                }
                /*
                 // Auto-resize algorithm is not great so let's wait until we find a better solution
                 var data = component.attributes.data;
                 var length = data.trim().split('\n').length || 1;
                 switch (component.attributes.mode) {
                 case 'button':
                 content.css('font-size', Math.floor(0.57 * component.height));
                 break;
                 case 'dropdown':
                 content.css('font-size', Math.floor(0.5 * component.height));
                 break;
                 case 'radio':
                 var h = component.height / (length || 1);
                 content.css('font-size', Math.floor(0.9 * h));
                 content.find('input')
                 .height(0.6 * h)
                 .width(0.6 * h);
                 break;
                 }
                 */
                // prevent any side effect
                e.preventDefault();
                // prevent event to bubble on stage
                e.stopPropagation();
            },

            /* jshint +W074 */

            /**
             * Component validation
             * @param component
             * @param pageIdx
             */
            validate: function (component, pageIdx) {
                var ret = Tool.fn.validate.call(this, component, pageIdx);
                var description = this.description; // tool description
                var messages = this.i18n.messages;
                if (component.attributes) {
                    if ((component.attributes.groupStyle && !RX_STYLE.test(component.attributes.groupStyle)) ||
                        (component.attributes.itemStyle && !RX_STYLE.test(component.attributes.itemStyle)) ||
                        (component.attributes.selectedStyle && !RX_STYLE.test(component.attributes.selectedStyle))) {
                        ret.push({
                            type: ERROR,
                            index: pageIdx,
                            message: kendo.format(messages.invalidStyle, description, pageIdx + 1)
                        });
                    }
                    if (!RX_DATA.test(component.attributes.data)) {
                        ret.push({
                            type: ERROR,
                            index: pageIdx,
                            message: kendo.format(messages.invalidData, description, pageIdx + 1)
                        });
                    }
                }
                return ret;
            }

        });
        tools.register(Quiz);

        /**
         * @class Static table tool
         * @type {void|*}
         */
        var Table = Tool.extend({
            id: 'table',
            icon: 'table',
            description: i18n.table.description,
            cursor: CURSOR_CROSSHAIR,
            weight: 2,
            templates: {
                default: '<div data-#= ns #role="table" style="#: attributes.style #" data-#= ns #columns="#: attributes.columns #" data-#= ns #rows="#: attributes.rows #" data-#= ns #value="#: JSON.stringify(attributes.data) #"></div>'
            },
            height: 300,
            width: 500,
            attributes: {
                columns: new adapters.NumberAdapter({ title: i18n.table.attributes.columns.title, defaultValue: 4 }, { 'data-decimals': 0, 'data-format': 'n0', 'data-min': 1, 'data-max': 20 }),
                rows: new adapters.NumberAdapter({ title: i18n.table.attributes.rows.title, defaultValue: 6 }, { 'data-decimals': 0, 'data-format': 'n0', 'data-min': 1, 'data-max': 20 }),
                data: new adapters.SpreadsheetAdapter({ title: i18n.table.attributes.data.title, defaultValue: [{}] }),
                style: new adapters.StyleAdapter({ title: i18n.table.attributes.style.title })
            },

            /**
             * onResize Event Handler
             * @method onResize
             * @param e
             * @param component
             */
            onResize: function (e, component) {
                var stageElement = $(e.currentTarget);
                assert.ok(stageElement.is(ELEMENT_CLASS), kendo.format('e.currentTarget is expected to be a stage element'));
                assert.instanceof(PageComponent, component, kendo.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                var content = stageElement.children(kendo.roleSelector('table'));
                if ($.type(component.width) === NUMBER) {
                    content.outerWidth(component.width - content.outerWidth(true) + content.outerWidth());
                }
                if ($.type(component.height) === NUMBER) {
                    content.outerHeight(component.height - content.outerHeight(true) + content.outerHeight());
                }
                // prevent any side effect
                e.preventDefault();
                // prevent event to bubble on stage
                e.stopPropagation();
            },

            /**
             * Component validation
             * @param component
             * @param pageIdx
             */
            validate: function (component, pageIdx) {
                var ret = Tool.fn.validate.call(this, component, pageIdx);
                var description = this.description; // tool description
                var messages = this.i18n.messages;
                if (component.attributes) {
                    if ((component.attributes.style && !RX_STYLE.test(component.attributes.style))) {
                        ret.push({
                            type: ERROR,
                            index: pageIdx,
                            message: kendo.format(messages.invalidStyle, description, pageIdx + 1)
                        });
                    }
                }
                return ret;
            }

        });
        tools.register(Table);

        var TEXTAREA = '<textarea id="#: properties.name #" class="k-textbox" style="#: attributes.style #" {0}></textarea>';
        /**
         * @class Textarea tool
         * @type {void|*}
         */
        var Textarea = Tool.extend({
            id: 'textarea',
            icon: 'document_orientation_landscape',
            description: i18n.textarea.description,
            cursor: CURSOR_CROSSHAIR,
            weight: 2,
            templates: {
                design: kendo.format(TEXTAREA, ''),
                play: kendo.format(TEXTAREA, 'data-#= ns #bind="value: #: properties.name #.value"'),
                review: kendo.format(TEXTAREA, 'data-#= ns #bind="value: #: properties.name #.value"') + Tool.fn.showResult()
            },
            height: 300,
            width: 500,
            attributes: {
                style: new adapters.StyleAdapter({ title: i18n.textarea.attributes.style.title, defaultValue: 'font-size:40px; resize:none;' })
            },
            properties: {
                name: new adapters.NameAdapter({ title: i18n.textarea.properties.name.title }),
                description: new adapters.DescriptionAdapter({ title: i18n.textarea.properties.description.title }),
                solution: new adapters.TextAdapter({ title: i18n.textarea.properties.solution.title }),
                validation: new adapters.ValidationAdapter({ title: i18n.textarea.properties.validation.title }),
                success: new adapters.ScoreAdapter({ title: i18n.textarea.properties.success.title, defaultValue: 1 }),
                failure: new adapters.ScoreAdapter({ title: i18n.textarea.properties.failure.title, defaultValue: 0 }),
                omit: new adapters.ScoreAdapter({ title: i18n.textarea.properties.omit.title, defaultValue: 0 })
            },

            /**
             * onEnable event handler
             * @class Textarea
             * @method onEnable
             * @param e
             * @param component
             * @param enabled
             */
            onEnable: function (e, component, enabled) {
                var stageElement = $(e.currentTarget);
                if (stageElement.is(ELEMENT_CLASS) && component instanceof PageComponent) {
                    stageElement.children('textarea')
                        .prop({
                            // disabled: !enabled, // disabled elements do not receive mousedown events in Edge and cannot be selected in design mode
                            readonly: !enabled
                        });
                }
            },

            /**
             * onResize Event Handler
             * @method onResize
             * @param e
             * @param component
             */
            onResize: function (e, component) {
                var stageElement = $(e.currentTarget);
                assert.ok(stageElement.is(ELEMENT_CLASS), kendo.format('e.currentTarget is expected to be a stage element'));
                assert.instanceof(PageComponent, component, kendo.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                var content = stageElement.children('textarea');
                if ($.type(component.width) === NUMBER) {
                    content.outerWidth(component.width - content.outerWidth(true) + content.outerWidth());
                }
                if ($.type(component.height) === NUMBER) {
                    content.outerHeight(component.height - content.outerHeight(true) + content.outerHeight());
                }
                // prevent any side effect
                e.preventDefault();
                // prevent event to bubble on stage
                e.stopPropagation();
            },

            /**
             * Component validation
             * @param component
             * @param pageIdx
             */
            validate: function (component, pageIdx) {
                var ret = Tool.fn.validate.call(this, component, pageIdx);
                var description = this.description; // tool description
                var messages = this.i18n.messages;
                if (component.attributes) {
                    if ((component.attributes.style && !RX_STYLE.test(component.attributes.style))) {
                        ret.push({
                            type: ERROR,
                            index: pageIdx,
                            message: kendo.format(messages.invalidStyle, description, pageIdx + 1)
                        });
                    }
                }
                return ret;
            }

        });
        tools.register(Textarea);

        // Masks cannot be properly set via data attributes. An error is raised when masks only contain digits. See the workaround in onResize for more information
        var TEXTBOX = '<input type="text" id="#: properties.name #" data-#= ns #role="maskedtextbox" data-#= ns #prompt-char="\u25CA" style="#: attributes.style #" {0}>';
        /**
         * @class Textbox tool
         * @type {void|*}
         */
        var Textbox = Tool.extend({
            id: 'textbox',
            icon: 'text_field',
            description: i18n.textbox.description,
            cursor: CURSOR_CROSSHAIR,
            weight: 1,
            templates: {
                design: kendo.format(TEXTBOX, ''),
                play: kendo.format(TEXTBOX, 'data-#= ns #bind="value: #: properties.name #.value"'),
                review: kendo.format(TEXTBOX, 'data-#= ns #bind="value: #: properties.name #.value"') + Tool.fn.showResult()
            },
            height: 80,
            width: 300,
            attributes: {
                mask: new adapters.StringAdapter({ title: i18n.textbox.attributes.mask.title }),
                style: new adapters.StyleAdapter({ title: i18n.textbox.attributes.style.title })
            },
            properties: {
                name: new adapters.NameAdapter({ title: i18n.textbox.properties.name.title }),
                description: new adapters.DescriptionAdapter({ title: i18n.textbox.properties.description.title }),
                solution: new adapters.StringAdapter({ title: i18n.textbox.properties.solution.title }),
                validation: new adapters.ValidationAdapter({ title: i18n.textbox.properties.validation.title }),
                success: new adapters.ScoreAdapter({ title: i18n.textbox.properties.success.title, defaultValue: 1 }),
                failure: new adapters.ScoreAdapter({ title: i18n.textbox.properties.failure.title, defaultValue: 0 }),
                omit: new adapters.ScoreAdapter({ title: i18n.textbox.properties.omit.title, defaultValue: 0 })
            },

            /**
             * onEnable event handler
             * @class Textbox
             * @method onEnable
             * @param e
             * @param component
             * @param enabled
             */
            onEnable: function (e, component, enabled) {
                var stageElement = $(e.currentTarget);
                if (stageElement.is(ELEMENT_CLASS) && component instanceof PageComponent) {
                    stageElement.children('input')
                        .prop({
                            // disabled: !enabled, // disabled elements do not receive mousedown events in Edge and cannot be selected in design mode
                            readonly: !enabled
                        });
                }
            },

            /**
             * onResize Event Handler
             * @method onResize
             * @param e
             * @param component
             */
            onResize: function (e, component) {
                var stageElement = $(e.currentTarget);
                assert.ok(stageElement.is(ELEMENT_CLASS), kendo.format('e.currentTarget is expected to be a stage element'));
                assert.instanceof(PageComponent, component, kendo.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                var content = stageElement.children('input');
                if ($.type(component.width) === NUMBER) {
                    content.outerWidth(component.width);
                }
                if ($.type(component.height) === NUMBER) {
                    content.outerHeight(component.height);
                    if (component.attributes && !RX_FONT_SIZE.test(component.attributes.style)) {
                        content.css('font-size', Math.floor(0.65 * content.height()));
                    }
                }
                // This is a trick because of http://docs.telerik.com/kendo-ui/framework/mvvm/overview#important-notes
                // In other words it is impossible to set a mask that only contains digits declaratively (data-mask attribute)
                // See also http://docs.telerik.com/kendo-ui/api/javascript/ui/maskedtextbox#configuration-mask
                var maskedTextBoxWidget = content.data('kendoMaskedTextBox');
                if (kendo.ui.MaskedTextBox && maskedTextBoxWidget instanceof kendo.ui.MaskedTextBox &&
                    maskedTextBoxWidget.options.mask !== component.attributes.mask) {
                    maskedTextBoxWidget.setOptions({ mask: component.attributes.mask });
                }
                // prevent any side effect
                e.preventDefault();
                // prevent event to bubble on stage
                e.stopPropagation();
            },

            /**
             * Component validation
             * @param component
             * @param pageIdx
             */
            validate: function (component, pageIdx) {
                var ret = Tool.fn.validate.call(this, component, pageIdx);
                var description = this.description; // tool description
                var messages = this.i18n.messages;
                if (component.attributes) {
                    // Note: we are allowing any mask
                    if ((component.attributes.style && !RX_STYLE.test(component.attributes.style))) {
                        ret.push({
                            type: ERROR,
                            index: pageIdx,
                            message: kendo.format(messages.invalidStyle, description, pageIdx + 1)
                        });
                    }
                }
                return ret;
            }

        });
        tools.register(Textbox);

        /**
         * Video tool
         * @class Video
         */
        var Video = Tool.extend({
            id: 'video',
            icon: 'movie',
            description: i18n.video.description,
            cursor: CURSOR_CROSSHAIR,
            templates: {
                default: '<div data-#= ns #role="mediaplayer" data-#= ns #mode="video" data-#= ns #autoplay="#: attributes.autoplay #" data-#= ns #files="#: attributes.files$() #" data-#= ns #toolbar-height="#: attributes.toolbarHeight #"></div>'
            },
            height: 300,
            width: 600,
            attributes: {
                autoplay: new adapters.BooleanAdapter({ title: 'Autoplay', defaultValue: false }),
                toolbarHeight: new adapters.NumberAdapter({ title: 'Toolbar Height', defaultValue: 48 }),
                mp4: new adapters.AssetAdapter({ title: 'MP4 File' }),
                ogv: new adapters.AssetAdapter({ title: 'OGV File' }),
                wbem: new adapters.AssetAdapter({ title: 'WBEM File' })
            },

            /**
             * Get Html or jQuery content
             * @method getHtmlContent
             * @param component
             * @param mode
             * @returns {*}
             */
            getHtmlContent: function (component, mode) {
                var that = this;
                assert.instanceof(Video, that, kendo.format(assert.messages.instanceof.default, 'this', 'Image'));
                assert.instanceof(PageComponent, component, kendo.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                assert.enum(Object.keys(kendo.ui.Stage.fn.modes), mode, kendo.format(assert.messages.enum.default, 'mode', Object.keys(kendo.ui.Stage.fn.modes)));
                assert.instanceof(ToolAssets, assets.video, kendo.format(assert.messages.instanceof.default, 'assets.video', 'kidoju.ToolAssets'));
                var template = kendo.template(this.templates.default);

                /* This function's cyclomatic complexity is too high. */
                /* jshint -W074 */

                // The files$ function resolves urls with schemes like cdn://video.mp4 and returns a stringified array
                component.attributes.files$ = function () {
                    var mp4 = component.attributes.get('mp4');
                    var ogv = component.attributes.get('ogv');
                    var wbem = component.attributes.get('wbem');
                    var schemes = assets.video.schemes;
                    for (var scheme in schemes) {
                        if (schemes.hasOwnProperty(scheme)) {
                            var schemeRx = new RegExp('^' + scheme + '://');
                            if (schemeRx.test(mp4)) {
                                mp4 = mp4.replace(scheme + '://', schemes[scheme]);
                            }
                            if (schemeRx.test(ogv)) {
                                ogv = ogv.replace(scheme + '://', schemes[scheme]);
                            }
                            if (schemeRx.test(wbem)) {
                                wbem = wbem.replace(scheme + '://', schemes[scheme]);
                            }
                        }
                    }
                    var files = [];
                    if (RX_HTTP_S.test(mp4)) {
                        files.push(mp4);
                    }
                    if (RX_HTTP_S.test(ogv)) {
                        files.push(ogv);
                    }
                    if (RX_HTTP_S.test(wbem)) {
                        files.push(wbem);
                    }
                    return JSON.stringify(files);
                };

                /* jshint +W074 */

                return template($.extend(component, { ns: kendo.ns }));
            },

            /**
             * onResize Event Handler
             * @method onResize
             * @param e
             * @param component
             */
            onResize: function (e, component) {
                var stageElement = $(e.currentTarget);
                assert.ok(stageElement.is(ELEMENT_CLASS), kendo.format('e.currentTarget is expected to be a stage element'));
                assert.instanceof(PageComponent, component, kendo.format(assert.messages.instanceof.default, 'component', 'kidoju.data.PageComponent'));
                var content = stageElement.children('div' + kendo.roleSelector('mediaplayer'));
                content.outerHeight(component.get('height'));
                content.outerWidth(component.get('width'));
                var widget = content.data('kendoMediaPlayer');
                if (kendo.ui.MediaPlayer && widget instanceof kendo.ui.MediaPlayer) {
                    widget.resize();
                }
                // prevent any side effect
                e.preventDefault();
                // prevent event to bubble on stage
                e.stopPropagation();
            },

            /**
             * Component validation
             * @param component
             * @param pageIdx
             */
            validate: function (component, pageIdx) {
                var ret = Tool.fn.validate.call(this, component, pageIdx);
                var description = this.description; // tool description
                var messages = this.i18n.messages;
                if (component.attributes) {
                    if (!RX_VIDEO.test(component.attributes.mp4)) {
                        ret.push({
                            type: ERROR,
                            index: pageIdx,
                            message: kendo.format(messages.invalidVideoFile, description, pageIdx + 1)
                        });
                    }
                    // Note: we are not testing for an ogv or wbem file
                }
                return ret;
            }

        });
        tools.register(Video);

        /**
         * We could also consider
         * HTML from Markdown (lists, tec)
         * Drawing surface
         * Shape
         * Clock
         * Text-to-Speech
         * Geogebra
         * Spreadsheet
         * Charts
         */

    }(window.jQuery));

    /* jshint +W071 */

    return window.kidoju;

}, typeof define === 'function' && define.amd ? define : function (_, f) { 'use strict'; f(); });
