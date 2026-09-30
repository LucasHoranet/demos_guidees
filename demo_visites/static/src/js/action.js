odoo.define('demo_visites.action', function (require) {
"use strict";

/**
 * Action client « demo_visites.play » : lance la démo passée dans params.demo.
 * Utilisable depuis un menu, un bouton ou do_action :
 *   { type: 'ir.actions.client', tag: 'demo_visites.play', params: { demo: 'devis' } }
 */
var core = require('web.core');
var demos = require('demo_visites.demos');
var player = require('demo_visites.player');

function lancerDemo(parent, action) {
    var cle = (action.params || {}).demo;
    var demo = demos.get(cle);
    if (!demo) {
        console.error('[démo] Démo inconnue : ' + cle);
        return;
    }
    // Le lecteur démarre tout de suite mais attend que l'écran de départ soit prêt
    player.jouer(demo);
    // Odoo ouvre ensuite cette action (écran de départ de la démo)
    if (demo.action) {
        return demo.action;
    }
}

core.action_registry.add('demo_visites.play', lancerDemo);

return lancerDemo;
});
