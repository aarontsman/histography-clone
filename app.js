'use strict';

// ─────────────────────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────────────────────

const CATS = {
  war:         { label: 'Wars',        color: '#ff4444' },
  disaster:    { label: 'Disasters',   color: '#ff8800' },
  science:     { label: 'Science',     color: '#44aaff' },
  politics:    { label: 'Politics',    color: '#ffcc00' },
  film:        { label: 'Film',        color: '#22ddee' },
  music:       { label: 'Music',       color: '#ff44aa' },
  art:         { label: 'Art',         color: '#cc55ff' },
  sports:      { label: 'Sports',      color: '#44ff88' },
  religion:    { label: 'Religion',    color: '#ffff55' },
  exploration: { label: 'Exploration', color: '#44ffcc' },
};

const CAT_ALIAS = { culture: 'art', other: 'art' };
function normCat(c) { return CAT_ALIAS[c] || (CATS[c] ? c : 'art'); }

function hexToRgb(hex) {
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
}

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

const TIMELINE_H = 116;
const HIT_RADIUS = 22;
const MIN_SPAN   = 10;
const MAX_SPAN   = 14e9;

// ─────────────────────────────────────────────────────────────
// BUILT-IN EVENTS
// ─────────────────────────────────────────────────────────────

const BUILTIN = [
  { id:'bb',   year:-13800000000, title:'Big Bang',                        desc:'The universe begins — space, time and matter spring into existence.',                              cat:'science',     wiki:'Big_Bang' },
  { id:'fe',   year:-4500000000,  title:'Formation of Earth',              desc:'Planet Earth coalesces from the solar nebula around the young Sun.',                               cat:'science',     wiki:'Formation_and_evolution_of_the_Solar_System' },
  { id:'fl',   year:-3800000000,  title:'First Life on Earth',             desc:'The earliest known microbial life appears in Earth\'s ancient oceans.',                            cat:'science',     wiki:'Abiogenesis' },
  { id:'sex',  year:-540000000,   title:'Cambrian Explosion',              desc:'An extraordinary burst of animal diversity occurs within ~25 million years.',                      cat:'science',     wiki:'Cambrian_explosion' },
  { id:'dino', year:-230000000,   title:'First Dinosaurs',                 desc:'Dinosaurs emerge during the Triassic period and go on to dominate the planet.',                    cat:'science',     wiki:'Dinosaur' },
  { id:'dext', year:-66000000,    title:'Dinosaur Extinction',             desc:'A mass extinction event — likely an asteroid impact — wipes out non-avian dinosaurs.',             cat:'disaster',    wiki:'Cretaceous%E2%80%93Paleogene_extinction_event' },
  { id:'hss',  year:-300000,      title:'Homo Sapiens Emerge',             desc:'Anatomically modern humans appear in Africa.',                                                      cat:'science',     wiki:'Homo_sapiens' },
  { id:'agr',  year:-10000,       title:'Agricultural Revolution',         desc:'Humans begin farming and animal husbandry, transforming civilisation forever.',                     cat:'science',     wiki:'Neolithic_Revolution' },
  { id:'wri',  year:-3400,  title:'Invention of Writing',           desc:'Sumerians in Mesopotamia develop cuneiform, the world\'s first writing system.',                  cat:'science',     wiki:'History_of_writing' },
  { id:'giz',  year:-2560,  title:'Great Pyramid of Giza',          desc:'The pyramid of Khufu is completed — the only surviving wonder of the ancient world.',             cat:'art',         wiki:'Great_Pyramid_of_Giza' },
  { id:'ham',  year:-1754,  title:'Code of Hammurabi',              desc:'One of history\'s earliest and most complete legal codes is established in Babylon.',              cat:'politics',    wiki:'Code_of_Hammurabi' },
  { id:'tro',  year:-1180,  title:'Trojan War',                     desc:'Legendary conflict between Greeks and Trojans; immortalised in Homer\'s Iliad.',                  cat:'war',         wiki:'Trojan_War' },
  { id:'olya', year:-776,   title:'First Olympic Games',            desc:'The ancient Olympic Games are held at Olympia in honour of Zeus.',                                 cat:'sports',      wiki:'Ancient_Olympic_Games' },
  { id:'bud',  year:-563,   title:'Birth of Buddha',                desc:'Siddhartha Gautama, the founder of Buddhism, is born in Lumbini.',                                cat:'religion',    wiki:'Gautama_Buddha' },
  { id:'cnf',  year:-551,   title:'Birth of Confucius',             desc:'Chinese philosopher whose teachings shaped East Asian culture and ethics for millennia.',          cat:'art',         wiki:'Confucius' },
  { id:'atn',  year:-508,   title:'Athenian Democracy',             desc:'Cleisthenes introduces democratic reforms in Athens — the world\'s first democracy.',             cat:'politics',    wiki:'Athenian_democracy' },
  { id:'grp',  year:-499,   title:'Greco-Persian Wars',             desc:'Greek city-states resist the Persian Empire at Marathon, Thermopylae and Salamis.',               cat:'war',         wiki:'Greco-Persian_Wars' },
  { id:'alx',  year:-334,   title:'Alexander\'s Conquests',         desc:'Alexander the Great sweeps through Persia, Egypt and into India.',                                 cat:'war',         wiki:'Wars_of_Alexander_the_Great' },
  { id:'pun',  year:-264,   title:'Punic Wars',                     desc:'Three wars between Rome and Carthage decide control of the Mediterranean.',                        cat:'war',         wiki:'Punic_Wars' },
  { id:'jce',  year:-44,    title:'Assassination of Julius Caesar', desc:'Roman dictator Julius Caesar is stabbed to death in the Senate on the Ides of March.',            cat:'politics',    wiki:'Assassination_of_Julius_Caesar' },
  { id:'jes',  year:1,      title:'Birth of Jesus',                 desc:'Jesus of Nazareth, the central figure of Christianity, is born in Judea.',                        cat:'religion',    wiki:'Jesus' },
  { id:'dst',  year:70,     title:'Destruction of Jerusalem',       desc:'Roman forces destroy the Second Temple during the Jewish–Roman War.',                             cat:'war',         wiki:'Siege_of_Jerusalem_(70_CE)' },
  { id:'rom',  year:476,    title:'Fall of Western Roman Empire',   desc:'The 500-year-old Western Roman Empire ends as Romulus Augustulus is deposed.',                    cat:'politics',    wiki:'Fall_of_the_Western_Roman_Empire' },
  { id:'isl',  year:610,    title:'Rise of Islam',                  desc:'Muhammad receives the first Quranic revelations; Islam is founded in Arabia.',                    cat:'religion',    wiki:'Muhammad' },
  { id:'crl',  year:800,    title:'Coronation of Charlemagne',      desc:'Charlemagne is crowned Holy Roman Emperor, uniting much of Western Europe.',                     cat:'politics',    wiki:'Charlemagne' },
  { id:'vik',  year:793,    title:'Viking Age Begins',              desc:'Norse raiders attack Lindisfarne monastery, marking the start of the Viking Age.',                cat:'war',         wiki:'Viking_Age' },
  { id:'nor',  year:1066,   title:'Norman Conquest of England',     desc:'William the Conqueror defeats Harold at Hastings — England is transformed.',                      cat:'war',         wiki:'Norman_conquest_of_England' },
  { id:'cru',  year:1095,   title:'First Crusade',                  desc:'Pope Urban II calls for a crusade to recapture Jerusalem from Muslim rule.',                      cat:'war',         wiki:'First_Crusade' },
  { id:'mgt',  year:1215,   title:'Magna Carta',                    desc:'English barons force King John to sign the Magna Carta, limiting royal power.',                   cat:'politics',    wiki:'Magna_Carta' },
  { id:'mon',  year:1206,   title:'Mongol Empire Founded',          desc:'Genghis Khan unites the Mongol tribes and begins the largest contiguous land empire.',            cat:'war',         wiki:'Mongol_Empire' },
  { id:'bpd',  year:1347,   title:'Black Death',                    desc:'Bubonic plague devastates Eurasia, killing up to 50% of Europe\'s population.',                  cat:'disaster',    wiki:'Black_Death' },
  { id:'prs',  year:1440,   title:'Printing Press Invented',        desc:'Gutenberg\'s movable-type press revolutionises the spread of knowledge.',                         cat:'science',     wiki:'Printing_press' },
  { id:'foc',  year:1453,   title:'Fall of Constantinople',         desc:'Ottoman Turks capture Constantinople, ending the Byzantine Empire after 1,000 years.',           cat:'war',         wiki:'Fall_of_Constantinople' },
  { id:'col',  year:1492,   title:'Columbus Reaches the Americas',  desc:'Christopher Columbus lands in the Caribbean, opening sustained contact between hemispheres.',     cat:'exploration', wiki:'Voyages_of_Christopher_Columbus' },
  { id:'mona', year:1503,   title:'Mona Lisa',                      desc:'Leonardo da Vinci begins painting the world\'s most famous portrait in Florence.',                cat:'art',         wiki:'Mona_Lisa' },
  { id:'sis',  year:1512,   title:'Sistine Chapel Ceiling',         desc:'Michelangelo completes his monumental ceiling fresco — one of the greatest artworks ever made.',  cat:'art',         wiki:'Sistine_Chapel_ceiling' },
  { id:'ref',  year:1517,   title:'Protestant Reformation',         desc:'Martin Luther posts his 95 Theses, fracturing Western Christianity.',                             cat:'religion',    wiki:'Reformation' },
  { id:'cop',  year:1543,   title:'Heliocentric Theory',            desc:'Copernicus publishes his Sun-centred model of the solar system.',                                  cat:'science',     wiki:'Nicolaus_Copernicus' },
  { id:'shk',  year:1623,   title:'Shakespeare\'s First Folio',     desc:'The first collected edition of Shakespeare\'s plays is published, 7 years after his death.',     cat:'art',         wiki:'First_Folio' },
  { id:'gal',  year:1609,   title:'Galileo\'s Telescope',           desc:'Galileo improves the telescope and confirms Jupiter\'s moons, supporting heliocentrism.',         cat:'science',     wiki:'Galileo_Galilei' },
  { id:'eng',  year:1642,   title:'English Civil War',              desc:'Parliament battles the Crown; Charles I is executed — a watershed for constitutional rule.',      cat:'war',         wiki:'English_Civil_War' },
  { id:'lon',  year:1666,   title:'Great Fire of London',           desc:'A devastating fire burns for four days, destroying 13,000 buildings in London.',                  cat:'disaster',    wiki:'Great_Fire_of_London' },
  { id:'nwt',  year:1687,   title:'Newton\'s Principia',            desc:'Isaac Newton lays the mathematical foundation of classical mechanics and gravity.',               cat:'science',     wiki:'Philosophi%C3%A6_Naturalis_Principia_Mathematica' },
  { id:'bth',  year:1824,   title:'Beethoven\'s 9th Symphony',      desc:'Beethoven — deaf — conducts the premiere of his monumental and triumphant 9th Symphony.',        cat:'music',       wiki:'Symphony_No._9_(Beethoven)' },
  { id:'ind',  year:1760,   title:'Industrial Revolution',          desc:'Britain\'s mechanisation of production transforms economies worldwide.',                           cat:'science',     wiki:'Industrial_Revolution' },
  { id:'ame',  year:1776,   title:'American Independence',          desc:'Thirteen colonies declare independence from Britain, founding the United States.',                 cat:'politics',    wiki:'United_States_Declaration_of_Independence' },
  { id:'fre',  year:1789,   title:'French Revolution',              desc:'The French people overthrow the monarchy; liberty and democracy become revolutionary ideals.',     cat:'politics',    wiki:'French_Revolution' },
  { id:'nap',  year:1804,   title:'Napoleon Becomes Emperor',       desc:'Napoleon Bonaparte crowns himself Emperor of France at Notre-Dame.',                              cat:'politics',    wiki:'Napoleon' },
  { id:'wat',  year:1815,   title:'Battle of Waterloo',             desc:'Napoleon\'s final defeat ends the Napoleonic Wars and reshapes Europe.',                          cat:'war',         wiki:'Battle_of_Waterloo' },
  { id:'dar',  year:1859,   title:'Theory of Evolution',            desc:'Charles Darwin publishes On the Origin of Species, transforming our understanding of life.',      cat:'science',     wiki:'On_the_Origin_of_Species' },
  { id:'acw',  year:1861,   title:'American Civil War',             desc:'The United States splits over slavery in its most devastating conflict.',                          cat:'war',         wiki:'American_Civil_War',         countries:['United States'] },
  { id:'phn',  year:1876,   title:'Telephone Invented',             desc:'Alexander Graham Bell patents the telephone and makes the first voice call.',                     cat:'science',     wiki:'Invention_of_the_telephone' },
  { id:'phon', year:1877,   title:'Phonograph Invented',            desc:'Thomas Edison invents the phonograph — the first device to record and play back sound.',          cat:'music',       wiki:'Phonograph' },
  { id:'elt',  year:1879,   title:'Practical Light Bulb',           desc:'Thomas Edison demonstrates a long-lasting incandescent light bulb.',                              cat:'science',     wiki:'Incandescent_light_bulb' },
  { id:'kra',  year:1883,   title:'Krakatoa Eruption',              desc:'One of history\'s deadliest eruptions; the explosion was heard 5,000 km away.',                   cat:'disaster',    wiki:'1883_eruption_of_Krakatoa' },
  { id:'cin',  year:1895,   title:'Birth of Cinema',                desc:'The Lumière brothers hold the first public film screening in Paris — cinema is born.',            cat:'film',        wiki:'Lumi%C3%A8re_brothers' },
  { id:'olym', year:1896,   title:'Modern Olympic Games',           desc:'Pierre de Coubertin revives the Olympic Games in Athens after a 1,500-year absence.',             cat:'sports',      wiki:'1896_Summer_Olympics' },
  { id:'wr',   year:1903,   title:'First Powered Airplane',         desc:'The Wright Brothers achieve the first sustained, powered, controlled flight at Kitty Hawk.',      cat:'science',     wiki:'Wright_Flyer' },
  { id:'sfq',  year:1906,   title:'San Francisco Earthquake',       desc:'A magnitude 7.9 earthquake and resulting fires destroy much of San Francisco.',                   cat:'disaster',    wiki:'1906_San_Francisco_earthquake' },
  { id:'ww1',  year:1914,   title:'World War I Begins',             desc:'The assassination of Archduke Franz Ferdinand triggers the deadliest war yet seen.',              cat:'war',         wiki:'World_War_I',               countries:['Germany','France','United Kingdom','Russia','Austria-Hungary'] },
  { id:'rel',  year:1915,   title:'General Theory of Relativity',   desc:'Einstein publishes his revolutionary theory of gravity, spacetime, and the cosmos.',              cat:'science',     wiki:'General_relativity' },
  { id:'rus',  year:1917,   title:'Russian Revolution',             desc:'The Bolsheviks seize power; the Tsar is overthrown and the Soviet Union is born.',                cat:'politics',    wiki:'Russian_Revolution' },
  { id:'flu',  year:1918,   title:'Spanish Flu Pandemic',           desc:'The deadliest pandemic in modern history kills an estimated 50–100 million people.',              cat:'disaster',    wiki:'Spanish_flu' },
  { id:'wcup', year:1930,   title:'First FIFA World Cup',           desc:'Uruguay hosts and wins the inaugural FIFA World Cup, watched by 93,000 fans.',                    cat:'sports',      wiki:'1930_FIFA_World_Cup' },
  { id:'gde',  year:1929,   title:'Great Depression Begins',        desc:'The Wall Street Crash triggers the worst economic crisis in modern history.',                      cat:'politics',    wiki:'Great_Depression' },
  { id:'ww2',  year:1939,   title:'World War II Begins',            desc:'Germany invades Poland; Britain and France declare war.',                                          cat:'war',         wiki:'World_War_II',              countries:['Germany','Poland','France','United Kingdom','Japan','Soviet Union','United States'] },
  { id:'nuc',  year:1945,   title:'Atomic Bombs on Japan',          desc:'The US drops atomic bombs on Hiroshima and Nagasaki, ending World War II.',                       cat:'war',         wiki:'Atomic_bombings_of_Hiroshima_and_Nagasaki', countries:['United States','Japan'] },
  { id:'un',   year:1945,   title:'United Nations Founded',         desc:'The UN is established to maintain international peace and security.',                              cat:'politics',    wiki:'United_Nations' },
  { id:'ind2', year:1947,   title:'Indian Independence',            desc:'India and Pakistan gain independence from Britain; partition causes mass displacement.',           cat:'politics',    wiki:'Indian_independence_movement' },
  { id:'dna',  year:1953,   title:'DNA Structure Discovered',       desc:'Watson, Crick and Franklin reveal the double-helix structure of DNA.',                            cat:'science',     wiki:'Nucleic_acid_double_helix' },
  { id:'spu',  year:1957,   title:'Sputnik — First Satellite',      desc:'The USSR launches Sputnik 1, the first artificial Earth satellite, opening the Space Age.',       cat:'science',     wiki:'Sputnik_1',                 countries:['Soviet Union'] },
  { id:'moo',  year:1969,   title:'Moon Landing',                   desc:'Apollo 11 astronauts Neil Armstrong and Buzz Aldrin walk on the Moon.',                           cat:'science',     wiki:'Apollo_11',                 countries:['United States'] },
  { id:'ber',  year:1989,   title:'Fall of the Berlin Wall',        desc:'The Berlin Wall falls, symbolising the end of the Cold War.',                                     cat:'politics',    wiki:'Fall_of_the_Berlin_Wall',   countries:['Germany'] },
  { id:'www',  year:1991,   title:'World Wide Web Launched',        desc:'Tim Berners-Lee opens the World Wide Web to the public, transforming communication.',             cat:'science',     wiki:'World_Wide_Web' },
  { id:'usc',  year:1991,   title:'Dissolution of the USSR',        desc:'The Soviet Union collapses into 15 independent nations, ending the Cold War era.',                cat:'politics',    wiki:'Dissolution_of_the_Soviet_Union' },
  { id:'911',  year:2001,   title:'September 11 Attacks',           desc:'Al-Qaeda hijackers kill nearly 3,000 people in the worst attack on US soil.',                    cat:'war',         wiki:'September_11_attacks',      countries:['United States'] },
  { id:'tsu',  year:2004,   title:'Indian Ocean Tsunami',           desc:'A magnitude 9.1 quake triggers a tsunami killing 230,000 across 14 countries.',                  cat:'disaster',    wiki:'2004_Indian_Ocean_earthquake_and_tsunami' },
  { id:'iph',  year:2007,   title:'iPhone Launched',                desc:'Apple introduces the iPhone, revolutionising mobile computing.',                                   cat:'science',     wiki:'IPhone_(1st_generation)' },
  { id:'cov',  year:2020,   title:'COVID-19 Pandemic',              desc:'A novel coronavirus causes a global pandemic, killing millions and reshaping society.',            cat:'disaster',    wiki:'COVID-19_pandemic',         countries:['China'] },
  { id:'rua',  year:2022,   title:'Russia Invades Ukraine',         desc:'Russia launches a full-scale invasion of Ukraine — the largest war in Europe since 1945.',       cat:'war',         wiki:'Russian_invasion_of_Ukraine', countries:['Russia','Ukraine'] },
  { id:'ais',  year:2023,   title:'Generative AI Revolution',       desc:'Large language models transform work, creativity and technology worldwide.',                       cat:'science',     wiki:'Generative_artificial_intelligence' },
];

