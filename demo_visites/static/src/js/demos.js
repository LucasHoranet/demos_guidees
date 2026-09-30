odoo.define('demo_visites.demos', function (require) {
"use strict";

/**
 * Registre des démos.
 *
 * Chaque démo s'ajoute avec :
 *   demos.add('cle', {
 *       name: "Libellé affiché dans le menu",
 *       action: 'module.xmlid_action',   // écran de départ (facultatif)
 *       hash: 'model=sale.order',        // attendre que l'URL contienne ceci (facultatif)
 *       options: { delai: 2000 },        // facultatif, voir player.js
 *       steps: function () { return [ ...étapes... ]; },
 *   });
 *
 * Une étape : { trigger: 'sélecteur CSS', content: 'texte HTML de la bulle',
 *               run: 'click' (défaut) | 'text xxx' | 'none' }
 */
var Registry = require('web.Registry');

return new Registry();
});
