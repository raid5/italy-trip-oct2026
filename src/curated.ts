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
      "Pizza pilgrimage: Pizzeria Carmnella dal 1892 (off in a workaday quarter, but a local legend) and 10 Diego Vitagliano in Santa Lucia.",
      "For a proper sit-down: seafood at Scicchitano on the Lungomare, or old-city home cooking at La Locanda Gesù Vecchio.",
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
  procida: {
    slug: "procida",
    name: "Procida",
    region: "Bay of Naples",
    tagline: "A pocket-size island of pastel fishermen's houses and lemon gardens.",
    coastal: true,
    wikivoyage: "Procida",
    wikipedia: "Procida",
    heroFile: "File:Procida Marina Corricella.jpg",
    transport: [
      "Ferries and hydrofoils from Naples (Molo Beverello / Calata Porta di Massa) reach Procida in ~40 min.",
      "Boats also hop to Ischia in ~15 min — easy to pair the two islands.",
      "The island is tiny — walk the harbors, or take the small buses and micro-taxis from Marina Grande.",
      "No car needed; the lanes are narrow and the center is best explored on foot.",
    ],
    foodNotes: [
      "Sea-to-table classics: spaghetti ai ricci (sea urchin), fritto misto, and the day's grilled catch.",
      "The giant Procida lemon stars in 'insalata di limoni', a refreshing lemon-and-chilli salad.",
      "'Lingua di bue' — a tongue-shaped lemon-cream pastry — is the island's sweet signature.",
      "Cool the evening with a chilled Campanian Falanghina or a glass of local limoncello.",
    ],
    beachNotes: [
      "Chiaiolella and Ciraccio on the west side have the widest sand and the best sunsets.",
      "Cala del Pozzo Vecchio ('Il Postino' beach) is a dark-sand cove framed by tufa cliffs.",
      "Spiaggia della Chiaia, down a long staircase, stays calm and family-friendly.",
      "Early-October sea is still swimmable (~74°F) and the summer crowds have thinned.",
    ],
    curatedPois: [
      {
        name: "Marina Corricella",
        category: "coastal",
        photoFile: "File:Procidamarina.jpg",
        blurb:
          "Procida's oldest fishing harbor — a sun-faded tumble of ochre, pink, and blue houses stacked above bobbing boats. Carless and impossibly photogenic, it's the postcard image of the island, best caught at golden hour from the steps above.",
        lat: 40.7607,
        lon: 14.026,
      },
      {
        name: "Marina Grande",
        category: "coastal",
        photoFile: "File:Marina Grande (Procida) 2016 (2).jpg",
        blurb:
          "The ferry harbor and lived-in heart of the island, fronted by a pastel wall of facades, café tables, and tackle shops. Your first and last view of Procida — and a fine spot for an aperitivo as the boats come and go.",
        lat: 40.766,
        lon: 14.041,
      },
      {
        name: "Marina di Chiaiolella",
        category: "coastal",
        photoFile: "File:Marina di Chiaiolella 1.JPG",
        blurb:
          "A rounded natural harbor on the island's quieter west side, ringed by seafood restaurants and moored sailboats, with the Vivara reserve arching off one end. The go-to for a long, unhurried lunch by the water.",
        lat: 40.7536,
        lon: 14.0125,
      },
      {
        name: "Cala del Pozzo Vecchio",
        category: "coastal",
        photoFile: "File:Cala Pozzo Vecchio - Procida.jpg",
        blurb:
          "A dark-sand cove under crumbling tufa cliffs, immortalized as the beach in the film 'Il Postino'. Sheltered and atmospheric, it has the kind of faded, end-of-season beauty that defines Procida.",
        lat: 40.7635,
        lon: 14.0145,
      },
      {
        name: "Terra Murata",
        category: "history",
        photoFile: "File:Terra Murata (Procida), 2016.jpg",
        blurb:
          "The fortified medieval citadel crowning the island's highest point — a maze of walls and tufa lanes raised against pirate raids. Its terraces give the definitive view straight down over Corricella's painted harbor.",
        lat: 40.7616,
        lon: 14.0291,
      },
      {
        name: "Palazzo d'Avalos",
        category: "history",
        photoFile: "File:Palazzo d'Avalos (Procida) 01.jpg",
        blurb:
          "A 16th-century palace that became a royal residence and then, for nearly two centuries, the island's prison. Now open for atmospheric tours, it broods over Terra Murata with sweeping views across the bay.",
        lat: 40.7622,
        lon: 14.03,
      },
      {
        name: "Abbazia di San Michele Arcangelo",
        category: "culture",
        photoFile: "File:Procida-Abbazia San Michele Arcangelo723.jpg",
        blurb:
          "The island's spiritual anchor, a 16th-century abbey on the Terra Murata cliffs with a gilded coffered ceiling and a warren of catacombs and hidden chapels below. Dedicated to Procida's protector, the Archangel Michael.",
        lat: 40.7619,
        lon: 14.0296,
      },
      {
        name: "Chiesa di Santa Maria delle Grazie",
        category: "culture",
        photoFile: "File:Church Santa Maria delle Grazie (1), Procida.jpg",
        blurb:
          "A pale-domed church above Corricella whose terrace is one of the best perches for taking in the painted harbor below. A quiet, luminous pause on the climb up to Terra Murata.",
        lat: 40.7606,
        lon: 14.027,
      },
      {
        name: "Vivara",
        category: "outdoors",
        photoFile: "File:Ponte di Vivara.jpg",
        blurb:
          "A crescent islet linked to Procida by a footbridge — now a protected reserve of Mediterranean scrub and seabirds over an ancient volcanic crater. A short, wild escape from the harbors (check the open days before you go).",
        lat: 40.7475,
        lon: 14.008,
      },
      {
        name: "Alici al limone",
        category: "food",
        photoFile: "File:Alici marinate 1.jpg",
        blurb:
          "Fresh anchovies cured in the juice of Procida's giant lemons with garlic, chilli, and parsley — silvery, barely 'cooked', and intensely of the sea. A humble, deeply local plate eaten straight from the marina, and the island's real food hook.",
      },
    ],
  },
  tropea: {
    slug: "tropea",
    name: "Tropea",
    region: "Calabria",
    tagline: "A cliff-top old town above a sweep of white sand and turquoise sea.",
    coastal: true,
    wikivoyage: "Tropea",
    wikipedia: "Tropea",
    heroFile: "File:Tropea - Santa Maria dell'Isola al tramonto.jpg",
    transport: [
      "Tropea has its own rail station on the Tyrrhenian coastal line; trains link Lamezia Terme and Reggio Calabria.",
      "Lamezia Terme (SUF) is the nearest airport, about an hour north by car or train.",
      "The historic center sits on the cliff and is walkable; long staircases drop to the beach below.",
      "Summer boats run to Capo Vaticano's coves and along the Coast of the Gods.",
    ],
    foodNotes: [
      "The sweet 'cipolla rossa di Tropea' (red onion) flavors everything from marmalade to gelato.",
      "'Nduja, Calabria's fiery spreadable salami, turns up on bread, pasta, and pizza.",
      "Swordfish, anchovies, and 'fileja' pasta with pork ragù are coastal-Calabrian staples.",
      "Just up the coast in Pizzo, the 'tartufo' chocolate-and-hazelnut gelato bomb is a must.",
      "Take an aperitivo on a cliff-edge terrace (Pimm's) as the sun drops behind Santa Maria dell'Isola.",
      "Seek out a Calabrian agriturismo for just-made ricotta with warm bread — ask for the local honey and chilli.",
    ],
    beachNotes: [
      "The main town beach below Santa Maria dell'Isola has fine white sand and clear, shallow water.",
      "Spiaggia della Rotonda and the marina beaches sit right under the old-town cliff.",
      "Capo Vaticano, a short hop south, hides some of Calabria's most beautiful coves.",
      "Early-October sea stays warm (~75°F) with far fewer crowds than August.",
    ],
    curatedPois: [
      {
        name: "Santa Maria dell'Isola",
        category: "coastal",
        photoFile: "File:Tropea - Santa Maria dell'Isola - 1.jpg",
        blurb:
          "A medieval sanctuary perched on its own rocky islet between the town cliff and the beach — Tropea's defining image. Climb the cut-stone stairs through terraced gardens for a Tyrrhenian panorama in every direction.",
        lat: 38.6757,
        lon: 15.8967,
      },
      {
        name: "Spiaggia della Rotonda",
        category: "coastal",
        photoFile: "File:Beach in Tropea - Calabria - Italy - July 17th 2013 - 02.jpg",
        blurb:
          "The luminous white-sand beach directly below the old town, lapped by water so clear it looks tropical. The classic spot to swim with the cliff, the cathedral, and Santa Maria dell'Isola rising overhead.",
        lat: 38.677,
        lon: 15.8975,
      },
      {
        name: "Capo Vaticano",
        category: "coastal",
        photoFile: "File:Ricadi - Capo Vaticano - 02.jpg",
        blurb:
          "A granite headland just south of town, ranked among Italy's finest beaches — a string of turquoise coves and white-sand pockets reached by paths down the cliffs. A short trip for a wilder, postcard swim.",
        lat: 38.6189,
        lon: 15.8281,
      },
      {
        name: "Porto di Tropea",
        category: "coastal",
        photoFile: "File:Tropea - Porto al tramonto.jpg",
        blurb:
          "The small marina at the foot of the cliffs, where fishing boats and pleasure craft tie up beneath the floodlit old town. A relaxed place for a sunset passeggiata and a seafood dinner by the water.",
        lat: 38.6797,
        lon: 15.8955,
      },
      {
        name: "Cattedrale di Tropea",
        category: "history",
        photoFile: "File:Duomo di Tropea.jpg",
        blurb:
          "The Norman cathedral at the town's core, founded in the 12th century and rebuilt after earthquakes, guarding a venerated Byzantine icon and two undetonated WWII bombs by the door. A cool, solemn stop among the lanes.",
        lat: 38.6772,
        lon: 15.8989,
      },
      {
        name: "Corso Vittorio Emanuele",
        category: "culture",
        photoFile: "File:Tropea - Corso Vittorio Emanuele.jpg",
        blurb:
          "The old town's pedestrian spine, lined with noble palazzi, gelaterias, and shops braiding the famous red onions into garlands. The stage for Tropea's evening stroll, ending at the cliff-edge belvederes.",
        lat: 38.6775,
        lon: 15.8983,
      },
      {
        name: "Veduta da Via Carmine",
        category: "culture",
        photoFile: "File:Tropea - Veduta da Via Carmine - 3.jpg",
        blurb:
          "The cliff-top viewpoint where the town meets the void — pastel houses balanced on the tufa edge above the sea, with Santa Maria dell'Isola below. One of the most photographed panoramas on the whole coast.",
        lat: 38.6779,
        lon: 15.8978,
      },
      {
        name: "Belvedere del Cannone",
        category: "outdoors",
        photoFile: "File:Tropea - Belvedere del Cannone - 2.jpg",
        blurb:
          "A small clifftop terrace built around an old cannon, framing the islet sanctuary and the bay in a single sweep. The prime perch for sunset, when the whole coast turns gold and rose.",
        lat: 38.6764,
        lon: 15.8973,
      },
      {
        name: "Cipolla rossa di Tropea",
        category: "food",
        photoFile: "File:Fresh Red Onion.jpg",
        blurb:
          "Tropea's prized sweet red onion, an IGP product so mild it's eaten raw, candied into marmalade, and even churned into gelato. You'll see it braided in every shop window — buy a string to take home.",
      },
      {
        name: "'Nduja calabrese",
        category: "food",
        photoFile: "File:Nduja mit Brot.jpg",
        blurb:
          "Calabria's soft, fiery, spreadable salami, shot through with the region's hot peppers. Smear it on warm bread, stir it into pasta, or melt it over pizza — the unmistakable taste of the Calabrian table.",
      },
      {
        name: "Tartufo di Pizzo",
        category: "food",
        photoFile: "File:Tartufo nero di Pizzo.jpg",
        blurb:
          "In nearby Pizzo, the tartufo is a hand-formed ball of hazelnut and chocolate gelato with a molten cocoa heart, dusted in cocoa. A short trip up the coast for one of Calabria's great sweet rituals.",
        hiddenGem: true,
      },
    ],
  },
  bagnara: {
    slug: "bagnara",
    name: "Bagnara Calabra",
    region: "Calabria",
    tagline: "A swordfishing town on the violet-hued Costa Viola.",
    coastal: true,
    wikivoyage: "Bagnara Calabra",
    wikipedia: "Bagnara Calabra",
    heroFile: "File:Lungomare di Bagnara Calabra - Province of Reggio Calabria, Italy - 18 Oct. 2014.jpg",
    transport: [
      "Bagnara sits on the Tyrrhenian rail line between Reggio Calabria and Tropea; the station is a short walk from the seafront.",
      "The A2 'Autostrada del Mediterraneo' passes just above town for drivers.",
      "It's an easy day-trip pairing with Scilla, a few minutes south along the Costa Viola.",
      "The center hugs the shore — flat and walkable along the lungomare.",
    ],
    foodNotes: [
      "This is a historic swordfish port — 'pesce spada' grilled, in rolls (involtini), or with pasta.",
      "Bagnara's almond 'torrone' is an IGP nougat, both the hard and the soft, cocoa-dusted kind.",
      "Sea-urchin and anchovy pastas show up on summer menus along the coast.",
      "Pair with a crisp Calabrian white or a sip of bergamot liqueur from down the coast.",
      "Alma Bistrot is the town's standout modern kitchen for a relaxed sit-down dinner.",
      "Inland, a Calabrian agriturismo serves just-made ricotta with bread — ask for honey and the local chilli.",
    ],
    beachNotes: [
      "The long pebble-and-sand beach runs the length of the lungomare, right in town.",
      "The Costa Viola's clear, deep water takes on a violet sheen at dusk — the coast's namesake.",
      "Quieter coves hide north toward Palmi beneath the cliffs.",
      "Early-October swimming is still pleasant (~74°F) with the beaches near-empty.",
    ],
    curatedPois: [
      {
        name: "Spiaggia di Bagnara",
        category: "coastal",
        photoFile: "File:Lungomare di Bagnara Calabra - Province of Reggio Calabria, Italy - 18 Oct. 2014 - (1).jpg",
        blurb:
          "The town beach unspools along the seafront promenade, a broad ribbon of sand and pebble backed by pastel houses and the headland. Easy, in-town swimming with the mountains tumbling almost to the water.",
        lat: 38.2875,
        lon: 15.808,
      },
      {
        name: "Costa Viola",
        category: "coastal",
        photoFile: "File:Costa viola.jpg",
        blurb:
          "The 'Violet Coast' between Bagnara and Scilla, where steep terraced cliffs drop to a sea that glows purple at sunset. Some of Calabria's most dramatic shoreline, threaded by old fishermen's paths.",
        lat: 38.27,
        lon: 15.79,
      },
      {
        name: "Torre Aragonese",
        category: "history",
        photoFile: "File:Torre Aragonese (Bagnara).jpg",
        blurb:
          "The squat coastal watchtower, also called the Torre Ruggiero, raised to spot raiders approaching from the sea. A weathered survivor of the town's fortified past, looking out over the gulf.",
        lat: 38.2845,
        lon: 15.8035,
      },
      {
        name: "Chiesa di Maria SS. del Carmelo",
        category: "culture",
        photoFile: "File:Bagnara Calabra (RC) - chiesa di Maria Santissima del Carmelo - 02.jpg",
        blurb:
          "Bagnara's grand parish church, rebuilt after the region's devastating earthquakes, with a richly worked interior honoring the Madonna del Carmine. The focus of the town's feast-day processions.",
        lat: 38.288,
        lon: 15.8085,
      },
      {
        name: "Pesce spada alla bagnarese",
        category: "food",
        photoFile: "File:Simple Grilled Swordfish (6952240417).jpg",
        blurb:
          "Swordfish is Bagnara's identity — hunted for centuries from long-prowed 'passerelle' boats in the strait. Eaten grilled, rolled into involtini, or with pasta, it's the dish that defines the town.",
      },
      {
        name: "Torrone di Bagnara",
        category: "food",
        photoFile: "File:Nougat artisanal.JPG",
        blurb:
          "An IGP almond nougat made here since the 1800s, in a hard 'martiniana' version and a soft, cocoa-and-spice 'torrefatto'. A sweet souvenir traditionally made by the town's women.",
        hiddenGem: true,
      },
    ],
  },
  scilla: {
    slug: "scilla",
    name: "Scilla",
    region: "Calabria",
    tagline: "A castle, a fishing quarter on the rocks, and Homer's legendary strait.",
    coastal: true,
    wikivoyage: "Scilla",
    wikipedia: "Scilla, Calabria",
    heroFile: "File:Scilla dal belvedere.jpg",
    transport: [
      "Scilla has a station on the Tyrrhenian line; Reggio Calabria is about 30 minutes south.",
      "It's the southern anchor of the Costa Viola, an easy pairing with Bagnara just north.",
      "Ferries across the Strait of Messina to Sicily leave from nearby Villa San Giovanni.",
      "The village is steep and walkable; stairs link the castle, the beach, and the Chianalea lanes.",
    ],
    foodNotes: [
      "Swordfish rules the menus — 'spaghetti con pesce spada' and grilled steaks fresh off the strait.",
      "Chianalea's tiny seafood trattorias serve the day's catch with their feet almost in the water.",
      "Anchovies, sea urchin, and bergamot from the Reggio coast flavor local cooking.",
      "Finish with a Calabrian gelato or a glass of crisp local white by the harbor.",
      "In the Calabrian hills, an agriturismo's just-made ricotta with bread — with honey and local chilli — is unmissable.",
    ],
    beachNotes: [
      "Marina Grande is a wide sand beach right below the castle, the village's main swimming spot.",
      "The water of the Costa Viola is deep, clear, and famously clean.",
      "Boats run from the beach to coves and along the violet cliffs toward Bagnara.",
      "Early-October sea is still warm (~74°F) and the village is blissfully quiet.",
    ],
    curatedPois: [
      {
        name: "Castello Ruffo",
        category: "history",
        photoFile: "File:Scilla - Castello Ruffo - 202208301303 3.jpg",
        blurb:
          "The cliff-top castle splitting the village in two, raised on the rock the ancients tied to the monster Scylla. Long a fortress and lighthouse, its ramparts give a commanding sweep over the strait toward Sicily.",
        lat: 38.2527,
        lon: 15.7148,
      },
      {
        name: "Chianalea",
        category: "coastal",
        photoFile: "File:Scilla - Chianalea - 1.jpg",
        blurb:
          "Scilla's ancient fishermen's quarter — a 'little Venice' of tall houses rising straight from the sea, divided by alleys and tiny landings where boats are still moored at the doorsteps. The most enchanting corner of town.",
        lat: 38.2543,
        lon: 15.7165,
      },
      {
        name: "Spiaggia di Marina Grande",
        category: "coastal",
        photoFile: "File:Spiaggia di Scilla.JPG",
        blurb:
          "The village's broad sand beach, curving below the castle with the strait shimmering ahead. Sheltered and shallow, it's the heart of summer life and an unbeatable place to swim under a fortress.",
        lat: 38.2533,
        lon: 15.7135,
      },
      {
        name: "Strait of Messina",
        category: "coastal",
        photoFile: "File:Strait of Messina 13.jpg",
        blurb:
          "The narrow channel between Calabria and Sicily, home in myth to the monsters Scylla and Charybdis. Its swirling currents and the silhouette of Etna across the water make for hypnotic gazing from the shore.",
        lat: 38.24,
        lon: 15.65,
      },
      {
        name: "Chiesa di San Rocco",
        category: "culture",
        photoFile: "File:Chiesa di San Rocco - Scilla - Italy - 8 Sept. 2008.jpg",
        blurb:
          "The village's hillside church, dedicated to the protector against plague, set on a small piazza that doubles as one of Scilla's finest free viewpoints over the rooftops and sea.",
        lat: 38.2531,
        lon: 15.7158,
      },
      {
        name: "Vista da Via de Nava",
        category: "culture",
        photoFile: "File:Scilla - Vista da Via de Nava.jpg",
        blurb:
          "The overlook on the town's upper road, where Chianalea, the castle, and the beach line up in a single, perfect frame. The picture every visitor stops to take on the way down to the water.",
        lat: 38.2538,
        lon: 15.716,
      },
      {
        name: "Belvedere di Piazza San Rocco",
        category: "outdoors",
        photoFile: "File:Scilla - Vista dalla piazza San Rocco - 1.jpg",
        blurb:
          "A panoramic terrace high above the village that takes in the whole sweep of the strait, with Sicily and Etna on the horizon. The spot to linger as the Costa Viola turns violet at dusk.",
        lat: 38.253,
        lon: 15.7157,
      },
      {
        name: "Spaghetti con pesce spada",
        category: "food",
        photoFile: "File:Grilled swordfish.jpg",
        blurb:
          "Swordfish from the strait is Scilla's signature, harpooned in season from tall-masted 'passerella' boats. Served as pasta, in light involtini, or simply grilled — best eaten waterside in Chianalea.",
      },
      {
        name: "Tramonto sulla Costa Viola",
        category: "coastal",
        photoFile: "File:Sunset at Scilla Beach.jpg",
        blurb:
          "The reason the coast is called 'Violet' — the sun sinking behind the Sicilian mountains turns the sea and cliffs through shades of rose and purple. Watch it from the beach with the castle blazing above.",
        hiddenGem: true,
      },
    ],
  },
  catania: {
    slug: "catania",
    name: "Catania",
    region: "Sicily",
    tagline: "A baroque city of black lava and gold, in the shadow of Etna.",
    coastal: true,
    wikivoyage: "Catania",
    wikipedia: "Catania",
    heroFile: "File:Piazza del Duomo, Catania 2024.jpg",
    transport: [
      "Catania-Fontanarossa (CTA) is Sicily's busiest airport, just south of the center.",
      "Trains and the Etna-circling Ferrovia Circumetnea radiate from Catania Centrale.",
      "A small metro and city buses serve the center; the historic core is walkable.",
      "Ferries and trains along the coast reach Messina, Syracuse, and the Ionian towns.",
    ],
    foodNotes: [
      "Pasta alla Norma — tomato, fried aubergine, basil, and salted ricotta — was born here.",
      "Street food rules: arancini, the horse-meat 'cavallo', and 'cipollina' pastries.",
      "Granita with a warm brioche is the classic Sicilian breakfast, almond and pistachio especially.",
      "Etna's volcanic-soil reds and whites (Nerello Mascalese, Carricante) pair with the seafood.",
      "Go all-in on Bronte pistachio — cannoli above all — Sicily's prized 'green gold'.",
      "Beyond the classic ragù, seek out the arancino with aubergine ('alla Norma').",
    ],
    beachNotes: [
      "San Giovanni Li Cuti is a tiny black-lava cove right in the city, ringed by fishing boats.",
      "The long sandy beaches of La Plaia stretch south of the port, with summer lidos.",
      "North along the Riviera dei Ciclopi, Aci Trezza and Aci Castello offer lava-rock swimming.",
      "Early-October sea stays warm (~76°F) and the Ionian light is at its best.",
    ],
    curatedPois: [
      {
        name: "Piazza del Duomo & Fontana dell'Elefante",
        category: "culture",
        photoFile: "File:Fontana dell'Elefante 2024b.jpg",
        blurb:
          "The baroque heart of Catania, paved in black-and-white lava and marble, centered on the smiling lava-stone elephant ('u Liotru') that is the city's emblem. The natural starting point for any wander.",
        lat: 37.5024,
        lon: 15.0874,
      },
      {
        name: "Cattedrale di Sant'Agata",
        category: "history",
        photoFile: "File:Catania - Cattedrale di Sant'Agata 20240104-19.jpg",
        blurb:
          "The cathedral of Catania's beloved patron saint, rebuilt in florid baroque after the 1693 earthquake, its facade banded in lava and pale stone. Home to the composer Bellini's tomb and the great February feast of Sant'Agata.",
        lat: 37.5019,
        lon: 15.0876,
      },
      {
        name: "Castello Ursino",
        category: "history",
        photoFile: "File:Castello Ursino, Catania 2024.jpg",
        blurb:
          "A blunt 13th-century Swabian castle, once on the shore until a 1669 lava flow pushed the sea back and left it inland. Today it guards the city's civic museum of art and antiquities.",
        lat: 37.4977,
        lon: 15.0844,
      },
      {
        name: "Monastero dei Benedettini",
        category: "history",
        photoFile: "File:Catania, ex Monastero dei Benedettini 1.jpg",
        blurb:
          "One of Europe's largest Benedictine monasteries, a UNESCO-listed baroque colossus built over earlier lava flows and now part of the university. Its cloisters and buried ruins reward a guided wander.",
        lat: 37.5028,
        lon: 15.0833,
      },
      {
        name: "Teatro Massimo Bellini",
        category: "culture",
        photoFile: "File:Teatro Massimo Bellini, Catania.jpg",
        blurb:
          "Catania's gilded 19th-century opera house, named for native son Vincenzo Bellini and famed for its acoustics. The piazza around it fills with café tables and aperitivo crowds come evening.",
        lat: 37.5039,
        lon: 15.0905,
      },
      {
        name: "Via Etnea",
        category: "culture",
        photoFile: "File:Catania Via Etnea.jpg",
        blurb:
          "The grand shopping street that runs dead-straight from the Duomo toward Etna, framing the volcano at its end. Lined with baroque palazzi, pastry shops, and the green oasis of the Villa Bellini gardens.",
        lat: 37.5065,
        lon: 15.0866,
      },
      {
        name: "La Pescheria",
        category: "culture",
        photoFile: "File:Catania, il mercato del pesce. - panoramio (4).jpg",
        blurb:
          "Catania's roaring morning fish market behind the Duomo — a theatre of glistening tuna, swordfish, and shouting vendors in a maze of stalls. The most vivid slice of the city's daily life, and a street-food feast.",
        lat: 37.5016,
        lon: 15.0879,
      },
      {
        name: "Mount Etna",
        category: "outdoors",
        photoFile: "File:Mount Etna 2024 04.jpg",
        blurb:
          "Europe's largest active volcano looms over the city, its summit often smoking or snow-streaked. Cable cars and guided 4x4s climb the lava fields toward the craters — a startling, otherworldly day out.",
        lat: 37.751,
        lon: 14.9934,
      },
      {
        name: "San Giovanni Li Cuti",
        category: "coastal",
        photoFile: "File:Volcanic rock beach in San Giovanni li Cuti, Catania.jpg",
        blurb:
          "A pocket cove of black lava rock and bright fishing boats tucked into the city's seafront, with a small pebble beach. A favorite local spot for a swim, a sunbathe, or fresh fish at the water's edge.",
        lat: 37.5189,
        lon: 15.1004,
      },
      {
        name: "Faraglioni dei Ciclopi (Aci Trezza)",
        category: "coastal",
        photoFile: "File:Acitrezza Faraglioni Moon Rise Sicilia Italy Italia - Creative Commons by gnuckx (4839699549).jpg",
        blurb:
          "Just up the Riviera dei Ciclopi, jagged basalt stacks rise from the sea — the rocks Homer's blinded Cyclops is said to have hurled at Odysseus. A scenic short trip for lava-rock swimming and a seafood lunch.",
        lat: 37.5586,
        lon: 15.1606,
      },
      {
        name: "Arancino al ragù",
        category: "food",
        photoFile: "File:Arancino Siciliano .jpg",
        blurb:
          "The crisp fried rice ball, stuffed with ragù, peas, and cheese — in Catania it's pointed ('a punta', shaped like Etna) and masculine, 'arancinu'. The essential first bite of Catanese street food.",
        hiddenGem: true,
      },
      {
        name: "Granita e brioche",
        category: "food",
        photoFile: "File:Granita brioche cornetto.jpg",
        blurb:
          "The Sicilian summer breakfast — almond, pistachio, or mulberry granita scooped into or beside a soft, fluffy brioche. Locals dip the brioche straight in; do as they do, ideally before the morning heat.",
        hiddenGem: true,
      },
      {
        name: "Pasta alla Norma",
        category: "food",
        photoFile: "File:Pasta alla Norma - Wiki Loves Sicilia.jpg",
        blurb:
          "Catania's own dish — pasta with tomato, fried aubergine, basil, and a snow of salted ricotta — said to be named for Bellini's opera 'Norma'. Simple, generous, and on every traditional menu in town.",
        hiddenGem: true,
      },
    ],
  },
  capri: {
    slug: "capri",
    name: "Capri",
    region: "Bay of Naples",
    tagline: "Limestone cliffs, blue caves, and lemon-scented terraces above an impossibly turquoise sea.",
    coastal: true,
    wikivoyage: "Capri",
    wikipedia: "Capri",
    heroFile: "File:Capri Island, view to Faraglioni - panoramio.jpg",
    transport: [
      "Ferries and faster hydrofoils run from Naples (Molo Beverello, ~50 min) and Sorrento (~25 min) into Marina Grande; buy ahead and check the last return in October, as sailings thin out.",
      "From Marina Grande the funicular climbs to Capri town's Piazzetta in four minutes; a separate bus network serves Anacapri and the cliff roads.",
      "Cars are effectively banned for visitors — get around on foot, by orange convertible taxi, or by the open-top island buses.",
      "Book the Grotta Azzurra by sea from Marina Grande or by bus to the cliff-top entrance, then transfer to a rowboat; both depend on calm seas, so go early.",
    ],
    foodNotes: [
      "Ravioli capresi — fresh pasta pillows filled with caciotta cheese and marjoram in a light tomato sauce — is the island's defining first course.",
      "Insalata caprese was born here: ripe tomatoes, milky fior di latte mozzarella, basil, and a thread of local olive oil, eaten at a shaded table.",
      "Save room for torta caprese, the flourless chocolate-and-almond cake with a crackly sugar-dusted crust, often paired with an espresso.",
      "End the meal with a chilled shot of limoncello made from fat Sorrento-Capri lemons; family-run trattorie off the Piazzetta pour the best.",
    ],
    beachNotes: [
      "Marina Piccola is the main swimming cove, with pebble strips, ladders into deep water, and lidos renting loungers beneath the Faraglioni.",
      "Boats from Marina Grande let you swim out near the Faraglioni and pass under the natural arch in the middle stack, a rite of passage.",
      "The shore is rock and pebble rather than sand, so bring water shoes; the water is famously clear and best entered from lido platforms or low rocks.",
      "By early October the sea is still a swimmable 72-75°F, warmer than the cooling air, so afternoons remain ideal for a dip.",
    ],
    curatedPois: [
      {
        name: "Grotta Azzurra (Blue Grotto)",
        category: "coastal",
        blurb: "Sunlight refracting through an underwater opening floods this sea cave with an electric, otherworldly blue. You enter lying flat in a tiny rowboat that slips through a low mouth in the cliff.",
        lat: 40.5606, lon: 14.2050,
        photoFile: "File:Grotta Azzurra - panoramio - Seko Naotomo.jpg",
      },
      {
        name: "I Faraglioni",
        category: "coastal",
        blurb: "Three towering limestone sea stacks rise straight from the water off Capri's southeastern tip, the island's signature silhouette. Boats glide through the natural arch pierced in the middle rock for luck.",
        lat: 40.5360, lon: 14.2400,
        photoFile: "File:Faraglioni, Capri, Italy.jpg",
      },
      {
        name: "Marina Grande",
        category: "coastal",
        blurb: "Capri's working harbor is a tumble of pastel houses and bobbing boats beneath the green cliffs, where every visitor first sets foot. Fishing skiffs share the quay with hydrofoils and grotto tour boats.",
        lat: 40.5556, lon: 14.2403,
        photoFile: "File:Marina Grande Capri.jpg",
      },
      {
        name: "Marina Piccola",
        category: "coastal",
        blurb: "This south-facing cove is the island's swimming heart, with sun-warmed rocks, ladders into clear water, and lidos under the gaze of the Faraglioni. Legend places the rock of the Sirens just offshore.",
        lat: 40.5394, lon: 14.2310,
        photoFile: "File:Portul Marina Piccola vazut din Gradinile lui Augustus din Capri.jpg",
      },
      {
        name: "Piazzetta (Piazza Umberto I)",
        category: "culture",
        blurb: "Capri town's tiny central square is a stage of café umbrellas, a clock tower, and the eternal flow of people-watching. Order an aperitivo and watch the island's famously theatrical passeggiata unfold.",
        lat: 40.5508, lon: 14.2425,
        photoFile: "File:Piazzetta (Capri), 2016.jpg",
      },
      {
        name: "Giardini di Augusto & Via Krupp",
        category: "outdoors",
        blurb: "Terraced flower gardens open onto a postcard panorama of the Faraglioni and Marina Piccola far below. From their edge the hairpin switchbacks of Via Krupp tumble dramatically down the cliff to the sea.",
        lat: 40.5483, lon: 14.2378,
        photoFile: "File:Via Krupp, Capri, Italia.jpg",
      },
      {
        name: "Belvedere di Tragara",
        category: "coastal",
        blurb: "A walk along bougainvillea-draped Via Tragara ends at a panoramic terrace looking straight down on the Faraglioni and the sailboats anchored beneath them. It is the island's most photographed vantage, and the light is best in late afternoon.",
        lat: 40.5430, lon: 14.2370,
        hiddenGem: true,
        photoFile: "File:Capri Faraglioni with boat.jpg",
      },
      {
        name: "Villa San Michele (Anacapri)",
        category: "art",
        blurb: "Swedish doctor Axel Munthe built this villa of marble loggias, antique fragments, and a colonnaded pergola on the cliffs above Anacapri. From its terrace the view sweeps across the whole bay to Vesuvius and the Sorrento peninsula.",
        lat: 40.5556, lon: 14.2128,
        photoFile: "File:Jardín San Michele Anacapri 27.JPG",
      },
      {
        name: "Monte Solaro Chairlift (Anacapri)",
        category: "outdoors",
        blurb: "A single-seat chairlift glides up over gardens and vineyards to Capri's highest point, 589 meters above the sea. The summit unfolds a 360-degree view of the island, the bay, and the mountains of the mainland.",
        lat: 40.5497, lon: 14.2122,
        photoFile: "File:Campania Capri2 tango7174.jpg",
      },
      {
        name: "Arco Naturale",
        category: "outdoors",
        blurb: "A massive limestone arch, the remnant of a collapsed sea cave, frames the open Tyrrhenian through pine and holm oak. The footpath to it threads quiet woods far from the Piazzetta crowds.",
        lat: 40.5505, lon: 14.2625,
        hiddenGem: true,
        photoFile: "File:Arco Naturale (Capri) 03 (js).jpg",
      },
      {
        name: "Torta Caprese",
        category: "food",
        blurb: "Capri's emblematic dessert is a dense, fudgy cake of dark chocolate and ground almonds, born from a baker's happy mistake of forgetting the flour. Dusted with powdered sugar, it is rich, moist, and naturally gluten-free.",
        lat: 40.5508, lon: 14.2422,
        photoFile: "File:Torta caprese with Faraglioni.png",
      },
      {
        name: "Insalata Caprese",
        category: "food",
        blurb: "The island gave its name to the simplest of Italian plates: tomatoes, fresh mozzarella, and basil in the colors of the flag. Eaten at a terrace table with local oil and bread, it tastes of a Campanian summer.",
        lat: 40.5510, lon: 14.2420,
        photoFile: "File:Insalata Caprese Shallow Focus.jpg",
      },
    ],
  },
  cagliari: {
    slug: "cagliari",
    name: "Cagliari",
    region: "Sardinia",
    tagline: "A limestone citadel above turquoise water, where Roman ruins, flamingo lagoons, and a city beach all share one golden horizon.",
    coastal: true,
    wikivoyage: "Cagliari",
    wikipedia: "Cagliari",
    heroFile: "File:Cagliari, Sardinia, Italy - Flickr - Bella MIao.jpg",
    transport: [
      "Cagliari Elmas airport sits 15 minutes from the centre, with a direct train link to Cagliari Centrale station.",
      "The historic core is walkable, but Castello's hill is steep; the free Bastione lift and the via Santa Croce escalators save the climb.",
      "CTM city buses and a light-metro line cover the wider city; line PF/PQ buses run out to Poetto beach in summer.",
      "Skip a car for the old town - parking is scarce and ZTL-restricted; use it only for day trips along the coast.",
    ],
    foodNotes: [
      "Fregola, toasted semolina pearls, is the local signature - order it 'con arselle' (with clams) or with seafood at a Marina trattoria.",
      "Malloreddus alla campidanese (ridged gnocchetti in sausage-and-saffron tomato sugo) and stuffed culurgiones are the must-try pastas.",
      "Bottarga di muggine (cured grey-mullet roe) is grated over spaghetti or shaved raw with olive oil; seadas, the fried cheese pastry under warm honey, closes the meal.",
      "Eat seafood in the Marina district's lanes and around the Mercato di San Benedetto; pair with a chilled Vermentino di Sardegna.",
    ],
    beachNotes: [
      "Poetto stretches roughly five miles of fine pale sand along the city's eastern edge, with calm, shallow, swimmable water and easy bus access.",
      "In early October the sea is still warm at around 72°F, comfortable for long swims well after the summer crowds thin out.",
      "Calamosca is a smaller sheltered cove beneath the Sella del Diavolo headland, good for snorkelling over clear, rocky-edged shallows.",
      "Free beach stretches alternate with lidos renting umbrellas and loungers; mornings are calmest before the afternoon sea breeze picks up.",
    ],
    curatedPois: [
      {
        name: "Il Castello",
        category: "history",
        blurb: "Cagliari's walled hilltop quarter, a tangle of pastel palazzi, ramparts and watchtowers crowning the city. Its limestone lanes open onto sudden terraces over the rooftops and the sea beyond.",
        lat: 39.2167, lon: 9.1167,
        photoFile: "File:Castello (Cagliari).jpg",
      },
      {
        name: "Bastione di Saint Remy",
        category: "culture",
        blurb: "A monumental neoclassical staircase and terrace built into the old bastions, all honey-coloured limestone and sweeping arches. The panoramic promenade at the top is the city's favourite place to watch the light soften over the harbour.",
        lat: 39.2156, lon: 9.1186,
        photoFile: "File:Bastione di Saint Remy - Cagliari, Italy 2024-03-28.jpg",
      },
      {
        name: "Cattedrale di Santa Maria",
        category: "history",
        blurb: "Cagliari's cathedral wears a Pisan-Romanesque facade of pale stone with a separate bell tower, glowing amber at sunset. Inside lie a baroque crypt of martyrs and an Aragonese pulpit carved in the 12th century.",
        lat: 39.2153, lon: 9.1183,
        photoFile: "File:Duomo di Cagliari Sardegna.jpg",
      },
      {
        name: "Torre dell'Elefante",
        category: "history",
        blurb: "A 1307 Pisan defensive tower named for the small carved elephant on its flank, its raw stone open at the rear in the Pisan fashion. Climb its wooden galleries for one of the best views down over the old town and port.",
        lat: 39.2161, lon: 9.1158,
        photoFile: "File:Torre dell'Elefante - panoramio.jpg",
      },
      {
        name: "Torre di San Pancrazio",
        category: "history",
        blurb: "The taller of Cagliari's two surviving Pisan towers guards the northern gate into Castello, its city-facing side left dramatically open. From the summit the whole sweep of the gulf and the salt lagoons unfolds.",
        lat: 39.2172, lon: 9.1172,
        hiddenGem: true,
        photoFile: "File:2015-08-11 09-35-09 DSC7387.jpg",
      },
      {
        name: "Anfiteatro Romano",
        category: "history",
        blurb: "A 2nd-century amphitheatre carved partly straight into the living rock of a hillside just below Castello. Worn tiers of seating and tunnel mouths hint at the gladiatorial games once staged within sight of the sea.",
        lat: 39.2186, lon: 9.1131,
        photoFile: "File:At Cagliari 2024 27.jpg",
      },
      {
        name: "Poetto Beach",
        category: "coastal",
        blurb: "The city's long ribbon of pale sand and luminous turquoise shallows, framed by the dark Sella del Diavolo headland. Lidos, kiosks and free stretches make it equal parts swim spot and evening passeggiata.",
        lat: 39.2050, lon: 9.1750,
        photoFile: "File:Poetto beach.jpg",
      },
      {
        name: "Sella del Diavolo",
        category: "outdoors",
        blurb: "The 'Devil's Saddle' is a limestone promontory closing off the Poetto bay, ribbed with Mediterranean scrub and ringed by hidden coves. A short trail past ruined towers leads to clifftop views over both the city and the open sea.",
        lat: 39.1944, lon: 9.1719,
        hiddenGem: true,
        photoFile: "File:Sella del Diavolo - Cagliari, Italy 2024-03-27 (03).jpg",
      },
      {
        name: "Molentargius Salt Pans",
        category: "outdoors",
        blurb: "A protected wetland of former salt pans between the city and Poetto, home to hundreds of resident pink flamingos. Boardwalks and cycle paths thread the reed-fringed pools where the birds wade and feed year-round.",
        lat: 39.2350, lon: 9.1530,
        photoFile: "File:Greater Flamingos (Fenicottero Rosa) (Phoenicopterus roseus) - Cagliari, Italy 2024-04-01 (01).jpg",
      },
      {
        name: "Calamosca",
        category: "coastal",
        blurb: "A small sheltered cove tucked beneath the Sella del Diavolo, watched over by a Spanish-era tower and a candy-striped lighthouse. Clear, calm water and rocky edges make it a quieter, snorkel-friendly alternative to Poetto.",
        lat: 39.1900, lon: 9.1644,
        hiddenGem: true,
        photoFile: "File:Torre e faro di Calamosca.jpg",
      },
      {
        name: "Piazza Yenne & the Marina",
        category: "culture",
        blurb: "The lively lower-town square where cafe terraces spread under palms below the Castello ramparts. From here the Marina district's narrow lanes run down toward the port, packed with seafood trattorie and aperitivo spots.",
        lat: 39.2147, lon: 9.1133,
        photoFile: "File:Piazza Yenne from largo Carlo Felice.jpg",
      },
      {
        name: "Fregola con arselle",
        category: "food",
        blurb: "Toasted semolina pearls simmered with clams, mussels and tomato until they soak up all the briny broth. It is the dish that most tastes of Cagliari's harbour, best eaten in a Marina trattoria.",
        lat: 39.2133, lon: 9.1147,
        photoFile: "File:Fregola sarda de Chef koketo.jpg",
      },
      {
        name: "Malloreddus alla campidanese",
        category: "food",
        blurb: "Ridged saffron-tinted gnocchetti dressed in a slow sausage-and-tomato sugo and grated pecorino. The everyday Sunday pasta of the Campidano plain around Cagliari.",
        lat: 39.2150, lon: 9.1140,
        photoFile: "File:Malloreddus mound.jpg",
      },
      {
        name: "Culurgiones",
        category: "food",
        blurb: "Hand-pleated pasta parcels sealed in a wheat-ear pattern and stuffed with potato, pecorino and mint. Served simply in tomato sauce, they are one of Sardinia's most distinctive comfort dishes.",
        lat: 39.2155, lon: 9.1145,
        photoFile: "File:Culurgiones Ogliastra.jpg",
      },
      {
        name: "Vermentino di Sardegna",
        category: "drink",
        blurb: "Sardinia's crisp, citrus-and-sea-breeze white, poured chilled all along the Cagliari waterfront. It is the natural partner to the city's seafood, from raw bottarga to a bowl of fregola.",
        lat: 39.2140, lon: 9.1130,
        photoFile: "File:Vermentino di Sardegna.jpg",
      },
    ],
  },
  alghero: {
    slug: "alghero",
    name: "Alghero",
    region: "Sardinia",
    tagline: "A walled Catalan city on Sardinia's Coral Riviera, where Algherese is still spoken and the sea laps golden ramparts.",
    coastal: true,
    wikivoyage: "Alghero",
    wikipedia: "Alghero",
    heroFile: "File:Bastioni di Alghero e il campanile di Santa Maria.jpg",
    transport: [
      "Alghero-Fertilia airport (AHO) sits 6 miles north; the local ASP/ARST bus and shared minibuses run into town, or it's a quick taxi.",
      "The historic centre is car-free and entirely walkable; park outside the walls near the port or Via Garibaldi and explore on foot.",
      "ARST buses connect Alghero to Sassari, Bosa, and the beaches at Fertilia, Maria Pia, and Le Bombarde in summer.",
      "Reach Grotta di Nettuno by boat from the port (scenic ~45-min coastal cruise) or by car to Capo Caccia plus the cliff staircase.",
    ],
    foodNotes: [
      "Aragosta alla catalana is the signature splurge: poached spiny lobster dressed simply with tomato, sweet onion, and olive oil, a Catalan legacy.",
      "Order fregola ai frutti di mare (toasted Sardinian pasta-pearls in a saffron seafood broth) and spaghetti ai ricci di mare when sea urchins are in season.",
      "Drink local whites from the Sella & Mosca estate just outside town: crisp Vermentino and the rare, aromatic Torbato grown almost only here.",
      "Eat along the Bastioni or in the old-town lanes; finish with seadas, the fried pastry of soft cheese drizzled with bitter Sardinian honey.",
    ],
    beachNotes: [
      "Spiaggia di Maria Pia, just southwest of town behind a pine-and-dune belt, has soft white sand and shallow, kid-friendly water.",
      "Le Bombarde and the adjacent Lazzaretto cove (toward Fertilia) are the locals' favourites for clear turquoise swimming and snorkeling.",
      "Early October is prime: thinning crowds and a sea still warm at around 72-73°F, comfortable for long swims.",
      "The dramatic limestone cliffs of Capo Caccia drop straight into deep blue water, ideal for boat trips and viewing the Coral Riviera rather than sunbathing.",
    ],
    curatedPois: [
      {
        name: "Centro Storico (Old Town)",
        category: "culture",
        blurb: "A labyrinth of cobbled lanes inside the walls where shop signs read in Catalan and balconies trail bougainvillea. Whimsical strung-up birdcages and lanterns make the narrow streets feel like an open-air stage.",
        lat: 40.5589, lon: 8.3155,
        photoFile: "File:Gilbert Ferret Street in Alghero.jpg",
      },
      {
        name: "Bastioni (Sea Walls)",
        category: "history",
        blurb: "Honey-coloured 16th-century ramparts rise straight from the rocks, their broad promenade hanging over the surf. It is Alghero's living room, where the whole town strolls at sunset above the breaking waves.",
        lat: 40.5582, lon: 8.3128,
        photoFile: "File:Bastioni di Alghero.jpg",
      },
      {
        name: "Cattedrale di Santa Maria",
        category: "history",
        blurb: "The cathedral hides a Catalan-Gothic interior behind a stately neoclassical portico of fluted columns. Climb its octagonal bell tower for a rooftop panorama over the terracotta old town and the bay.",
        lat: 40.5590, lon: 8.3146,
        photoFile: "File:Alghero - Cattedrale di Santa Maria - 2025-09-16 00-11-06 001.jpg",
      },
      {
        name: "Chiesa di San Michele",
        category: "art",
        blurb: "The Jesuit church's glory is outside: a great dome sheathed in glazed majolica tiles laid in a dizzying diamond of red, green, yellow, and blue. It glints above the rooftops as Alghero's most photographed silhouette.",
        lat: 40.5586, lon: 8.3160,
        photoFile: "File:Alghero - Chiesa di San Michele (05).JPG",
      },
      {
        name: "Torre di Sulis",
        category: "history",
        blurb: "A squat, massive cylindrical tower anchoring the southern bastions, built to repel corsairs and later a prison. Its piazza is one of the old town's best vantage points over the open sea.",
        lat: 40.5575, lon: 8.3140,
        photoFile: "File:2024-10-09 Alghero, Torre di Sulis 1.jpg",
      },
      {
        name: "Torre di Porta Terra",
        category: "history",
        blurb: "The great landward gate-tower once sealed the only entrance through the walls, its stone scorched amber by centuries of sun. Known as the Jewish Tower, it recalls the medieval community that helped build it.",
        lat: 40.5601, lon: 8.3171,
        photoFile: "File:Alghero - Q112710491 - 2025-09-16 00-05-21 001.jpg",
      },
      {
        name: "Porto di Alghero (Marina)",
        category: "coastal",
        blurb: "A forest of sailboat masts and bobbing fishing gozzi fills the harbour beneath the old-town walls. It is the launch point for coastal cruises and the place to watch the catch come in at dusk.",
        lat: 40.5610, lon: 8.3120,
        photoFile: "File:Alghero harbour - panoramio.jpg",
      },
      {
        name: "Capo Caccia",
        category: "outdoors",
        blurb: "A vast limestone headland that rears out of the sea in sheer white cliffs, crowned by a lighthouse. The promontory shelters nesting griffon vultures and frames the Coral Riviera's most cinematic seascape.",
        lat: 40.5640, lon: 8.1680,
        photoFile: "File:14 635 Capo Caccia, Porto Conte.jpg",
      },
      {
        name: "Grotta di Nettuno (Neptune's Grotto)",
        category: "outdoors",
        blurb: "A spectacular sea cave at the foot of Capo Caccia, where floodlit stalactites and an emerald saltwater lake mirror the dripping vaults. Reach it by boat from the port or by descending the cliff staircase.",
        lat: 40.5586, lon: 8.1576,
        photoFile: "File:Grotta di Nettuno 873-874mod.jpg",
      },
      {
        name: "Escala del Cabirol",
        category: "outdoors",
        blurb: "A vertiginous staircase of 654 steps that zigzags down the sheer face of Capo Caccia to the grotto's mouth. The descent past the open Mediterranean is as breathtaking as the cave below.",
        lat: 40.5595, lon: 8.1590,
        hiddenGem: true,
        photoFile: "File:14 639 Escala de Cabirol.jpg",
      },
      {
        name: "Spiaggia di Maria Pia",
        category: "coastal",
        blurb: "A long crescent of pale sand backed by a fragrant umbrella-pine forest and low dunes. Its shallow, gently shelving water makes it the most relaxed swim close to town.",
        lat: 40.5780, lon: 8.2920,
        photoFile: "File:Alghero, spiaggia di Maria Pia (01).jpg",
      },
      {
        name: "Le Bombarde",
        category: "coastal",
        blurb: "The locals' beach near Fertilia, with brilliant turquoise shallows and fine sand sheltered by a rocky point. Clear water and easy entry make it ideal for swimming and snorkeling.",
        lat: 40.5944, lon: 8.2386,
        hiddenGem: true,
        photoFile: "File:Le Bombarde - panoramio.jpg",
      },
      {
        name: "Spiaggia del Lazzaretto",
        category: "coastal",
        blurb: "A small, sheltered cove tucked into green hills just past Le Bombarde, named for the old quarantine tower above. Calm and scenic, it rewards anyone willing to wander a little farther up the coast.",
        lat: 40.5980, lon: 8.2330,
        hiddenGem: true,
        photoFile: "File:Alghero, spiaggia del Lazzaretto (01).jpg",
      },
      {
        name: "Sella & Mosca / Vermentino",
        category: "drink",
        blurb: "Alghero's wine identity centres on crisp Vermentino and the rare Torbato, much of it from the historic Sella & Mosca estate north of town. A chilled glass beside grilled fish is the essential local ritual.",
        lat: 40.5933, lon: 8.2667,
        photoFile: "File:Vermentino di Sardegna.jpg",
      },
      {
        name: "Fregola ai frutti di mare",
        category: "food",
        blurb: "Toasted semolina pearls simmered with mussels, clams, and prawns in a saffron-gold broth, Sardinia's answer to a seafood risotto. It captures the island's grain-and-sea cooking in one bowl.",
        lat: 40.5589, lon: 8.3148,
        photoFile: "File:Fregola ai frutti di mare (IMG 20260515 203730).jpg",
      },
      {
        name: "Spaghetti ai ricci di mare",
        category: "food",
        blurb: "Spaghetti tossed with the briny orange roe of freshly opened sea urchins, a delicacy harvested along this coast in the cooler months. Simple, intense, and unmistakably Algherese.",
        lat: 40.5592, lon: 8.3152,
        hiddenGem: true,
        photoFile: "File:Spaghetti ricci di mare.jpg",
      },
    ],
  },
  villasimius: {
    slug: "villasimius",
    name: "Villasimius",
    region: "Sardinia",
    tagline: "Turquoise coves and white-sand beaches at the wild southeast tip of Sardinia.",
    coastal: true,
    wikivoyage: "Villasimius",
    wikipedia: "Villasimius",
    heroFile: "File:Winter in Sardinia. Villasimius, the three seas.jpg",
    transport: [
      "Roughly an hour's drive (about 50 km) east from Cagliari and its Elmas airport along the scenic SP17/SS125 coast road — a car is by far the easiest way in and out.",
      "In summer the ARST bus line connects Cagliari to Villasimius town; service thins out sharply off-season, so check timetables before relying on it.",
      "A car (or scooter) is essential for reaching the scattered beaches — Punta Molentis, Porto Giunco and Cala Caterina each have their own car parks, several of them paid in high season.",
      "The Porto Turistico marina runs seasonal boat excursions out to the Capo Carbonara marine reserve and Isola dei Cavoli, a relaxed way to see the coast from the water.",
    ],
    foodNotes: [
      "Seafood is the star: look for fregola con arselle (toasted Sardinian semolina pasta-pearls simmered with tiny local clams) on almost every trattoria menu.",
      "Bottarga di muggine — cured grey-mullet roe, grated over pasta or sliced thin with olive oil — is a Sardinian delicacy that turns up all along this coast.",
      "Splurge on the day's catch and, in season, fresh ricci di mare (sea urchins) eaten raw with bread, paired with a crisp Sardinian Vermentino.",
      "Finish with seadas, the warm fried pastry pockets of fresh cheese drizzled with bitter Sardinian honey, and a glass of red Cannonau.",
    ],
    beachNotes: [
      "This stretch is some of Sardinia's most spectacular swimming water — clear, shallow turquoise shallows at Spiaggia di Simius and Porto Giunco that stay calm on most days.",
      "Punta Molentis is the showstopper: a sheltered sand spit between granite boulders, but the small car park fills early and access is regulated in peak summer.",
      "The Capo Carbonara headland is a protected marine area — exceptional snorkelling over seagrass and rock, with the Isola dei Cavoli reserve just offshore.",
      "In early October the sea is still beautifully swimmable at around 72 to 74°F, warm enough for long swims with far fewer crowds than August.",
    ],
    curatedPois: [
      {
        name: "Spiaggia di Porto Giunco",
        category: "coastal",
        blurb: "A long ribbon of pale sand backed by the Stagno di Notteri lagoon, watched over by a 16th-century Spanish watchtower on the headland. Climb to the tower for the postcard view of beach, lagoon and turquoise bay all at once.",
        lat: 39.1106, lon: 9.5306,
        photoFile: "File:Aerial view of the beach of Porto Giunco (Spiaggia di Porto Giunco) and the nearby lake Stagno di Notteri in Sardinia, Italy (48402731012).jpg",
      },
      {
        name: "Stagno di Notteri",
        category: "outdoors",
        blurb: "A shallow coastal lagoon pinched between Porto Giunco beach and the bay, where pink flamingos stalk the brackish water through much of the year. A short walk from the sand turns a beach day into a quiet bit of birdwatching.",
        lat: 39.1138, lon: 9.5283,
        hiddenGem: true,
        photoFile: "File:Aerial view of the lake Stagno di Notteri with Marina di Villasimius in the background, Sardinia, Italy (48402743736).jpg",
      },
      {
        name: "Punta Molentis",
        category: "coastal",
        blurb: "A jewel of a cove where a sandy spit threads between sculpted granite boulders and two arcs of water, each a different shade of blue. The intimate scale and clarity make it one of the most photographed spots on the whole southeast coast.",
        lat: 39.1019, lon: 9.5719,
        photoFile: "File:A view from the sea to the beach of Punta Molentis in Sardinia, Italy (48399487286).jpg",
      },
      {
        name: "Spiaggia di Simius",
        category: "coastal",
        blurb: "The town's nearest and longest beach, a broad sweep of fine white sand sloping into shallow turquoise water. Low dunes and scrub at the back keep it feeling natural despite its easy reach from Villasimius centre.",
        lat: 39.1278, lon: 9.5236,
        photoFile: "File:Spiaggia di Simius 02.jpg",
      },
      {
        name: "Capo Carbonara",
        category: "coastal",
        blurb: "The granite cape at Sardinia's southeasternmost point, ringed by a protected marine area prized for snorkelling and clear water. A lighthouse marks the headland above coves of seagrass-fringed shallows and tumbled boulders.",
        lat: 39.0894, lon: 9.5169,
        photoFile: "File:Spiaggia - Capo Carbonara, Villasimius, Cagliari, Italia - 28 Maggio 2026 01.jpg",
      },
      {
        name: "Isola dei Cavoli",
        category: "outdoors",
        blurb: "A low rocky islet a short boat-ride offshore, crowned by a 19th-century lighthouse and lying at the heart of the Capo Carbonara reserve. Snorkelling and diving boats circle its clear waters, home to a submerged statue of the Madonna of the Sea.",
        lat: 39.0833, lon: 9.5333,
        photoFile: "File:View of the lighthouse on the island of Cavoli (Isola dei Cavoli) in Sardinia, Italy (48399911771).jpg",
      },
      {
        name: "Fortezza Vecchia",
        category: "history",
        blurb: "A weathered Spanish-era fortress perched on a rocky promontory above transparent water, built to guard the coast against corsair raids. Its blunt stone keep and ramparts make for an evocative walk with sea views in every direction.",
        lat: 39.0975, lon: 9.5444,
        hiddenGem: true,
        photoFile: "File:Villasimius Fortezza Vecchia 02.jpg",
      },
      {
        name: "Cala Caterina",
        category: "coastal",
        blurb: "A small sheltered bay tucked beneath the Capo Carbonara peninsula, fringed by Mediterranean scrub and pine. Quieter than the big-name beaches, it rewards anyone who seeks out its calm, glassy shallows.",
        lat: 39.0997, lon: 9.5189,
        hiddenGem: true,
        photoFile: "File:Panoramic view of Porto Giunco, Capo Carbonara and Cala Caterina in Sardinia, Italy (48402726241).jpg",
      },
      {
        name: "Porto Turistico di Villasimius",
        category: "culture",
        blurb: "A tidy modern marina set among pine woods where sailing yachts and excursion boats moor for the season. It's the departure point for trips out to the marine reserve and a pleasant spot for an evening passeggiata and aperitivo.",
        lat: 39.1042, lon: 9.5392,
        photoFile: "File:Marina di Villasimius 02.jpg",
      },
      {
        name: "Fregola con arselle",
        category: "food",
        blurb: "Toasted Sardinian semolina pearls, fregola, simmered with the tiny local clams known as arselle until they soak up all the briny broth. It's the signature first course of this coast and turns up on nearly every trattoria menu.",
        lat: 39.1408, lon: 9.5219,
        photoFile: "File:Fregole top.jpg",
      },
      {
        name: "Seadas",
        category: "food",
        blurb: "Warm fried pastry pockets filled with fresh tangy cheese and drizzled with bitter Sardinian honey, the island's beloved sweet-savoury dessert. Hand-shaped and crimped before frying, they are best eaten the moment they reach the table.",
        lat: 39.1408, lon: 9.5219,
        photoFile: "File:Preparazione casalinga delle seadas.jpg",
      },
    ],
  },
};
