import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface PrivacyModalProps {
  open: boolean;
  onClose: () => void;
  type: "privacy" | "cgu";
}

const PRIVACY_CONTENT = {
  title: "Politique de confidentialité",
  lastUpdated: "25 mars 2026",
  sections: [
    {
      heading: "1. Qui sommes-nous",
      body: "Malaky est une application de jeu de soirée développée et éditée par APli, société de droit malgache. L'application est disponible à l'adresse malaky.app.",
    },
    {
      heading: "2. Données collectées",
      body: "Malaky collecte un minimum de données pour fonctionner :\n\n• Identifiant de session anonyme (stocké localement sur votre appareil) pour compter les utilisateurs actifs — aucun lien avec votre identité réelle.\n\n• Votes au Dilemme du Jour : votre choix (A ou B) est enregistré de façon anonyme dans notre base de données. Aucun nom, email ou donnée personnelle n'est associé à ce vote.\n\n• Données de paiement : si vous achetez un pack, les informations de transaction (montant, référence, statut) sont traitées par notre partenaire de paiement. Malaky ne stocke jamais vos coordonnées bancaires.\n\n• Préférences locales : vos réglages (son, vibration, packs débloqués) sont sauvegardés uniquement sur votre appareil via le localStorage de votre navigateur.",
    },
    {
      heading: "3. Ce que nous ne collectons PAS",
      body: "• Votre nom, prénom ou identité réelle\n• Votre adresse email ou numéro de téléphone\n• Votre localisation GPS\n• Votre historique de navigation\n• Les prénoms des joueurs saisis dans l'application (stockés uniquement en session locale)\n• Aucune donnée n'est vendue à des tiers",
    },
    {
      heading: "4. Cookies et stockage local",
      body: "L'application utilise uniquement le localStorage de votre navigateur pour sauvegarder vos préférences et vos packs achetés. Aucun cookie de tracking, aucune publicité, aucune analytics invasive.",
    },
    {
      heading: "5. Hébergement",
      body: "Nos données sont hébergées sur une infrastructure sécurisée. Les données des sessions actives sont automatiquement supprimées après 24 heures d'inactivité.",
    },
    {
      heading: "6. Vos droits",
      body: "Conformément au RGPD et aux lois malgaches applicables, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Comme nous ne collectons aucune donnée personnelle identifiable, l'exercice de ces droits peut se faire simplement en effaçant les données locales de votre navigateur (vider le cache / localStorage).",
    },
    {
      heading: "7. Contenu pour adultes",
      body: "Certains packs (After Dark, Hot, Chaos) contiennent du contenu réservé aux personnes majeures (+18 ans). En achetant ces packs, vous confirmez être majeur(e) selon la législation de votre pays.",
    },
    {
      heading: "8. Contact",
      body: "Pour toute question relative à la confidentialité :\n📧 contact@malaky.app\n\nMalaky — Antananarivo, Madagascar",
    },
  ],
};

const CGU_CONTENT = {
  title: "Conditions d'utilisation",
  lastUpdated: "25 mars 2026",
  sections: [
    {
      heading: "1. Acceptation",
      body: "En utilisant Malaky, vous acceptez les présentes Conditions Générales d'Utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser l'application.",
    },
    {
      heading: "2. Description du service",
      body: "Malaky est un jeu de société numérique destiné à être joué en groupe. L'application propose différents modes de jeu et ambiances, dont certains sont accessibles gratuitement et d'autres via achat.",
    },
    {
      heading: "3. Utilisation acceptable",
      body: "Vous vous engagez à utiliser Malaky de façon responsable et à ne pas :\n• Utiliser l'application pour harceler ou nuire à d'autres personnes\n• Contourner le système de paiement pour accéder aux contenus payants\n• Partager les contenus payants avec des personnes n'ayant pas effectué l'achat\n• Utiliser les contenus 18+ si vous êtes mineur(e)",
    },
    {
      heading: "4. Achats et remboursements",
      body: "Les achats de packs sont définitifs et non remboursables, sauf défaut technique avéré de notre part. Les packs achetés sont liés à votre appareil via le localStorage. En cas de changement d'appareil, contactez-nous pour un transfert manuel.",
    },
    {
      heading: "5. Contenu généré",
      body: "Le Dilemme du Jour est généré par intelligence artificielle. Malaky ne saurait être tenu responsable des opinions exprimées dans ces dilemmes. Si un contenu vous semble inapproprié, contactez-nous.",
    },
    {
      heading: "6. Propriété intellectuelle",
      body: "Tous les contenus de Malaky (questions, défis, design, code) sont la propriété exclusive d'APli. Toute reproduction, même partielle, est interdite sans autorisation écrite.",
    },
    {
      heading: "7. Limitation de responsabilité",
      body: "Malaky est un jeu de soirée prévu pour des adultes consentants. L'éditeur ne peut être tenu responsable de situations conflictuelles, gênes ou dommages résultant de l'utilisation du jeu en dehors de son cadre ludique prévu.",
    },
    {
      heading: "8. Droit applicable",
      body: "Les présentes CGU sont soumises au droit malgache. En cas de litige, les tribunaux d'Antananarivo seront seuls compétents.",
    },
    {
      heading: "9. Contact",
      body: "📧 contact@malaky.app\nMalaky — Antananarivo, Madagascar",
    },
  ],
};

const PrivacyModal = ({ open, onClose, type }: PrivacyModalProps) => {
  const content = type === "privacy" ? PRIVACY_CONTENT : CGU_CONTENT;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-md max-h-[85vh] rounded-t-3xl bg-card shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
              <div>
                <h3 className="text-lg font-bold text-foreground">{content.title}</h3>
                <p className="text-xs text-muted-foreground">
                  Mise à jour : {content.lastUpdated}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-xl bg-secondary p-2 text-muted-foreground"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {content.sections.map((section, i) => (
                <div key={i}>
                  <h4 className="text-sm font-bold text-foreground mb-1.5">
                    {section.heading}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                    {section.body}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PrivacyModal;