// ─────────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────────

const state = {
  viewStart:  1800,
  viewEnd:    2030,
  events:     [],
  activeCats: new Set(Object.keys(CATS)),
  search:     '',
  country:    '',
  hovered:    null,
  selected:   null,
  dragging:   false,
  dragX:      0,
  dragStartX: 0,
  velocity:   0,
  lastDragX:  0,
  lastDragT:  0,
  tlDragging: false,
  tlDragMode: null,
  tlDragStartX:  0,
  tlDragStartVS: 0,
  tlDragStartVE: 0,
};

// ─────────────────────────────────────────────────────────────
// DOM REFS
// ─────────────────────────────────────────────────────────────

const canvas     = document.getElementById('canvas');
const ctx        = canvas.getContext('2d');
const loading    = document.getElementById('loading');
const tooltip    = document.getElementById('tooltip');
const ttYear     = document.getElementById('tooltip-year');
const ttTitle    = document.getElementById('tooltip-title');
const panel      = document.getElementById('panel');
const panelClose = document.getElementById('panel-close');
const panelBadge = document.getElementById('panel-cat-badge');
const panelYear  = document.getElementById('panel-year');
const panelTitle = document.getElementById('panel-title');
const panelImg   = document.getElementById('panel-img');
const panelDesc  = document.getElementById('panel-desc');
const panelLink  = document.getElementById('panel-link');
const filters    = document.getElementById('filters');
const searchEl   = document.getElementById('search');
const yearRange      = document.getElementById('year-range');
const countryInput   = document.getElementById('country-input');
const countryDropdown = document.getElementById('country-dropdown');

// ─────────────────────────────────────────────────────────────
// OFFSCREEN RESOURCES
// ─────────────────────────────────────────────────────────────

let bgCanvas = null;
const SPRITES = {};

function buildBackground() {
  bgCanvas = document.createElement('canvas');
  bgCanvas.width  = canvas.width;
  bgCanvas.height = canvas.height;
  const bc = bgCanvas.getContext('2d');
  bc.fillStyle = '#080808';
  bc.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
}

function buildSprites() {
  // Pre-render one sprite per category: small glow + white core
  for (const [key, cat] of Object.entries(CATS)) {
    const SZ = 28, c = SZ / 2;
    const sp = document.createElement('canvas');
    sp.width = sp.height = SZ;
    const sc = sp.getContext('2d');
    const [r,g,b] = hexToRgb(cat.color);
    // Outer glow
    const gg = sc.createRadialGradient(c, c, 0, c, c, c);
    gg.addColorStop(0,    `rgba(${r},${g},${b},0.55)`);
    gg.addColorStop(0.35, `rgba(${r},${g},${b},0.18)`);
    gg.addColorStop(1,    'transparent');
    sc.fillStyle = gg; sc.fillRect(0, 0, SZ, SZ);
    // White centre dot
    const cg = sc.createRadialGradient(c, c, 0, c, c, 3.5);
    cg.addColorStop(0, 'rgba(255,255,255,1)');
    cg.addColorStop(1, `rgba(${r},${g},${b},0.4)`);
    sc.fillStyle = cg;
    sc.beginPath(); sc.arc(c, c, 3.5, 0, Math.PI * 2); sc.fill();
    SPRITES[key] = sp;
  }
}

// ─────────────────────────────────────────────────────────────
// COORDINATES
// ─────────────────────────────────────────────────────────────

function yearToX(year) {
  return (year - state.viewStart) / (state.viewEnd - state.viewStart) * canvas.width;
}
function xToYear(x) {
  return state.viewStart + (x / canvas.width) * (state.viewEnd - state.viewStart);
}
function eventY(ev) {
  let h = 0;
  for (let i = 0; i < ev.id.length; i++) h = (Math.imul(31, h) + ev.id.charCodeAt(i)) | 0;
  const t = ((h >>> 0) % 10000) / 10000;
  return 52 + t * (canvas.height - TIMELINE_H - 62);
}
function twinkle(ev, now) {
  let h = 0;
  const s = ev.id + 'tw';
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  const phase = ((h >>> 0) % 1000) / 1000 * Math.PI * 2;
  const speed = 0.18 + ((h >>> 13) % 100) / 280;
  return 0.55 + 0.45 * Math.sin(now * 0.001 * speed + phase);
}

// ─────────────────────────────────────────────────────────────
// TIMELINE BAR (log-scale)
// ─────────────────────────────────────────────────────────────

const BAR_MAX = 2030, BAR_MIN = -14e9;
const LOG_D = Math.log10(BAR_MAX - BAR_MIN);
function y2bf(year)   { return 1 - Math.log10(Math.max(1, BAR_MAX - year)) / LOG_D; }
function bf2y(frac)   { return Math.round(BAR_MAX - Math.pow(10, (1 - frac) * LOG_D)); }
function y2bx(year,w) { return y2bf(year) * w; }
function bx2y(x, w)   { return bf2y(x / w); }

