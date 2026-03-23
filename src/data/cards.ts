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
    badge: "Intense",
    color: "primary" as const,
  },
  {
    id: "quick_challenge" as GameMode,
    name: "Défis express",
    subtitle: "Chrono, pas de pitié",
    emoji: "⚡",
    badge: "Rapide",
    color: "mango" as const,
  },
];

export const VIBES = [
  { id: "soft" as Vibe, name: "Soft", emoji: "😇", description: "Famille, tout public", tag: "famille", free: true, priceLabel: "Gratuit" },
  { id: "fun" as Vibe, name: "Fun", emoji: "😏", description: "Entre amis, léger et drôle", tag: "amis", free: true, priceLabel: "Gratuit" },
  { id: "hot" as Vibe, name: "Hot", emoji: "🔥", description: "Soirée, plus osé", tag: "soirée", free: false, priceLabel: "9 900 Ar" },
  { id: "chaos" as Vibe, name: "Chaos", emoji: "💀", description: "Dangereux, zéro filtre", tag: "dangereux", free: false, priceLabel: "7 900 Ar" },
];

export const STORE_PACKS = [
  {
    id: "hot",
    vibe: "hot" as Vibe,
    name: "Pack Hot",
    emoji: "🔥",
    description: "Débloque toutes les ambiances Hot",
    price: "9 900 Ar",
    cardCount: 800,
    free: false,
  },
  {
    id: "chaos",
    vibe: "chaos" as Vibe,
    name: "Pack Chaos",
    emoji: "💀",
    description: "Débloque toutes les ambiances Chaos",
    price: "7 900 Ar",
    cardCount: 800,
    free: false,
  },
  {
    id: "bundle",
    vibe: null,
    name: "Bundle Hot + Chaos",
    emoji: "🎁",
    description: "Les deux packs payants au meilleur prix",
    price: "15 000 Ar",
    cardCount: 1600,
    free: false,
  },
] as const;

const MINIMUM_CARDS_PER_COMBO = 150;
const MAX_PLAYERS = 12;

type CardType = GameCard["card_type"];

const createCard = (
  mode: GameMode,
  vibe: Vibe,
  index: number,
  cardType: CardType,
  text: string,
  requiresProp: GameCard["requires_prop"] = "none"
): GameCard => ({
  id: `${mode}-${vibe}-${index}`,
  mode,
  vibe,
  lang: "fr",
  card_type: cardType,
  text,
  requires_prop: requiresProp,
  player_min: 2,
  player_max: MAX_PLAYERS,
});

const truthPrompts: Record<Vibe, string[]> = {
  soft: [
    "raconte ton plus beau souvenir avec ta famille",
    "dis quel compliment t'a le plus marqué",
    "avoue quel petit plaisir te remet toujours de bonne humeur",
    "raconte le moment où tu t'es senti vraiment fier de toi",
    "dis ce que tu fais quand tu veux te calmer",
    "explique quel proche te connaît le mieux",
    "raconte ton souvenir d'école le plus drôle",
    "dis ce que tu cuisines le mieux",
    "avoue quelle habitude te suit depuis l'enfance",
    "raconte la plus belle surprise que tu as reçue",
  ],
  fun: [
    "avoue le message le plus gênant que tu as envoyé",
    "raconte ton excuse la plus nulle pour annuler une sortie",
    "dis qui ici te ferait le plus rire en voyage",
    "avoue le mensonge le plus inutile que tu as raconté cette semaine",
    "raconte ton plus gros fail en public",
    "dis ce que tu caches le plus dans ton téléphone",
    "avoue qui ici pourrait te convaincre de faire n'importe quoi",
    "raconte le moment où tu as eu envie de disparaître de honte",
    "dis quel réseau social révèle ton côté le plus bizarre",
    "raconte le dernier moment où tu as trop parlé",
  ],
  hot: [
    "avoue quel type de personne te fait craquer le plus vite",
    "raconte ton date le plus embarrassant",
    "dis si tu as déjà regretté un baiser",
    "avoue ce qui te fait perdre tous tes moyens chez quelqu'un",
    "raconte la chose la plus folle que tu as faite par attirance",
    "dis quel regard te déstabilise le plus",
    "avoue si tu as déjà ghosté quelqu'un sans raison claire",
    "raconte ton plus grand regret sentimental",
    "dis ce que tu trouves irrésistible chez quelqu'un",
    "avoue quelle jalousie t'a déjà trahi",
    "dis ce que tu fantasmes de faire à un premier date",
    "avoue ta technique de drague la plus douteuse",
    "raconte la nuit la plus intense que tu as vécue",
    "dis ce qui te rend le plus vulnérable en couple",
    "avoue avec qui ici tu aurais un date si tu devais choisir",
    "raconte le message le plus risqué que tu as envoyé à 2h du matin",
    "dis quel compliment physique te touche le plus",
    "avoue si tu as déjà eu des pensées pour quelqu'un de présent",
    "raconte le moment où tu as failli embrasser quelqu'un mais tu ne l'as pas fait",
    "dis ce qui t'excite le plus dans une relation naissante",
    "avoue combien de temps tu mets à stalker un crush",
    "raconte ta pire erreur de jugement en amour",
    "dis ce que tu fais quand tu veux vraiment séduire quelqu'un",
    "avoue si tu as déjà eu un crush sur un ami proche",
    "raconte la déclaration la plus gênante que tu as faite ou reçue",
  ],
  chaos: [
    "avoue le mensonge le plus risqué que tu as raconté à ta famille",
    "raconte ton plus gros fail dans un taxi-be ou en ville",
    "dis ce que ta mère ne doit jamais apprendre sur toi",
    "avoue le moment où tu as improvisé une excuse absurde pour t'en sortir",
    "raconte la décision la plus chaotique que tu as prise sur un coup de tête",
    "dis quelle personne ici pourrait t'entraîner dans un mauvais plan",
    "avoue le dernier message que tu aurais dû garder pour toi",
    "raconte la honte la plus malgache de ta vie",
    "dis quel secret ici ferait le plus de dégâts s'il sortait",
    "avoue ton talent le plus dangereux quand tu es trop à l'aise",
  ],
};

