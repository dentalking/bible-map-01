import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.note.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.personRelationship.deleteMany();
  await prisma.journeyStop.deleteMany();
  await prisma.journey.deleteMany();
  await prisma.event.deleteMany();
  await prisma.person.deleteMany();
  await prisma.location.deleteMany();
  await prisma.theme.deleteMany();
  await prisma.bibleVerse.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  await prisma.user.create({
    data: {
      email: 'admin@biblemap.com',
      password: await bcrypt.hash('admin123', 10),
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  const testUser = await prisma.user.create({
    data: {
      email: 'test@biblemap.com',
      password: await bcrypt.hash('test123', 10),
      name: 'Test User',
      role: 'USER',
    },
  });

  console.log('✅ Users created');

  // Create locations
  const jerusalem = await prisma.location.create({
    data: {
      name: 'Jerusalem',
      nameHebrew: 'יְרוּשָׁלַיִם',
      nameGreek: 'Ἰερουσαλήμ',
      modernName: 'Jerusalem',
      country: 'Israel',
      latitude: 31.7683,
      longitude: 35.2137,
      description: 'The holy city, center of Jewish worship and capital of ancient Israel',
      significance: 'Most important city in biblical history, site of the Temple',
      period: 'Throughout biblical history',
    },
  });

  const bethlehem = await prisma.location.create({
    data: {
      name: 'Bethlehem',
      nameHebrew: 'בֵּית לֶחֶם',
      nameGreek: 'Βηθλεέμ',
      modernName: 'Bethlehem',
      country: 'Palestinian Territories',
      latitude: 31.7054,
      longitude: 35.2024,
      description: 'City of David, birthplace of Jesus',
      significance: 'Birthplace of King David and Jesus Christ',
      period: 'Throughout biblical history',
    },
  });

  await prisma.location.create({
    data: {
      name: 'Nazareth',
      nameHebrew: 'נָצְרַת',
      nameGreek: 'Ναζαρέθ',
      modernName: 'Nazareth',
      country: 'Israel',
      latitude: 32.7021,
      longitude: 35.2978,
      description: 'Childhood home of Jesus',
      significance: 'Where Jesus grew up and began his ministry',
      period: 'New Testament',
    },
  });

  await prisma.location.create({
    data: {
      name: 'Sea of Galilee',
      nameHebrew: 'יָם כִּנֶּרֶת',
      nameGreek: 'Θάλασσα της Γαλιλαίας',
      modernName: 'Lake Kinneret',
      country: 'Israel',
      latitude: 32.8333,
      longitude: 35.5833,
      description: 'Freshwater lake in northern Israel',
      significance: 'Site of many of Jesus\' miracles and teachings',
      period: 'Throughout biblical history',
    },
  });

  const babylon = await prisma.location.create({
    data: {
      name: 'Babylon',
      nameHebrew: 'בָּבֶל',
      nameGreek: 'Βαβυλών',
      modernName: 'Hillah (near)',
      country: 'Iraq',
      latitude: 32.5355,
      longitude: 44.4275,
      description: 'Ancient Mesopotamian city',
      significance: 'Capital of Babylonian Empire, site of Jewish exile',
      period: 'Old Testament',
    },
  });

  const damascus = await prisma.location.create({
    data: {
      name: 'Damascus',
      nameHebrew: 'דַּמֶּשֶׂק',
      nameGreek: 'Δαμασκός',
      modernName: 'Damascus',
      country: 'Syria',
      latitude: 33.5138,
      longitude: 36.2765,
      description: 'One of the oldest continuously inhabited cities',
      significance: 'Where Paul was converted to Christianity',
      period: 'Throughout biblical history',
    },
  });

  console.log('✅ Locations created');

  // Create persons
  const abraham = await prisma.person.create({
    data: {
      name: 'Abraham',
      nameHebrew: 'אַבְרָהָם',
      description: 'Father of faith, patriarch of Israel',
      birthYear: -2000,
      deathYear: -1825,
      testament: 'OLD',
      gender: 'MALE',
      significance: 'Father of the Jewish nation, model of faith',
      birthPlaceId: babylon.id,
    },
  });

  const moses = await prisma.person.create({
    data: {
      name: 'Moses',
      nameHebrew: 'מֹשֶׁה',
      description: 'Prophet who led Israel out of Egypt',
      birthYear: -1526,
      deathYear: -1406,
      testament: 'OLD',
      gender: 'MALE',
      significance: 'Delivered Israel from Egypt, received the Ten Commandments',
    },
  });

  const david = await prisma.person.create({
    data: {
      name: 'David',
      nameHebrew: 'דָּוִד',
      description: 'Second king of Israel, man after God\'s own heart',
      birthYear: -1040,
      deathYear: -970,
      testament: 'OLD',
      gender: 'MALE',
      significance: 'Greatest king of Israel, ancestor of Jesus',
      birthPlaceId: bethlehem.id,
      deathPlaceId: jerusalem.id,
    },
  });

  const jesus = await prisma.person.create({
    data: {
      name: 'Jesus Christ',
      nameHebrew: 'יֵשׁוּעַ',
      nameGreek: 'Ἰησοῦς Χριστός',
      description: 'Son of God, Savior of humanity',
      birthYear: -4,
      deathYear: 30,
      testament: 'NEW',
      gender: 'MALE',
      significance: 'Central figure of Christianity, Messiah',
      birthPlaceId: bethlehem.id,
    },
  });

  const paul = await prisma.person.create({
    data: {
      name: 'Paul (Saul)',
      nameHebrew: 'שָׁאוּל',
      nameGreek: 'Παῦλος',
      description: 'Apostle to the Gentiles',
      birthYear: 5,
      deathYear: 67,
      testament: 'NEW',
      gender: 'MALE',
      significance: 'Spread Christianity throughout the Roman Empire',
    },
  });

  const mary = await prisma.person.create({
    data: {
      name: 'Mary (Mother of Jesus)',
      nameHebrew: 'מִרְיָם',
      nameGreek: 'Μαρία',
      description: 'Mother of Jesus Christ',
      birthYear: -20,
      deathYear: 50,
      testament: 'NEW',
      gender: 'FEMALE',
      significance: 'Mother of Jesus, model of faith and obedience',
    },
  });

  await prisma.person.create({
    data: {
      name: 'John the Baptist',
      nameHebrew: 'יוֹחָנָן הַמַּטְבִּיל',
      nameGreek: 'Ἰωάννης ὁ βαπτιστής',
      description: 'Forerunner of Jesus Christ',
      birthYear: -5,
      deathYear: 29,
      testament: 'NEW',
      gender: 'MALE',
      significance: 'Prepared the way for Jesus, baptized Jesus',
    },
  });

  await prisma.person.create({
    data: {
      name: 'Peter (Simon)',
      nameHebrew: 'שִׁמְעוֹן',
      nameGreek: 'Πέτρος',
      description: 'Chief apostle, leader of early church',
      birthYear: 1,
      deathYear: 64,
      testament: 'NEW',
      gender: 'MALE',
      significance: 'Leader of the twelve apostles, founded the church',
    },
  });

  console.log('✅ Persons created');

  // Create relationships
  await prisma.personRelationship.create({
    data: {
      personFromId: mary.id,
      personToId: jesus.id,
      relationshipType: 'PARENT',
      description: 'Mother of Jesus',
    },
  });

  await prisma.personRelationship.create({
    data: {
      personFromId: abraham.id,
      personToId: david.id,
      relationshipType: 'ANCESTOR',
      description: 'Ancestor through lineage',
    },
  });

  console.log('✅ Relationships created');

  // Create events
  await prisma.event.create({
    data: {
      title: 'The Exodus from Egypt',
      description: 'God delivers Israel from slavery in Egypt through Moses',
      year: -1446,
      testament: 'OLD',
      category: 'EXODUS',
      significance: 'Foundational event of Jewish identity and faith',
      persons: {
        connect: [{ id: moses.id }],
      },
    },
  });

  await prisma.event.create({
    data: {
      title: 'Birth of Jesus Christ',
      description: 'The incarnation of God as human',
      year: -4,
      testament: 'NEW',
      category: 'MINISTRY',
      significance: 'Beginning of the New Covenant',
      locationId: bethlehem.id,
      persons: {
        connect: [{ id: jesus.id }, { id: mary.id }],
      },
    },
  });

  await prisma.event.create({
    data: {
      title: 'Crucifixion of Jesus',
      description: 'Jesus dies on the cross for humanity\'s sins',
      year: 30,
      testament: 'NEW',
      category: 'CRUCIFIXION',
      significance: 'Central event of Christian faith - atonement for sins',
      locationId: jerusalem.id,
      persons: {
        connect: [{ id: jesus.id }],
      },
    },
  });

  await prisma.event.create({
    data: {
      title: 'Resurrection of Jesus',
      description: 'Jesus rises from the dead on the third day',
      year: 30,
      testament: 'NEW',
      category: 'RESURRECTION',
      significance: 'Victory over death, foundation of Christian hope',
      locationId: jerusalem.id,
      persons: {
        connect: [{ id: jesus.id }],
      },
    },
  });

  await prisma.event.create({
    data: {
      title: 'Paul\'s Conversion',
      description: 'Saul encounters Jesus on the road to Damascus',
      year: 35,
      testament: 'NEW',
      category: 'MINISTRY',
      significance: 'Transformation of Christianity\'s greatest persecutor to apostle',
      locationId: damascus.id,
      persons: {
        connect: [{ id: paul.id }],
      },
    },
  });

  console.log('✅ Events created');

  // Create journeys
  await prisma.journey.create({
    data: {
      title: 'Abraham\'s Journey to Canaan',
      description: 'Abraham travels from Ur to the Promised Land',
      startYear: -2000,
      endYear: -1995,
      distance: 1500,
      duration: '5 years',
      purpose: 'Following God\'s call to the Promised Land',
      personId: abraham.id,
      stops: {
        create: [
          {
            orderIndex: 1,
            locationId: babylon.id,
            description: 'Starting point - Ur of the Chaldeans',
          },
          {
            orderIndex: 2,
            locationId: damascus.id,
            description: 'Passing through Damascus',
          },
          {
            orderIndex: 3,
            locationId: bethlehem.id,
            description: 'Arriving in Canaan',
            duration: 'Settlement',
          },
        ],
      },
    },
  });

  await prisma.journey.create({
    data: {
      title: 'Paul\'s First Missionary Journey',
      description: 'Paul\'s first journey to spread the Gospel',
      startYear: 46,
      endYear: 48,
      distance: 2000,
      duration: '2 years',
      purpose: 'Spreading Christianity to Asia Minor',
      personId: paul.id,
      stops: {
        create: [
          {
            orderIndex: 1,
            locationId: jerusalem.id,
            description: 'Starting from Jerusalem',
          },
          {
            orderIndex: 2,
            locationId: damascus.id,
            description: 'Through Damascus and Syria',
            duration: '6 months',
          },
        ],
      },
    },
  });

  console.log('✅ Journeys created');

  // Create themes
  await prisma.theme.create({
    data: {
      title: 'Faith',
      category: 'FAITH',
      description: 'Trust and belief in God',
      summary: 'Faith is the foundation of relationship with God, demonstrated through trust and obedience',
      applications: [
        'Trust God even when you cannot see the outcome',
        'Faith requires action and obedience',
        'Faith grows through trials and experience',
      ],
    },
  });

  await prisma.theme.create({
    data: {
      title: 'Salvation',
      category: 'SALVATION',
      description: 'God\'s plan to save humanity from sin',
      summary: 'God\'s redemptive work throughout history, culminating in Jesus Christ',
      applications: [
        'Salvation is by grace through faith',
        'Salvation transforms lives',
        'Salvation is available to all people',
      ],
    },
  });

  await prisma.theme.create({
    data: {
      title: 'Love',
      category: 'LOVE',
      description: 'God\'s love and human love',
      summary: 'Love is the greatest commandment and the nature of God',
      applications: [
        'Love God with all your heart',
        'Love your neighbor as yourself',
        'Love is patient and kind',
      ],
    },
  });

  console.log('✅ Themes created');

  // Create sample Bible verses
  await prisma.bibleVerse.createMany({
    data: [
      {
        book: 'Genesis',
        chapter: 12,
        verseStart: 1,
        text: 'The Lord had said to Abram, Go from your country, your people and your fathers household to the land I will show you.',
        translation: 'NIV',
      },
      {
        book: 'Exodus',
        chapter: 3,
        verseStart: 14,
        text: 'God said to Moses, I am who I am. This is what you are to say to the Israelites: I am has sent me to you.',
        translation: 'NIV',
      },
      {
        book: 'John',
        chapter: 3,
        verseStart: 16,
        text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
        translation: 'NIV',
      },
      {
        book: 'Matthew',
        chapter: 28,
        verseStart: 19,
        verseEnd: 20,
        text: 'Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, and teaching them to obey everything I have commanded you.',
        translation: 'NIV',
      },
    ],
  });

  console.log('✅ Bible verses created');

  // Create sample bookmarks
  await prisma.bookmark.create({
    data: {
      userId: testUser.id,
      title: 'Favorite Person',
      personId: jesus.id,
    },
  });

  await prisma.bookmark.create({
    data: {
      userId: testUser.id,
      title: 'Important Location',
      locationId: jerusalem.id,
    },
  });

  console.log('✅ Bookmarks created');

  console.log('🌱 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });