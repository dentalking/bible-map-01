import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedExtendedData() {
  console.log('🌱 Adding extended sample data...');

  // Additional Locations
  const egypt = await prisma.location.create({
    data: {
      name: 'Egypt',
      nameHebrew: 'מִצְרַיִם',
      modernName: 'Egypt',
      latitude: 26.8206,
      longitude: 30.8025,
      description: 'Ancient land where Israelites were enslaved',
      significance: 'Place of bondage and the Exodus',
      region: 'AFRICA',
      locationType: 'COUNTRY'
    }
  });

  const damascus = await prisma.location.create({
    data: {
      name: 'Damascus',
      nameHebrew: 'דַּמֶּשֶׂק',
      modernName: 'Damascus, Syria',
      latitude: 33.5138,
      longitude: 36.2765,
      description: 'Ancient city where Paul was converted',
      significance: 'Site of Paul\'s conversion on the road to Damascus',
      region: 'MIDDLE_EAST',
      locationType: 'CITY'
    }
  });

  const mountSinai = await prisma.location.create({
    data: {
      name: 'Mount Sinai',
      nameHebrew: 'הר סיני',
      modernName: 'Jabal Musa, Egypt',
      latitude: 28.5395,
      longitude: 33.9736,
      description: 'Mountain where Moses received the Ten Commandments',
      significance: 'Place of divine revelation and covenant',
      region: 'MIDDLE_EAST',
      locationType: 'MOUNTAIN'
    }
  });

  const rome = await prisma.location.create({
    data: {
      name: 'Rome',
      nameGreek: 'Ῥώμη',
      modernName: 'Rome, Italy',
      latitude: 41.9028,
      longitude: 12.4964,
      description: 'Capital of the Roman Empire',
      significance: 'Center of early Christian persecution and later acceptance',
      region: 'EUROPE',
      locationType: 'CITY'
    }
  });

  const gardenOfEden = await prisma.location.create({
    data: {
      name: 'Garden of Eden',
      nameHebrew: 'גַּן עֵדֶן',
      latitude: 33.0, // Approximate - actual location unknown
      longitude: 44.0,
      description: 'Paradise where Adam and Eve lived',
      significance: 'The original paradise, site of humanity\'s fall',
      region: 'MIDDLE_EAST',
      locationType: 'REGION'
    }
  });

  const jericho = await prisma.location.create({
    data: {
      name: 'Jericho',
      nameHebrew: 'יְרִיחוֹ',
      modernName: 'Jericho, West Bank',
      latitude: 31.8667,
      longitude: 35.4500,
      description: 'Ancient city conquered by Joshua',
      significance: 'First city conquered in the Promised Land',
      region: 'MIDDLE_EAST',
      locationType: 'CITY'
    }
  });

  const capernaum = await prisma.location.create({
    data: {
      name: 'Capernaum',
      nameHebrew: 'כְּפַר נַחוּם',
      modernName: 'Capernaum, Israel',
      latitude: 32.8806,
      longitude: 35.5750,
      description: 'Jesus\' base of operations during his ministry',
      significance: 'City of Jesus, site of many miracles',
      region: 'MIDDLE_EAST',
      locationType: 'CITY'
    }
  });

  const seaOfGalilee = await prisma.location.create({
    data: {
      name: 'Sea of Galilee',
      nameHebrew: 'יָם כִּנֶּרֶת',
      modernName: 'Lake Kinneret, Israel',
      latitude: 32.8333,
      longitude: 35.5833,
      description: 'Freshwater lake where Jesus performed many miracles',
      significance: 'Site of Jesus walking on water, calming the storm',
      region: 'MIDDLE_EAST',
      locationType: 'BODY_OF_WATER'
    }
  });

  const mountOfOlives = await prisma.location.create({
    data: {
      name: 'Mount of Olives',
      nameHebrew: 'הר הזיתים',
      modernName: 'Mount of Olives, Jerusalem',
      latitude: 31.7784,
      longitude: 35.2474,
      description: 'Mountain ridge east of Jerusalem',
      significance: 'Site of Jesus\' ascension and Gethsemane',
      region: 'MIDDLE_EAST',
      locationType: 'MOUNTAIN'
    }
  });

  // Additional Persons
  const noah = await prisma.person.create({
    data: {
      name: 'Noah',
      nameHebrew: 'נֹחַ',
      description: 'Builder of the ark, saved humanity from the flood',
      birthYear: -2948,
      deathYear: -1998,
      testament: 'OLD',
      gender: 'MALE',
      significance: 'Righteous man who preserved life during the flood'
    }
  });

  const joseph = await prisma.person.create({
    data: {
      name: 'Joseph',
      nameHebrew: 'יוֹסֵף',
      description: 'Son of Jacob, sold into slavery, became vizier of Egypt',
      birthYear: -1915,
      deathYear: -1805,
      testament: 'OLD',
      gender: 'MALE',
      significance: 'Saved Israel from famine, example of forgiveness',
      birthPlaceId: egypt.id
    }
  });

  const joshua = await prisma.person.create({
    data: {
      name: 'Joshua',
      nameHebrew: 'יְהוֹשֻׁעַ',
      description: 'Successor of Moses, led Israel into Promised Land',
      birthYear: -1500,
      deathYear: -1390,
      testament: 'OLD',
      gender: 'MALE',
      significance: 'Military leader who conquered Canaan',
      birthPlaceId: egypt.id
    }
  });

  const solomon = await prisma.person.create({
    data: {
      name: 'Solomon',
      nameHebrew: 'שְׁלֹמֹה',
      description: 'Son of David, wisest and wealthiest king of Israel',
      birthYear: -990,
      deathYear: -931,
      testament: 'OLD',
      gender: 'MALE',
      significance: 'Builder of the First Temple, author of wisdom literature',
      birthPlaceId: (await prisma.location.findFirst({ where: { name: 'Jerusalem' } }))?.id
    }
  });

  const isaiah = await prisma.person.create({
    data: {
      name: 'Isaiah',
      nameHebrew: 'יְשַׁעְיָהוּ',
      description: 'Major prophet who prophesied about the Messiah',
      birthYear: -765,
      deathYear: -695,
      testament: 'OLD',
      gender: 'MALE',
      significance: 'Prophet of messianic prophecies and social justice',
      birthPlaceId: (await prisma.location.findFirst({ where: { name: 'Jerusalem' } }))?.id
    }
  });

  const daniel = await prisma.person.create({
    data: {
      name: 'Daniel',
      nameHebrew: 'דָּנִיֵּאל',
      description: 'Prophet in Babylonian exile, interpreter of dreams',
      birthYear: -620,
      deathYear: -538,
      testament: 'OLD',
      gender: 'MALE',
      significance: 'Faithful in exile, apocalyptic visions'
    }
  });

  const johnTheBaptist = await prisma.person.create({
    data: {
      name: 'John the Baptist',
      nameGreek: 'Ἰωάννης ὁ Βαπτιστής',
      description: 'Forerunner of Jesus, baptized in the Jordan River',
      birthYear: -4,
      deathYear: 30,
      testament: 'NEW',
      gender: 'MALE',
      significance: 'Prepared the way for Jesus\' ministry'
    }
  });

  const peter = await prisma.person.create({
    data: {
      name: 'Peter (Simon Peter)',
      nameGreek: 'Πέτρος',
      description: 'Chief apostle, leader of the early church',
      birthYear: -1,
      deathYear: 64,
      testament: 'NEW',
      gender: 'MALE',
      significance: 'Rock upon which Jesus built his church',
      deathPlaceId: rome.id
    }
  });

  const mary = await prisma.person.create({
    data: {
      name: 'Mary (Mother of Jesus)',
      nameHebrew: 'מִרְיָם',
      nameGreek: 'Μαρία',
      description: 'Mother of Jesus Christ',
      birthYear: -20,
      deathYear: 48,
      testament: 'NEW',
      gender: 'FEMALE',
      significance: 'Mother of the Messiah, model of faith and obedience',
      birthPlaceId: (await prisma.location.findFirst({ where: { name: 'Nazareth' } }))?.id
    }
  });

  const john = await prisma.person.create({
    data: {
      name: 'John (Apostle)',
      nameGreek: 'Ἰωάννης',
      description: 'The beloved disciple, author of Gospel and Revelation',
      birthYear: 6,
      deathYear: 100,
      testament: 'NEW',
      gender: 'MALE',
      significance: 'Author of five New Testament books, last surviving apostle'
    }
  });

  const maryMagdalene = await prisma.person.create({
    data: {
      name: 'Mary Magdalene',
      nameHebrew: 'מִרְיָם הַמַּגְדָּלִית',
      nameGreek: 'Μαρία ἡ Μαγδαληνή',
      description: 'Follower of Jesus, first witness of resurrection',
      birthYear: -5,
      deathYear: 50,
      testament: 'NEW',
      gender: 'FEMALE',
      significance: 'First to see the risen Christ'
    }
  });

  // Additional Events
  const creation = await prisma.event.create({
    data: {
      title: 'Creation of the World',
      description: 'God creates the heavens and the earth in six days',
      year: -4004, // Traditional date
      testament: 'OLD',
      category: 'CREATION',
      significance: 'Beginning of all existence',
      locationId: gardenOfEden.id
    }
  });

  const flood = await prisma.event.create({
    data: {
      title: 'The Great Flood',
      description: 'God floods the earth, saving only Noah and his family',
      year: -2348,
      testament: 'OLD',
      category: 'CREATION', // Using closest available category
      significance: 'God\'s judgment and new beginning for humanity',
      persons: {
        connect: { id: noah.id }
      }
    }
  });

  const towerOfBabel = await prisma.event.create({
    data: {
      title: 'Tower of Babel',
      description: 'Humanity\'s languages are confused',
      year: -2247,
      testament: 'OLD',
      category: 'PATRIARCHS', // Using closest available category
      significance: 'Origin of diverse languages and nations',
      locationId: (await prisma.location.findFirst({ where: { name: 'Babylon' } }))?.id
    }
  });

  const callOfAbraham = await prisma.event.create({
    data: {
      title: 'Call of Abraham',
      description: 'God calls Abraham to leave Ur and go to Canaan',
      year: -1921,
      testament: 'OLD',
      category: 'PATRIARCHS',
      significance: 'Beginning of God\'s covenant people'
    }
  });

  const givingOfTheLaw = await prisma.event.create({
    data: {
      title: 'Giving of the Law',
      description: 'Moses receives the Ten Commandments at Mount Sinai',
      year: -1446,
      testament: 'OLD',
      category: 'EXODUS',
      significance: 'Establishment of God\'s law for His people',
      locationId: mountSinai.id
    }
  });

  const fallOfJericho = await prisma.event.create({
    data: {
      title: 'Fall of Jericho',
      description: 'The walls of Jericho fall after Israelites march around them',
      year: -1406,
      testament: 'OLD',
      category: 'CONQUEST',
      significance: 'First victory in the Promised Land',
      locationId: jericho.id,
      persons: {
        connect: { id: joshua.id }
      }
    }
  });

  const davidBecomesKing = await prisma.event.create({
    data: {
      title: 'David Becomes King',
      description: 'David is anointed as king of Israel',
      year: -1010,
      testament: 'OLD',
      category: 'MONARCHY',
      significance: 'Establishment of the Davidic line',
      locationId: (await prisma.location.findFirst({ where: { name: 'Jerusalem' } }))?.id
    }
  });

  const templeBuilt = await prisma.event.create({
    data: {
      title: 'Solomon\'s Temple Built',
      description: 'Solomon completes the First Temple in Jerusalem',
      year: -957,
      testament: 'OLD',
      category: 'MONARCHY',
      significance: 'Centralization of worship in Jerusalem',
      locationId: (await prisma.location.findFirst({ where: { name: 'Jerusalem' } }))?.id,
      persons: {
        connect: { id: solomon.id }
      }
    }
  });

  const babylonianExile = await prisma.event.create({
    data: {
      title: 'Babylonian Exile',
      description: 'Jerusalem falls and Judah is exiled to Babylon',
      year: -586,
      testament: 'OLD',
      category: 'EXILE',
      significance: 'Judgment for disobedience, preservation in exile'
    }
  });

  const returnFromExile = await prisma.event.create({
    data: {
      title: 'Return from Exile',
      description: 'Jews return to Jerusalem and rebuild the temple',
      year: -538,
      testament: 'OLD',
      category: 'RETURN',
      significance: 'God\'s faithfulness to His promises',
      locationId: (await prisma.location.findFirst({ where: { name: 'Jerusalem' } }))?.id
    }
  });

  const baptismOfJesus = await prisma.event.create({
    data: {
      title: 'Baptism of Jesus',
      description: 'John baptizes Jesus in the Jordan River',
      year: 27,
      testament: 'NEW',
      category: 'MINISTRY',
      significance: 'Beginning of Jesus\' public ministry',
      persons: {
        connect: { id: johnTheBaptist.id }
      }
    }
  });

  const feedingOf5000 = await prisma.event.create({
    data: {
      title: 'Feeding of the 5000',
      description: 'Jesus miraculously feeds 5000 people with five loaves and two fish',
      year: 29,
      testament: 'NEW',
      category: 'MIRACLE',
      significance: 'Demonstration of Jesus\' divine power and compassion',
      locationId: seaOfGalilee.id
    }
  });

  const transfiguration = await prisma.event.create({
    data: {
      title: 'The Transfiguration',
      description: 'Jesus is transfigured before Peter, James, and John',
      year: 32,
      testament: 'NEW',
      category: 'MIRACLE',
      significance: 'Revelation of Jesus\' divine glory',
      persons: {
        connect: [{ id: peter.id }, { id: john.id }]
      }
    }
  });

  const lastSupper = await prisma.event.create({
    data: {
      title: 'The Last Supper',
      description: 'Jesus shares final meal with disciples, institutes communion',
      year: 33,
      testament: 'NEW',
      category: 'MINISTRY',
      significance: 'Institution of the Lord\'s Supper',
      locationId: (await prisma.location.findFirst({ where: { name: 'Jerusalem' } }))?.id,
      persons: {
        connect: [{ id: peter.id }, { id: john.id }]
      }
    }
  });

  const crucifixion = await prisma.event.create({
    data: {
      title: 'Crucifixion of Jesus',
      description: 'Jesus is crucified at Golgotha for the sins of humanity',
      year: 33,
      testament: 'NEW',
      category: 'CRUCIFIXION',
      significance: 'Atonement for sin, salvation for humanity',
      locationId: (await prisma.location.findFirst({ where: { name: 'Jerusalem' } }))?.id,
      persons: {
        connect: [{ id: mary.id }, { id: maryMagdalene.id }, { id: john.id }]
      }
    }
  });

  const resurrection = await prisma.event.create({
    data: {
      title: 'Resurrection of Jesus',
      description: 'Jesus rises from the dead on the third day',
      year: 33,
      testament: 'NEW',
      category: 'RESURRECTION',
      significance: 'Victory over death, hope of eternal life',
      locationId: (await prisma.location.findFirst({ where: { name: 'Jerusalem' } }))?.id,
      persons: {
        connect: [{ id: maryMagdalene.id }, { id: peter.id }]
      }
    }
  });

  const ascension = await prisma.event.create({
    data: {
      title: 'Ascension of Jesus',
      description: 'Jesus ascends to heaven from the Mount of Olives',
      year: 33,
      testament: 'NEW',
      category: 'RESURRECTION',
      significance: 'Jesus returns to the Father',
      locationId: mountOfOlives.id
    }
  });

  const pentecost = await prisma.event.create({
    data: {
      title: 'Day of Pentecost',
      description: 'Holy Spirit descends on the disciples',
      year: 33,
      testament: 'NEW',
      category: 'CHURCH',
      significance: 'Birth of the Church',
      locationId: (await prisma.location.findFirst({ where: { name: 'Jerusalem' } }))?.id,
      persons: {
        connect: { id: peter.id }
      }
    }
  });

  const paulsConversion = await prisma.event.create({
    data: {
      title: 'Paul\'s Conversion',
      description: 'Saul encounters Jesus on the road to Damascus',
      year: 35,
      testament: 'NEW',
      category: 'MINISTRY',
      significance: 'Conversion of the apostle to the Gentiles',
      locationId: damascus.id
    }
  });

  // Additional Journeys
  const abrahamJourney = await prisma.journey.create({
    data: {
      title: 'Abraham\'s Journey to Canaan',
      description: 'Abraham travels from Ur to the Promised Land',
      startYear: -1921,
      endYear: -1920,
      purpose: 'Following God\'s call to the Promised Land',
      personId: (await prisma.person.findFirst({ where: { name: 'Abraham' } }))?.id || ''
    }
  });

  const israeliteExodus = await prisma.journey.create({
    data: {
      title: 'The Exodus from Egypt',
      description: '40-year journey from Egypt to the Promised Land',
      startYear: -1446,
      endYear: -1406,
      distance: 1000,
      duration: '40 years',
      purpose: 'Liberation from slavery and journey to Promised Land',
      personId: (await prisma.person.findFirst({ where: { name: 'Moses' } }))?.id || ''
    }
  });

  // Add journey stops for Exodus
  await prisma.journeyStop.createMany({
    data: [
      {
        journeyId: israeliteExodus.id,
        locationId: egypt.id,
        orderIndex: 1,
        description: 'Starting point - land of slavery'
      },
      {
        journeyId: israeliteExodus.id,
        locationId: mountSinai.id,
        orderIndex: 2,
        description: 'Receiving the Ten Commandments',
        duration: '1 year'
      },
      {
        journeyId: israeliteExodus.id,
        locationId: jericho.id,
        orderIndex: 3,
        description: 'First conquest in Promised Land'
      }
    ]
  });

  const jesusMinistry = await prisma.journey.create({
    data: {
      title: 'Jesus\' Ministry Journey',
      description: 'Jesus travels throughout Galilee and Judea teaching and healing',
      startYear: 27,
      endYear: 33,
      duration: '3.5 years',
      purpose: 'Preaching the Kingdom of God',
      personId: (await prisma.person.findFirst({ where: { name: 'Jesus' } }))?.id || ''
    }
  });

  // Add journey stops for Jesus' ministry
  const nazareth = await prisma.location.findFirst({ where: { name: 'Nazareth' } });
  const bethlehem = await prisma.location.findFirst({ where: { name: 'Bethlehem' } });
  const jerusalem = await prisma.location.findFirst({ where: { name: 'Jerusalem' } });

  if (nazareth && capernaum && jerusalem) {
    await prisma.journeyStop.createMany({
      data: [
        {
          journeyId: jesusMinistry.id,
          locationId: nazareth.id,
          orderIndex: 1,
          description: 'Hometown - begins ministry'
        },
        {
          journeyId: jesusMinistry.id,
          locationId: capernaum.id,
          orderIndex: 2,
          description: 'Base of operations',
          duration: '2 years'
        },
        {
          journeyId: jesusMinistry.id,
          locationId: jerusalem.id,
          orderIndex: 3,
          description: 'Final week - crucifixion and resurrection'
        }
      ]
    });
  }

  // Paul's First Missionary Journey
  const paulFirstJourney = await prisma.journey.create({
    data: {
      title: 'Paul\'s First Missionary Journey',
      description: 'Paul and Barnabas spread the Gospel to Cyprus and Asia Minor',
      startYear: 46,
      endYear: 48,
      distance: 1400,
      duration: '2 years',
      purpose: 'Evangelizing the Gentiles',
      personId: (await prisma.person.findFirst({ where: { name: 'Paul' } }))?.id || ''
    }
  });

  // Additional Themes
  await prisma.theme.create({
    data: {
      title: 'Covenant',
      titleHebrew: 'בְּרִית',
      description: 'God\'s binding agreements with humanity',
      category: 'COVENANT',
      significance: 'Foundation of God\'s relationship with His people'
    }
  });

  await prisma.theme.create({
    data: {
      title: 'Kingdom of God',
      titleGreek: 'Βασιλεία του Θεού',
      description: 'God\'s reign and rule over all creation',
      category: 'KINGDOM',
      significance: 'Central message of Jesus\' teaching'
    }
  });

  await prisma.theme.create({
    data: {
      title: 'Prophecy and Fulfillment',
      description: 'Old Testament prophecies fulfilled in the New Testament',
      category: 'PROPHECY',
      significance: 'Demonstrates God\'s sovereignty over history'
    }
  });

  await prisma.theme.create({
    data: {
      title: 'Love and Mercy',
      titleHebrew: 'חֶסֶד',
      titleGreek: 'Ἀγάπη',
      description: 'God\'s steadfast love and compassion',
      category: 'LOVE',
      significance: 'Core attribute of God\'s character'
    }
  });

  await prisma.theme.create({
    data: {
      title: 'Justice and Righteousness',
      titleHebrew: 'צֶדֶק וּמִשְׁפָּט',
      description: 'God\'s standard for human conduct and society',
      category: 'JUSTICE',
      significance: 'Foundation for biblical ethics and social justice'
    }
  });

  await prisma.theme.create({
    data: {
      title: 'Faith and Obedience',
      titleHebrew: 'אֱמוּנָה',
      titleGreek: 'Πίστις',
      description: 'Trust in God demonstrated through action',
      category: 'FAITH',
      significance: 'Essential response to God\'s grace'
    }
  });

  await prisma.theme.create({
    data: {
      title: 'Sin and Redemption',
      description: 'Humanity\'s fall and God\'s plan of salvation',
      category: 'REDEMPTION',
      significance: 'The central narrative of Scripture'
    }
  });

  await prisma.theme.create({
    data: {
      title: 'Prayer and Worship',
      description: 'Communication with God and expressing devotion',
      category: 'WORSHIP',
      significance: 'Essential practices of faith'
    }
  });

  console.log('✅ Extended sample data added successfully');
}

seedExtendedData()
  .catch((e) => {
    console.error('Error seeding extended data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });