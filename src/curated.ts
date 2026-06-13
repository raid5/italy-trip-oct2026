import type { Phrase } from "./schema.js";

/**
 * Hand-authored marquee POI. Wikivoyage often describes a town's signature
 * sights (e.g. Positano's beaches) only in prose, never as listing templates,
 * so the generator can't scrape them. These are merged in with a forced
 * category and ranked first within it. A photo is still fetched from Commons.
 */
export interface CuratedPoi {
  name: string;
  category: "history" | "art" | "culture" | "coastal" | "outdoors" | "food" | "drink";
  blurb: string;
  lat?: number;
  lon?: number;
  hiddenGem?: boolean; // surfaced after the "known for" sights, as a local tip
  photoQuery?: string; // override the Commons search when the name searches poorly
  photoFile?: string; // pin an exact Commons "File:…" when search is unreliable
}

export interface CityConfig {
  slug: string;
  name: string;
  region: string;
  tagline: string;
  coastal: boolean;
  wikivoyage: string; // Wikivoyage page title
  wikipedia: string; // Wikipedia page title
  heroQuery?: string; // override the Commons search for the hero photo
  heroFile?: string; // pin an exact Commons "File:…" hero when search is unreliable
  transport: string[];
  foodNotes: string[];
  beachNotes?: string[];
  curatedPois?: CuratedPoi[];
}

