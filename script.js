const TRANCHES = [
  {
    max: 16.5,
    label: "Dénutrition",
    color: "#4cc9f0",
    comments: [
      "Même ton ombre a demandé un arrêt maladie pour sous-alimentation.",
      "On t'a confondu avec un portemanteau. Le manteau a porté plainte.",
      "Un courant d'air et tu finis en Belgique. Va manger, sérieux.",
      "Les squelettes du cours de bio te trouvent un peu trop maigre.",
    ],
  },
  {
    max: 18.5,
    label: "Maigreur",
    color: "#4cc9f0",
    comments: [
      "Va manger. Pas une salade. Un vrai repas, avec du fromage.",
      "Si tu te mets de profil, tu disparais. Pratique pour fuir les impôts, pas pour vivre.",
      "Ta grand-mère t'a vu et a lancé un gratin par réflexe.",
      "Tu prends un bain, on retire la bonde, on te cherche dans les canalisations.",
    ],
  },
  {
    max: 25,
    label: "Normal",
    color: "#3ddc97",
    comments: [
      "Corps parfaitement normal. Aucune excuse, donc : tes problèmes viennent de ta personnalité.",
      "Félicitations, tu es dans la moyenne. Comme pour tout le reste.",
      "Le corps va bien. Pour l'âme, consulte un autre site.",
      "IMC idéal. Les vers de terre te trouveront parfaitement équilibré, un jour.",
    ],
  },
  {
    max: 30,
    label: "Surpoids",
    color: "#ffd166",
    comments: [
      "Va courir. Pas jusqu'au frigo, ça ne compte pas.",
      "Ton canapé a gardé ta forme. Il t'aime, mais il souffre.",
      "Une salade de temps en temps, ça ne mord pas. Contrairement à toi.",
      "Les escaliers te regardent avec pitié. Prends-les quand même.",
    ],
  },
  {
    max: 35,
    label: "Obésité modérée",
    color: "#ff9f43",
    comments: [
      "Va courir. Si tu ne peux pas courir, marche. Si tu ne peux pas marcher, rampe vers une salade.",
      "Le livreur Uber Eats connaît le prénom de ton chat.",
      "Ta balance affiche « une personne à la fois, s'il te plaît ».",
      "Quand tu sautes, les sismographes du Japon s'inquiètent.",
    ],
  },
  {
    max: 40,
    label: "Obésité sévère",
    color: "#ff4d6d",
    comments: [
      "Ton cardiologue a acheté une maison avec tes consultations. Va courir, pour lui faire un procès.",
      "Le tapis de course est ton ami. Il est triste que tu l'aies transformé en séchoir à linge.",
      "Le buffet à volonté a affiché ta photo à l'entrée. Avec « interdit » écrit dessous.",
      "Ton cœur fait des heures sup' non payées. Il prépare une grève.",
    ],
  },
  {
    max: Infinity,
    label: "Obésité morbide",
    color: "#ff4d6d",
    comments: [
      "« Morbide », c'est le terme médical. Ton cercueil sera sur mesure, autant que ce soit le plus tard possible. Va courir.",
      "Le croque-mort a déjà commandé du bois en plus. Prouve-lui qu'il a eu tort.",
      "Tu as ta propre force gravitationnelle. Des petits satellites tournent autour de toi.",
      "Ton médecin ne dit plus « faites attention », il dit « mettez vos affaires en ordre ». Bouge-toi.",
    ],
  },
];

const GAUGE_MIN = 15;
const GAUGE_MAX = 40;
// Position des seuils sur la jauge (doit correspondre au dégradé CSS)
const GAUGE_STOPS = [
  [15, 0], [18.5, 14], [25, 40], [30, 60], [35, 80], [40, 100],
];

const form = document.getElementById("form");
const result = document.getElementById("result");
const imcValue = document.getElementById("imc-value");
const imcLabel = document.getElementById("imc-label");
const marker = document.getElementById("marker");
const comment = document.getElementById("comment");
const ideal = document.getElementById("ideal");
const again = document.getElementById("again");

let currentTranche = null;
let lastComment = -1;

function gaugePosition(imc) {
  const v = Math.min(Math.max(imc, GAUGE_MIN), GAUGE_MAX);
  for (let i = 1; i < GAUGE_STOPS.length; i++) {
    const [v0, p0] = GAUGE_STOPS[i - 1];
    const [v1, p1] = GAUGE_STOPS[i];
    if (v <= v1) return p0 + ((v - v0) / (v1 - v0)) * (p1 - p0);
  }
  return 100;
}

function pickComment() {
  const list = currentTranche.comments;
  let i;
  do { i = Math.floor(Math.random() * list.length); } while (list.length > 1 && i === lastComment);
  lastComment = i;
  comment.textContent = list[i];
}

function animateNumber(target) {
  const start = performance.now();
  const duration = 900;
  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    imcValue.textContent = (target * eased).toFixed(1);
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const poids = parseFloat(document.getElementById("poids").value);
  const tailleM = parseFloat(document.getElementById("taille").value) / 100;
  if (!poids || !tailleM) return;

  const imc = poids / (tailleM * tailleM);
  currentTranche = TRANCHES.find((t) => imc < t.max);
  lastComment = -1;

  document.documentElement.style.setProperty("--tone", currentTranche.color);
  imcLabel.textContent = currentTranche.label;
  pickComment();

  const min = (18.5 * tailleM * tailleM).toFixed(1);
  const max = (24.9 * tailleM * tailleM).toFixed(1);
  ideal.textContent = `Poids « normal » pour ta taille : entre ${min} et ${max} kg.`;

  // Relance l'animation d'apparition
  result.classList.add("hidden");
  void result.offsetWidth;
  result.classList.remove("hidden");

  marker.style.left = "0%";
  requestAnimationFrame(() => {
    marker.style.left = gaugePosition(imc) + "%";
  });
  animateNumber(imc);
});

again.addEventListener("click", pickComment);
