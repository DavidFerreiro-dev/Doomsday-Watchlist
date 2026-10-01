/* ══════════════════════════════════════════════════════════
   MARVEL CHARACTER DATABASE
   Images from: https://akabab.github.io/superhero-api/api/
   CDN: https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/sm/<slug>.jpg
   ══════════════════════════════════════════════════════════ */

const HERO_IMG = slug => {
  if (!slug) return null;
  const filename = slug.replace(/^\d+-/, '');
  const logoNames = {
    'iron-man': 'ironman',
    'captain-america': 'capamerica',
    'black-widow': 'blackwidow',
    'scarlet-witch': 'scarletwitch',
    'spider-man': 'spiderman',
    'ant-man': 'antman',
    'doctor-strange': 'dctorstrange',
    'captain-marvel': 'captainmarvel',
    'black-panther': 'blackpanther',
    'war-machine': 'warmachine',
    falcon: 'falconwintersoldier',
    'nick-fury': 'nickfury',
    'shang-chi': 'shangchi',
    'moon-knight': 'moonknight',
    'star-lord': 'satrlord',
    drax: 'drax',
    'drax-the-destroyer': 'drax',
    'rocket-raccoon': 'rocket',
    'professor-x': 'professorx',
    'jean-grey': 'jeangrey',
    'mister-fantastic': 'mrfantastic',
    'invisible-woman': 'suestorm',
    'human-torch': 'humantorch',
    thing: 'thething',
    'doctor-doom': 'doctordoom',
    'red-skull': 'redskull',
    'iron-fist': 'iron fist',
    'jessica-jones': 'jessicajones',
    'luke-cage': 'lukecage',
    'kraven-the-hunter': 'kraven',
    'ghost-rider': 'ghostrider',
    'green-goblin': 'greengoblin',
    'gwen-stacy': 'gwenstacy',
    'stan-lee': 'stanlee',
  };
  return `Assets/Logos/${encodeURIComponent(logoNames[filename] || filename)}.jpg`;
};

