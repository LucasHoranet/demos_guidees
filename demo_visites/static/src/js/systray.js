odoo.define('demo_visites.systray', function (require) {
"use strict";

/**
 * Icône « lecture » dans la barre du haut, avec la liste des démos.
 * Visible uniquement pour le groupe demo_visites.group_demo_visites.
 */
var SystrayMenu = require('web.SystrayMenu');
var Widget = require('web.Widget');
var session = require('web.session');
var demos = require('demo_visites.demos');

var DemoMenu = Widget.extend({
    tagName: 'li',
    className: 'o_demo_visites_systray dropdown',
    events: {
        'click .o_demo_visites_item': '_onDemoClick',
    },

    willStart: function () {
        var self = this;
        return Promise.all([
            this._super.apply(this, arguments),
            session.user_has_group('demo_visites.group_demo_visites').then(function (visible) {
                self.visible = visible;
            }),
        ]);
    },

    start: function () {
        if (!this.visible) {
            this.$el.addClass('d-none');
            return this._super.apply(this, arguments);
        }
        var $toggle = $('<a href="#" role="button" class="dropdown-toggle o-no-caret" ' +
                        'data-toggle="dropdown" data-display="static" aria-expanded="false" ' +
                        'title="Démos guidées"/>')
            .append('<i class="fa fa-play-circle" role="img" aria-label="Démos guidées"/>');
        var $menu = $('<div class="dropdown-menu dropdown-menu-right" role="menu"/>');
        $menu.append('<h6 class="dropdown-header">Démos guidées</h6>');
        _.each(demos.entries(), function (demo, cle) {
            $('<a href="#" role="menuitem" class="dropdown-item o_demo_visites_item"/>')
                .attr('data-demo', cle)
                .text(demo.name)
                .appendTo($menu);
        });
        this.$el.append($toggle, $menu);
        return this._super.apply(this, arguments);
    },

    _onDemoClick: function (ev) {
        ev.preventDefault();
        this.do_action({
            type: 'ir.actions.client',
            tag: 'demo_visites.play',
            params: { demo: $(ev.currentTarget).data('demo') },
        });
    },
});

DemoMenu.prototype.sequence = 1;
SystrayMenu.Items.push(DemoMenu);

return DemoMenu;
});
