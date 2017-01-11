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
    name: "Saison 2016"
  }, {
    id: 1100,
    name: "Saison 2015"
  }];

  window._categories = [{
    id: 3001,
    program_id: 1000,
    name: "A1",
    description: "lundi",
    player_ids: []
  }, {
    id: 3002,
    program_id: 1000,
    name: "A2",
    description: "lundi",
    player_ids: []
  }, {
    id: 3003,
    program_id: 1000,
    name: "A3",
    description: "lundi",
    player_ids: []
  }, {
    id: 3100,
    program_id: 1100,
    name: "Double A",
    description: "mardi",
    player_ids: []
  }];

  window._rounds = [{
    id: 4001,
    program_id: 1000,
    name: "Semaine 1",
    description: "1 au 4 mai",
    date: "2016-05-01"
  }, {
    id: 4002,
    program_id: 1000,
    name: "Semaine 2",
    description: "7 au 10 mai",
    date: "2016-05-07"
  }, {
    id: 4003,
    program_id: 1000,
    name: "Semaine 3",
    description: "14 au 17 mai",
    date: "2016-05-14"
  }, {
    id: 4004,
    program_id: 1000,
    name: "Semaine 4",
    description: "21 au 24 mai",
    date: "2016-05-21"
  }, {
    id: 4005,
    program_id: 1000,
    name: "Semaine 5",
    description: "28 au 31 mai",
    date: "2016-05-28"
  }, {
    id: 4100,
    program_id: 1100,
    name: "Semaine 1",
    description: "1 au 4 mai",
    date: "2015-05-01"
  }]

  window._players = [{
    id: 2314,
    name: "Abdelkader Merabet",
    email: "abdel@merabet.com",
    phone: "514-123-1234",
    image: null
  }, {
    id: 2317,
    name: "Samuel Gendron",
    email: "sam@gendron.com",
    phone: "514-123-1234",
    image: null
  }, {
    id: 2414,
    name: "Martin Gilbert Drapeau",
    email: "martindrapeau@gmail.com",
    phone: "514-123-1234",
    image: null
  }, {
    id: 2415,
    name: "Ludovic Bazinet",
    email: "ludovicbazinet@gmail.com",
    phone: "514-123-1234",
    image: null
  }, {
    id: 2417,
    name: "Alain Mussely",
    email: "alain@must.com",
    phone: "514-123-1234",
    image: null
  }, {
    id: 2418,
    name: "Eva Mussely",
    email: "eva@must.com",
    phone: "514-123-1234",
    image: null
  }];

  window._matches = [{
    id: 5402,
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

  window._events = [{
    Id: 1000,
    When: '2016-08-08 09:00:00',
    Start: ' 9:00',
    End: '16:00',
    DateString: 'lundi 8 août',
    Name: 'Camp option hockey cosom',
    Type: 'Activity',
    InvoiceId: 2000,
    PersonId: 3,
    FirstName: 'Ludovic',
    LastName: 'Bazinet',
    ProfilePictureUrl: 'img/ludovic.jpg',
    OrganizationId: 201,
    OrganizationLogoUrl: 'img/sports-montreal.jpg',
    OrganizationName: "Sports Montréal"
  }, {
    Id: 1001,
    When: '2016-08-09 09:00:00',
    Start: ' 9:00',
    End: '16:00',
    DateString: 'mardi 9 août',
    Name: 'Camp option hockey cosom',
    Type: 'Activity',
    InvoiceId: 2000,
    PersonId: 3,
    FirstName: 'Ludovic',
    LastName: 'Bazinet',
    ProfilePictureUrl: 'img/ludovic.jpg',
    OrganizationId: 201,
    OrganizationLogoUrl: 'img/sports-montreal.jpg',
    OrganizationName: "Sports Montréal"
  }, {
    Id: 1002,
    When: '2016-08-09 19:00:00',
    Start: '19:00',
    End: '21:00',
    DateString: 'mardi 9 août',
    Name: "LIGUE RÉCRÉATIVE (jeu en double) Mardi, Niv. 3.5/4.0 - 19h00 à 21h00",
    Type: 'Activity',
    InvoiceId: 2003,
    PersonId: 4,
    FirstName: 'Martin',
    LastName: 'Drapeau',
    ProfilePictureUrl: 'img/martin.jpg',
    OrganizationId: 201,
    OrganizationLogoUrl: 'img/tennis-montreal.png',
    OrganizationName: "Tennis Montréal"
  }, {
    Id: 1003,
    When: '2016-08-10 09:00:00',
    Start: ' 9:00',
    End: '16:00',
    DateString: 'mercredi 10 août',
    Name: 'Camp option hockey cosom',
    Type: 'Activity',
    InvoiceId: 2000,
    PersonId: 3,
    FirstName: 'Ludovic',
    LastName: 'Bazinet',
    ProfilePictureUrl: 'img/ludovic.jpg',
    OrganizationId: 201,
    OrganizationLogoUrl: 'img/sports-montreal.jpg',
    OrganizationName: "Sports Montréal"
  }, {
    Id: 1004,
    When: '2016-08-11 09:00:00',
    Start: ' 9:00',
    End: '16:00',
    DateString: 'jeudi 11 août',
    Name: 'Camp option hockey cosom',
    Type: 'Activity',
    InvoiceId: 2000,
    PersonId: 3,
    FirstName: 'Ludovic',
    LastName: 'Bazinet',
    ProfilePictureUrl: 'img/ludovic.jpg',
    OrganizationId: 201,
    OrganizationLogoUrl: 'img/sports-montreal.jpg',
    OrganizationName: "Sports Montréal"
  }, {
    Id: 1005,
    When: '2016-08-12 09:00:00',
    Start: ' 9:00',
    End: '16:00',
    DateString: 'vendredi 12 août',
    Name: 'Camp option hockey cosom',
    Type: 'Activity',
    InvoiceId: 2000,
    PersonId: 3,
    FirstName: 'Ludovic',
    LastName: 'Bazinet',
    ProfilePictureUrl: 'img/ludovic.jpg',
    OrganizationId: 201,
    OrganizationLogoUrl: 'img/sports-montreal.jpg',
    OrganizationName: "Sports Montréal"
  }, {
    Id: 1006,
    When: '2016-08-16 19:00:00',
    Start: '19:00',
    End: '21:00',
    DateString: 'mardi 16 août',
    Name: "LIGUE RÉCRÉATIVE (jeu en double) Mardi, Niv. 3.5/4.0 - 19h00 à 21h00",
    Type: 'Activity',
    InvoiceId: 2003,
    PersonId: 4,
    FirstName: 'Martin',
    LastName: 'Drapeau',
    ProfilePictureUrl: 'img/martin.jpg',
    OrganizationId: 201,
    OrganizationLogoUrl: 'img/tennis-montreal.png',
    OrganizationName: "Tennis Montréal"
  }, {
    Id: 1007,
    When: '2016-08-23 19:00:00',
    Start: '19:00',
    End: '21:00',
    DateString: 'mardi 23 août',
    Name: "LIGUE RÉCRÉATIVE (jeu en double) Mardi, Niv. 3.5/4.0 - 19h00 à 21h00",
    Type: 'Activity',
    InvoiceId: 2003,
    PersonId: 4,
    FirstName: 'Martin',
    LastName: 'Drapeau',
    ProfilePictureUrl: 'img/martin.jpg',
    OrganizationId: 201,
    OrganizationLogoUrl: 'img/tennis-montreal.png',
    OrganizationName: "Tennis Montréal"
  }, {
    Id: 1008,
    When: '2016-08-30 19:00:00',
    Start: '19:00',
    End: '21:00',
    DateString: 'mardi 30 août',
    Name: "LIGUE RÉCRÉATIVE (jeu en double) Mardi, Niv. 3.5/4.0 - 19h00 à 21h00",
    Type: 'Activity',
    InvoiceId: 2003,
    PersonId: 4,
    FirstName: 'Martin',
    LastName: 'Drapeau',
    ProfilePictureUrl: 'img/martin.jpg',
    OrganizationId: 201,
    OrganizationLogoUrl: 'img/tennis-montreal.png',
    OrganizationName: "Tennis Montréal"
  }];

}.call(this));