export interface GameCard {
  id: string;
  mode: GameMode;
  vibe: Vibe;
  lang: "fr" | "mg";
  card_type: "truth" | "dare" | "group" | "duel" | "vote" | "timer";
  text: string;
  requires_prop: "none" | "phone" | "chair" | "paper" | "coin";
  player_min: number;
  player_max: number;
}

export type GameMode = "truth_dare" | "never_have_i_ever" | "most_likely" | "would_you_rather" | "quick_challenge";
export type Vibe = "soft" | "fun" | "hot" | "chaos";

export const GAME_MODES = [
  {
    id: "truth_dare" as GameMode,
    name: "Action ou Vérité",
    subtitle: "Avoue ou ose",
    emoji: "🔥",
    badge: "Hilarant",
    color: "coral" as const,
  },
  {
    id: "never_have_i_ever" as GameMode,
    name: "Je n'ai jamais",
    subtitle: "Qui l'a déjà fait ?",
    emoji: "🙈",
    badge: "Confessionnel",
    color: "primary" as const,
  },
  {
    id: "most_likely" as GameMode,
    name: "Qui est le plus…",
    subtitle: "Vote et débat",
    emoji: "👆",
    badge: "Social",
    color: "mango" as const,
  },
  {
    id: "would_you_rather" as GameMode,
    name: "Tu préfères ?",
    subtitle: "Choix impossibles",
    emoji: "🤔",
    badge: "Intime",
    color: "primary" as const,
  },
  {
    id: "quick_challenge" as GameMode,
    name: "Défis express",
    subtitle: "Chrono, pas de pitié",
    emoji: "⚡",
    badge: "Tendu",
    color: "mango" as const,
  },
];

export const VIBES = [
  { id: "soft" as Vibe, name: "Soft", emoji: "😇", description: "Famille, tout public", tag: "famille" },
  { id: "fun" as Vibe, name: "Fun", emoji: "😏", description: "Entre amis, léger et drôle", tag: "amis" },
  { id: "hot" as Vibe, name: "Hot", emoji: "🔥", description: "Soirée, ça monte d'un cran", tag: "soirée" },
  { id: "chaos" as Vibe, name: "Chaos", emoji: "💀", description: "Vous êtes prévenus…", tag: "dangereux" },
];

export const STORE_PACKS = [
  { id: "chaos_mada", name: "Chaos Mada", emoji: "🇲🇬", description: "Références 100% malgaches", price: "Gratuit", free: true, cardCount: 80 },
  { id: "couple_date", name: "Couple / Date", emoji: "💕", description: "Intimité, complicité, connexion", price: "1 500 Ar", free: false, cardCount: 60 },
  { id: "campus_coloc", name: "Campus / Coloc", emoji: "🎓", description: "Fac, coloc, crush, sorties", price: "1 500 Ar", free: false, cardCount: 60 },
  { id: "sans_filtre_plus", name: "Sans Filtre+", emoji: "🌶️", description: "Le pack le plus osé", price: "2 000 Ar", free: false, cardCount: 80 },
  { id: "fianakaviana", name: "Fianakaviana XL", emoji: "👨‍👩‍👧‍👦", description: "100 cartes famille en plus", price: "1 000 Ar", free: false, cardCount: 100 },
  { id: "nosy_be", name: "Nosy Be Edition", emoji: "🏝️", description: "Spécial vacances & plage", price: "1 500 Ar", free: false, cardCount: 50 },
];

// ==========================================
// MASSIVE CARD DATABASE
// ==========================================

const td = (id: string, vibe: Vibe, type: GameCard["card_type"], text: string, min = 2, max = 12, prop: GameCard["requires_prop"] = "none"): GameCard => ({
  id, mode: "truth_dare", vibe, lang: "fr", card_type: type, text, requires_prop: prop, player_min: min, player_max: max,
});

const nh = (id: string, vibe: Vibe, text: string, min = 3, max = 12): GameCard => ({
  id, mode: "never_have_i_ever", vibe, lang: "fr", card_type: "vote", text, requires_prop: "none", player_min: min, player_max: max,
});

const ml = (id: string, vibe: Vibe, text: string, min = 3, max = 12): GameCard => ({
  id, mode: "most_likely", vibe, lang: "fr", card_type: "vote", text, requires_prop: "none", player_min: min, player_max: max,
});

const wr = (id: string, vibe: Vibe, text: string): GameCard => ({
  id, mode: "would_you_rather", vibe, lang: "fr", card_type: "truth", text, requires_prop: "none", player_min: 2, player_max: 12,
});

const qc = (id: string, vibe: Vibe, text: string, min = 2, max = 12): GameCard => ({
  id, mode: "quick_challenge", vibe, lang: "fr", card_type: "timer", text, requires_prop: "none", player_min: min, player_max: max,
});

