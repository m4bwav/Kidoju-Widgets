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
        TOOLBOX = 'toolbox',
        DIV = '<div id="{0}"></div>';


    describe('kidoju.widgets.toolbox', function() {

        describe('Initializing', function() {

            it('from code', function() {
                var element = $(kendo.format(DIV, TOOLBOX)).appendTo(FIXTURES);
                element.kendoToolbox({
                    path: '../../src/styles/images/toolbox/'
                });

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
            kendo.destroy(fixtures);
            fixtures.find('*').off();
            fixtures.empty();
        });

    });

}(this, jQuery));
