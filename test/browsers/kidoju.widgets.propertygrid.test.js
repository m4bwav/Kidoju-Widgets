/**
 * Copyright (c) 2013-2015 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

/* jshint browser: true, mocha: true, expr: true */

;(function (window, $, undefined) {

    'use strict';

    var expect = window.chai.expect,
        kendo = window.kendo,
        kidoju = window.kidoju,
        FIXTURES = '#fixtures',
        PROPERTY_GRID = 'propertyGrid',
        DIV = '<div id="{0}"></div>';


    describe('kidoju.widgets.propertygrid', function() {

        describe('Initializing', function() {

            it('from code', function() {
                var element = $(kendo.format(DIV, PROPERTY_GRID)).appendTo(FIXTURES);
                element.kendoPropertyGrid();

            });

            it('from markup', function() {
                $.noop();
            });


        });

        describe('MVVM', function() {

            it('TODO', function() {
                $.noop();
            });

        });

        describe('Events', function() {

            it('TODO', function() {
                $.noop();
            });

        });

        afterEach(function() {
            var fixtures = $(FIXTURES);
            //kendo.destroy(fixtures); //<--- Raises a RangeError
            fixtures.find('*').off();
            fixtures.empty();
        });

    });

}(this, jQuery));