export const CARDS: GameCard[] = [
  // ============================================
  // ACTION OU VÉRITÉ — SOFT (40 cartes)
  // ============================================
  td("s01", "soft", "truth", "C'est quoi ton plat préféré de maman ?"),
  td("s02", "soft", "truth", "{player}, si tu pouvais avoir un super-pouvoir, ce serait quoi ?"),
  td("s03", "soft", "dare", "{player}, fais deviner un film en mimant. Tu as 30 secondes.", 3),
  td("s04", "soft", "dare", "{player}, chante le refrain de ta chanson préférée."),
  td("s05", "soft", "truth", "{player}, c'est quoi ton souvenir d'enfance le plus drôle ?"),
  td("s06", "soft", "dare", "{player}, fais ton meilleur accent étranger pendant 20 secondes."),
  td("s07", "soft", "truth", "{player}, qui dans cette pièce serait le meilleur prof ?", 3),
  td("s08", "soft", "dare", "{player}, dessine un animal les yeux fermés. Les autres devinent.", 3),
  td("s09", "soft", "truth", "{player}, c'est quoi le truc le plus gentil qu'on t'ait dit ?"),
  td("s10", "soft", "group", "Tout le monde : levez la main si vous avez déjà eu peur du noir.", 3),
  td("s11", "soft", "dare", "{player}, imite un animal pendant 10 secondes. Le groupe devine.", 3),
  td("s12", "soft", "truth", "{player}, si tu pouvais voyager n'importe où, ce serait où ?"),
  td("s13", "soft", "dare", "{player}, dis l'alphabet à l'envers le plus vite possible."),
  td("s14", "soft", "truth", "{player}, c'est quoi ta plus grande peur ?"),
  td("s15", "soft", "dare", "{player}, fais rire quelqu'un sans parler. Tu as 15 secondes.", 3),
  td("s16", "soft", "truth", "{player}, quel métier tu voulais faire quand tu étais petit ?"),
  td("s17", "soft", "group", "Chacun dit son emoji préféré. Le groupe vote le meilleur.", 3),
  td("s18", "soft", "dare", "{player}, raconte une blague. Si personne rit, tu refais.", 3),
  td("s19", "soft", "truth", "{player}, c'est quoi le dernier truc qui t'a fait pleurer de rire ?"),
  td("s20", "soft", "dare", "{player}, fais ta meilleure imitation de robot pendant 15 secondes."),
  td("s21", "soft", "truth", "{player}, si tu devais manger un seul plat pour toujours, lequel ?"),
  td("s22", "soft", "dare", "{player}, invente une chanson sur la personne à ta droite. 20 sec.", 3),
  td("s23", "soft", "truth", "{player}, c'est quoi ton talent caché le plus inutile ?"),
  td("s24", "soft", "group", "Debout si vous préférez les chiens aux chats !", 3),
  td("s25", "soft", "dare", "{player}, mime ton emoji préféré. Les autres devinent.", 3),
  td("s26", "soft", "truth", "{player}, quelle est la chose la plus bizarre que tu aies mangée ?"),
  td("s27", "soft", "dare", "{player}, parle comme un commentateur sportif pendant 15 secondes."),
  td("s28", "soft", "truth", "{player}, qui est ton héros ou héroïne préféré(e) ?"),
  td("s29", "soft", "dare", "{player}, fais 10 squats maintenant. Pas de triche."),
  td("s30", "soft", "truth", "{player}, c'est quoi le meilleur cadeau qu'on t'ait offert ?"),
  td("s31", "soft", "duel", "{player} vs {player2} : celui qui tient le plus longtemps sans cligner gagne."),
  td("s32", "soft", "truth", "{player}, si tu étais un animal, tu serais lequel ?"),
  td("s33", "soft", "dare", "{player}, fais semblant de présenter la météo pendant 20 secondes."),
  td("s34", "soft", "truth", "{player}, c'est quoi ton dessin animé préféré ?"),
  td("s35", "soft", "dare", "{player}, dis 'je t'aime' à la personne en face de toi en la regardant dans les yeux.", 3),
  td("s36", "soft", "group", "Chacun dit le dernier truc drôle sur son téléphone.", 3),
  td("s37", "soft", "truth", "{player}, quel jour de ta vie tu voudrais revivre ?"),
  td("s38", "soft", "dare", "{player}, marche au ralenti jusqu'à l'autre bout de la pièce et reviens."),
  td("s39", "soft", "truth", "{player}, c'est quoi le compliment qui t'a le plus touché ?"),
  td("s40", "soft", "dare", "{player}, fais une grimace. Le groupe note sur 10.", 3),

  // ============================================
  // ACTION OU VÉRITÉ — FUN (50 cartes)
  // ============================================
  td("f01", "fun", "truth", "C'est quoi le mensonge le plus bête que tu as raconté cette semaine ?"),
  td("f02", "fun", "dare", "{player}, imite la personne à ta gauche pendant 30 secondes.", 3),
  td("f03", "fun", "truth", "{player}, c'est qui la dernière personne que tu as stalkée sur les réseaux ?"),
  td("f04", "fun", "dare", "{player}, envoie un vocal à ton dernier contact WhatsApp en chantant.", 2, 12, "phone"),
  td("f05", "fun", "group", "Tout le monde : levez la main si vous avez déjà menti pour éviter une sortie.", 3),
  td("f06", "fun", "duel", "{player} vs {player2} : celui qui tient le plus longtemps sans rire gagne."),
  td("f07", "fun", "truth", "{player}, c'est quoi la chose la plus gênante dans ton historique de recherche ?"),
  td("f08", "fun", "dare", "{player}, fais ta meilleure danse pendant 15 secondes. Maintenant."),
  td("f09", "fun", "truth", "{player}, t'as déjà eu un crush sur quelqu'un dans cette pièce ?", 3),
  td("f10", "fun", "dare", "{player}, appelle le 3ème contact de ton répertoire et dis 'tu me manques'.", 2, 12, "phone"),
  td("f11", "fun", "truth", "{player}, c'est quoi la pire excuse que tu as donnée pour ne pas sortir ?"),
  td("f12", "fun", "dare", "{player}, poste une story avec juste un emoji cœur sans contexte.", 2, 12, "phone"),
  td("f13", "fun", "truth", "{player}, si tu devais supprimer un réseau social pour toujours, lequel ?"),
  td("f14", "fun", "group", "Levez la main si vous avez déjà screenshot une conversation pour la montrer à quelqu'un.", 3),
  td("f15", "fun", "dare", "{player}, laisse {player2} poster ce qu'il veut sur ton statut WhatsApp.", 2, 12, "phone"),
  td("f16", "fun", "truth", "{player}, c'est quoi le pire rencard que tu as eu ?"),
  td("f17", "fun", "dare", "{player}, parle avec un accent pendant les 3 prochains tours."),
  td("f18", "fun", "truth", "{player}, t'as déjà fait semblant de ne pas voir quelqu'un que tu connaissais ?"),
  td("f19", "fun", "dare", "{player}, fais un compliment sincère à chaque personne ici.", 3),
  td("f20", "fun", "truth", "{player}, c'est quoi le truc le plus cher que tu as cassé ?"),
  td("f21", "fun", "dare", "{player}, imite la façon de marcher de {player2}.", 3),
  td("f22", "fun", "truth", "{player}, quel est ton guilty pleasure musical ?"),
  td("f23", "fun", "group", "Chacun donne une note de 1 à 10 à sa propre journée. Le plus bas raconte.", 3),
  td("f24", "fun", "dare", "{player}, fais une déclaration d'amour dramatique à un objet dans la pièce."),
  td("f25", "fun", "truth", "{player}, c'est qui ici qui te fait le plus rire ?", 3),
  td("f26", "fun", "dare", "{player}, montre ta dernière photo dans ta galerie à tout le monde.", 2, 12, "phone"),
  td("f27", "fun", "truth", "{player}, t'as déjà menti à tes parents sur où tu étais ?"),
  td("f28", "fun", "duel", "{player} vs {player2} : bataille de regard. Premier qui détourne perd."),
  td("f29", "fun", "truth", "{player}, c'est quoi le truc le plus random que tu as fait à 3h du mat ?"),
  td("f30", "fun", "dare", "{player}, fais le bruit d'un klaxon de taxi-be pendant 5 secondes."),
  td("f31", "fun", "truth", "{player}, t'as déjà fait semblant d'aimer un cadeau ?"),
  td("f32", "fun", "dare", "{player}, danse sur la prochaine chanson que {player2} choisit pendant 20 sec."),
  td("f33", "fun", "truth", "{player}, si tu pouvais lire les pensées de quelqu'un ici, ce serait qui ?", 3),
  td("f34", "fun", "group", "Tout le monde ferme les yeux. Pointez vers la personne la plus drôle.", 3),
  td("f35", "fun", "dare", "{player}, fais semblant de pleurer de manière très dramatique."),
  td("f36", "fun", "truth", "{player}, quel est le dernier mensonge que tu as dit aujourd'hui ?"),
  td("f37", "fun", "dare", "{player}, échange de place avec {player2} et imite sa posture exacte."),
  td("f38", "fun", "truth", "{player}, si tu devais vivre avec quelqu'un ici, ce serait qui ?", 3),
  td("f39", "fun", "dare", "{player}, raconte l'histoire la plus embarrassante de ta vie en 30 secondes."),
  td("f40", "fun", "truth", "{player}, c'est quoi ton red flag n°1 chez quelqu'un ?"),
  td("f41", "fun", "dare", "{player}, fais un freestyle de rap sur {player2}. 20 secondes."),
  td("f42", "fun", "truth", "{player}, t'as déjà envoyé un message à la mauvaise personne ?"),
  td("f43", "fun", "group", "Tout le monde : imitez la personne la plus vieille du groupe.", 3),
  td("f44", "fun", "dare", "{player}, parle comme un robot jusqu'au prochain tour."),
  td("f45", "fun", "truth", "{player}, c'est quoi la chose la plus bizarre dans ton téléphone ?"),
  td("f46", "fun", "duel", "{player} vs {player2} : le premier qui fait rire l'autre a gagné."),
  td("f47", "fun", "truth", "{player}, quelle est ta plus grande insécurité ?"),
  td("f48", "fun", "dare", "{player}, dis le nom de ton crush devant tout le monde. Pas d'esquive.", 3),
  td("f49", "fun", "truth", "{player}, si tu pouvais échanger de vie avec quelqu'un ici pour 1 jour, qui ?", 3),
  td("f50", "fun", "dare", "{player}, fais une pub TV improvisée pour un objet choisi par {player2}."),

  // ============================================
  // ACTION OU VÉRITÉ — HOT (45 cartes)
  // ============================================
  td("h01", "hot", "truth", "{player}, c'est quoi ta plus grosse honte en soirée ?"),
  td("h02", "hot", "dare", "{player}, envoie 'tu me manques bcp' à ton ex ou à un crush.", 2, 12, "phone"),
  td("h03", "hot", "truth", "{player}, t'as déjà embrassé quelqu'un que tu regrettes ?"),
  td("h04", "hot", "dare", "{player}, fais un lap dance de 10 secondes sur une chaise.", 3),
  td("h05", "hot", "truth", "{player}, c'est quoi le truc le plus fou que tu as fait par amour ?"),
  td("h06", "hot", "dare", "{player}, chuchote quelque chose de gênant à l'oreille de {player2}."),
  td("h07", "hot", "truth", "{player}, t'as déjà ghosté quelqu'un ? Pourquoi ?"),
  td("h08", "hot", "group", "Levez la main si vous avez déjà menti sur votre nombre d'ex.", 3),
  td("h09", "hot", "dare", "{player}, laisse {player2} envoyer un DM depuis ton compte.", 2, 12, "phone"),
  td("h10", "hot", "truth", "{player}, c'est quoi ton type physique idéal ? Sois précis."),
  td("h11", "hot", "dare", "{player}, fais une danse sensuelle pendant 15 secondes. No joke."),
  td("h12", "hot", "truth", "{player}, quelle est la chose la plus risquée que tu aies faite ?"),
  td("h13", "hot", "dare", "{player}, enlève un vêtement de ton choix (chaussettes ça compte)."),
  td("h14", "hot", "truth", "{player}, t'as déjà stalké l'ex de ton ex ?"),
  td("h15", "hot", "duel", "{player} vs {player2} : regardez-vous dans les yeux 30 sec sans rire."),
  td("h16", "hot", "truth", "{player}, raconte ton pire date Tinder ou rencontre en ligne."),
  td("h17", "hot", "dare", "{player}, fais ta meilleure imitation d'un séducteur/séductrice."),
  td("h18", "hot", "truth", "{player}, si tu devais embrasser quelqu'un dans cette pièce, qui ?", 3),
  td("h19", "hot", "dare", "{player}, lis à voix haute ton dernier DM envoyé à un crush.", 2, 12, "phone"),
  td("h20", "hot", "truth", "{player}, c'est quoi la chose la plus embarrassante que tes parents ont découverte ?"),
  td("h21", "hot", "group", "Pointez la personne ici qui a le plus de game. 1, 2, 3… pointez !", 3),
  td("h22", "hot", "dare", "{player}, appelle quelqu'un et dis 'je pense à toi ce soir' sans contexte.", 2, 12, "phone"),
  td("h23", "hot", "truth", "{player}, t'es déjà tombé amoureux de l'ami(e) de ton pote ?"),
  td("h24", "hot", "dare", "{player}, fais semblant de draguer {player2} de la manière la plus absurde."),
  td("h25", "hot", "truth", "{player}, c'est quoi le secret que personne ici ne connaît ?", 3),
  td("h26", "hot", "dare", "{player}, montre ta conversation la plus gênante à tout le monde.", 2, 12, "phone"),
  td("h27", "hot", "truth", "{player}, t'as déjà dit 'je t'aime' sans le penser ?"),
  td("h28", "hot", "dare", "{player}, fais un slow avec {player2}. 15 secondes. C'est tout."),
  td("h29", "hot", "truth", "{player}, c'est quoi ton fantasme de vie le plus inavouable ?"),
  td("h30", "hot", "group", "Fermez les yeux. Pointez la personne la plus séduisante. 3, 2, 1…", 3),
  td("h31", "hot", "dare", "{player}, enregistre un vocal séducteur et envoie-le au dernier contact.", 2, 12, "phone"),
  td("h32", "hot", "truth", "{player}, t'as déjà eu des sentiments pour deux personnes en même temps ?"),
  td("h33", "hot", "dare", "{player}, mange/bois quelque chose choisi par le groupe.", 3),
  td("h34", "hot", "truth", "{player}, c'est quoi le truc le plus manipulateur que tu aies fait ?"),
  td("h35", "hot", "dare", "{player}, échange ton téléphone avec {player2} pendant 2 tours.", 2, 12, "phone"),
  td("h36", "hot", "truth", "{player}, quelle est ta plus grande fierté secrète ?"),
  td("h37", "hot", "duel", "{player} vs {player2} : le plus convaincant en fake drague gagne. Le groupe vote.", 3),
  td("h38", "hot", "truth", "{player}, t'as déjà fait quelque chose d'illégal (de pas grave) ?"),
  td("h39", "hot", "dare", "{player}, fais une déclaration d'amour à {player2} en étant 100% sérieux."),
  td("h40", "hot", "truth", "{player}, si quelqu'un ici t'invitait en date, tu dirais oui à qui ?", 3),
  td("h41", "hot", "dare", "{player}, prends le téléphone de {player2} et like la dernière photo de son crush.", 2, 12, "phone"),
  td("h42", "hot", "truth", "{player}, c'est quoi ton plus gros regret amoureux ?"),
  td("h43", "hot", "group", "Tour de table : chacun dit la chose la plus folle qu'il a faite pour impressionner quelqu'un.", 3),
  td("h44", "hot", "dare", "{player}, fais un câlin de 10 secondes à {player2}. En silence."),
  td("h45", "hot", "truth", "{player}, raconte un truc que tu n'as jamais dit à personne."),

  // ============================================
  // ACTION OU VÉRITÉ — CHAOS (40 cartes)
  // ============================================
  td("c01", "chaos", "truth", "{player}, dis le mensonge le plus bête que tu as raconté pour éviter quelqu'un."),
  td("c02", "chaos", "dare", "{player}, appelle ta mère et dis-lui que tu as raté un examen. Tiens 10 sec.", 2, 12, "phone"),
  td("c03", "chaos", "truth", "{player}, c'est quoi ta plus grosse honte dans un taxi-be ?"),
  td("c04", "chaos", "dare", "{player}, fais une imitation de quelqu'un qui négocie le prix au marché."),
  td("c05", "chaos", "truth", "{player}, raconte ta pire excuse quand la Jirama a coupé et que t'avais pas de bougie."),
  td("c06", "chaos", "group", "Levez la main si vous avez déjà dit 'j'arrive dans 5 minutes' alors que vous étiez encore chez vous.", 3),
  td("c07", "chaos", "dare", "{player}, fais semblant d'être un vendeur de rue pendant 20 secondes."),
  td("c08", "chaos", "truth", "{player}, c'est quoi le pire repas que tu as mangé chez quelqu'un sans rien dire ?"),
  td("c09", "chaos", "dare", "{player}, envoie 'allo, c'est urgent' à un contact random et attends la réponse.", 2, 12, "phone"),
  td("c10", "chaos", "truth", "{player}, t'as déjà fait semblant d'avoir du réseau pour éviter un appel ?"),
  td("c11", "chaos", "dare", "{player}, imite 3 vendeurs de rue différents en 20 secondes.", 3),
  td("c12", "chaos", "truth", "{player}, raconte ton plus gros fail en public à Tana."),
  td("c13", "chaos", "duel", "{player} vs {player2} : le meilleur kabary en 15 secondes. Le groupe juge."),
  td("c14", "chaos", "dare", "{player}, parle en malagasy soutenu pendant les 2 prochains tours."),
  td("c15", "chaos", "truth", "{player}, t'as déjà menti sur ton adresse pour un truc administratif ?"),
  td("c16", "chaos", "group", "Qui ici a déjà couru pour attraper un taxi-be qui partait ? Debout !", 3),
  td("c17", "chaos", "dare", "{player}, fais ta meilleure imitation d'un embouteillage à Analakely."),
  td("c18", "chaos", "truth", "{player}, c'est quoi la chose la plus malgache que tu fais sans t'en rendre compte ?"),
  td("c19", "chaos", "dare", "{player}, appelle un ami et dis-lui 'il faut qu'on parle' sans rien ajouter.", 2, 12, "phone"),
  td("c20", "chaos", "truth", "{player}, t'as déjà inventé une excuse pour éviter un kabary ?"),
  td("c21", "chaos", "dare", "{player}, fais du haggling imaginaire avec {player2} qui vend une chaise."),
  td("c22", "chaos", "truth", "{player}, raconte ta pire histoire avec un voisin bruyant."),
  td("c23", "chaos", "group", "Tour de table : chacun imite quelqu'un d'ici. On devine qui c'est.", 3),
  td("c24", "chaos", "dare", "{player}, mange quelque chose les yeux bandés, choisi par le groupe.", 3),
  td("c25", "chaos", "truth", "{player}, c'est quoi le truc le plus random que tu as acheté en bord de route ?"),
  td("c26", "chaos", "dare", "{player}, fais un discours politique fictif de 20 secondes."),
  td("c27", "chaos", "truth", "{player}, t'as déjà dit oui à un truc sans savoir du tout ce que c'était ?"),
  td("c28", "chaos", "duel", "{player} vs {player2} : fake pleurs. Le plus convaincant gagne.", 3),
  td("c29", "chaos", "dare", "{player}, enregistre un vocal en pleurant à quelqu'un. Envoie-le.", 2, 12, "phone"),
  td("c30", "chaos", "truth", "{player}, si tu devais résumer ta vie en un proverbe malgache, ce serait lequel ?"),
  td("c31", "chaos", "dare", "{player}, fais une battle de beatbox avec {player2}. 10 sec chacun.", 3),
  td("c32", "chaos", "truth", "{player}, raconte un truc que tu as fait et que ta mère ne doit JAMAIS savoir."),
  td("c33", "chaos", "dare", "{player}, fais le DJ et mets l'ambiance pendant 30 secondes sans musique."),
  td("c34", "chaos", "group", "Chacun raconte en une phrase sa pire honte de cette année.", 3),
  td("c35", "chaos", "truth", "{player}, c'est quoi le truc que tu fais en cachette que tout le monde fait ?"),
  td("c36", "chaos", "dare", "{player}, laisse le groupe poster ce qu'il veut sur ton statut WhatsApp.", 3, 12, "phone"),
  td("c37", "chaos", "truth", "{player}, t'as déjà pleuré pour un truc vraiment pas grave ?"),
  td("c38", "chaos", "dare", "{player}, fais un roast de 15 secondes sur {player2}. Avec amour."),
  td("c39", "chaos", "truth", "{player}, si on faisait un film de ta vie, ce serait quel genre ?"),
  td("c40", "chaos", "dare", "{player}, fais une scène de rupture dramatique avec {player2}. Oscars level."),

  // ============================================
  // JE N'AI JAMAIS — SOFT (20)
  // ============================================
  nh("ns01", "soft", "Je n'ai jamais fait semblant de dormir pour ne pas ouvrir la porte."),
  nh("ns02", "soft", "Je n'ai jamais ri à une blague que je n'avais pas comprise."),
  nh("ns03", "soft", "Je n'ai jamais prétendu avoir lu un livre que je n'ai jamais ouvert."),
  nh("ns04", "soft", "Je n'ai jamais chanté sous la douche en pensant que personne n'entendait."),
  nh("ns05", "soft", "Je n'ai jamais mangé le dernier morceau en cachette."),
  nh("ns06", "soft", "Je n'ai jamais oublié le prénom de quelqu'un juste après qu'il se soit présenté."),
  nh("ns07", "soft", "Je n'ai jamais fait croire que j'étais malade pour rester à la maison."),
  nh("ns08", "soft", "Je n'ai jamais parlé tout seul quand personne ne regardait."),
  nh("ns09", "soft", "Je n'ai jamais eu peur d'un film pour enfants."),
  nh("ns10", "soft", "Je n'ai jamais raté mon arrêt de bus parce que je rêvassais."),
  nh("ns11", "soft", "Je n'ai jamais fait semblant de connaître une chanson."),
  nh("ns12", "soft", "Je n'ai jamais pleuré en regardant un dessin animé."),
  nh("ns13", "soft", "Je n'ai jamais dansé devant un miroir."),
  nh("ns14", "soft", "Je n'ai jamais dit 'c'est ma dernière bouchée' et pris 3 de plus."),
  nh("ns15", "soft", "Je n'ai jamais googlé mon propre nom."),
  nh("ns16", "soft", "Je n'ai jamais envoyé un bisou à la mauvaise personne."),
  nh("ns17", "soft", "Je n'ai jamais fait tomber mon téléphone sur ma figure au lit."),
  nh("ns18", "soft", "Je n'ai jamais fait semblant d'être occupé pour éviter quelqu'un."),
  nh("ns19", "soft", "Je n'ai jamais dit 'j'ai pas faim' et mangé quand même."),
  nh("ns20", "soft", "Je n'ai jamais fait de vœu en voyant une étoile filante."),

  // ============================================
  // JE N'AI JAMAIS — FUN (25)
  // ============================================
  nh("nf01", "fun", "Je n'ai jamais fait semblant de ne pas voir quelqu'un dans la rue."),
  nh("nf02", "fun", "Je n'ai jamais lu les messages de quelqu'un d'autre en cachette."),
  nh("nf03", "fun", "Je n'ai jamais mangé un truc tombé par terre quand personne ne regardait."),
  nh("nf04", "fun", "Je n'ai jamais screenshot une conversation pour la montrer à quelqu'un."),
  nh("nf05", "fun", "Je n'ai jamais stalké un ex sur les réseaux."),
  nh("nf06", "fun", "Je n'ai jamais menti sur mon âge."),
  nh("nf07", "fun", "Je n'ai jamais fait semblant d'être au téléphone pour éviter quelqu'un."),
  nh("nf08", "fun", "Je n'ai jamais envoyé un message et regretté immédiatement."),
  nh("nf09", "fun", "Je n'ai jamais dit du mal de quelqu'un qui était juste derrière moi."),
  nh("nf10", "fun", "Je n'ai jamais annulé un plan à la dernière minute juste par flemme."),
  nh("nf11", "fun", "Je n'ai jamais mis un like par accident en stalkant."),
  nh("nf12", "fun", "Je n'ai jamais répondu 'haha' à un message qui ne m'a pas fait rire du tout."),
  nh("nf13", "fun", "Je n'ai jamais trahi un secret."),
  nh("nf14", "fun", "Je n'ai jamais fait semblant de comprendre un mot en anglais."),
  nh("nf15", "fun", "Je n'ai jamais menti dans un CV."),
  nh("nf16", "fun", "Je n'ai jamais pleuré à cause d'un film romantique."),
  nh("nf17", "fun", "Je n'ai jamais texté quelqu'un en étant à côté de lui."),
  nh("nf18", "fun", "Je n'ai jamais fait un achat impulsif et regretté."),
  nh("nf19", "fun", "Je n'ai jamais dit 'on se voit bientôt' sans aucune intention de le faire."),
  nh("nf20", "fun", "Je n'ai jamais triché à un jeu de société."),
  nh("nf21", "fun", "Je n'ai jamais porté le même vêtement 3 jours de suite."),
  nh("nf22", "fun", "Je n'ai jamais supprimé un message avant que l'autre le lise."),
  nh("nf23", "fun", "Je n'ai jamais ignoré un appel et envoyé un SMS 'je suis occupé'."),
  nh("nf24", "fun", "Je n'ai jamais flirté juste pour l'ego."),
  nh("nf25", "fun", "Je n'ai jamais pris un selfie et mis plus de 10 minutes à choisir le filtre."),

  // ============================================
  // JE N'AI JAMAIS — HOT (20)
  // ============================================
  nh("nh01", "hot", "Je n'ai jamais embrassé quelqu'un que je venais de rencontrer."),
  nh("nh02", "hot", "Je n'ai jamais menti à un(e) ex pour le/la rendre jaloux(se)."),
  nh("nh03", "hot", "Je n'ai jamais eu un crush sur l'ami(e) de mon/ma meilleur(e) ami(e)."),
  nh("nh04", "hot", "Je n'ai jamais envoyé un message que j'aurais dû garder pour moi."),
  nh("nh05", "hot", "Je n'ai jamais dragué juste pour voir si je pouvais."),
  nh("nh06", "hot", "Je n'ai jamais menti sur mes sentiments pour quelqu'un."),
  nh("nh07", "hot", "Je n'ai jamais été jaloux(se) d'un(e) ami(e) de mon/ma copain/copine."),
  nh("nh08", "hot", "Je n'ai jamais dit 'je t'aime' en premier."),
  nh("nh09", "hot", "Je n'ai jamais eu deux dates dans la même journée."),
  nh("nh10", "hot", "Je n'ai jamais regretté une relation entière."),
  nh("nh11", "hot", "Je n'ai jamais gardé un secret sur ma vie amoureuse pendant plus d'un mois."),
  nh("nh12", "hot", "Je n'ai jamais envoyé un message à un(e) ex à 2h du matin."),
  nh("nh13", "hot", "Je n'ai jamais eu le cœur brisé à cause de quelqu'un dans cette pièce."),
  nh("nh14", "hot", "Je n'ai jamais fait quelque chose d'illégal pour impressionner quelqu'un."),
  nh("nh15", "hot", "Je n'ai jamais été 'l'autre' dans une relation."),
  nh("nh16", "hot", "Je n'ai jamais ghosté quelqu'un après un premier date."),
  nh("nh17", "hot", "Je n'ai jamais fait semblant d'être ivre pour avoir une excuse."),
  nh("nh18", "hot", "Je n'ai jamais pleuré pour quelqu'un qui ne le méritait pas."),
  nh("nh19", "hot", "Je n'ai jamais eu un plan B en cas d'échec amoureux."),
  nh("nh20", "hot", "Je n'ai jamais supprimé toutes les photos d'un(e) ex dans un moment de rage."),

  // ============================================
  // JE N'AI JAMAIS — CHAOS (15)
  // ============================================
  nh("nc01", "chaos", "Je n'ai jamais inventé une excuse pour éviter un kabary."),
  nh("nc02", "chaos", "Je n'ai jamais fait semblant d'avoir du réseau pour éviter un appel."),
  nh("nc03", "chaos", "Je n'ai jamais menti à un policier à Tana."),
  nh("nc04", "chaos", "Je n'ai jamais couru après un taxi-be en criant."),
  nh("nc05", "chaos", "Je n'ai jamais mangé du vary à 3h du matin."),
  nh("nc06", "chaos", "Je n'ai jamais blâmé la Jirama pour un truc qui n'avait rien à voir."),
  nh("nc07", "chaos", "Je n'ai jamais fait un truc super gênant dans un lieu public à Tana."),
  nh("nc08", "chaos", "Je n'ai jamais négocié le prix d'un taxi jusqu'à ce que le chauffeur s'énerve."),
  nh("nc09", "chaos", "Je n'ai jamais prétendu être au courant d'un ragot juste pour avoir les détails."),
  nh("nc10", "chaos", "Je n'ai jamais fait semblant de comprendre le malagasy officiel."),
  nh("nc11", "chaos", "Je n'ai jamais esquivé un cousin au marché pour ne pas payer quelque chose."),
  nh("nc12", "chaos", "Je n'ai jamais blâmé quelqu'un d'autre pour un truc que j'ai fait."),
  nh("nc13", "chaos", "Je n'ai jamais fait un truc juste pour la story Instagram."),
  nh("nc14", "chaos", "Je n'ai jamais inventé un problème de réseau pour couper un appel."),
  nh("nc15", "chaos", "Je n'ai jamais fait semblant de connaître quelqu'un pour éviter un malaise."),

  // ============================================
  // QUI EST LE PLUS — SOFT (15)
  // ============================================
  ml("ms01", "soft", "Qui est le plus susceptible de s'endormir en premier ?"),
  ml("ms02", "soft", "Qui est le plus susceptible de devenir célèbre ?"),
  ml("ms03", "soft", "Qui est le plus susceptible de pleurer devant un film ?"),
  ml("ms04", "soft", "Qui est le plus susceptible d'oublier un anniversaire ?"),
  ml("ms05", "soft", "Qui est le plus susceptible de devenir président ?"),
  ml("ms06", "soft", "Qui est le plus susceptible de se perdre dans un endroit qu'il connaît ?"),
  ml("ms07", "soft", "Qui est le plus susceptible de parler à un inconnu dans la rue ?"),
  ml("ms08", "soft", "Qui est le plus susceptible de manger le dernier biscuit ?"),
  ml("ms09", "soft", "Qui est le plus susceptible de rater son réveil ?"),
  ml("ms10", "soft", "Qui est le plus susceptible de se mettre à danser sans raison ?"),
  ml("ms11", "soft", "Qui est le plus susceptible de garder un secret jusqu'à la tombe ?"),
  ml("ms12", "soft", "Qui est le plus susceptible de faire un câlin à tout le monde ?"),
  ml("ms13", "soft", "Qui est le plus susceptible d'adopter 10 chats ?"),
  ml("ms14", "soft", "Qui est le plus susceptible de finir en voyage solo autour du monde ?"),
  ml("ms15", "soft", "Qui est le plus susceptible de rire de sa propre blague ?"),

  // ============================================
  // QUI EST LE PLUS — FUN (20)
  // ============================================
  ml("mf01", "fun", "Qui est le plus susceptible de ghoster quelqu'un sans raison ?"),
  ml("mf02", "fun", "Qui est le plus susceptible de se battre avec un distributeur automatique ?"),
  ml("mf03", "fun", "Qui est le plus susceptible d'envoyer un message gênant au mauvais groupe ?"),
  ml("mf04", "fun", "Qui est le plus susceptible de mentir sur sa localisation ?"),
  ml("mf05", "fun", "Qui est le plus susceptible de créer un faux profil ?"),
  ml("mf06", "fun", "Qui est le plus susceptible de finir en détention pour un truc stupide ?"),
  ml("mf07", "fun", "Qui est le plus susceptible de tomber amoureux en premier ?"),
  ml("mf08", "fun", "Qui est le plus susceptible de stalker un crush pendant 3 heures ?"),
  ml("mf09", "fun", "Qui est le plus susceptible d'avoir un double compte secret ?"),
  ml("mf10", "fun", "Qui est le plus susceptible de finir dans une vidéo virale embarrassante ?"),
  ml("mf11", "fun", "Qui est le plus susceptible de voler la frite de quelqu'un sans demander ?"),
  ml("mf12", "fun", "Qui est le plus susceptible de se faire recaler d'une boîte ?"),
  ml("mf13", "fun", "Qui est le plus susceptible de pleurer à un mariage ?"),
  ml("mf14", "fun", "Qui est le plus susceptible de se marier en premier ?"),
  ml("mf15", "fun", "Qui est le plus susceptible de dire un truc gênant devant les parents ?"),
  ml("mf16", "fun", "Qui est le plus susceptible de répondre honnêtement à cette question ?"),
  ml("mf17", "fun", "Qui est le plus susceptible de faire un discours de mariage qui fait pleurer tout le monde ?"),
  ml("mf18", "fun", "Qui est le plus susceptible de devenir influenceur ?"),
  ml("mf19", "fun", "Qui est le plus susceptible de dormir pendant un film au cinéma ?"),
  ml("mf20", "fun", "Qui est le plus susceptible de manger un repas entier debout dans la cuisine ?"),

  // ============================================
  // QUI EST LE PLUS — HOT (15)
  // ============================================
  ml("mh01", "hot", "Qui est le plus susceptible de se réveiller à côté de quelqu'un de surprenant ?"),
  ml("mh02", "hot", "Qui est le plus susceptible de briser un cœur cette année ?"),
  ml("mh03", "hot", "Qui est le plus susceptible de retourner avec son ex ?"),
  ml("mh04", "hot", "Qui est le plus susceptible d'avoir une vie secrète ?"),
  ml("mh05", "hot", "Qui est le plus susceptible de finir dans un couple inattendu ici ?"),
  ml("mh06", "hot", "Qui est le plus susceptible de faire le premier pas ?"),
  ml("mh07", "hot", "Qui est le plus susceptible d'avoir le plus de contacts WhatsApp non-répondus ?"),
  ml("mh08", "hot", "Qui est le plus susceptible de dire 'on est juste amis' alors que c'est plus ?"),
  ml("mh09", "hot", "Qui est le plus susceptible de draguer le serveur/la serveuse ?"),
  ml("mh10", "hot", "Qui est le plus susceptible de mentir sur ses sentiments ?"),
  ml("mh11", "hot", "Qui est le plus susceptible de faire une scène de jalousie en public ?"),
  ml("mh12", "hot", "Qui est le plus susceptible de se marier pour l'argent ?"),
  ml("mh13", "hot", "Qui est le plus susceptible de pleurer après une rupture pendant 6 mois ?"),
  ml("mh14", "hot", "Qui est le plus susceptible d'avoir le plus gros body count ici ?"),
  ml("mh15", "hot", "Qui est le plus susceptible de tomber amoureux de quelqu'un dans cette pièce ?"),

  // ============================================
  // QUI EST LE PLUS — CHAOS (10)
  // ============================================
  ml("mc01", "chaos", "Qui est le plus susceptible de se perdre dans Analakely ?"),
  ml("mc02", "chaos", "Qui est le plus susceptible de se faire arnaquer au marché ?"),
  ml("mc03", "chaos", "Qui est le plus susceptible de finir dans un taxi-be en direction du mauvais endroit ?"),
  ml("mc04", "chaos", "Qui est le plus susceptible de provoquer une coupure Jirama ?"),
  ml("mc05", "chaos", "Qui est le plus susceptible de faire un kabary de 30 minutes sans s'arrêter ?"),
  ml("mc06", "chaos", "Qui est le plus susceptible de devenir viral sur Facebook Mada ?"),
  ml("mc07", "chaos", "Qui est le plus susceptible de négocier le prix d'un truc gratuit ?"),
  ml("mc08", "chaos", "Qui est le plus susceptible d'inventer un nouveau proverbe malgache ?"),
  ml("mc09", "chaos", "Qui est le plus susceptible de se faire gronder par sa mère demain ?"),
  ml("mc10", "chaos", "Qui est le plus susceptible de raconter cette soirée sur Facebook ?"),

  // ============================================
  // TU PRÉFÈRES — SOFT (15)
  // ============================================
  wr("ws01", "soft", "Tu préfères ne plus jamais manger de chocolat ou ne plus jamais manger de glace ?"),
  wr("ws02", "soft", "Tu préfères pouvoir voler ou être invisible ?"),
  wr("ws03", "soft", "Tu préfères vivre sans musique ou sans films ?"),
  wr("ws04", "soft", "Tu préfères avoir le pouvoir de parler aux animaux ou de parler toutes les langues ?"),
  wr("ws05", "soft", "Tu préfères revivre le passé ou voir le futur ?"),
  wr("ws06", "soft", "Tu préfères ne plus jamais dormir ou ne plus jamais manger ?"),
  wr("ws07", "soft", "Tu préfères être le plus drôle ou le plus intelligent ?"),
  wr("ws08", "soft", "Tu préfères vivre 200 ans ou avoir 10 vies de 20 ans ?"),
  wr("ws09", "soft", "Tu préfères avoir un dinosaure ou un dragon comme animal de compagnie ?"),
  wr("ws10", "soft", "Tu préfères voyager dans l'espace ou au fond de l'océan ?"),
  wr("ws11", "soft", "Tu préfères être toujours en retard ou toujours trop en avance ?"),
  wr("ws12", "soft", "Tu préfères manger uniquement du sucré ou uniquement du salé ?"),
  wr("ws13", "soft", "Tu préfères ne plus jamais utiliser internet ou ne plus jamais voyager ?"),
  wr("ws14", "soft", "Tu préfères avoir la force de 100 personnes ou l'intelligence de 100 personnes ?"),
  wr("ws15", "soft", "Tu préfères vivre dans un monde sans couleurs ou sans sons ?"),

  // ============================================
  // TU PRÉFÈRES — FUN (20)
  // ============================================
  wr("wf01", "fun", "Tu préfères ne plus jamais utiliser ton téléphone ou ne plus jamais manger de vary ?"),
  wr("wf02", "fun", "Tu préfères que tout le monde lise tes messages ou voie ton historique de recherche ?"),
  wr("wf03", "fun", "Tu préfères perdre tous tes followers ou perdre tous tes contacts ?"),
  wr("wf04", "fun", "Tu préfères être bloqué par ton crush ou être vu en 'lu' pour toujours ?"),
  wr("wf05", "fun", "Tu préfères ne jamais pouvoir mentir ou ne jamais connaître la vérité ?"),
  wr("wf06", "fun", "Tu préfères revivre ton moment le plus gênant ou oublier ton meilleur souvenir ?"),
  wr("wf07", "fun", "Tu préfères que tes parents lisent tous tes DMs ou ceux de ton ex ?"),
  wr("wf08", "fun", "Tu préfères ne plus jamais rire ou ne plus jamais pleurer ?"),
  wr("wf09", "fun", "Tu préfères porter les mêmes vêtements chaque jour ou ne jamais porter le même truc deux fois ?"),
  wr("wf10", "fun", "Tu préfères être célèbre et détesté ou inconnu et aimé ?"),
  wr("wf11", "fun", "Tu préfères parler tout haut ce que tu penses ou ne plus jamais parler ?"),
  wr("wf12", "fun", "Tu préfères avoir une queue de chien ou des oreilles de lapin ?"),
  wr("wf13", "fun", "Tu préfères vivre sans wifi pendant un an ou sans sommeil pendant une semaine ?"),
  wr("wf14", "fun", "Tu préfères manger uniquement de la pizza ou uniquement des pâtes pour le reste de ta vie ?"),
  wr("wf15", "fun", "Tu préfères savoir comment tu vas mourir ou quand tu vas mourir ?"),
  wr("wf16", "fun", "Tu préfères ne jamais pouvoir fermer une porte ou ne jamais pouvoir l'ouvrir ?"),
  wr("wf17", "fun", "Tu préfères avoir la voix de Morgan Freeman ou les moves de Michael Jackson ?"),
  wr("wf18", "fun", "Tu préfères perdre la mémoire chaque matin ou la vue chaque soir ?"),
  wr("wf19", "fun", "Tu préfères vivre dans un monde avec des zombies ou avec des dinosaures ?"),
  wr("wf20", "fun", "Tu préfères renoncer à ton plat préféré ou à ta chanson préférée ?"),

  // ============================================
  // TU PRÉFÈRES — HOT (15)
  // ============================================
  wr("wh01", "hot", "Tu préfères embrasser ton ex ou ton pire ennemi ?"),
  wr("wh02", "hot", "Tu préfères que ton crush lise tes messages ou voie tes photos supprimées ?"),
  wr("wh03", "hot", "Tu préfères ne plus jamais avoir de date ou avoir un date chaque jour avec des inconnus ?"),
  wr("wh04", "hot", "Tu préfères dire à tout le monde qui tu aimes ou ne jamais pouvoir le dire ?"),
  wr("wh05", "hot", "Tu préfères être avec quelqu'un de beau mais ennuyeux ou moche mais hilarant ?"),
  wr("wh06", "hot", "Tu préfères oublier ton premier amour ou ton dernier amour ?"),
  wr("wh07", "hot", "Tu préfères que ton ex devienne meilleur ami de ton crush ou l'inverse ?"),
  wr("wh08", "hot", "Tu préfères avoir 100 dates ratées ou 0 date en 5 ans ?"),
  wr("wh09", "hot", "Tu préfères que tout le monde sache tes sentiments ou ne jamais pouvoir les exprimer ?"),
  wr("wh10", "hot", "Tu préfères revivre ta pire rupture ou ta pire soirée ?"),
  wr("wh11", "hot", "Tu préfères être trompé(e) sans le savoir ou le savoir mais ne rien pouvoir faire ?"),
  wr("wh12", "hot", "Tu préfères épouser le premier swipe right ou ne jamais swiper ?"),
  wr("wh13", "hot", "Tu préfères perdre l'amour de ta vie ou ne jamais le rencontrer ?"),
  wr("wh14", "hot", "Tu préfères être avec quelqu'un qui t'aime trop ou pas assez ?"),
  wr("wh15", "hot", "Tu préfères que tes amis choisissent ton prochain date ou ton ex ?"),

  // ============================================
  // TU PRÉFÈRES — CHAOS (10)
  // ============================================
  wr("wc01", "chaos", "Tu préfères vivre sans Jirama pendant un an ou sans WiFi pendant un an ?"),
  wr("wc02", "chaos", "Tu préfères prendre le taxi-be tous les jours ou ne plus jamais sortir de chez toi ?"),
  wr("wc03", "chaos", "Tu préfères manger du vary froid pour chaque repas ou ne plus jamais manger de vary ?"),
  wr("wc04", "chaos", "Tu préfères être coincé dans un embouteillage à Analakely pour toujours ou vivre à la campagne sans internet ?"),
  wr("wc05", "chaos", "Tu préfères être celui qui fait les kabary à chaque événement ou ne plus jamais être invité ?"),
  wr("wc06", "chaos", "Tu préfères que ta mère lise tes messages pendant un an ou qu'elle poste sur ton Facebook ?"),
  wr("wc07", "chaos", "Tu préfères ne parler qu'en malagasy soutenu ou qu'en français avec un accent parisien exagéré ?"),
  wr("wc08", "chaos", "Tu préfères vivre une coupure Jirama d'un mois ou un embouteillage de 12h ?"),
  wr("wc09", "chaos", "Tu préfères que tout le monde à Tana sache ton salaire ou ton historique de recherche ?"),
  wr("wc10", "chaos", "Tu préfères être le sujet d'un mème viral malgache ou passer à la télé nationale pour un fail ?"),

  // ============================================
  // DÉFIS EXPRESS — SOFT (10)
  // ============================================
  qc("qs01", "soft", "{player}, cite 5 fruits en 10 secondes !"),
  qc("qs02", "soft", "{player}, fais 5 grimaces différentes en 10 secondes !", 3),
  qc("qs03", "soft", "{player}, dis 3 compliments à 3 personnes différentes en 15 secondes !", 3),
  qc("qs04", "soft", "{player}, compte à rebours de 20 à 1 le plus vite possible !"),
  qc("qs05", "soft", "{player}, mime 3 métiers en 15 secondes. Les autres devinent !", 3),
  qc("qs06", "soft", "{player}, dis une phrase en 5 langues différentes en 20 secondes !"),
  qc("qs07", "soft", "{player}, fais 10 pompes en 15 secondes !"),
  qc("qs08", "soft", "{player}, cite 5 pays commençant par la lettre M en 15 secondes !"),
  qc("qs09", "soft", "{player}, fais le tour de la pièce en marchant comme un crabe !"),
  qc("qs10", "soft", "{player}, chante l'hymne national (au moins le début) en 10 secondes !"),

  // ============================================
  // DÉFIS EXPRESS — FUN (15)
  // ============================================
  qc("qf01", "fun", "{player}, cite 5 pays d'Afrique en 10 secondes !"),
  qc("qf02", "fun", "{player}, fais rire quelqu'un en 15 secondes ou tu perds.", 3),
  qc("qf03", "fun", "{player}, fais la voix de 3 personnages célèbres en 20 secondes !"),
  qc("qf04", "fun", "{player}, invente un slogan publicitaire pour {player2} en 10 secondes !"),
  qc("qf05", "fun", "{player}, raconte une histoire triste en 15 secondes. Si quelqu'un rit, tu perds.", 3),
  qc("qf06", "fun", "{player}, tiens en équilibre sur un pied pendant que tu récites un poème. 20 sec."),
  qc("qf07", "fun", "{player}, fais un résumé de ta journée en mode rap. 15 secondes."),
  qc("qf08", "fun", "{player}, imite 3 célébrités en 20 secondes. Le groupe juge.", 3),
  qc("qf09", "fun", "{player}, dis 5 mots qui riment avec 'amour' en 10 secondes !"),
  qc("qf10", "fun", "{player}, fais une pub pour un produit imaginaire. 20 secondes max."),
  qc("qf11", "fun", "{player}, fais un beatbox de 15 secondes. On juge."),
  qc("qf12", "fun", "{player}, cite le maximum de marques de voiture en 15 secondes !"),
  qc("qf13", "fun", "{player}, fais deviner un mot en le dessinant en l'air. 20 secondes.", 3),
  qc("qf14", "fun", "{player}, raconte ta matinée en mode documentaire animalier. 20 secondes."),
  qc("qf15", "fun", "{player}, fais le plus de voix d'animaux différentes en 15 secondes !"),

  // ============================================
  // DÉFIS EXPRESS — HOT (10)
  // ============================================
  qc("qh01", "hot", "{player}, fais une déclaration d'amour à {player2} en 15 secondes. 100% sérieux."),
  qc("qh02", "hot", "{player}, fais le séducteur/séductrice et drague {player2} en 20 secondes.", 3),
  qc("qh03", "hot", "{player}, dis 5 trucs que tu trouves attirants chez quelqu'un en 15 secondes."),
  qc("qh04", "hot", "{player}, fais un strip-tease de chaussette en 10 secondes. Dramatique."),
  qc("qh05", "hot", "{player}, chante une chanson d'amour à {player2} en le/la regardant dans les yeux."),
  qc("qh06", "hot", "{player}, raconte ton pire date en mode commentateur sportif. 20 secondes."),
  qc("qh07", "hot", "{player}, fais le plus beau clin d'œil possible. Le groupe note sur 10.", 3),
  qc("qh08", "hot", "{player}, dis 3 pickup lines les plus nulles que tu connais en 15 secondes."),
  qc("qh09", "hot", "{player}, fais un slow imaginaire pendant 15 secondes. Seul(e). Avec conviction."),
  qc("qh10", "hot", "{player}, mime ta technique de drague. Le groupe devine. 20 secondes.", 3),

  // ============================================
  // DÉFIS EXPRESS — CHAOS (10)
  // ============================================
  qc("qc01", "chaos", "{player}, imite 3 vendeurs de rue différents en 20 secondes.", 3),
  qc("qc02", "chaos", "{player}, fais un kabary improvisé sur {player2} en 20 secondes."),
  qc("qc03", "chaos", "{player}, négocie le prix d'un objet imaginaire avec {player2}. Tu as 20 secondes."),
  qc("qc04", "chaos", "{player}, fais ta meilleure imitation de quelqu'un coincé dans un embouteillage à Tana."),
  qc("qc05", "chaos", "{player}, invente un proverbe malgache en 10 secondes. Le groupe vote si c'est crédible.", 3),
  qc("qc06", "chaos", "{player}, fais l'annonce d'un taxi-be. Destination + prix. 10 secondes."),
  qc("qc07", "chaos", "{player}, imite 5 sons qu'on entend à Tana en 15 secondes."),
  qc("qc08", "chaos", "{player}, fais un discours de vente pour un mofo gasy imaginaire. 20 secondes."),
  qc("qc09", "chaos", "{player}, mime une scène typique au marché. {player2} est le vendeur. 20 sec."),
  qc("qc10", "chaos", "{player}, fais le guide touristique de ton quartier. Version chaos. 20 secondes."),
];

export function getFilteredCards(mode: GameMode, vibe: Vibe, playerCount: number): GameCard[] {
  return CARDS.filter(
    (c) =>
      c.mode === mode &&
      c.vibe === vibe &&
      c.player_min <= playerCount &&
      c.player_max >= playerCount
  );
}

export function fillPlayerNames(text: string, currentPlayer: string, allPlayers: string[]): string {
  let result = text.replace("{player}", currentPlayer);
  const otherPlayers = allPlayers.filter((p) => p !== currentPlayer);
  if (otherPlayers.length > 0) {
    const randomOther = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
    result = result.replace("{player2}", randomOther);
  }
  return result;
}