const truthTopics: Record<Vibe, string[]> = {
  soft: [
    "et pourquoi",
    "sans tricher",
    "avec tous les détails",
    "en une seule phrase",
    "comme si tu racontais ça à un enfant",
    "et ce que ça dit de toi",
    "et ce que tu referais demain",
    "et la personne liée à ce souvenir",
  ],
  fun: [
    "sans censurer les détails",
    "et assume totalement",
    "en regardant le groupe dans les yeux",
    "comme si c'était normal",
    "avec le nom de la personne si tu oses",
    "et dis ce que tu ferais différemment",
    "avec ton meilleur ton dramatique",
    "en mode confession totale",
  ],
  hot: [
    "et sois vraiment honnête",
    "sans utiliser le mot 'ça dépend'",
    "en donnant un exemple précis",
    "et dis ce que tu n'assumes pas",
    "avec le plus de détails possibles",
    "sans détourner le regard",
    "et explique pourquoi",
    "comme si ton crush écoutait",
  ],
  chaos: [
    "même si ça t'enfonce",
    "et on veut les noms",
    "sans te protéger",
    "comme si tout le monde allait le répéter demain",
    "et assume jusqu'au bout",
    "en mode confession catastrophique",
    "sans inventer d'excuse",
    "et dis ce qui s'est passé après",
  ],
};

