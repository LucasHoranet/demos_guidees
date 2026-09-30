# demos_guidees
Module Démos Guidées pour intégration dans Odoo

1. Donner l'accès aux utilisateurs

Seuls les membres du groupe « Démos guidées » voient l'icône ▶ et le menu. À l'installation, seul l'admin en fait partie.

Pour ajouter quelqu'un, passe en mode debug, puis va dans Paramètres > Utilisateurs et sociétés > Groupes. Cherche « Démos guidées » et ajoute les utilisateurs dans l'onglet Utilisateurs. Ils doivent ensuite recharger la page (F5) pour voir l'icône.

2. Lancer une démo

Il y a trois façons :

L'icône ▶ dans la barre du haut, qui liste toutes les démos déclarées.
Le menu Ventes > Démo : créer un devis.
Un bouton placé où tu veux (voir la section 6).

Une fois lancée, la démo :

ouvre elle-même son écran de départ (ici Ventes > Devis) ;
attend que l'écran soit chargé ;
enchaîne les étapes : le curseur rouge se déplace, l'élément est encadré, la bulle s'affiche, puis l'action (clic ou saisie) est jouée.

La touche Échap l'arrête à tout moment. Si un élément reste introuvable pendant 15 secondes, un message « Démo interrompue à l'étape N » s'affiche au centre de l'écran. Le détail (le sélecteur en cause) est dans la console du navigateur.

3. Régler la vitesse

Dans le fichier de la démo, par exemple demo_devis.js, la clé options accepte :

Option	Défaut	Rôle
delai	2000	Temps de lecture de chaque bulle (ms)
frappe	70	Vitesse de frappe, en ms par caractère
timeout	15000	Attente maximale d'un élément avant abandon
anim	700	Durée du déplacement du curseur

anim doit rester égal à la durée transition définie dans demo_visites.scss. Si tu modifies l'un, modifie l'autre.

Pour une vidéo, delai: 2500 et frappe: 90 donnent un rythme confortable. Pour de l'onboarding, où l'utilisateur lit, compte plutôt 3000 à 4000.

4. Changer l'apparence

Tout se règle dans static/src/scss/demo_visites.scss :

$o-demo-color : la couleur des bulles et de l'encadré. Tu peux y mettre la couleur Horanet.
.o_demo_cursor : la taille, la couleur et l'ombre du curseur.
.o_demo_bubble : la police, la largeur maximale et les marges des bulles.
5. Créer une nouvelle démo
Structure d'un fichier

Crée par exemple static/src/js/demo_confirmer.js :

javascript
odoo.define('demo_visites.demo_confirmer', function (require) {
"use strict";
var demos = require('demo_visites.demos');

demos.add('confirmer', {
    name: "Confirmer un devis",                     // libellé dans le menu ▶
    action: 'sale.action_quotations_with_onboarding', // écran de départ (xmlid)
    hash: 'model=sale.order',                      // attendre que l'URL contienne ceci
    options: { delai: 2500 },
    steps: function () {
        return [{
            trigger: '.o_data_row:contains("Devis"):first td.o_data_cell:first',
            content: "Ouvrons un <b>devis</b> en attente",
        }, {
            trigger: 'button[name="action_confirm"]',
            content: "Un clic sur <b>Confirmer</b>…",
        }, {
            trigger: '.o_statusbar_status .btn-primary',
            content: "… et le devis devient un <b>bon de commande</b>",
            run: 'none',
        }];
    },
});
});

Ajoute ensuite une ligne dans views/assets.xml :

xml
<script type="text/javascript" src="/demo_visites/static/src/js/demo_confirmer.js"/>

Pour finir, mets à jour le module : Applications > Démos guidées > Mettre à jour. La nouvelle démo apparaît alors automatiquement dans le menu ▶.