// ─────────────────────────────────────────────────────────────
// FORMATTING
// ─────────────────────────────────────────────────────────────

function fmtYear(y) {
  if (y <= -1e9) return `${(-y/1e9).toFixed(1)}B BCE`;
  if (y <= -1e6) return `${(-y/1e6).toFixed(0)}M BCE`;
  if (y <= -1e3) return `${(-y/1e3).toFixed(1)}K BCE`;
  if (y < 0)     return `${-y} BCE`;
  if (y === 0)   return '1 CE';
  return `${y} CE`;
}
function tickInterval(span) {
  for (const v of [1,2,5,10,20,50,100,200,500,1000,2000,5000,10000,50000,
                   100000,500000,1e6,5e6,1e7,5e7,1e8,5e8,1e9,5e9])
    if (span / v <= 12) return v;
  return 1e9;
}

// ─────────────────────────────────────────────────────────────
// VISIBLE EVENTS
// ─────────────────────────────────────────────────────────────

let _visCache = null;
function visibleEvents() {
  if (_visCache) return _visCache;
  const q  = state.search.toLowerCase();
  const co = state.country;
  _visCache = state.events.filter(ev => {
    if (!state.activeCats.has(ev.cat)) return false;
    if (q && !ev.title.toLowerCase().includes(q) &&
           !(ev.desc||'').toLowerCase().includes(q)) return false;
    if (co) {
      const ec = ev.countries;
      if (!ec || !ec.length || !ec.includes(co)) return false;
    }
    return ev.year >= state.viewStart && ev.year <= state.viewEnd;
  });
  return _visCache;
}

// ─────────────────────────────────────────────────────────────
// DRAW
// ─────────────────────────────────────────────────────────────

function draw(now = 0) {
  _visCache = null;  // invalidate per-frame cache
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (bgCanvas) ctx.drawImage(bgCanvas, 0, 0);
  drawDots(now);
  drawLabels(now);
  drawTimelineBar();
  updateHUD();
}

function drawDots(now) {
  const evts = visibleEvents();
  if (!evts.length) return;
  const hov = state.hovered, sel = state.selected;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const ev of evts) {
    const x = yearToX(ev.year);
    if (x < -20 || x > canvas.width + 20) continue;
    const y  = eventY(ev);
    const tw = twinkle(ev, now);
    const hot = ev === hov || ev === sel;
    const sp = SPRITES[ev.cat] || SPRITES.war;
    const sz = hot ? 42 : 28;
    ctx.globalAlpha = tw * (hot ? 1.0 : 0.7);
    ctx.drawImage(sp, x - sz/2, y - sz/2, sz, sz);
  }
  ctx.restore();
}

// ─────────────────────────────────────────────────────────────
// LABELS & SELECTION INDICATOR
// ─────────────────────────────────────────────────────────────

function drawLabels(now) {
  if (state.selected) drawPulse(state.selected, now);
}

function drawPulse(ev, now) {
  const x = yearToX(ev.year), y = eventY(ev);
  const [r,g,b] = hexToRgb((CATS[ev.cat]||CATS.war).color);
  // Two rings at different phases
  for (let i = 0; i < 2; i++) {
    const t = ((now * 0.0018) + i * 0.5) % 1;
    const radius = 14 + t * 28;
    const alpha  = (1 - t) * 0.55;
    ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
    ctx.lineWidth   = 1.2;
    ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.stroke();
  }
}


// Historical eras for timeline labels
const ERAS = [
  { year: -13800000000, label: 'BIG BANG' },
  { year:  -3800000000, label: 'EARLY LIFE' },
  { year:   -540000000, label: 'ANCIENT LIFE' },
  { year:    -66000000, label: 'AGE OF MAMMALS' },
  { year:      -300000, label: 'STONE AGE' },
  { year:       -10000, label: 'NEOLITHIC' },
  { year:        -3000, label: 'ANCIENT' },
  { year:         -500, label: 'CLASSICAL' },
  { year:          500, label: 'MIDDLE AGES' },
  { year:         1400, label: 'RENAISSANCE' },
  { year:         1700, label: 'INDUSTRIAL' },
  { year:         1900, label: 'MODERN' },
  { year:         1970, label: 'INFORMATION AGE' },
];

function drawTimelineBar() {
  const W = canvas.width, H = canvas.height;
  const bY = H - TIMELINE_H;

  // Bar background
  ctx.fillStyle = '#0c0c0c';
  ctx.fillRect(0, bY, W, TIMELINE_H);
  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
  ctx.lineWidth   = 1;
  ctx.beginPath(); ctx.moveTo(0, bY); ctx.lineTo(W, bY); ctx.stroke();

  // Era labels along the bar
  ctx.font      = '8px Helvetica Neue, Helvetica, sans-serif';
  ctx.textAlign = 'left';
  for (let i = 0; i < ERAS.length; i++) {
    const x = y2bx(ERAS[i].year, W);
    const nextX = i + 1 < ERAS.length ? y2bx(ERAS[i+1].year, W) : W;
    if (nextX - x < 24) continue; // skip if no room
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillText(ERAS[i].label, x + 4, bY + TIMELINE_H - 8);
    // Era divider tick
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, bY + 1); ctx.lineTo(x, bY + TIMELINE_H - 1); ctx.stroke();
  }

  // Density dots (all events, log-scale)
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const ev of state.events) {
    const x = y2bx(ev.year, W);
    if (x < 0 || x > W) continue;
    const [r,g,b] = hexToRgb((CATS[ev.cat]||CATS.war).color);
    ctx.fillStyle = `rgba(${r},${g},${b},0.3)`;
    ctx.beginPath(); ctx.arc(x, bY + TIMELINE_H * 0.4, 1.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  // Viewport rect
  const vL = y2bx(state.viewStart, W), vR = y2bx(state.viewEnd, W);
  const vW = Math.max(6, vR - vL);
  ctx.fillStyle   = 'rgba(255,255,255,0.05)';
  ctx.fillRect(vL, bY + 1, vW, TIMELINE_H - 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth   = 1;
  ctx.strokeRect(vL + 0.5, bY + 1.5, vW - 1, TIMELINE_H - 3);

  // Year tick labels above bar
  const span  = state.viewEnd - state.viewStart;
  const intv  = tickInterval(span);
  const first = Math.ceil(state.viewStart / intv) * intv;
  ctx.fillStyle   = 'rgba(255,255,255,0.3)';
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.font        = '10px monospace';
  ctx.textAlign   = 'center';
  ctx.lineWidth   = 1;
  for (let yr = first; yr <= state.viewEnd; yr += intv) {
    const tx = yearToX(yr);
    if (tx < 32 || tx > W - 32) continue;
    ctx.beginPath(); ctx.moveTo(tx, bY); ctx.lineTo(tx, bY + 5); ctx.stroke();
    ctx.fillText(fmtYear(yr), tx, bY - 5);
  }
}

function updateHUD() {
  yearRange.textContent = `${fmtYear(Math.round(state.viewStart))}  —  ${fmtYear(Math.round(state.viewEnd))}`;
}

// ─────────────────────────────────────────────────────────────
// ANIMATION LOOP (20 fps for twinkling / pulse)
// ─────────────────────────────────────────────────────────────

let lastAnimTs = 0;
const ANIM_MS  = 1000 / 20;

function animLoop(ts) {
  requestAnimationFrame(animLoop);
  if (!state.dragging && !state.tlDragging) {
    if (ts - lastAnimTs >= ANIM_MS) {
      draw(ts);
      lastAnimTs = ts;
    }
  }
}

// ─────────────────────────────────────────────────────────────
// ZOOM / PAN
// ─────────────────────────────────────────────────────────────

function panBy(dYear) {
  state.viewStart += dYear;
  state.viewEnd   += dYear;
}
function zoomAround(factor, pivotYear) {
  let ns = pivotYear - (pivotYear - state.viewStart) * factor;
  let ne = pivotYear + (state.viewEnd   - pivotYear) * factor;
  const span = ne - ns;
  if (span < MIN_SPAN) { const m=(ns+ne)/2; ns=m-MIN_SPAN/2; ne=m+MIN_SPAN/2; }
  if (span > MAX_SPAN) { const m=(ns+ne)/2; ns=m-MAX_SPAN/2; ne=m+MAX_SPAN/2; }
  state.viewStart = ns;
  state.viewEnd   = ne;
}
function resetView() {
  state.viewStart = 1800;
  state.viewEnd   = 2030;
}

// ─────────────────────────────────────────────────────────────
// HIT TEST
// ─────────────────────────────────────────────────────────────

function hitTest(mx, my) {
  let best = null, bestD = HIT_RADIUS;
  for (const ev of visibleEvents()) {
    const d = Math.hypot(mx - yearToX(ev.year), my - eventY(ev));
    if (d < bestD) { bestD = d; best = ev; }
  }
  return best;
}

// ─────────────────────────────────────────────────────────────
// INPUT
// ─────────────────────────────────────────────────────────────

function inTimeline(y) { return y > canvas.height - TIMELINE_H; }

canvas.addEventListener('wheel', e => {
  e.preventDefault();
  zoomAround(e.deltaY > 0 ? 1.12 : 0.88, xToYear(e.offsetX));
  draw(performance.now());
}, { passive: false });

canvas.addEventListener('mousedown', e => {
  const my = e.offsetY, mx = e.offsetX;
  if (inTimeline(my)) {
    const W = canvas.width;
    const vpL = y2bx(state.viewStart, W), vpR = y2bx(state.viewEnd, W);
    const edge = 8;
    state.tlDragging    = true;
    state.tlDragStartX  = mx;
    state.tlDragStartVS = state.viewStart;
    state.tlDragStartVE = state.viewEnd;
    if      (Math.abs(mx - vpL) < edge) state.tlDragMode = 'left';
    else if (Math.abs(mx - vpR) < edge) state.tlDragMode = 'right';
    else if (mx >= vpL && mx <= vpR)    state.tlDragMode = 'move';
    else {
      const yr = bx2y(mx, W), half = (state.viewEnd - state.viewStart) / 2;
      state.viewStart = yr - half;
      state.viewEnd   = yr + half;
      state.tlDragMode    = 'move';
      state.tlDragStartVS = state.viewStart;
      state.tlDragStartVE = state.viewEnd;
      draw(performance.now());
    }
  } else {
    state.dragging   = true;
    state.dragX      = mx;
    state.dragStartX = mx;
    state.velocity   = 0;
    state.lastDragX  = mx;
    state.lastDragT  = performance.now();
    canvas.classList.add('dragging');
    canvas.classList.remove('on-event');
  }
});

window.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left, my = e.clientY - rect.top;

  if (state.tlDragging) {
    const W = canvas.width, dx = mx - state.tlDragStartX;
    if (state.tlDragMode === 'move') {
      const origY = bf2y(Math.max(0, Math.min(1, state.tlDragStartX / W)));
      const nextY = bf2y(Math.max(0, Math.min(1, (state.tlDragStartX + dx) / W)));
      const dyr = nextY - origY;
      state.viewStart = state.tlDragStartVS + dyr;
      state.viewEnd   = state.tlDragStartVE + dyr;
    } else if (state.tlDragMode === 'left') {
      state.viewStart = bx2y(y2bx(state.tlDragStartVS, W) + dx, W);
    } else if (state.tlDragMode === 'right') {
      state.viewEnd = bx2y(y2bx(state.tlDragStartVE, W) + dx, W);
    }
    if (state.viewEnd - state.viewStart < MIN_SPAN) state.viewEnd = state.viewStart + MIN_SPAN;
    draw(performance.now());
    return;
  }

  if (state.dragging) {
    const now = performance.now(), dt = now - state.lastDragT;
    panBy(xToYear(state.dragX) - xToYear(mx));
    state.velocity = dt > 0 ? (xToYear(mx) - xToYear(state.lastDragX)) / dt * 16 : 0;
    state.dragX = state.lastDragX = mx;
    state.lastDragT = now;
    draw(performance.now());
    return;
  }

  if (!inTimeline(my)) {
    const hit = hitTest(mx, my);
    if (hit !== state.hovered) { state.hovered = hit; draw(performance.now()); }
    if (hit) {
      const col = (CATS[hit.cat]||CATS.war).color;
      ttYear.textContent  = fmtYear(hit.year);
      ttTitle.textContent = hit.title;
      ttTitle.style.color = col;
      tooltip.classList.remove('hidden');
      tooltip.style.left = Math.min(e.clientX + 16, window.innerWidth  - 250) + 'px';
      tooltip.style.top  = Math.min(e.clientY + 14, window.innerHeight - 70)  + 'px';
      canvas.classList.add('on-event');
    } else {
      tooltip.classList.add('hidden');
      canvas.classList.remove('on-event');
    }
  } else {
    tooltip.classList.add('hidden');
    canvas.classList.remove('on-event');
    if (state.hovered) { state.hovered = null; draw(performance.now()); }
  }
});