const dareActions: Record<Vibe, string[]> = {
  soft: [
    "chante le refrain de ta chanson préférée",
    "imite un prof, un parent ou un voisin pendant 20 secondes",
    "fais rire le groupe sans parler",
    "présente la météo comme à la télé",
    "mime un animal jusqu'à ce que le groupe trouve",
    "raconte une mini-histoire en parlant comme un robot",
    "fais un compliment sincère à chaque joueur",
    "danse comme si tu étais seul dans ta chambre",
    "fais deviner un film seulement avec des gestes",
    "joue la star pendant 15 secondes",
  ],
  fun: [
    "imite la personne à ta gauche",
    "fais une pub absurde pour un objet choisi par le groupe",
    "fais un vocal totalement ridicule à un ami",
    "danse sans musique avec beaucoup trop de confiance",
    "fais un freestyle sur le joueur de ton choix",
    "raconte ta journée comme un documentaire animalier",
    "parle avec un accent improvisé pendant deux tours",
    "fais semblant d'être influenceur face caméra",
    "joue une scène dramatique digne d'une série",
    "transforme un objet banal en produit de luxe",
  ],
  hot: [
    "fais une déclaration de flirt ultra sérieuse à {player2}",
    "soutiens un regard intense avec {player2} pendant 15 secondes",
    "fais la démarche la plus séduisante possible",
    "chuchote une phrase de drague très nulle à {player2}",
    "fais croire pendant 20 secondes que tu es irrésistible",
    "donne trois compliments assumés à {player2}",
    "mime ton meilleur first date",
    "fais un slow imaginaire avec beaucoup trop d'émotion",
    "joue la scène d'un message envoyé à 2h du matin",
    "balance la pire pickup line que tu connais avec conviction",
    "masse les épaules de {player2} pendant 10 secondes",
    "murmure quelque chose de provocant à l'oreille de {player2}",
    "fais semblant que {player2} est ton crush et drague-le/la devant tout le monde",
    "décris {player2} de la façon la plus attirante possible",
    "joue un couple en pleine réconciliation passionnée avec {player2}",
    "fais le mouvement le plus sensuel que tu connais",
    "touche la main de {player2} et dis-lui un secret intime",
    "fais comme si tu venais de passer une nuit incroyable et raconte ta version",
    "danse un slow collé-serré imaginaire avec {player2}",
    "regarde {player2} dans les yeux et dis-lui ce que tu trouves attirant chez lui/elle",
    "joue la scène du baiser raté avec {player2} au ralenti",
    "fais la voix la plus séduisante possible en lisant le prénom de {player2}",
    "enlace {player2} et dis-lui pourquoi c'est la personne idéale pour un rendez-vous",
    "imite ton meilleur mouvement de danse en boîte, version séducteur/séductrice",
    "joue le personnage de quelqu'un qui flirte outrageusement au téléphone",
  ],
  chaos: [
    "fais un discours politique improvisé pour défendre une idée absurde",
    "imite une dispute de marché avec {player2}",
    "joue un vendeur de rue pendant 20 secondes",
    "annonce une destination de taxi-be comme si ta vie en dépendait",
    "fais semblant d'appeler ta mère pour annoncer une catastrophe",
    "transforme un petit problème en drame national",
    "mime une scène de rupture totalement excessive avec {player2}",
    "fais un kabary improvisé sur la personne de ton choix",
    "vends un mofo gasy imaginaire comme un produit de luxe",
    "joue une crise parce qu'il n'y a plus de réseau",
  ],
};

const dareTwists: Record<Vibe, string[]> = {
  soft: [
    "Tu as 20 secondes.",
    "Le groupe note sur 10.",
    "Avec un maximum de sérieux.",
    "Sans t'arrêter une seule fois.",
    "Et tout le monde te regarde.",
    "Comme si c'était ton talent caché.",
  ],
  fun: [
    "Tu as 15 secondes et pas d'excuse.",
    "Si le groupe rit, c'est gagné.",
    "Avec une confiance totalement injustifiée.",
    "Comme si tu étais devant 1000 personnes.",
    "Et tu dois aller jusqu'au bout.",
    "Sans casser ton personnage.",
  ],
  hot: [
    "Assume du début à la fin.",
    "Sans rire ni fuir du regard.",
    "Le groupe juge l'intensité.",
    "Comme si tu voulais vraiment convaincre.",
    "Et avec zéro gêne apparente.",
    "Tu as 15 secondes exactement.",
  ],
  chaos: [
    "On veut du chaos pur.",
    "Et plus c'est dramatique, mieux c'est.",
    "Tu as 20 secondes pour survivre.",
    "Sans réduire l'intensité une seule seconde.",
    "Comme si tout le monde te filmait.",
    "Le groupe décide si c'était assez dangereux.",
  ],
};

const groupActions: Record<Vibe, string[]> = {
  soft: [
    "tout le monde donne son meilleur souvenir de vacances",
    "tout le monde pointe la personne la plus douce",
    "tout le monde dit un talent caché",
    "tout le monde révèle son plat préféré",
    "tout le monde choisit qui ferait le meilleur parent",
  ],
  fun: [
    "tout le monde pointe la personne la plus drôle",
    "tout le monde avoue un petit mensonge récent",
    "tout le monde mime la même célébrité",
    "tout le monde choisit le roi ou la reine du drama",
    "tout le monde désigne la personne la plus bordélique",
  ],
  hot: [
    "tout le monde désigne la personne avec le plus de charme",
    "tout le monde avoue qui ferait le meilleur date",
    "tout le monde vote pour le regard le plus dangereux",
    "tout le monde désigne la personne la plus séduisante sans parler",
    "tout le monde choisit la personne qui ferait le premier pas",
  ],
  chaos: [
    "tout le monde pointe la personne la plus imprévisible",
    "tout le monde vote pour la personne capable de pire ce soir",
    "tout le monde choisit qui survivrait le moins bien à un scandale",
    "tout le monde désigne le plus gros agent du chaos",
    "tout le monde révèle qui embarquerait tout le monde dans un plan nul",
  ],
};

