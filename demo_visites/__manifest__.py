# -*- coding: utf-8 -*-
{
    'name': 'Démos guidées',
    'version': '13.0.1.0.0',
    'category': 'Tools',
    'summary': "Démos animées (curseur, bulles, frappe) lancées depuis la barre du haut",
    'description': """
Démos guidées
=============
Joue des parcours animés dans l'interface (curseur, bulles explicatives,
saisie automatique), pour l'onboarding ou l'enregistrement de vidéos.

* Icône « lecture » dans la barre du haut pour lancer une démo
* Entrée de menu Ventes > Démo : créer un devis
* Visible uniquement pour le groupe « Démos guidées »
* Touche Échap pour arrêter une démo en cours
""",
    'depends': ['web', 'sale'],
    'data': [
        'security/demo_visites_groups.xml',
        'views/assets.xml',
        'views/demo_visites_actions.xml',
    ],
    'installable': True,
    'application': False,
    'license': 'LGPL-3',
}