let momentumGen = 0;
window.addEventListener('mouseup', () => {
  if (state.tlDragging) { state.tlDragging = false; state.tlDragMode = null; return; }
  if (!state.dragging)  return;
  state.dragging = false;
  canvas.classList.remove('dragging');
  const gen = ++momentumGen;
  let v = state.velocity;
  (function momentum() {
    if (gen !== momentumGen || Math.abs(v) < 0.15) return;
    panBy(-v * (state.viewEnd - state.viewStart) / canvas.width * 16);
    v *= 0.88;
    draw(performance.now());
    requestAnimationFrame(momentum);
  })();
});

canvas.addEventListener('click', e => {
  if (Math.abs(e.offsetX - state.dragStartX) > 5) return;
  if (inTimeline(e.offsetY)) return;
  const hit = hitTest(e.offsetX, e.offsetY);
  if (hit) { state.selected = hit; showPanel(hit); }
  else     { state.selected = null; hidePanel(); }
  draw(performance.now());
});

// ── Touch ──────────────────────────────────────────────────

let lastTouchDist = null;

canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  if (e.touches.length === 2) {
    lastTouchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX,
                               e.touches[0].clientY - e.touches[1].clientY);
    return;
  }
  const rect = canvas.getBoundingClientRect();
  state.dragging   = true;
  state.dragX      = e.touches[0].clientX - rect.left;
  state.dragStartX = state.dragX;
  state.velocity   = 0;
}, { passive: false });

canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  if (e.touches.length === 2) {
    const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX,
                            e.touches[0].clientY - e.touches[1].clientY);
    if (lastTouchDist) {
      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
      zoomAround(lastTouchDist / dist, xToYear(cx));
      draw(performance.now());
    }
    lastTouchDist = dist;
    return;
  }
  if (!state.dragging) return;
  const x = e.touches[0].clientX - rect.left;
  panBy(xToYear(state.dragX) - xToYear(x));
  state.dragX = x;
  draw(performance.now());
}, { passive: false });

canvas.addEventListener('touchend', () => { state.dragging = false; lastTouchDist = null; });

// ── Keyboard shortcuts ─────────────────────────────────────

document.addEventListener('keydown', e => {
  if (e.target === searchEl) return;
  const mid = (state.viewStart + state.viewEnd) / 2;
  switch (e.key) {
    case 'Escape':
      if (state.selected) { hidePanel(); state.selected = null; draw(performance.now()); }
      break;
    case 'ArrowRight':
      panBy((state.viewEnd - state.viewStart) * 0.18);
      draw(performance.now()); break;
    case 'ArrowLeft':
      panBy(-(state.viewEnd - state.viewStart) * 0.18);
      draw(performance.now()); break;
    case '+': case '=':
      zoomAround(0.72, mid); draw(performance.now()); break;
    case '-': case '_':
      zoomAround(1.4,  mid); draw(performance.now()); break;
    case 'Home':
      resetView(); draw(performance.now()); break;
  }
});

// ─────────────────────────────────────────────────────────────
// PANEL
// ─────────────────────────────────────────────────────────────

function showPanel(ev) {
  const cat   = CATS[ev.cat] || CATS.war;
  const color = cat.color;

  panelBadge.textContent       = cat.label;
  panelBadge.style.color       = color;
  panelBadge.style.borderColor = color;
  const countryStr = (ev.countries && ev.countries.length) ? ev.countries.join(', ') : '';
  panelYear.textContent = countryStr ? `${fmtYear(ev.year)} · ${countryStr}` : fmtYear(ev.year);
  panelTitle.textContent       = ev.title;
  panelTitle.style.color       = color;
  panelDesc.textContent        = ev.desc || '';
  panelDesc.classList.remove('loading');

  panelImg.classList.remove('loaded');
  panelImg.src = '';

  if (ev.wiki) {
    panelLink.href          = `https://en.wikipedia.org/wiki/${ev.wiki}`;
    panelLink.style.display = 'inline-flex';
  } else {
    panelLink.href          = '';
    panelLink.style.display = 'none';
  }

  panel.classList.remove('hidden');
  panel.scrollTop = 0;
  loadPanelContent(ev);
}

function setImgSrc(url) {
  panelImg.classList.remove('loaded');
  panelImg.onload  = () => panelImg.classList.add('loaded');
  panelImg.onerror = () => {};
  panelImg.src = url;
  // Handle already-cached images where onload fires synchronously
  if (panelImg.complete && panelImg.naturalHeight > 0) panelImg.classList.add('loaded');
}