const groupTwists: Record<Vibe, string[]> = {
  soft: ["Puis chacun explique en une phrase.", "Pas le droit de répéter un autre joueur."],
  fun: ["Ensuite le groupe débat 10 secondes.", "Et la personne choisie doit répondre."],
  hot: ["Et la personne la plus citée réagit tout de suite.", "Puis on veut une justification honnête."],
  chaos: ["Et personne n'a le droit d'être diplomate.", "Puis la personne citée contre-attaque."],
};

const duelActions: Record<Vibe, string[]> = {
  soft: ["celui qui sourit en premier perd", "battle de compliment, le groupe vote", "concours de regard le plus gentil"],
  fun: ["premier qui rit perd", "meilleure imitation l'un de l'autre", "battle de mini-roast, le groupe vote"],
  hot: ["regard intense de 15 secondes sans fuir", "meilleure phrase de drague, le groupe vote", "qui joue le mieux le date parfait"],
  chaos: ["qui fait le discours le plus absurde", "battle de drama, le plus convaincant gagne", "qui survit le mieux à un faux scandale"],
};

const voteQuestions: Record<Vibe, string[]> = {
  soft: [
    "qui ici inspire le plus confiance ?",
    "qui ferait le meilleur grand frère ou grande sœur ?",
    "qui est le plus apaisant ?",
    "qui ferait le meilleur partenaire de road trip ?",
    "qui a le meilleur cœur ?",
  ],
  fun: [
    "qui ici a le plus de secrets ridicules ?",
    "qui survivrait le moins bien sans téléphone ?",
    "qui ferait le pire coloc ?",
    "qui est le plus susceptible de répondre 'tkt' à tout ?",
    "qui a le plus d'énergie de personnage principal ?",
  ],
  hot: [
    "qui ici a le plus de charme ?",
    "qui ferait le meilleur date surprise ?",
    "qui a le sourire le plus dangereux ?",
    "qui pourrait briser le plus de cœurs sans le vouloir ?",
    "qui sait le mieux séduire sans parler ?",
  ],
  chaos: [
    "qui ici serait le plus dangereux avec un secret ?",
    "qui est capable de mentir le plus calmement ?",
    "qui provoquerait le plus de dégâts avec un simple message ?",
    "qui est le plus imprévisible sous pression ?",
    "qui transformerait un détail en catastrophe ?",
  ],
};

const neverBase: Record<Vibe, string[]> = {
  soft: [
    "fait semblant d'aller bien alors que tu voulais juste dormir",
    "mangé en cachette le dernier morceau",
    "oublié le prénom de quelqu'un juste après la présentation",
    "fait semblant de comprendre alors que pas du tout",
    "chanté tout seul en pensant que personne n'entendait",
    "rêvé éveillé au point d'oublier où tu allais",
    "ri à une blague que tu n'avais pas comprise",
    "fait une promesse adorable que tu as oubliée ensuite",
    "gardé un petit souvenir sans raison précise",
    "fait semblant d'être occupé pour rester tranquille",
  ],
  fun: [
    "stalké quelqu'un beaucoup trop longtemps",
    "annulé une sortie pour une excuse nulle",
    "envoyé un message puis regretté instantanément",
    "fait semblant de ne pas voir quelqu'un dans la rue",
    "screené une conversation pour la montrer à un ami",
    "menti sur ta localisation réelle",
    "fait un achat impulsif absurde",
    "répondu 'haha' sans rire du tout",
    "espéré qu'un message disparaisse par magie",
    "porté le même outfit trop de fois de suite",
  ],
  hot: [
    "eu un crush que tu n'assumes pas",
    "pensé à envoyer un message à 2h du matin",
    "ghosté quelqu'un au lieu d'être honnête",
    "regretté un flirt très vite",
    "dit 'ça va' alors que sentimentalement pas du tout",
    "jalousé quelqu'un pour une histoire de cœur",
    "menti sur tes sentiments pour te protéger",
    "eu envie de recontacter un ex sans raison valable",
    "joué la personne détachée alors que c'était faux",
    "fait semblant de ne rien ressentir alors que si",
  ],
  chaos: [
    "inventé une excuse catastrophique pour t'en sortir",
    "accusé le réseau, la Jirama ou le trafic pour couvrir une bourde",
    "fait semblant d'être en route alors que tu n'étais pas parti",
    "dit un truc trop honnête au mauvais moment",
    "créé un mini-drama sans le vouloir",
    "évité quelqu'un avec une mise en scène ridicule",
    "pris une décision risquée sur un coup de tête",
    "promis quelque chose impossible à tenir",
    "dit 'j'arrive dans 5 minutes' alors que c'était faux",
    "lancé une idée dangereuse juste pour voir",
  ],
};