/** Known cities. Add more here, then run `pnpm city "<Name>"`. */
export const CITY_CONFIGS: Record<string, CityConfig> = {
  rome: {
    slug: "rome",
    name: "Rome",
    region: "Lazio",
    tagline: "The Eternal City — layered with three thousand years of history.",
    coastal: false,
    wikivoyage: "Rome",
    wikipedia: "Rome",
    heroQuery: "Colosseum Rome Italy",
    transport: [
      "Fly into Fiumicino (FCO); the Leonardo Express train reaches Termini in ~32 min.",
      "The Metro (lines A/B/C) plus buses cover the center; buy a 48/72-hour pass.",
      "The historic core is walkable — most major sights are within 30 minutes on foot.",
      "High-speed trains (Frecciarossa / Italo) link Rome to Naples in ~70 minutes.",
    ],
    foodNotes: [
      "Roman pasta canon: cacio e pepe, carbonara, amatriciana, gricia.",
      "Try supplì (fried rice croquettes) and pizza al taglio for a cheap lunch.",
      "Casual trattorias are the heart of Roman dining — long lunches and late dinners.",
      "Finish with a cornetto and espresso standing at a bar, like a local.",
    ],
    curatedPois: [
      {
        name: "Colosseum",
        category: "history",
        blurb:
          "Rome's colossal first-century amphitheater, where tens of thousands once watched gladiatorial games. The largest amphitheater ever built and the enduring symbol of Imperial Rome.",
        lat: 41.8902,
        lon: 12.4922,
      },
      {
        name: "Roman Forum & Palatine Hill",
        category: "history",
        photoQuery: "Roman Forum Rome",
        blurb:
          "The political and religious heart of ancient Rome — a valley of temples, basilicas, and triumphal arches beneath the Palatine, the hill where the city was said to be founded.",
        lat: 41.8925,
        lon: 12.4853,
      },
      {
        name: "Pantheon",
        category: "history",
        photoQuery: "Pantheon Rome facade portico",
        blurb:
          "A near-perfectly preserved Roman temple from around 125 AD, crowned by the world's largest unreinforced concrete dome with its open oculus to the sky.",
        lat: 41.8986,
        lon: 12.4769,
      },
      {
        name: "Vatican Museums & Sistine Chapel",
        category: "art",
        photoQuery: "Sistine Chapel ceiling Vatican",
        blurb:
          "Centuries of papal art collections culminating in Michelangelo's Sistine Chapel ceiling. Vast, dense, and unmissable — go early or book ahead to beat the crowds.",
        lat: 41.9065,
        lon: 12.4534,
      },
      {
        name: "St. Peter's Basilica",
        category: "history",
        photoQuery: "St Peter's Basilica Rome dome",
        blurb:
          "The grandest church of the Renaissance, raised over the apostle Peter's tomb. Climb the Michelangelo-designed dome for a sweeping view across St. Peter's Square.",
        lat: 41.9022,
        lon: 12.4533,
      },
      {
        name: "Trevi Fountain",
        category: "culture",
        blurb:
          "Rome's most theatrical Baroque fountain — a wall of sculpted sea-gods and travertine. Tradition says a coin tossed over the shoulder ensures a return to Rome.",
        lat: 41.9009,
        lon: 12.4833,
      },
      {
        name: "Villa Borghese",
        category: "outdoors",
        photoQuery: "Villa Borghese lake temple Aesculapius Rome",
        blurb:
          "Rome's great landscaped park above the Spanish Steps — shaded paths, a lake, and the Pincio terrace looking out over the rooftops. Easy to wander for an hour or a whole morning.",
        lat: 41.9139,
        lon: 12.4853,
      },
      {
        name: "Gianicolo (Janiculum) Terrace",
        category: "outdoors",
        photoQuery: "Janiculum hill Rome panorama",
        blurb:
          "The Janiculum hill gives the widest, most romantic panorama over Rome's domes and rooftops — a short uphill walk rewarded by golden evening light and a daily noon cannon.",
        lat: 41.8919,
        lon: 12.4615,
      },
      {
        name: "Via Appia Antica",
        category: "outdoors",
        photoFile: "File:Roma, Via Appia Antica (04).jpg",
        blurb:
          "The ancient Appian Way, now a green archaeological park you can walk or bike for miles past Roman tombs, catacombs, and umbrella pines — Rome's countryside escape.",
        lat: 41.8546,
        lon: 12.516,
      },
      {
        name: "Pizzarium Bonci",
        category: "food",
        photoQuery: "pizza al taglio Rome",
        blurb:
          "Gabriele Bonci's famous pizza-al-taglio counter near the Vatican — thick, airy squares with inventive seasonal toppings, cut with scissors and sold by weight. Stand-up only.",
      },
      {
        name: "Salumeria Roscioli",
        category: "food",
        photoFile: "File:Espaguetis carbonara.jpg",
        blurb:
          "Part deli, part wine bar, part restaurant in the centro storico — a temple to the Roman pasta canon (carbonara, cacio e pepe) alongside cured meats and cheeses. Book ahead.",
      },
      {
        name: "Da Enzo al 29",
        category: "food",
        photoQuery: "cacio e pepe pasta",
        blurb:
          "A tiny, beloved Trastevere trattoria doing the Roman classics with market ingredients — expect a queue, generous portions, and no pretense. Lunch and dinner only; cash welcome.",
      },
      {
        name: "Giolitti",
        category: "food",
        photoQuery: "gelato Italian ice cream",
        blurb:
          "Rome's grand old gelateria, scooping since 1900 a few steps from the Pantheon — dozens of flavors piled high in a marble parlor that feels like another century.",
      },
      {
        name: "Sant'Eustachio Il Caffè",
        category: "drink",
        photoQuery: "espresso coffee bar Italy",
        blurb:
          "A historic 1938 espresso bar near the Pantheon, famed for a secret-method gran caffè served pre-sweetened and frothy. Drink it standing at the counter like a Roman.",
      },
      {
        name: "Antico Caffè Greco",
        category: "drink",
        photoQuery: "Antico Caffè Greco Rome interior",
        blurb:
          "Rome's oldest café, open on Via Condotti since 1760 — red velvet, gilt mirrors, and marble tables once frequented by Keats and Casanova. A coffee here is pure theater.",
      },
    ],
  },
  naples: {
    slug: "naples",
    name: "Naples",
    region: "Campania",
    tagline: "Raw, operatic, and the birthplace of pizza — Vesuvius on the horizon.",
    coastal: true,
    wikivoyage: "Naples",
    wikipedia: "Naples",
    heroQuery: "Naples Vesuvius gulf panorama",
    transport: [
      "Naples Centrale is the rail hub; Frecciarossa to Rome is ~70 min.",
      "The Circumvesuviana regional line runs to Pompeii, Herculaneum, and Sorrento.",
      "Ferries and hydrofoils leave from Molo Beverello for Capri, Ischia, and the Amalfi Coast.",
      "Walk the historic center (Spaccanapoli); use funiculars up to the Vomero hill.",
    ],
    foodNotes: [
      "This is the home of pizza — try a Margherita or Marinara from a wood-fired Napoletana oven.",
      "Street snacks: fried pizza (pizza fritta), cuoppo (fried seafood cone), and frittatina.",
      "Sweet stops: sfogliatella pastry and baba al rum with an espresso.",
      "Seafood and the wines of Campania (Falanghina, Greco di Tufo) pair beautifully.",
    ],
    beachNotes: [
      "Naples itself is a working port — for swimming, day-trip to the islands or Amalfi Coast.",
      "Posillipo has small rocky coves and the Gaiola marine area for a quick city swim.",
    ],
    curatedPois: [
      {
        name: "Naples National Archaeological Museum",
        category: "art",
        photoQuery: "Alexander Mosaic Naples archaeological museum",
        blurb:
          "One of the world's great antiquities museums — the finest mosaics and frescoes rescued from Pompeii and Herculaneum, plus the colossal Farnese marbles.",
        lat: 40.8536,
        lon: 14.2509,
      },
      {
        name: "Cappella Sansevero (Veiled Christ)",
        category: "art",
        photoQuery: "Veiled Christ Sanmartino marble sculpture",
        blurb:
          "A small Baroque chapel housing the astonishing 'Veiled Christ', carved so the marble shroud appears translucent — among the most virtuosic sculptures in Italy.",
        lat: 40.8489,
        lon: 14.254,
      },
      {
        name: "Lungomare & Castel dell'Ovo",
        category: "coastal",
        photoFile: "File:Castel dell'Ovo (Naples) 02.jpg",
        blurb:
          "Naples' seafront promenade curves past the Castel dell'Ovo, a sea-girt medieval fortress on a tiny island. The classic spot for a sunset stroll with Vesuvius across the bay.",
        lat: 40.8281,
        lon: 14.247,
      },
      {
        name: "Posillipo & Gaiola",
        category: "coastal",
        photoFile: "File:Isoletta della Gaiola (Napoli) 01.jpg",
        blurb:
          "The leafy Posillipo headland drops to small rocky coves and the protected Gaiola marine area — clear water, swimming nooks, and sweeping views back over the bay.",
        lat: 40.7944,
        lon: 14.1872,
      },
      {
        name: "Spaccanapoli",
        category: "culture",
        photoFile: "File:Napoli - Spaccanapoli (17340842723).jpg",
        blurb:
          "The dead-straight, shadowed lane that slices the old city in two — the throbbing spine of historic Naples, lined with churches, workshops, and street food.",
        lat: 40.8497,
        lon: 14.2585,
      },
      {
        name: "Mount Vesuvius",
        category: "outdoors",
        photoFile: "File:Evening view on the bay of Naples, overlooking Mount Vesuvius.jpg",
        blurb:
          "The brooding volcano that buried Pompeii in 79 AD. A short trail climbs to the crater rim for a startling view into the cone and out over the Bay of Naples.",
        lat: 40.821,
        lon: 14.426,
      },
      {
        name: "L'Antica Pizzeria da Michele",
        category: "food",
        photoFile: "File:Pizza Napoli Brandi.jpeg",
        blurb:
          "The spartan 1870 pizzeria purists call the soul of Neapolitan pizza — essentially two pizzas, Margherita and Marinara, blistered in a wood oven. Take a number and wait.",
      },
      {
        name: "Gino Sorbillo",
        category: "food",
        photoQuery: "Neapolitan pizza Naples",
        blurb:
          "The most famous name on Via dei Tribunali, the pizza street of the old center — a vast, pillowy Margherita from a third-generation pizzaiolo. Expect a crowd on the pavement.",
      },
      {
        name: "Pasticceria Scaturchio",
        category: "food",
        photoFile: "File:Sfogliatella - Caffe Vini Spuntini.jpg",
        blurb:
          "A Piazza San Domenico Maggiore institution for sfogliatella and rum-soaked babà — the classic Neapolitan sweet stop for an espresso break between sights.",
      },
      {
        name: "Gran Caffè Gambrinus",
        category: "drink",
        photoQuery: "Gran Caffè Gambrinus Naples",
        blurb:
          "Naples' belle-époque café by Piazza del Plebiscito, pouring coffee since 1860 under chandeliers and stucco. Order a caffè and honor the local 'caffè sospeso' tradition.",
      },
    ],
  },
  positano: {
    slug: "positano",
    name: "Positano",
    region: "Amalfi Coast",
    tagline: "Pastel houses cascading down cliffs to a turquoise sea.",
    coastal: true,
    wikivoyage: "Positano",
    wikipedia: "Positano",
    heroQuery: "Positano Amalfi Coast view",
    transport: [
      "Reach it by ferry from Naples, Sorrento, or Amalfi — the most scenic arrival.",
      "The SITA bus winds the coastal road; driving is slow and parking scarce.",
      "Expect lots of stairs — Positano is vertical. Wear good shoes.",
      "Boats and water taxis hop to nearby beaches and the Li Galli islets.",
    ],
    foodNotes: [
      "Seafood-forward: spaghetti alle vongole, fried anchovies, grilled local catch.",
      "Lemons are everywhere — try delizia al limone dessert and house-made limoncello.",
      "Cliffside terraces serve long lunches with Amalfi Coast wine and a sea view.",
    ],
    beachNotes: [
      "Spiaggia Grande is the main beach below town — part free, part paid loungers.",
      "Fornillo beach is quieter, a short cliff path west of the main beach.",
      "Boat trips reach Arienzo ('the 300-steps beach') and hidden coves toward Praiano.",
      "Early-October sea is still swimmable (~73–75°F); afternoons are golden for photos.",
    ],
    curatedPois: [
      {
        name: "Spiaggia Grande",
        category: "coastal",
        blurb:
          "Positano's main beach, framed by the pastel amphitheater of town. A free public stretch sits beside rows of paid loungers; fishing boats and ferries share the shore. Best light is late afternoon as the cliffs glow.",
        lat: 40.6275,
        lon: 14.4847,
      },
      {
        name: "Fornillo Beach",
        category: "coastal",
        blurb:
          "A quieter pebble cove a five-minute walk west along the cliffside Via Positanesi d'America path. Calmer water, a couple of low-key beach bars, and a local feel away from the main-beach crowds.",
        lat: 40.6286,
        lon: 14.481,
      },
      {
        name: "Path of the Gods (Sentiero degli Dei)",
        category: "outdoors",
        photoQuery: "Sentiero degli Dei Amalfi Coast",
        blurb:
          "The Amalfi Coast's legendary cliff-top trail, running high above the sea from Bomerano to Nocelle near Positano. Roughly two to three hours of unforgettable coastal views; bring water and proper shoes.",
        lat: 40.631,
        lon: 14.453,
      },
      {
        name: "Li Galli Islands",
        category: "coastal",
        photoQuery: "Li Galli islands Amalfi",
        blurb:
          "A tiny private archipelago off Positano, mythologized as the home of Homer's sirens. You can't land, but boat tours circle the islets and anchor nearby for a swim in deep blue water.",
        lat: 40.5783,
        lon: 14.435,
      },
      {
        name: "Da Vincenzo",
        category: "food",
        photoQuery: "spaghetti alle vongole clams",
        blurb:
          "A family-run Positano favorite cooking the coast's seafood and house pastas for three generations — warm, unfussy, and reliably excellent. Book ahead in season.",
      },
      {
        name: "La Tagliata",
        category: "food",
        photoFile: "File:Amalfi Coast (Italy, October 2020) - 14 (50558382446).jpg",
        blurb:
          "A hillside, family-run spot high above Positano serving a no-menu parade of homemade dishes with a jaw-dropping coastal panorama. They'll shuttle you up from town and back.",
      },
      {
        name: "Franco's Bar",
        category: "drink",
        photoFile: "File:Positano Sunset.JPG",
        blurb:
          "Le Sirenuse's cliff-edge cocktail bar — no reservations, first-come stools, and arguably the finest aperitivo view on the Amalfi Coast as the sun drops behind Li Galli.",
      },
    ],
  },
  // --- expansion-ready ---
  sorrento: {
    slug: "sorrento",
    name: "Sorrento",
    region: "Bay of Naples",
    tagline: "Clifftop town of lemon groves, a balcony over the Bay of Naples.",
    coastal: true,
    wikivoyage: "Sorrento",
    wikipedia: "Sorrento",
    heroQuery: "Sorrento coast Bay of Naples panorama",
    heroFile: "File:Aerial panorama of Sorrento. March 2023.jpg",
    transport: [
      "End of the Circumvesuviana line from Naples (~70 min) — the easy rail link.",
      "Ferries and hydrofoils to Capri, Naples, and the Amalfi Coast leave from Marina Piccola.",
      "The town center is compact and walkable; the old quarter is best on foot.",
      "SITA buses wind south to Positano and Amalfi along the coastal road.",
    ],
    foodNotes: [
      "Gnocchi alla sorrentina (with tomato, basil, and fior di latte) is the hometown dish.",
      "Seafood pastas and the local 'spaghetti ai ricci' (sea urchin) star on coastal menus.",
      "Limoncello was popularized here — the sfusato lemon scents desserts and after-dinner glasses.",
      "Long lemon-grove lunches and a slow evening passeggiata are the Sorrentine rhythm.",
    ],
    beachNotes: [
      "Mostly rocky platforms and small marinas; cliffside bathing clubs lower you to the water.",
      "Marina Grande's little beach keeps an old fishing-village feel away from the center.",
      "Bagni della Regina Giovanna is a wild natural sea pool in Roman ruins — bring water shoes.",
      "Early-October sea is still swimmable (~73°F); ferries open up Capri and Amalfi swims.",
    ],
    curatedPois: [
      {
        name: "Marina Grande",
        category: "coastal",
        photoFile: "File:Marina Grande, Sorrento.jpg",
        blurb:
          "Sorrento's old fishing village, tucked below the cliffs — pastel houses on the water, beached wooden boats, and seafood trattorias where the catch comes in steps from your table. A small beach and an unhurried, lived-in feel away from the busy center.",
        lat: 40.6293,
        lon: 14.3686,
      },
      {
        name: "Cloister of San Francesco",
        category: "culture",
        photoFile: "File:Chiostro di San Francesco (Sorrento) WLM24 (04).jpg",
        blurb:
          "A serene 14th-century cloister of interlaced arches draped in bougainvillea, beside the church of San Francesco. Free to enter, it hosts summer concerts and weddings — one of the most photographed quiet corners in town.",
        lat: 40.6256,
        lon: 14.3724,
      },
      {
        name: "Villa Comunale",
        category: "coastal",
        photoFile: "File:View of beach huts at the port of Sorrento, from Villa Comunale, 2010.jpg",
        blurb:
          "A small public garden on the cliff edge with the town's best free panorama — straight across the Bay of Naples to Vesuvius, with the bathing huts of Marina Piccola directly below. The classic spot to catch the sunset before dinner.",
        lat: 40.6262,
        lon: 14.3716,
      },
      {
        name: "Piazza Tasso",
        category: "culture",
        photoFile: "File:Piazza Tasso - Sorrento BW 2013-05-12.jpg",
        blurb:
          "The social heart of Sorrento, named for the poet Torquato Tasso who was born here. Cafés spill across the square, horse-drawn carriages wait, and the evening passeggiata flows through — the place to sit with a coffee and watch the town go by.",
        lat: 40.6263,
        lon: 14.3753,
      },
      {
        name: "Sedile Dominova",
        category: "culture",
        photoFile: "File:Sorrento Sedile Dominova BW 2013-05-12 12-40-36.JPG",
        blurb:
          "A rare 15th-century open loggia at a street corner in the old town, its dome and walls covered in faded frescoes. Once the meeting seat of Sorrento's noble families, it's now a working men's club — a vivid survival of the medieval city.",
        lat: 40.6259,
        lon: 14.3742,
      },
      {
        name: "Basilica di Sant'Antonino",
        category: "culture",
        photoFile: "File:Basilica di Sant'Antonino 1.JPG",
        blurb:
          "The church of Sorrento's patron saint, with a crypt of votive offerings and a pair of whale ribs by the door, trophies of a local legend. A short, atmospheric stop on the way through the old quarter.",
        lat: 40.6266,
        lon: 14.3736,
      },
      {
        name: "Museo Correale di Terranova",
        category: "art",
        photoFile: "File:Sorrento Museo Correale di Terranova.jpg",
        blurb:
          "An aristocratic villa turned museum of Neapolitan decorative arts — Capodimonte porcelain, inlaid 'intarsia' woodwork (a Sorrentine craft), and old-master paintings, set in citrus gardens with a belvedere over the gulf. A quiet, refined hour.",
        lat: 40.6286,
        lon: 14.3792,
      },
      {
        name: "O'Parrucchiano La Favorita",
        category: "food",
        photoFile: "File:Gnocchi alla sorrentina. Le Scuderie, Via Simone Sancasciani 1, 56125 Pizo PI.jpg",
        blurb:
          "An institution since 1868, set inside a glass-roofed conservatory thick with lemon and orange trees. Said to be the birthplace of cannelloni; the gnocchi alla sorrentina and the greenhouse setting alone are worth the visit.",
        lat: 40.6271,
        lon: 14.3746,
      },
      {
        name: "I Giardini di Cataldo",
        category: "drink",
        photoFile: "File:Entrance to the Lemon Grove.jpg",
        blurb:
          "A working, family-run lemon grove a few minutes from Piazza Tasso, where giant sfusato lemons hang under chestnut-pole pergolas. Wander the rows and taste the house limoncello and lemon delizia straight from the people who make it.",
        lat: 40.6259,
        lon: 14.3771,
      },
      {
        name: "Gelateria David",
        category: "food",
        photoFile: "File:Gelato artigianale italiano, Bertinelli.jpg",
        blurb:
          "A beloved Sorrento gelateria churning seasonal flavors built on local fruit — the lemon and the 'profumi di Sorrento' are the ones to try. A friendly stop on the evening stroll, often with a tasting before you choose.",
        lat: 40.6268,
        lon: 14.3736,
      },
      {
        name: "Bagni della Regina Giovanna",
        category: "coastal",
        photoFile: "File:Sorrento 2013 - 4 (9694529604).jpg",
        blurb:
          "A natural sea pool ringed by the ruins of the Roman Villa Pollio Felice, where a stone arch lets the sea wash into a sheltered basin. A scenic walk west of town rewards you with one of the coast's most atmospheric (and free) swims.",
        lat: 40.6346,
        lon: 14.3389,
        hiddenGem: true,
      },
      {
        name: "Vallone dei Mulini",
        category: "outdoors",
        photoFile: "File:Sorrento Vallone dei Mulini.jpg",
        blurb:
          "A deep green gorge slicing through the center, where an abandoned flour mill stands wrapped in ferns and humid jungle. You view it from a railing on Via Fuorimura — a startling pocket of wilderness right in the middle of town.",
        lat: 40.6266,
        lon: 14.3738,
        hiddenGem: true,
      },
    ],
  },
  amalfi: {
    slug: "amalfi",
    name: "Amalfi",
    region: "Amalfi Coast",
    tagline: "Once a maritime republic, now the coast's namesake jewel.",
    coastal: true,
    wikivoyage: "Amalfi",
    wikipedia: "Amalfi",
    transport: [
      "Ferry hub for the coast — connections to Positano, Salerno, and Capri.",
      "SITA buses link Amalfi to Ravello and along the coastal road.",
    ],
    foodNotes: [
      "Scialatielli ai frutti di mare (fresh pasta with seafood) is the signature dish.",
      "Sfusato lemons flavor everything from pasta to granita.",
    ],
    beachNotes: ["The town beach sits right by the ferry dock; nearby Atrani is quieter."],
  },
  pompeii: {
    slug: "pompeii",
    name: "Pompeii",
    region: "Campania",
    tagline: "A Roman city frozen in 79 AD by Vesuvius — the ultimate day trip.",
    coastal: false,
    wikivoyage: "Pompeii",
    wikipedia: "Pompeii",
    transport: [
      "Circumvesuviana from Naples or Sorrento stops at Pompei Scavi.",
      "Allow at least half a day; the archaeological site is vast.",
    ],
    foodNotes: ["Eat in modern Pompei town or pack water and snacks — the site is huge and hot."],
  },
};