async function loadPanelContent(ev) {
  // 1. Use stored Wikidata image immediately if available
  if (ev.img) setImgSrc(ev.img);

  // 2. Fetch Wikipedia summary for better extract (and image fallback)
  if (!ev.wiki) { if (!ev.img) panelDesc.textContent = ev.desc || ''; return; }
  panelDesc.classList.add('loading');
  panelDesc.textContent = 'Loading…';
  try {
    const ctrl = new AbortController();
    const tid  = setTimeout(() => ctrl.abort(), 8000);
    const res  = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${ev.wiki}`,
      { signal: ctrl.signal }
    );
    clearTimeout(tid);
    if (!res.ok) throw new Error();
    const data = await res.json();

    // Use Wikipedia thumbnail if no Wikidata image, or if Wikidata image failed to load
    const wikiThumb = data.thumbnail?.source || data.originalimage?.source;
    if (wikiThumb && (!ev.img || !panelImg.classList.contains('loaded'))) {
      setImgSrc(wikiThumb);
    }

    // Full extract (up to 700 chars)
    if (data.extract) {
      const text = data.extract.length > 700
        ? data.extract.slice(0, 700).replace(/\s\S+$/, '') + '…'
        : data.extract;
      panelDesc.textContent = text;
    } else {
      panelDesc.textContent = ev.desc || '';
    }
  } catch (_) {
    panelDesc.textContent = ev.desc || '';
  }
  panelDesc.classList.remove('loading');
}

function hidePanel() {
  panel.classList.add('hidden');
  state.selected = null;
}

panelClose.addEventListener('click', () => { hidePanel(); draw(performance.now()); });

// ─────────────────────────────────────────────────────────────
// CATEGORY FILTERS
// ─────────────────────────────────────────────────────────────

function buildFilters() {
  filters.innerHTML = '';
  for (const [key, cat] of Object.entries(CATS)) {
    const btn = document.createElement('button');
    btn.className = 'cat-btn active';
    btn.style.setProperty('--cat-color', cat.color);
    btn.dataset.cat = key;
    btn.innerHTML =
      `<span class="cat-dot" style="background:${cat.color}"></span>` +
      `<span class="cat-label">${cat.label}</span>` +
      `<span class="cat-count">0</span>`;
    btn.addEventListener('click', () => {
      if (state.activeCats.has(key)) { state.activeCats.delete(key); btn.classList.remove('active'); }
      else                           { state.activeCats.add(key);    btn.classList.add('active');    }
      draw(performance.now());
    });
    filters.appendChild(btn);
  }
}


// ─────────────────────────────────────────────────────────────
// SEARCH
// ─────────────────────────────────────────────────────────────

searchEl.addEventListener('input', () => {
  state.search = searchEl.value.trim();
  draw(performance.now());
});

// ─────────────────────────────────────────────────────────────
// COUNTRY FILTER
// ─────────────────────────────────────────────────────────────

let allCountries = [];

function buildCountryList() {
  const set = new Set();
  for (const ev of state.events) {
    for (const c of (ev.countries || [])) set.add(c);
  }
  allCountries = Array.from(set).sort();
}

function renderCountryDropdown(filter) {
  const q = filter.toLowerCase();
  const matches = q
    ? allCountries.filter(c => c.toLowerCase().includes(q))
    : allCountries;
  if (!matches.length) { countryDropdown.classList.add('hidden'); return; }
  countryDropdown.innerHTML = '';
  if (state.country) {
    const clr = document.createElement('div');
    clr.className = 'country-opt';
    clr.textContent = '✕  Clear filter';
    clr.style.color = 'rgba(255,255,255,0.4)';
    clr.addEventListener('mousedown', e => {
      e.preventDefault();
      state.country = '';
      countryInput.value = '';
      countryInput.classList.remove('active');
      countryDropdown.classList.add('hidden');
      draw(performance.now());
    });
    countryDropdown.appendChild(clr);
  }
  for (const c of matches.slice(0, 80)) {
    const el = document.createElement('div');
    el.className = 'country-opt' + (c === state.country ? ' selected' : '');
    el.textContent = c;
    el.addEventListener('mousedown', e => {
      e.preventDefault();
      state.country = c;
      countryInput.value = c;
      countryInput.classList.add('active');
      countryDropdown.classList.add('hidden');
      draw(performance.now());
    });
    countryDropdown.appendChild(el);
  }
  countryDropdown.classList.remove('hidden');
}

countryInput.addEventListener('focus', () => renderCountryDropdown(countryInput.value));
countryInput.addEventListener('input', () => renderCountryDropdown(countryInput.value));
countryInput.addEventListener('blur', () => {
  setTimeout(() => countryDropdown.classList.add('hidden'), 150);
  // If text doesn't match selection, reset
  if (countryInput.value !== state.country) {
    countryInput.value = state.country;
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && state.country) {
    state.country = '';
    countryInput.value = '';
    countryInput.classList.remove('active');
    draw(performance.now());
  }
});

// ─────────────────────────────────────────────────────────────
// ZOOM CONTROLS & RESIZE
// ─────────────────────────────────────────────────────────────


document.getElementById('btn-lucky').addEventListener('click', () => {
  if (!state.events.length) return;
  const ev = state.events[Math.floor(Math.random() * state.events.length)];
  const span = 50;
  state.viewStart = ev.year - span / 2;
  state.viewEnd   = ev.year + span / 2;
  state.selected  = ev;
  state.activeCats = new Set(Object.keys(CATS));
  state.country   = '';
  countryInput.value = '';
  countryInput.classList.remove('active');
  showPanel(ev);
  draw(performance.now());
});

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    buildBackground();
    draw(performance.now());
  }, 120);
});

// ─────────────────────────────────────────────────────────────
// DATA LOADING
// ─────────────────────────────────────────────────────────────

async function loadData() {
  state.events = BUILTIN.map(ev => ({ ...ev, cat: normCat(ev.cat) }));
  try {
    const res = await fetch('data/events.json');
    if (res.ok) {
      const extra = await res.json();
      const ids = new Set(state.events.map(e => e.id));
      for (const ev of extra) {
        const cat = normCat(ev.cat);
        if (!ids.has(ev.id)) { state.events.push({ ...ev, cat }); ids.add(ev.id); }
      }
    }
  } catch (_) {}
  buildCountryList();
  updateCatCounts();
}

function updateCatCounts() {
  const counts = {};
  for (const ev of state.events) counts[ev.cat] = (counts[ev.cat] || 0) + 1;
  for (const btn of filters.querySelectorAll('.cat-btn')) {
    const n = counts[btn.dataset.cat] || 0;
    const el = btn.querySelector('.cat-count');
    if (el) el.textContent = n;
  }
}

// ─────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────

async function init() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  buildBackground();
  buildSprites();
  buildFilters();
  await loadData();
  // Fade out loading screen
  loading.classList.add('fade-out');
  setTimeout(() => { loading.style.display = 'none'; }, 750);
  draw(0);
  requestAnimationFrame(animLoop);
}

init();