const neverSuffix: Record<Vibe, string[]> = {
  soft: ["sans mauvaise intention.", "puis eu honte un peu après.", "et espéré que personne ne remarque.", "juste parce que c'était plus simple."],
  fun: ["et fait comme si de rien n'était.", "avant de paniquer juste après.", "puis raconté ça à un ami.", "en espérant ne jamais te faire griller."],
  hot: ["et assumé seulement à moitié.", "avant de trop y repenser ensuite.", "alors que ça pouvait mal finir.", "sans savoir quoi faire après."],
  chaos: ["et tout le monde aurait pu le découvrir.", "avec un niveau de culot anormal.", "avant que ça ne parte un peu trop loin.", "et tu t'en es sorti par miracle."],
};

const likelyBase: Record<Vibe, string[]> = {
  soft: [
    "réconforter tout le groupe",
    "organiser la meilleure journée en famille",
    "rire pour rien",
    "adopter un animal sans prévenir",
    "oublier son réveil un dimanche",
    "faire un cadeau très attentionné",
    "garder un secret jusqu'au bout",
    "devenir le plus aimé du quartier",
    "préparer le meilleur goûter",
    "mettre tout le monde d'accord",
  ],
  fun: [
    "envoyer un message gênant au mauvais groupe",
    "faire une story ridicule sans regret",
    "survivre avec 2% de batterie toute la journée",
    "annuler au dernier moment pour une raison absurde",
    "créer un running gag qui dure des mois",
    "se retrouver au centre d'un fou rire général",
    "répondre 't'inquiète' sans solution derrière",
    "faire le plus grand détour pour éviter quelqu'un",
    "se perdre dans sa propre explication",
    "devenir viral pour une raison bête",
  ],
  hot: [
    "faire le premier pas",
    "laisser quelqu'un complètement troublé",
    "recevoir le plus de regards en soirée",
    "envoyer le message le plus risqué",
    "regretter un flirt au réveil",
    "cacher ses sentiments trop longtemps",
    "tomber amoureux le plus vite",
    "faire semblant d'être détaché alors que non",
    "avoir le sourire le plus dangereux",
    "faire chavirer quelqu'un sans effort",
  ],
  chaos: [
    "transformer un détail en énorme histoire",
    "partir dans un plan sans réfléchir",
    "créer un mini scandale par accident",
    "mentir avec beaucoup trop d'assurance",
    "improviser la pire excuse du groupe",
    "embarquer tout le monde dans un chaos total",
    "prendre la parole comme si c'était une crise nationale",
    "faire une entrée beaucoup trop dramatique",
    "retourner une situation contre tout le monde",
    "faire exploser le niveau de tension pour rien",
  ],
};

const likelySuffix: Record<Vibe, string[]> = {
  soft: ["si on lui laisse une soirée entière ?", "dans les 24 prochaines heures ?", "sans même s'en rendre compte ?", "avec le plus de naturel ?"],
  fun: ["avant minuit ?", "sans aucune honte ?", "juste pour l'anecdote ?", "puis nier juste après ?"],
  hot: ["si l'ambiance monte encore ?", "sans avoir besoin d'un mot ?", "dès ce soir ?", "avec zéro effort apparent ?"],
  chaos: ["et tout assumer ensuite ?", "avant que ça dégénère ?", "même si c'est une très mauvaise idée ?", "puis dire 'c'était pas moi' ?"],
};