export const PHRASES: { group: string; items: Phrase[] }[] = [
  {
    group: "Essentials",
    items: [
      { it: "Buongiorno", en: "Good morning / hello", say: "bwon-JOR-no" },
      { it: "Buonasera", en: "Good evening", say: "bwona-SEH-ra" },
      { it: "Per favore", en: "Please", say: "pehr fah-VOH-reh" },
      { it: "Grazie", en: "Thank you", say: "GRAH-tsyeh" },
      { it: "Prego", en: "You're welcome / go ahead", say: "PREH-go" },
      { it: "Scusi", en: "Excuse me (polite)", say: "SKOO-zee" },
      { it: "Parla inglese?", en: "Do you speak English?", say: "PAR-la een-GLEH-zeh" },
    ],
  },
  {
    group: "Eating out",
    items: [
      { it: "Un tavolo per due", en: "A table for two", say: "oon TAH-vo-lo pehr DOO-eh" },
      { it: "Il conto, per favore", en: "The check, please", say: "eel KON-toh" },
      { it: "Un caffè", en: "An espresso", say: "oon kaf-FEH" },
      { it: "Acqua frizzante / naturale", en: "Sparkling / still water", say: "AH-kwa free-TSAN-teh" },
      { it: "È squisito!", en: "It's delicious!", say: "eh skwee-ZEE-to" },
    ],
  },
  {
    group: "Getting around",
    items: [
      { it: "Dov'è...?", en: "Where is...?", say: "do-VEH" },
      { it: "Quanto costa?", en: "How much is it?", say: "KWAN-to KOS-ta" },
      { it: "Un biglietto", en: "A ticket", say: "oon beel-YET-to" },
      { it: "A che ora parte il traghetto?", en: "What time does the ferry leave?", say: "ah keh OH-ra PAR-teh eel tra-GHET-to" },
    ],
  },
];

export const PACKING_LIST: string[] = [
  "Light layers — warm sunny days (low 70s °F) but cooler evenings near the coast.",
  "Comfortable walking shoes (Rome's cobbles and Positano's stairs are no joke).",
  "Swimwear and a quick-dry towel — the sea is still warm in early October.",
  "A light rain jacket or compact umbrella for the occasional October shower.",
  "Modest layer (shoulders/knees covered) for entering churches and the Vatican.",
  "Sunglasses, sunscreen, and a refillable water bottle (public fountains are safe).",
  "A European plug adapter (Type F/L, 230V) and a portable phone battery.",
  "A little cash — small trattorias, beach kiosks, and ferries aren't always card-friendly.",
];
