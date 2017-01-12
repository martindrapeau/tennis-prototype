(function() {

  window._organizations = [{
    id: 100,
    name: 'Ligue de Tennis Montréal Nord',
    admin_ids: [2414]
  }, {
    id: 101,
    name: 'Tennis Deux-Montagnes',
    admin_ids: [2414, 2417]
  }];

  window._programs = [{
    id: 1000,
    organization_id: 100,
    name: "Saison 2016"
  }, {
    id: 1100,
    organization_id: 101,
    name: "Saison 2015"
  }];

  window._categories = [{
    id: 3001,
    program_id: 1000,
    organization_id: 100,
    name: "A1",
    description: "lundi",
    player_ids: []
  }, {
    id: 3002,
    program_id: 1000,
    organization_id: 100,
    name: "A2",
    description: "lundi",
    player_ids: []
  }, {
    id: 3003,
    program_id: 1000,
    organization_id: 100,
    name: "A3",
    description: "lundi",
    player_ids: []
  }, {
    id: 3100,
    program_id: 1100,
    organization_id: 101,
    name: "Double A",
    description: "mardi",
    player_ids: []
  }];

  window._rounds = [{
    id: 4001,
    program_id: 1000,
    organization_id: 100,
    name: "Semaine 1",
    description: "1 au 4 mai",
    date: "2016-05-01"
  }, {
    id: 4002,
    program_id: 1000,
    organization_id: 100,
    name: "Semaine 2",
    description: "7 au 10 mai",
    date: "2016-05-07"
  }, {
    id: 4003,
    program_id: 1000,
    organization_id: 100,
    name: "Semaine 3",
    description: "14 au 17 mai",
    date: "2016-05-14"
  }, {
    id: 4004,
    program_id: 1000,
    organization_id: 100,
    name: "Semaine 4",
    description: "21 au 24 mai",
    date: "2016-05-21"
  }, {
    id: 4005,
    program_id: 1000,
    organization_id: 100,
    name: "Semaine 5",
    description: "28 au 31 mai",
    date: "2016-05-28"
  }, {
    id: 4100,
    program_id: 1100,
    organization_id: 101,
    name: "Semaine 1",
    description: "1 au 4 mai",
    date: "2015-05-01"
  }]

  window._players = [{
    id: 2314,
    organization_id: [100, 101],
    name: "Abdelkader Merabet",
    email: "abdel@merabet.com",
    phone: "514-123-1234",
    image: null
  }, {
    id: 2317,
    organization_id: [100, 101],
    name: "Samuel Gendron",
    email: "sam@gendron.com",
    phone: "514-123-1234",
    image: null
  }, {
    id: 2414,
    organization_id: [100, 101],
    name: "Martin Gilbert Drapeau",
    email: "martindrapeau@gmail.com",
    phone: "514-123-1234",
    image: null
  }, {
    id: 2415,
    organization_id: [100, 101],
    name: "Ludovic Bazinet",
    email: "ludovicbazinet@gmail.com",
    phone: "514-123-1234",
    image: null
  }, {
    id: 2417,
    organization_id: [100, 101],
    name: "Alain Mussely",
    email: "alain@must.com",
    phone: "514-123-1234",
    image: null
  }, {
    id: 2418,
    organization_id: [100, 101],
    name: "Eva Mussely",
    email: "eva@must.com",
    phone: "514-123-1234",
    image: null
  }];

  window._matches = [{
    id: 5402,
    organization_id: 100,
    program_id: 1000,
    category_id: 3001,
    round_id: 4001,
    type: "singles",
    created_on: "2016-03-21 22:02:43",
    played_on: "2016-05-01 08:00:00",
    user_id: 2314,
    user_partner_id: null,
    other_id: 2317,
    other_partner_id: null,
    user_points: null,
    other_points: null,
    user_set1: 7,
    other_set1: 5,
    user_tie1: null,
    other_tie1: null,
    user_set2: 3,
    other_set2: 1,
    user_tie2: null,
    other_tie2: null,
    user_set3: null,
    other_set3: null,
    user_tie3: null,
    other_tie3: null,
    user_set4: null,
    other_set4: null,
    user_tie4: null,
    other_tie4: null,
    user_set5: null,
    other_set5: null,
    user_tie5: null,
    other_tie5: null,
    exception: 'user_won_because_forfeit',
    user: {
      id: 2314,
      name: "Abdelkader Merabet",
    },
    user_partner: null,
    other: {
      id: 2317,
      name: "Samuel Gendron",
    },
    other_partner: null,
    location: "Calixa Lavallée",
    comment: "Bon match!"
  }, {
    id: 5404,
    organization_id: 100,
    program_id: 1000,
    category_id: 3001,
    round_id: 4001,
    type: "singles",
    created_on: "2016-03-21 22:02:43",
    played_on: "2016-05-01 08:00:00",
    user_id: 2414,
    user_partner_id: null,
    other_id: 2415,
    other_partner_id: null,
    user_points: null,
    other_points: null,
    user_set1: 3,
    other_set1: 6,
    user_tie1: null,
    other_tie1: null,
    user_set2: 3,
    other_set2: 6,
    user_tie2: null,
    other_tie2: null,
    user_set3: null,
    other_set3: null,
    user_tie3: null,
    other_tie3: null,
    user_set4: null,
    other_set4: null,
    user_tie4: null,
    other_tie4: null,
    user_set5: null,
    other_set5: null,
    user_tie5: null,
    other_tie5: null,
    exception: null,
    user: {
      id: 2414,
      name: "Martin Gilbert Drapeau"
    },
    other: {
      id: 2415,
      name: "Ludovic Bazinet"
    },
    other_partner: null,
    location: "Calixa Lavallée",
    comment: "Bon match!"
  }, {
    id: 5406,
    organization_id: 100,
    program_id: 1000,
    category_id: 3001,
    round_id: 4002,
    type: "singles",
    created_on: "2016-03-21 22:02:43",
    played_on: "2016-05-01 08:00:00",
    user_id: 2314,
    user_partner_id: null,
    other_id: 2415,
    other_partner_id: null,
    user_points: null,
    other_points: null,
    user_set1: 7,
    other_set1: 5,
    user_tie1: null,
    other_tie1: null,
    user_set2: 3,
    other_set2: 1,
    user_tie2: null,
    other_tie2: null,
    user_set3: null,
    other_set3: null,
    user_tie3: null,
    other_tie3: null,
    user_set4: null,
    other_set4: null,
    user_tie4: null,
    other_tie4: null,
    user_set5: null,
    other_set5: null,
    user_tie5: null,
    other_tie5: null,
    exception: 'user_won_because_forfeit',
    user: {
      id: 2314,
      name: "Abdelkader Merabet",
    },
    user_partner: null,
    other: {
      id: 2415,
      name: "Ludovic Bazinet"
    },
    other_partner: null,
    location: "Calixa Lavallée",
    comment: "Bon match!"
  }, {
    id: 5408,
    organization_id: 100,
    program_id: 1000,
    category_id: 3001,
    round_id: 4002,
    type: "singles",
    created_on: "2016-03-21 22:02:43",
    played_on: "2016-05-01 08:00:00",
    user_id: 2414,
    user_partner_id: null,
    other_id: 2317,
    other_partner_id: null,
    user_points: null,
    other_points: null,
    user_set1: 3,
    other_set1: 6,
    user_tie1: null,
    other_tie1: null,
    user_set2: 3,
    other_set2: 6,
    user_tie2: null,
    other_tie2: null,
    user_set3: null,
    other_set3: null,
    user_tie3: null,
    other_tie3: null,
    user_set4: null,
    other_set4: null,
    user_tie4: null,
    other_tie4: null,
    user_set5: null,
    other_set5: null,
    user_tie5: null,
    other_tie5: null,
    exception: null,
    user: {
      id: 2414,
      name: "Martin Gilbert Drapeau"
    },
    other: {
      id: 2317,
      name: "Samuel Gendron",
    },
    other_partner: null,
    location: "Calixa Lavallée",
    comment: "Bon match!"
  }, {
    id: 5506,
    organization_id: 101,
    program_id: 1100,
    category_id: 3100,
    round_id: 4100,
    type: "doubles",
    created_on: "2016-08-21 22:02:43",
    played_on: "2016-09-01 17:00:00",
    user_id: 2414,
    user_partner_id: 2415,
    other_id: 2417,
    other_partner_id: 2418,
    user_points: 3,
    other_points: 1,
    user_set1: 4,
    other_set1: 6,
    user_tie1: null,
    other_tie1: null,
    user_set2: 6,
    other_set2: 3,
    user_tie2: null,
    other_tie2: null,
    user_set3: 7,
    other_set3: 5,
    user_tie3: null,
    other_tie3: null,
    user_set4: null,
    other_set4: null,
    user_tie4: null,
    other_tie4: null,
    user_set5: null,
    other_set5: null,
    user_tie5: null,
    other_tie5: null,
    exception: null,
    user: {
      id: 2414,
      name: "Martin Gilbert Drapeau",
    },
    user_partner: {
      id: 2415,
      name: "Ludovic Bazinet",
    },
    other: {
      id: 2417,
      name: "Alain Mussely",
    },
    other_partner: {
      id: 2418,
      name: "Eva Mussely",
    },
    location: "Calixa Lavallée",
    comment: "Bon match!"
  }];

}.call(this));