const ratherA: Record<Vibe, string[]> = {
  soft: [
    "revivre ton meilleur anniversaire",
    "avoir un week-end parfait en famille",
    "toujours savoir quoi dire pour rassurer quelqu'un",
    "gagner un voyage surprise à Madagascar",
    "recevoir un compliment sincère tous les jours",
    "ne plus jamais être stressé",
    "avoir toujours le bon plat à table",
    "savoir chanter juste",
    "avoir une mémoire parfaite pour les bons souvenirs",
    "toujours tomber sur la bonne personne au bon moment",
  ],
  fun: [
    "effacer ton moment le plus gênant en public",
    "voir tous les messages supprimés de tes amis",
    "ne plus jamais envoyer un message embarrassant",
    "pouvoir lire une pensée par jour",
    "avoir des stories toujours parfaites",
    "savoir immédiatement qui ment",
    "gagner tous les débats absurdes",
    "pouvoir rejouer tes fails pour les corriger",
    "avoir une batterie illimitée",
    "être impossible à ghoster",
  ],
  hot: [
    "savoir exactement quand quelqu'un te veut vraiment",
    "recevoir une confession honnête de ton crush",
    "ne jamais regretter un flirt",
    "pouvoir relire tous tes messages avant qu'ils partent",
    "être irrésistible pendant une soirée",
    "toujours reconnaître les vraies intentions",
    "ne jamais te tromper de personne",
    "avoir une confiance absolue en date",
    "pouvoir annuler un baiser raté",
    "faire tomber la bonne personne au bon moment",
  ],
  chaos: [
    "effacer ton pire scandale potentiel",
    "savoir à l'avance quand ça va partir en vrille",
    "avoir une excuse crédible instantanée",
    "faire disparaître un message dangereux",
    "revenir 10 minutes en arrière après une bourde",
    "entendre une conversation secrète sans te faire voir",
    "retirer une phrase juste après l'avoir dite",
    "sortir toujours vivant d'un plan idiot",
    "gagner tous les conflits même quand tu as tort",
    "avoir un alibi parfait en permanence",
  ],
};

const ratherB: Record<Vibe, string[]> = {
  soft: [
    "recommencer toutes tes meilleures vacances",
    "avoir une maison toujours pleine de bonnes ondes",
    "faire rire quelqu'un de triste en une seconde",
    "recevoir le cadeau parfait à chaque fête",
    "toujours garder ton calme",
    "avoir un repas préféré gratuit à vie",
    "être la personne la plus apaisante de la pièce",
    "savoir créer des souvenirs légendaires",
  ],
  fun: [
    "supprimer ton historique gênant pour toujours",
    "voir qui parle réellement de toi",
    "ne plus jamais te faire afficher",
    "devenir viral uniquement pour de bonnes raisons",
    "pouvoir annuler un vocal après écoute",
    "ne plus jamais faire de faute de frappe risquée",
    "toujours avoir la meilleure répartie",
    "savoir qui te stalk exactement",
  ],
  hot: [
    "ne plus jamais rougir quand ça devient intense",
    "savoir toujours quand il faut envoyer le premier message",
    "garder le contrôle de ton cœur en soirée",
    "connaître l'effet réel que tu fais",
    "ne plus jamais tomber sur une mauvaise personne",
    "savoir exactement quoi répondre à ton crush",
    "recevoir un date parfait sans effort",
    "toujours sentir quand la vibe est réciproque",
  ],
  chaos: [
    "annuler n'importe quelle catastrophe sociale une fois par mois",
    "faire taire instantanément une rumeur",
    "effacer une capture d'écran envoyée au mauvais endroit",
    "voir arriver le danger 5 minutes avant",
    "savoir qui a balancé l'info",
    "disparaître d'une situation gênante immédiatement",
    "contrôler le niveau de drama autour de toi",
    "survivre à toutes tes mauvaises idées sans conséquence",
  ],
};

