odoo.define('demo_visites.demo_devis', function (require) {
"use strict";

var demos = require('demo_visites.demos');

// ---- À adapter à votre base ----------------------------------------------
var CLIENT   = "Tristan BLAINEAU"; // nom du client tel qu'il apparaît dans la liste déroulante
var ARTICLE  = "ART TVA 20%";      // nom exact d'un article existant
var QUANTITE = "3";
// ---------------------------------------------------------------------------

var LIGNE = 'div[name="order_line"] .o_data_row ';

demos.add('devis', {
    name: "Créer un devis",
    // Écran de départ : Ventes > Devis
    action: 'sale.action_quotations_with_onboarding',
    hash: 'model=sale.order',
    options: { delai: 2000 },
    steps: function () {
        return [{
            trigger: '.o_list_button_add',
            content: "Créons un nouveau <b>devis</b>",
        }, {
            trigger: '.o_form_editable .o_field_many2one[name="partner_id"] input',
            content: "On choisit le <b>client</b>",
            run: 'text ' + CLIENT,
        }, {
            trigger: '.ui-autocomplete:visible .ui-menu-item a:contains("' + CLIENT + '")',
            content: "… et on le sélectionne",
        }, {
            trigger: 'div[name="order_line"] .o_field_x2many_list_row_add > a',
            content: "On ajoute une <b>ligne d'article</b>",
        }, {
            trigger: LIGNE + '.o_field_many2one input',
            content: "On cherche l'<b>article</b>",
            run: 'text ' + ARTICLE,
        }, {
            trigger: '.ui-autocomplete:visible .ui-menu-item a:contains("' + ARTICLE + '")',
            content: "… et on le sélectionne",
        }, {
            trigger: LIGNE + 'input[name="product_uom_qty"], ' + LIGNE + '[name="product_uom_qty"] input',
            content: "On indique la <b>quantité</b>",
            run: 'text ' + QUANTITE,
        }, {
            trigger: '.o_form_button_save',
            content: "On <b>enregistre</b> le devis",
        }, {
            trigger: '.o_form_readonly .oe_subtotal_footer',
            content: "Les <b>totaux</b> sont calculés automatiquement",
            run: 'none',
        }, {
            trigger: 'button[name="action_quotation_send"]',
            content: "Il ne reste plus qu'à <b>l'envoyer par email</b> au client",
            run: 'none', // on montre le bouton sans cliquer : rien n'est envoyé
        }];
    },
});
});