const CHAR_GROUPS = [
  {
    id: 'avengers',
    label: 'The Avengers',
    icon: '🛡️',
    chars: [
      {
        id: 'iron-man', name: 'Iron Man', icon: '🔴',
        img: HERO_IMG('194-iron-man'),
        variants: [
          { id: 'tony-stark', label: 'Tony Stark', sub: 'Robert Downey Jr.', actors: ['Robert Downey Jr.'] },
        ],
      },
      {
        id: 'captain-america', name: 'Captain America', icon: '🔵',
        img: HERO_IMG('149-captain-america'),
        variants: [
          { id: 'steve-rogers', label: 'Steve Rogers', sub: 'Chris Evans', actors: ['Chris Evans'] },
          { id: 'sam-wilson-cap', label: 'Sam Wilson', sub: 'Anthony Mackie', actors: ['Anthony Mackie'] },
        ],
      },
      {
        id: 'thor', name: 'Thor', icon: '⚡',
        img: HERO_IMG('659-thor'),
        variants: [
          { id: 'thor-hemsworth', label: 'Thor Odinson', sub: 'Chris Hemsworth', actors: ['Chris Hemsworth'] },
          { id: 'jane-thor', label: 'Jane Foster Thor', sub: 'Natalie Portman', actors: ['Natalie Portman'] },
        ],
      },
      {
        id: 'hulk', name: 'Hulk', icon: '💚',
        img: HERO_IMG('332-hulk'),
        variants: [
          { id: 'bruce-ruffalo', label: 'Bruce Banner', sub: 'Mark Ruffalo', actors: ['Mark Ruffalo'] },
          { id: 'bruce-norton', label: 'Bruce Banner', sub: 'Edward Norton', actors: ['Edward Norton'] },
          { id: 'bruce-bana', label: 'Bruce Banner', sub: 'Eric Bana', actors: ['Eric Bana'] },
          { id: 'she-hulk', label: 'She-Hulk', sub: 'Tatiana Maslany', actors: ['Tatiana Maslany'] },
        ],
      },
      {
        id: 'black-widow', name: 'Black Widow', icon: '🕷️',
        img: HERO_IMG('107-black-widow'),
        variants: [
          { id: 'natasha', label: 'Natasha Romanoff', sub: 'Scarlett Johansson', actors: ['Scarlett Johansson'] },
          { id: 'yelena', label: 'Yelena Belova', sub: 'Florence Pugh', actors: ['Florence Pugh'] },
        ],
      },
      {
        id: 'hawkeye', name: 'Hawkeye', icon: '🏹',
        img: HERO_IMG('311-hawkeye'),
        variants: [
          { id: 'clint', label: 'Clint Barton', sub: 'Jeremy Renner', actors: ['Jeremy Renner'] },
          { id: 'kate', label: 'Kate Bishop', sub: 'Hailee Steinfeld', actors: ['Hailee Steinfeld'] },
        ],
      },
      {
        id: 'wanda', name: 'Scarlet Witch', icon: '🔮',
        img: HERO_IMG('576-scarlet-witch'),
        variants: [
          { id: 'wanda-olsen', label: 'Wanda Maximoff', sub: 'Elizabeth Olsen', actors: ['Elizabeth Olsen'] },
        ],
      },
      {
        id: 'vision', name: 'Vision', icon: '💜',
        img: HERO_IMG('692-vision'),
        variants: [
          { id: 'vision-bettany', label: 'Vision', sub: 'Paul Bettany', actors: ['Paul Bettany'] },
        ],
      },
      {
        id: 'spider-man', name: 'Spider-Man', icon: '🕸️',
        img: HERO_IMG('620-spider-man'),
        variants: [
          { id: 'spidey-holland', label: 'Peter Parker', sub: 'Tom Holland', actors: ['Tom Holland'] },
          { id: 'spidey-maguire', label: 'Peter Parker', sub: 'Tobey Maguire', actors: ['Tobey Maguire'] },
          { id: 'spidey-garfield', label: 'Peter Parker', sub: 'Andrew Garfield', actors: ['Andrew Garfield'] },
          { id: 'spidey-miles', label: 'Miles Morales', sub: 'Shameik Moore', actors: ['Shameik Moore'] },
          { id: 'spidey-noir', label: 'Spider-Noir', sub: 'Nicolas Cage', actors: ['Nicolas Cage'] },
        ],
      },
      {
        id: 'ant-man', name: 'Ant-Man / Wasp', icon: '🐜',
        img: HERO_IMG('34-ant-man'),
        variants: [
          { id: 'scott', label: 'Scott Lang / Ant-Man', sub: 'Paul Rudd', actors: ['Paul Rudd'] },
          { id: 'hank', label: 'Hank Pym', sub: 'Michael Douglas', actors: ['Michael Douglas'] },
          { id: 'wasp-hope', label: 'Hope Van Dyne / Wasp', sub: 'Evangeline Lilly', actors: ['Evangeline Lilly'] },
          { id: 'wasp-janet', label: 'Janet Van Dyne', sub: 'Michelle Pfeiffer', actors: ['Michelle Pfeiffer'] },
        ],
      },
      {
        id: 'dr-strange', name: 'Doctor Strange', icon: '✨',
        img: HERO_IMG('218-doctor-strange'),
        variants: [
          { id: 'strange-cumberbatch', label: 'Stephen Strange', sub: 'Benedict Cumberbatch', actors: ['Benedict Cumberbatch'] },
        ],
      },
      {
        id: 'captain-marvel', name: 'Captain Marvel', icon: '⭐',
        img: HERO_IMG('153-captain-marvel'),
        variants: [
          { id: 'carol', label: 'Carol Danvers', sub: 'Brie Larson', actors: ['Brie Larson'] },
          { id: 'kamala', label: 'Ms. Marvel – Kamala Khan', sub: 'Iman Vellani', actors: ['Iman Vellani'] },
          { id: 'monica', label: 'Photon – Monica Rambeau', sub: 'Teyonah Parris', actors: ['Teyonah Parris'] },
        ],
      },
      {
        id: 'black-panther', name: 'Black Panther', icon: '🐾',
        img: HERO_IMG('98-black-panther'),
        variants: [
          { id: 'tchalla', label: "T'Challa", sub: 'Chadwick Boseman', actors: ['Chadwick Boseman'] },
          { id: 'shuri', label: 'Shuri', sub: 'Letitia Wright', actors: ['Letitia Wright'] },
        ],
      },
      {
        id: 'war-machine', name: 'War Machine', icon: '🔫',
        img: HERO_IMG('700-war-machine'),
        variants: [
          { id: 'rhodey-cheadle', label: 'James Rhodes', sub: 'Don Cheadle', actors: ['Don Cheadle'] },
          { id: 'rhodey-howard', label: 'James Rhodes', sub: 'Terrence Howard', actors: ['Terrence Howard'] },
        ],
      },
      {
        id: 'sam-bucky', name: 'Falcon / Winter Soldier', icon: '🦅',
        img: HERO_IMG('263-falcon'),
        variants: [
          { id: 'sam-falcon', label: 'Sam Wilson / Falcon', sub: 'Anthony Mackie', actors: ['Anthony Mackie'] },
          { id: 'bucky', label: 'Bucky Barnes / Winter Soldier', sub: 'Sebastian Stan', actors: ['Sebastian Stan'] },
        ],
      },
      {
        id: 'nick-fury', name: 'Nick Fury', icon: '🕶️',
        img: HERO_IMG('479-nick-fury'),
        variants: [
          { id: 'fury-jackson', label: 'Nick Fury', sub: 'Samuel L. Jackson', actors: ['Samuel L. Jackson'] },
        ],
      },
      {
        id: 'shang-chi', name: 'Shang-Chi', icon: '🥊',
        img: HERO_IMG('595-shang-chi'),
        variants: [
          { id: 'shang-liu', label: 'Shang-Chi', sub: 'Simu Liu', actors: ['Simu Liu'] },
        ],
      },
      {
        id: 'moon-knight', name: 'Moon Knight', icon: '🌙',
        img: HERO_IMG('470-moon-knight'),
        variants: [
          { id: 'mk-isaac', label: 'Marc Spector / Moon Knight', sub: 'Oscar Isaac', actors: ['Oscar Isaac'] },
        ],
      },
    ],
  },

  {
    id: 'guardians',
    label: 'Guardians of the Galaxy',
    icon: '🚀',
    chars: [
      {
        id: 'starlord', name: 'Star-Lord', icon: '🎧',
        img: HERO_IMG('644-star-lord'),
        variants: [{ id: 'quill', label: 'Peter Quill', sub: 'Chris Pratt', actors: ['Chris Pratt'] }],
      },
      {
        id: 'gamora', name: 'Gamora', icon: '💚',
        img: HERO_IMG('281-gamora'),
        variants: [{ id: 'gamora-saldana', label: 'Gamora', sub: 'Zoe Saldana', actors: ['Zoe Saldana'] }],
      },
      {
        id: 'drax', name: 'Drax', icon: '💪',
        img: HERO_IMG('224-drax-the-destroyer'),
        variants: [{ id: 'drax-bautista', label: 'Drax', sub: 'Dave Bautista', actors: ['Dave Bautista'] }],
      },
      {
        id: 'groot', name: 'Groot', icon: '🌳',
        img: HERO_IMG('303-groot'),
        variants: [{ id: 'groot-diesel', label: 'Groot', sub: 'Vin Diesel', actors: ['Vin Diesel'] }],
      },
      {
        id: 'rocket', name: 'Rocket Raccoon', icon: '🦝',
        img: HERO_IMG('567-rocket-raccoon'),
        variants: [{ id: 'rocket-cooper', label: 'Rocket', sub: 'Bradley Cooper', actors: ['Bradley Cooper'] }],
      },
      {
        id: 'nebula', name: 'Nebula', icon: '💙',
        img: HERO_IMG('473-nebula'),
        variants: [{ id: 'nebula-gillan', label: 'Nebula', sub: 'Karen Gillan', actors: ['Karen Gillan'] }],
      },
    ],
  },

  {
    id: 'xmen',
    label: 'X-Men',
    icon: '⚡',
    chars: [
      {
        id: 'wolverine', name: 'Wolverine', icon: '🦴',
        img: HERO_IMG('717-wolverine'),
        variants: [{ id: 'logan-jackman', label: 'Logan / Wolverine', sub: 'Hugh Jackman', actors: ['Hugh Jackman'] }],
      },
      {
        id: 'colossus', name: 'Colossus', icon: '🦾',
        img: HERO_IMG('colossus'),
        variants: [
          { id: 'colossus-cudmore', label: 'Piotr Rasputin', sub: 'Daniel Cudmore', actors: ['Daniel Cudmore'] },
          { id: 'colossus-kapicic', label: 'Piotr Rasputin', sub: 'Stefan Kapicic', actors: ['Stefan Kapicic'] },
        ],
      },
      {
        id: 'deadpool', name: 'Deadpool', icon: '💀',
        img: HERO_IMG('210-deadpool'),
        variants: [{ id: 'wade-reynolds', label: 'Wade Wilson', sub: 'Ryan Reynolds', actors: ['Ryan Reynolds'] }],
      },
      {
        id: 'mantis', name: 'Mantis', icon: '🌿',
        img: HERO_IMG('mantis'),
        variants: [{ id: 'mantis-klementieff', label: 'Mantis', sub: 'Pom Klementieff', actors: ['Pom Klementieff'] }],
      },
      {
        id: 'professor-x', name: 'Professor X', icon: '🧠',
        img: HERO_IMG('531-professor-x'),
        variants: [
          { id: 'xavier-stewart', label: 'Charles Xavier', sub: 'Patrick Stewart', actors: ['Patrick Stewart'] },
          { id: 'xavier-mcavoy', label: 'Young Charles Xavier', sub: 'James McAvoy', actors: ['James McAvoy'] },
        ],
      },
      {
        id: 'magneto', name: 'Magneto', icon: '🧲',
        img: HERO_IMG('423-magneto'),
        variants: [
          { id: 'magneto-mckellen', label: 'Erik Lehnsherr', sub: 'Ian McKellen', actors: ['Ian McKellen'] },
          { id: 'magneto-fassbender', label: 'Young Erik', sub: 'Michael Fassbender', actors: ['Michael Fassbender'] },
        ],
      },
      {
        id: 'cyclops', name: 'Cyclops', icon: '👁️',
        img: HERO_IMG('195-cyclops'),
        variants: [
          { id: 'cyclops-marsden', label: 'Scott Summers', sub: 'James Marsden', actors: ['James Marsden'] },
          { id: 'cyclops-sheridan', label: 'Young Scott', sub: 'Tye Sheridan', actors: ['Tye Sheridan'] },
        ],
      },
      {
        id: 'jean-grey', name: 'Jean Grey', icon: '🔥',
        img: HERO_IMG('355-jean-grey'),
        variants: [
          { id: 'jean-janssen', label: 'Jean Grey', sub: 'Famke Janssen', actors: ['Famke Janssen'] },
          { id: 'jean-turner', label: 'Young Jean', sub: 'Sophie Turner', actors: ['Sophie Turner'] },
          { id: 'jean-sink', label: 'Young Jean', sub: 'Sadie Sink', actors: ['Sadie Sink'] },
        ],
      },
      {
        id: 'storm', name: 'Storm', icon: '⛈️',
        img: HERO_IMG('648-storm'),
        variants: [
          { id: 'storm-berry', label: 'Ororo Munroe', sub: 'Halle Berry', actors: ['Halle Berry'] },
          { id: 'storm-shipp', label: 'Young Storm', sub: 'Alexandra Shipp', actors: ['Alexandra Shipp'] },
        ],
      },
      {
        id: 'rogue', name: 'Rogue', icon: '👐',
        img: HERO_IMG('569-rogue'),
        variants: [{ id: 'rogue-paquin', label: 'Rogue', sub: 'Anna Paquin', actors: ['Anna Paquin'] }],
      },
      {
        id: 'mystique', name: 'Mystique', icon: '🔵',
        img: HERO_IMG('471-mystique'),
        variants: [
          { id: 'mystique-romijn', label: 'Mystique', sub: 'Rebecca Romijn', actors: ['Rebecca Romijn'] },
          { id: 'mystique-lawrence', label: 'Young Mystique', sub: 'Jennifer Lawrence', actors: ['Jennifer Lawrence'] },
        ],
      },
      {
        id: 'beast', name: 'Beast', icon: '💙',
        img: HERO_IMG('68-beast'),
        variants: [
          { id: 'beast-grammer', label: 'Hank McCoy', sub: 'Kelsey Grammer', actors: ['Kelsey Grammer'] },
          { id: 'beast-hoult', label: 'Young Hank', sub: 'Nicholas Hoult', actors: ['Nicholas Hoult'] },
        ],
      },
    ],
  },

  {
    id: 'ff',
    label: 'Fantastic Four',
    icon: '4️⃣',
    chars: [
      {
        id: 'mr-fantastic', name: 'Mr. Fantastic', icon: '🔵',
        img: HERO_IMG('466-mister-fantastic'),
        variants: [
          { id: 'reed-pascal', label: 'Reed Richards', sub: 'Pedro Pascal (MCU)', actors: ['Pedro Pascal'] },
          { id: 'reed-gruffudd', label: 'Reed Richards', sub: 'Ioan Gruffudd (Fox)', actors: ['Ioan Gruffudd'] },
        ],
      },
      {
        id: 'invisible-woman', name: 'Invisible Woman', icon: '🫥',
        img: HERO_IMG('340-invisible-woman'),
        variants: [
          { id: 'sue-kirby', label: 'Sue Storm', sub: 'Vanessa Kirby (MCU)', actors: ['Vanessa Kirby'] },
          { id: 'sue-alba', label: 'Sue Storm', sub: 'Jessica Alba (Fox)', actors: ['Jessica Alba'] },
        ],
      },
      {
        id: 'human-torch', name: 'Human Torch', icon: '🔥',
        img: HERO_IMG('335-human-torch'),
        variants: [
          { id: 'johnny-quinn', label: 'Johnny Storm', sub: 'Joseph Quinn (MCU)', actors: ['Joseph Quinn'] },
          { id: 'johnny-evans', label: 'Johnny Storm', sub: 'Chris Evans (Fox)', actors: ['Chris Evans'] },
        ],
      },
      {
        id: 'thing', name: 'The Thing', icon: '🗿',
        img: HERO_IMG('657-thing'),
        variants: [
          { id: 'thing-ebon', label: 'Ben Grimm', sub: 'Ebon Moss-Bachrach (MCU)', actors: ['Ebon Moss-Bachrach'] },
          { id: 'thing-chiklis', label: 'Ben Grimm', sub: 'Michael Chiklis (Fox)', actors: ['Michael Chiklis'] },
        ],
      },
    ],
  },

  {
    id: 'villains',
    label: 'Villains',
    icon: '👹',
    chars: [
      {
        id: 'thanos', name: 'Thanos', icon: '🟣',
        img: HERO_IMG('655-thanos'),
        variants: [{ id: 'thanos-brolin', label: 'Thanos', sub: 'Josh Brolin', actors: ['Josh Brolin'] }],
      },
      {
        id: 'loki', name: 'Loki', icon: '🐍',
        img: HERO_IMG('406-loki'),
        variants: [{ id: 'loki-hiddleston', label: 'Loki Laufeyson', sub: 'Tom Hiddleston', actors: ['Tom Hiddleston'] }],
      },
      {
        id: 'doom', name: 'Doctor Doom', icon: '🟢',
        img: HERO_IMG('217-doctor-doom'),
        variants: [
          { id: 'doom-rdj', label: 'Victor Von Doom', sub: 'Robert Downey Jr. (MCU)', actors: ['Robert Downey Jr.'], titles: ['Avengers: Doomsday', 'Avengers: Secret Wars'] },
          { id: 'doom-mcmahon', label: 'Victor Von Doom', sub: 'Julian McMahon (Fox)', actors: ['Julian McMahon'], titles: ['Fantastic Four', 'Fantastic Four: Rise of the Silver Surfer'] },
        ],
      },
      {
        id: 'red-skull', name: 'Red Skull', icon: '☠️',
        img: HERO_IMG('553-red-skull'),
        variants: [
          { id: 'rs-weaving', label: 'Johann Schmidt', sub: 'Hugo Weaving', actors: ['Hugo Weaving'] },
          { id: 'rs-ross', label: 'Red Skull', sub: 'Ross Marquand', actors: ['Ross Marquand'] },
        ],
      },
      {
        id: 'ultron', name: 'Ultron', icon: '🤖',
        img: HERO_IMG('672-ultron'),
        variants: [{ id: 'ultron-spader', label: 'Ultron', sub: 'James Spader', actors: ['James Spader'] }],
      },
      {
        id: 'galactus', name: 'Galactus', icon: '🌍',
        img: HERO_IMG('279-galactus'),
        variants: [{ id: 'galactus-jones', label: 'Galactus', sub: 'Ralph Ineson', actors: ['Ralph Ineson'] }],
      },
    ],
  },

  {
    id: 'spidey-universe',
    label: 'Spider-Man Universe (Sony)',
    icon: '🕸️',
    chars: [
      {
        id: 'venom', name: 'Venom', icon: '⬛',
        img: HERO_IMG('689-venom'),
        variants: [
          { id: 'venom-hardy', label: 'Eddie Brock / Venom', sub: 'Tom Hardy', actors: ['Tom Hardy'] },
          { id: 'venom-topher', label: 'Eddie Brock', sub: 'Topher Grace (SM3)', actors: ['Topher Grace'] },
        ],
      },
      {
        id: 'morbius', name: 'Morbius', icon: '🦇',
        img: HERO_IMG('469-morbius'),
        variants: [{ id: 'morbius-leto', label: 'Michael Morbius', sub: 'Jared Leto', actors: ['Jared Leto'] }],
      },
      {
        id: 'kraven', name: 'Kraven', icon: '🦁',
        img: HERO_IMG('388-kraven-the-hunter'),
        variants: [{ id: 'kraven-johnson', label: 'Kraven the Hunter', sub: 'Aaron Taylor-Johnson', actors: ['Aaron Taylor-Johnson'] }],
      },
    ],
  },

  {
    id: 'defenders',
    label: 'The Defenders',
    icon: '🏙️',
    chars: [
      {
        id: 'daredevil', name: 'Daredevil', icon: '🔴',
        img: HERO_IMG('200-daredevil'),
        variants: [
          { id: 'dd-cox', label: 'Matt Murdock', sub: 'Charlie Cox', actors: ['Charlie Cox'] },
          { id: 'dd-affleck', label: 'Matt Murdock', sub: 'Ben Affleck (2003)', actors: ['Ben Affleck'] },
        ],
      },
      {
        id: 'punisher', name: 'Punisher', icon: '💀',
        img: HERO_IMG('533-punisher'),
        variants: [
          { id: 'frank-bernthal', label: 'Frank Castle', sub: 'Jon Bernthal', actors: ['Jon Bernthal'] },
          { id: 'frank-jane', label: 'Frank Castle', sub: 'Thomas Jane (2004)', actors: ['Thomas Jane'] },
        ],
      },
      {
        id: 'jessica-jones', name: 'Jessica Jones', icon: '💪',
        img: HERO_IMG('362-jessica-jones'),
        variants: [{ id: 'jessica-ritter', label: 'Jessica Jones', sub: 'Krysten Ritter', actors: ['Krysten Ritter'] }],
      },
      {
        id: 'luke-cage', name: 'Luke Cage', icon: '🦾',
        img: HERO_IMG('413-luke-cage'),
        variants: [{ id: 'luke-colter', label: 'Luke Cage', sub: 'Mike Colter', actors: ['Mike Colter'] }],
      },
      {
        id: 'iron-fist', name: 'Iron Fist', icon: '🤜',
        img: HERO_IMG('344-iron-fist'),
        variants: [{ id: 'danny-jones', label: 'Danny Rand', sub: 'Finn Jones', actors: ['Finn Jones'] }],
      },
    ],
  },

  {
    id: 'other',
    label: 'Others',
    icon: '🦸',
    chars: [
      {
        id: 'blade-char', name: 'Blade', icon: '🗡️',
        img: HERO_IMG('111-blade'),
        variants: [
          { id: 'blade-snipes', label: 'Eric Brooks / Blade', sub: 'Wesley Snipes', actors: ['Wesley Snipes'] },
          { id: 'blade-ali', label: 'Blade', sub: 'Mahershala Ali (MCU)', actors: ['Mahershala Ali'] },
        ],
      },
      {
        id: 'thor-valkyrie', name: 'Valkyrie', icon: '⚔️',
        img: HERO_IMG('690-valkyrie'),
        variants: [{ id: 'valkyrie-thompson', label: 'Valkyrie', sub: 'Tessa Thompson', actors: ['Tessa Thompson'] }],
      },
      {
        id: 'ghost-rider', name: 'Ghost Rider', icon: '🔥',
        img: HERO_IMG('ghost-rider'),
        variants: [
          { id: 'ghost-rider-cage', label: 'Johnny Blaze', sub: 'Nicolas Cage', actors: ['Nicolas Cage'] },
          { id: 'ghost-rider-reyes', label: 'Robbie Reyes', sub: 'Gabriel Luna', actors: ['Gabriel Luna'] },
        ],
      },
      {
        id: 'sylvie', name: 'Sylvie', icon: '🗡️',
        img: HERO_IMG('sylvie'),
        variants: [{ id: 'sylvie-di-martino', label: 'Sylvie', sub: 'Sophia Di Martino', actors: ['Sophia Di Martino'] }],
      },
      {
        id: 'stan-lee', name: 'Stan Lee', icon: '✍️',
        img: HERO_IMG('stan-lee'),
        variants: [{ id: 'stan-lee-cameo', label: 'Stan Lee', sub: 'Stan Lee', actors: ['Stan Lee'] }],
      },
      {
        id: 'mobius', name: 'Mobius', icon: '⏱️',
        img: HERO_IMG('mobius'),
        variants: [{ id: 'mobius-wilson', label: 'Mobius M. Mobius', sub: 'Owen Wilson', actors: ['Owen Wilson'] }],
      },
      {
        id: 'ned', name: 'Ned Leeds', icon: '🎒',
        img: HERO_IMG('ned'),
        variants: [{ id: 'ned-batalon', label: 'Ned Leeds', sub: 'Jacob Batalon', actors: ['Jacob Batalon'] }],
      },
      {
        id: 'mj', name: 'MJ', icon: '📚',
        img: HERO_IMG('mj'),
        variants: [{ id: 'mj-zendaya', label: 'Michelle Jones-Watson', sub: 'Zendaya', actors: ['Zendaya'] }],
      },
      {
        id: 'gwen-stacy', name: 'Gwen Stacy', icon: '🕷️',
        img: HERO_IMG('gwen-stacy'),
        variants: [{ id: 'gwen-stone', label: 'Gwen Stacy', sub: 'Emma Stone', actors: ['Emma Stone'] }],
      },
      {
        id: 'happy', name: 'Happy Hogan', icon: '🛡️',
        img: HERO_IMG('happy'),
        variants: [{ id: 'happy-favreau', label: 'Happy Hogan', sub: 'Jon Favreau', actors: ['Jon Favreau'] }],
      },
      {
        id: 'pepper', name: 'Pepper Potts', icon: '💼',
        img: HERO_IMG('pepper'),
        variants: [{ id: 'pepper-paltrow', label: 'Pepper Potts', sub: 'Gwyneth Paltrow', actors: ['Gwyneth Paltrow'] }],
      },
      {
        id: 'green-goblin', name: 'Green Goblin', icon: '🎃',
        img: HERO_IMG('green-goblin'),
        variants: [
          { id: 'goblin-dafoe', label: 'Norman Osborn', sub: 'Willem Dafoe', actors: ['Willem Dafoe'] },
          { id: 'goblin-dehaan', label: 'Harry Osborn', sub: 'Dane DeHaan', actors: ['Dane DeHaan'] },
        ],
      },
    ],
  },
];

CHAR_GROUPS.forEach(group => {
  const groupLogoNames = {
    avengers: 'Avengers',
    guardians: 'Guardians',
    xmen: 'xmen',
    ff: 'fantasticfour',
    villains: 'villains',
    'spidey-universe': 'sonyssu',
    defenders: 'thedefenders',
    other: 'other',
  };
  group.logo = `Assets/Logos/${encodeURIComponent(groupLogoNames[group.id] || group.id)}.jpg`;
});