const challengeActions: Record<Vibe, string[]> = {
  soft: [
    "chante une comptine avec sérieux",
    "fais deviner un animal en mime",
    "cite 5 choses que tu aimes",
    "raconte un souvenir d'enfance en accéléré",
    "fais rire la personne à ta droite",
    "présente-toi comme une star",
    "fais la marche la plus élégante de la pièce",
    "imite ton personnage préféré",
    "invente un slogan pour le groupe",
    "dis 3 compliments très vite",
  ],
  fun: [
    "fais un beatbox ridicule",
    "vends un objet imaginaire",
    "raconte ta journée en mode télénovela",
    "imite trois personnes différentes",
    "fais une danse gênante assumée",
    "trouve 5 excuses nulles pour être en retard",
    "parle comme si tu étais en interview",
    "résume ta vie en rap",
    "rejoue ton dernier fail avec conviction",
    "invente une pub pour toi-même",
  ],
  hot: [
    "balance une phrase de drague nulle mais assumée",
    "tiens un regard intense avec {player2}",
    "fais un compliment qui déstabilise",
    "mime un date parfait",
    "joue le crush qui hésite à écrire",
    "fais une entrée de séducteur ou séductrice",
    "raconte une scène romantique comme un film",
    "donne 3 qualités attirantes chez quelqu'un",
    "improvise un slow sans musique",
    "joue le message de minuit le plus dangereux",
  ],
  chaos: [
    "fais un mini scandale théâtral",
    "imite un vendeur de rue en crise",
    "annonce une catastrophe imaginaire au groupe",
    "joue la pire excuse de dernière minute",
    "vends un produit impossible avec aplomb",
    "imite quelqu'un bloqué dans les embouteillages",
    "transforme une petite erreur en drame total",
    "fais un kabary absurde de 15 secondes",
    "joue une scène de voisinage chaotique",
    "improvise un appel d'urgence totalement faux",
  ],
};

const challengeTwists: Record<Vibe, string[]> = {
  soft: ["en 10 secondes", "en 15 secondes", "sans rire", "avec un sourire géant"],
  fun: ["en 12 secondes", "comme si ta réputation en dépendait", "avec un sérieux absurde", "sans t'arrêter"],
  hot: ["en restant crédible", "sans fuir le regard", "avec un max de confiance", "et le groupe juge"],
  chaos: ["comme si c'était une urgence nationale", "avec trop d'intensité", "et zéro retenue", "avant que le groupe te coupe"],
};

const pairTexts = (base: string[], suffixes: string[]) =>
  base.flatMap((entry) => suffixes.map((suffix) => `${entry} ${suffix}`));

const crossTexts = (left: string[], right: string[], mapper: (a: string, b: string) => string) =>
  left.flatMap((a) => right.map((b) => mapper(a, b)));

const buildTruthDareDeck = (vibe: Vibe) => {
  const truthTexts = crossTexts(truthPrompts[vibe], truthTopics[vibe], (prompt, topic) => `{player}, ${prompt} ${topic} ?`).slice(0, 70);
  const dareTexts = crossTexts(dareActions[vibe], dareTwists[vibe], (action, twist) => `{player}, ${action}. ${twist}`).slice(0, 60);
  const groupTexts = crossTexts(groupActions[vibe], groupTwists[vibe], (action, twist) => `${action[0].toUpperCase()}${action.slice(1)}. ${twist}`).slice(0, 10);
  const duelTexts = duelActions[vibe].map((action) => `{player} vs {player2} : ${action}. Le groupe tranche.`).slice(0, 10);
  const voteTexts = voteQuestions[vibe].map((question) => `Le groupe vote : ${question}`).slice(0, 10);
  const bonusTexts = voteQuestions[vibe].slice(0, 2).map((question) => `Vote éclair : ${question} Réponse immédiate.`);

  const cards: GameCard[] = [];
  let index = 1;
  truthTexts.forEach((text) => cards.push(createCard("truth_dare", vibe, index++, "truth", text)));
  dareTexts.forEach((text, i) => cards.push(createCard("truth_dare", vibe, index++, "dare", text, i % 6 === 0 ? "phone" : "none")));
  groupTexts.forEach((text) => cards.push(createCard("truth_dare", vibe, index++, "group", text)));
  duelTexts.forEach((text) => cards.push(createCard("truth_dare", vibe, index++, "duel", text)));
  voteTexts.forEach((text) => cards.push(createCard("truth_dare", vibe, index++, "vote", text)));
  bonusTexts.forEach((text) => cards.push(createCard("truth_dare", vibe, index++, "vote", text)));
  return cards;
};

