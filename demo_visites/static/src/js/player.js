odoo.define('demo_visites.player', function (require) {
"use strict";

/**
 * Lecteur de démo : curseur animé, bulle explicative, surbrillance,
 * clics et saisie lettre par lettre. Indépendant du gestionnaire de tours d'Odoo.
 * Touche Échap : arrête la démo.
 */

var DEFAUTS = {
    delai: 2000,     // temps de lecture de chaque bulle (ms)
    anim: 700,       // déplacement du curseur (ms), doit correspondre au SCSS
    timeout: 15000,  // attente max d'un élément avant d'abandonner (ms)
    frappe: 70,      // vitesse de frappe (ms par caractère)
};

var enCours = false;

function attendre(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

function Lecteur(demo) {
    this.demo = demo;
    this.opts = _.extend({}, DEFAUTS, demo.options || {});
    this.stop = false;
    this.etapeCourante = -1;
}

_.extend(Lecteur.prototype, {

    installer: function () {
        var self = this;
        this.$cursor = $('<div class="o_demo_cursor"/>')
            .css({ left: window.innerWidth / 2, top: window.innerHeight / 2 })
            .appendTo(document.body);
        this.$bubble = $('<div class="o_demo_bubble"/>').appendTo(document.body);
        $(document).on('keydown.demoVisites', function (ev) {
            if (ev.key === 'Escape') { self.stop = true; }
        });
    },

    nettoyer: function () {
        this.$cursor.remove();
        this.$bubble.remove();
        $('.o_demo_highlight').removeClass('o_demo_highlight');
        $(document).off('.demoVisites');
    },

    // Attend que l'URL contienne un fragment (ex. 'model=sale.order')
    attendreHash: function (fragment) {
        var self = this;
        return new Promise(function (resolve, reject) {
            var debut = Date.now();
            (function boucle() {
                if (self.stop) { return reject(new Error('arrêté par Échap')); }
                if (window.location.hash.indexOf(fragment) !== -1) { return resolve(); }
                if (Date.now() - debut > self.opts.timeout) {
                    return reject(new Error("l'écran de départ ne s'est pas ouvert (" + fragment + ")"));
                }
                setTimeout(boucle, 200);
            })();
        });
    },

    // Attend qu'un élément visible corresponde au sélecteur
    trouver: function (sel) {
        var self = this;
        return new Promise(function (resolve, reject) {
            var debut = Date.now();
            (function boucle() {
                if (self.stop) { return reject(new Error('arrêté par Échap')); }
                var $el = $(sel).filter(':visible').first();
                if ($el.length && !$('body').hasClass('o_ui_blocked')) { return resolve($el); }
                if (Date.now() - debut > self.opts.timeout) {
                    return reject(new Error('élément introuvable : ' + sel));
                }
                setTimeout(boucle, 200);
            })();
        });
    },

    // Déplace le curseur, surligne l'élément et affiche la bulle à côté
    montrer: function ($el, html) {
        $el[0].scrollIntoView({ block: 'nearest' });
        var r = $el[0].getBoundingClientRect();
        this.$cursor.css({ left: r.left + r.width / 2, top: r.top + r.height / 2 });
        $('.o_demo_highlight').removeClass('o_demo_highlight');
        $el.addClass('o_demo_highlight');
        this.$bubble.html(html);
        var bw = this.$bubble.outerWidth();
        var bh = this.$bubble.outerHeight();
        var top = r.bottom + 14;
        if (top + bh > window.innerHeight - 10) { top = r.top - bh - 14; }
        var left = Math.min(Math.max(10, r.left + r.width / 2 - bw / 2), window.innerWidth - bw - 10);
        this.$bubble.css({ top: top, left: left, opacity: 1 });
    },

    // Message centré (fin ou interruption de la démo)
    annoncer: function (html) {
        this.$bubble.html(html);
        this.$bubble.css({
            top: window.innerHeight / 2 - this.$bubble.outerHeight() / 2,
            left: window.innerWidth / 2 - this.$bubble.outerWidth() / 2,
            opacity: 1,
        });
    },

    cliquer: function ($el) {
        var $cursor = this.$cursor;
        $cursor.addClass('o_demo_clic');
        setTimeout(function () { $cursor.removeClass('o_demo_clic'); }, 160);
        $el.trigger('mouseenter').trigger('mouseover')
           .trigger('mousedown').trigger('mouseup').trigger('click');
    },

    // Saisie lettre par lettre
    taper: function ($el, texte) {
        var self = this;
        this.cliquer($el);
        $el.focus();
        var estMany2one = $el.closest('.o_field_many2one').length > 0;
        var i = 0;
        function lettre() {
            if (self.stop) { return Promise.resolve(); }
            if (i >= texte.length) {
                $el.trigger('keydown').trigger('keyup');
                // Pas de 'change' sur un champ relationnel : Odoo proposerait « Créer et modifier »
                if (!estMany2one) { $el.trigger('change'); }
                return Promise.resolve();
            }
            i++;
            $el.val(texte.slice(0, i)).trigger('input');
            return attendre(self.opts.frappe).then(lettre);
        }
        return lettre();
    },

    jouerEtape: function (i) {
        var self = this;
        if (i >= this.etapes.length || this.stop) { return Promise.resolve(); }
        var etape = this.etapes[i];
        var $el;
        this.etapeCourante = i;

        return this.trouver(etape.trigger).then(function ($trouve) {
            $el = $trouve;
            self.montrer($el, etape.content);
            return attendre(self.opts.anim + self.opts.delai);
        }).then(function () {
            // L'écran a pu être redessiné pendant la pause : on retrouve l'élément
            if (!self.stop && !document.body.contains($el[0])) {
                return self.trouver(etape.trigger).then(function ($nouveau) {
                    $el = $nouveau;
                    self.montrer($el, etape.content);
                    return attendre(self.opts.anim);
                });
            }
        }).then(function () {
            if (self.stop) { return; }
            var run = etape.run || 'click';
            if (run === 'click') {
                self.cliquer($el);
            } else if (run.indexOf('text ') === 0) {
                return self.taper($el, run.slice(5));
            }
            // 'none' : on montre seulement
        }).then(function () {
            self.$bubble.css('opacity', 0);
            return attendre(500);
        }).then(function () {
            return self.jouerEtape(i + 1);
        });
    },

    jouer: function () {
        var self = this;
        this.etapes = this.demo.steps();
        this.installer();
        var depart = this.demo.hash ? this.attendreHash(this.demo.hash) : Promise.resolve();

        return depart.then(function () {
            return attendre(800);
        }).then(function () {
            return self.jouerEtape(0);
        }).then(function () {
            return attendre(1500);
        }).catch(function (err) {
            if (self.stop) {
                self.annoncer("Démo arrêtée");
            } else {
                var n = self.etapeCourante + 1;
                console.error('[démo] Étape ' + n + '/' + self.etapes.length + ' bloquée : ' + err.message);
                self.annoncer("Démo interrompue à l'étape " + n + ".<br/>Détail dans la console du navigateur.");
            }
            return attendre(3000);
        }).then(function () {
            self.nettoyer();
        });
    },
});

return {
    /**
     * Lance une démo. Ne fait rien si une démo est déjà en cours.
     * @param {Object} demo  entrée du registre demo_visites.demos
     * @returns {Promise}
     */
    jouer: function (demo) {
        if (enCours) { return Promise.resolve(); }
        enCours = true;
        return new Lecteur(demo).jouer().then(function () {
            enCours = false;
        }, function () {
            enCours = false;
        });
    },
};
});