Les champs d'une démo
name : le libellé affiché dans le menu ▶.
action (facultatif) : l'identifiant XML de l'écran de départ. Sans lui, la démo démarre sur l'écran courant.
hash (facultatif) : un fragment que l'URL doit contenir avant la première étape, par exemple model=sale.order. Il évite que la démo clique sur l'écran précédent pendant le chargement.
steps : une fonction qui renvoie la liste des étapes.
Les champs d'une étape
trigger : le sélecteur CSS/jQuery de l'élément à attendre. :contains(), :first et :visible sont acceptés.
content : le texte de la bulle. Le HTML est autorisé (<b>, <br/>).
run, qui peut valoir :
'click' : clic sur l'élément. C'est la valeur par défaut si run est absent.
'text Mon texte' : saisie lettre par lettre.
'none' : on montre l'élément sans agir. Utile pour conclure ou pour éviter une action risquée.
Aide-mémoire des sélecteurs Odoo 13
Élément	Sélecteur
Bouton Créer (liste)	.o_list_button_add
Bouton Modifier / Enregistrer / Annuler	.o_form_button_edit / .o_form_button_save / .o_form_button_cancel
Un champ	.o_field_widget[name="nom_technique"]
Champ relationnel (saisie)	.o_field_many2one[name="partner_id"] input
Choix dans la liste déroulante	.ui-autocomplete:visible .ui-menu-item a:contains("Texte")
Ajouter une ligne	div[name="order_line"] .o_field_x2many_list_row_add > a
Bouton d'action du formulaire	button[name="action_confirm"]
Onglet du formulaire	.nav-link:contains("Autres informations")
Bouton principal d'une fenêtre	.modal-footer .btn-primary
Entrée de menu	a[data-menu-xmlid="sale.menu_sale_quotations"]
Étape de la barre de statut	.o_statusbar_status button[data-value="sale"]
Trouver et tester un sélecteur
Fais un clic droit sur l'élément, puis Inspecter. Privilégie les attributs name="..." et les classes qui commencent par o_, qui sont stables. Évite les id générés, du type o_field_input_123.
Teste dans la console :
javascript
   $('ton sélecteur').filter(':visible').length

Le résultat doit être 1, ou au moins 1 : la démo prend le premier élément visible.

6. Lancer une démo depuis ailleurs

Un bouton dans une vue formulaire (dans une vue héritée de ton module) :

xml
<button name="%(demo_visites.action_demo_devis)d" type="action"
        string="Voir la démo" class="btn-secondary"
        groups="demo_visites.group_demo_visites"/>

Une autre entrée de menu : duplique le couple ir.actions.client + menuitem de views/demo_visites_actions.xml, en changeant params ({'demo': 'confirmer'}) et le parent.

Depuis du Python, par exemple à la fin d'un assistant :

python
return {
    'type': 'ir.actions.client',
    'tag': 'demo_visites.play',
    'params': {'demo': 'devis'},
}
7. Enregistrer une vidéo propre
Travaille sur une base de test : chaque lecture crée ou modifie de vraies données.
Ferme le bandeau d'onboarding des devis (la croix ×) pour libérer de la place à l'écran.
Quitte le mode debug, qui n'est pas nécessaire pour lancer une démo, pour ne pas montrer l'icône debug.
Ferme les outils de développement (F12), garde un zoom navigateur à 100 % et une résolution fixe, 1920×1080 par exemple.
Démarre l'enregistrement (OBS ou autre) avant de cliquer sur ▶, puis coupe le début au montage.
Pour masquer le vrai pointeur de la souris, laisse-la immobile dans un coin, ou désactive son affichage dans les réglages de capture d'OBS.
8. Limites à connaître
Données réelles : la démo agit vraiment. N'utilise run: 'none' que sur les boutons irréversibles, comme les envois de mail, les validations de facture ou les paiements.
Pas de rechargement complet de page pendant une démo : le lecteur vit dans la page. La navigation interne d'Odoo (menus, fiches, retours) fonctionne. Un F5, ou un bouton qui recharge toute la page, l'arrête.
Sélecteurs sensibles aux évolutions : une mise à jour de Horanet GO qui modifie un formulaire peut casser une étape. Le message d'erreur indique alors laquelle corriger.
Droits d'accès : la démo agit avec les droits de l'utilisateur connecté. Si ce dernier ne peut pas créer de devis, l'étape échouera.
Données de démo figées : le client et l'article sont écrits en dur dans le fichier. Ils doivent exister dans chaque base où la démo est jouée.
9. Dépannage
Symptôme	Cause probable	Solution
Pas d'icône ▶	L'utilisateur n'est pas dans le groupe	Ajoute-le au groupe, puis F5
Démo absente du menu ▶	Fichier non déclaré ou module non mis à jour	Vérifie assets.xml, puis mets à jour le module
Modification JS non prise en compte	Cache des assets	Recharge avec ?debug=assets, ou mets à jour le module
« Interrompue à l'étape 1 »	L'écran de départ ne s'ouvre pas	Vérifie l'xmlid dans action et la valeur de hash
« Élément introuvable »	Sélecteur faux ou écran personnalisé	Inspecte l'élément et teste le sélecteur dans la console
Une fenêtre « Créer et modifier » s'ouvre	Le texte saisi ne correspond à aucun enregistrement	Corrige le nom (client ou article) dans le fichier de la démo