const buildNeverDeck = (vibe: Vibe) =>
  crossTexts(
    neverBase[vibe].map((entry) => `Je n'ai jamais ${entry}`),
    neverSuffix[vibe],
    (left, right) => `${left} ${right}`
  )
    .flatMap((text) => [
      text,
      `${text} Et assume si c'est déjà arrivé.`,
      `${text} Le groupe veut un exemple si tu lèves la main.`,
      `${text} Sans faire semblant de réfléchir.`,
    ])
    .slice(0, 160)
    .map((text, index) => createCard("never_have_i_ever", vibe, index + 1, "vote", text));

const buildMostLikelyDeck = (vibe: Vibe) =>
  crossTexts(
    likelyBase[vibe].map((entry) => `Qui est le plus susceptible de ${entry}`),
    likelySuffix[vibe],
    (left, right) => `${left} ${right}`
  )
    .flatMap((text) => [
      text,
      `${text} Vote immédiat du groupe.`,
      `${text} Et la personne la plus citée se défend.`,
      `${text} Sans diplomatie.`,
    ])
    .slice(0, 160)
    .map((text, index) => createCard("most_likely", vibe, index + 1, "vote", text));

const buildWouldYouRatherDeck = (vibe: Vibe) =>
  crossTexts(ratherA[vibe], ratherB[vibe], (left, right) => `Tu préfères ${left} ou ${right} ?`)
    .flatMap((text) => [
      text,
      `${text} Tu dois répondre immédiatement.`,
      `${text} Et expliquer en une phrase.`,
      `${text} Sans dire 'aucun des deux'.`,
    ])
    .slice(0, 160)
    .map((text, index) => createCard("would_you_rather", vibe, index + 1, "truth", text));

const buildQuickChallengeDeck = (vibe: Vibe) =>
  crossTexts(challengeActions[vibe], challengeTwists[vibe], (action, twist) => `{player}, ${action} ${twist}.`)
    .flatMap((text) => [
      text,
      `${text} Le groupe juge la performance.`,
      `${text} Avec zéro préparation.`,
      `${text} Et pas le droit d'abandonner.`,
    ])
    .slice(0, 160)
    .map((text, index) => createCard("quick_challenge", vibe, index + 1, "timer", text));

export const CARDS: GameCard[] = [
  ...buildTruthDareDeck("soft"),
  ...buildTruthDareDeck("fun"),
  ...buildTruthDareDeck("hot"),
  ...buildTruthDareDeck("chaos"),
  ...buildNeverDeck("soft"),
  ...buildNeverDeck("fun"),
  ...buildNeverDeck("hot"),
  ...buildNeverDeck("chaos"),
  ...buildMostLikelyDeck("soft"),
  ...buildMostLikelyDeck("fun"),
  ...buildMostLikelyDeck("hot"),
  ...buildMostLikelyDeck("chaos"),
  ...buildWouldYouRatherDeck("soft"),
  ...buildWouldYouRatherDeck("fun"),
  ...buildWouldYouRatherDeck("hot"),
  ...buildWouldYouRatherDeck("chaos"),
  ...buildQuickChallengeDeck("soft"),
  ...buildQuickChallengeDeck("fun"),
  ...buildQuickChallengeDeck("hot"),
  ...buildQuickChallengeDeck("chaos"),
];

const validateCardCoverage = () => {
  for (const mode of GAME_MODES) {
    for (const vibe of VIBES) {
      const total = CARDS.filter((card) => card.mode === mode.id && card.vibe === vibe.id).length;
      if (total < MINIMUM_CARDS_PER_COMBO) {
        throw new Error(`Not enough cards for ${mode.id}/${vibe.id}: ${total}`);
      }
    }
  }
};

validateCardCoverage();

export function getFilteredCards(mode: GameMode, vibe: Vibe, playerCount: number): GameCard[] {
  const filtered = CARDS.filter(
    (card) => card.mode === mode && card.vibe === vibe && card.player_min <= playerCount && card.player_max >= playerCount
  );

  if (filtered.length >= MINIMUM_CARDS_PER_COMBO) return filtered;

  return CARDS.filter((card) => card.mode === mode && card.vibe === vibe);
}

export function fillPlayerNames(text: string, currentPlayer: string, allPlayers: string[]): string {
  const replaceAll = (value: string, token: string, replacement: string) => value.split(token).join(replacement);
  const otherPlayers = allPlayers.filter((player) => player !== currentPlayer);
  const fallbackPlayer = otherPlayers[0] || currentPlayer;

  let result = replaceAll(text, "{player}", currentPlayer);
  result = replaceAll(result, "{player2}", fallbackPlayer);

  return result;
}
