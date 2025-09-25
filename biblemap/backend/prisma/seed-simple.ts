import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSimpleData() {
  console.log('🌱 Adding additional sample data...');

  try {
    // Additional Locations (simplified)
    const egypt = await prisma.location.create({
      data: {
        name: 'Egypt',
        nameHebrew: 'מִצְרַיִם',
        modernName: 'Egypt',
        latitude: 26.8206,
        longitude: 30.8025,
        description: 'Ancient land where Israelites were enslaved',
        significance: 'Place of bondage and the Exodus'
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
        significance: 'Site of Paul\'s conversion'
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
        significance: 'Place of divine revelation and covenant'
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
        significance: 'First city conquered in the Promised Land'
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
        significance: 'City of Jesus, site of many miracles'
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
        significance: 'Site of Jesus walking on water'
      }
    });

    console.log('✅ Locations added');

    // Additional Persons (simplified)
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

    const solomon = await prisma.person.create({
      data: {
        name: 'Solomon',
        nameHebrew: 'שְׁלֹמֹה',
        description: 'Son of David, wisest and wealthiest king of Israel',
        birthYear: -990,
        deathYear: -931,
        testament: 'OLD',
        gender: 'MALE',
        significance: 'Builder of the First Temple'
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
        significance: 'Prophet of messianic prophecies'
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
        significance: 'Mother of the Messiah'
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
        significance: 'Rock upon which Jesus built his church'
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
        significance: 'Author of five New Testament books'
      }
    });

    console.log('✅ Persons added');

    // Additional Events
    const flood = await prisma.event.create({
      data: {
        title: 'The Great Flood',
        description: 'God floods the earth, saving only Noah and his family',
        year: -2348,
        testament: 'OLD',
        category: 'CREATION',
        significance: 'God\'s judgment and new beginning for humanity',
        persons: {
          connect: { id: noah.id }
        }
      }
    });

    const givingOfTheLaw = await prisma.event.create({
      data: {
        title: 'Giving of the Law',
        description: 'Moses receives the Ten Commandments at Mount Sinai',
        year: -1446,
        testament: 'OLD',
        category: 'EXODUS',
        significance: 'Establishment of God\'s law',
        locationId: mountSinai.id
      }
    });

    const fallOfJericho = await prisma.event.create({
      data: {
        title: 'Fall of Jericho',
        description: 'The walls of Jericho fall',
        year: -1406,
        testament: 'OLD',
        category: 'CONQUEST',
        significance: 'First victory in the Promised Land',
        locationId: jericho.id
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
        persons: {
          connect: { id: solomon.id }
        }
      }
    });

    const feedingOf5000 = await prisma.event.create({
      data: {
        title: 'Feeding of the 5000',
        description: 'Jesus miraculously feeds 5000 people',
        year: 29,
        testament: 'NEW',
        category: 'MIRACLE',
        significance: 'Demonstration of Jesus\' divine power',
        locationId: seaOfGalilee.id
      }
    });

    const lastSupper = await prisma.event.create({
      data: {
        title: 'The Last Supper',
        description: 'Jesus shares final meal with disciples',
        year: 33,
        testament: 'NEW',
        category: 'MINISTRY',
        significance: 'Institution of the Lord\'s Supper',
        persons: {
          connect: [{ id: peter.id }, { id: john.id }]
        }
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

    console.log('✅ Events added');

    // Additional Themes
    await prisma.theme.create({
      data: {
        title: 'The Kingdom of God',
        description: 'God\'s reign and rule over all creation',
        summary: 'The central message of Jesus\' teaching about God\'s sovereign rule',
        category: 'KINGDOM'
      }
    });

    await prisma.theme.create({
      data: {
        title: 'Divine Love',
        description: 'God\'s steadfast love and compassion for humanity',
        summary: 'The core attribute of God\'s character revealed throughout Scripture',
        category: 'LOVE'
      }
    });

    await prisma.theme.create({
      data: {
        title: 'Justice and Righteousness',
        description: 'God\'s standard for human conduct and society',
        summary: 'The foundation for biblical ethics and social responsibility',
        category: 'JUSTICE'
      }
    });

    await prisma.theme.create({
      data: {
        title: 'Prayer and Worship',
        description: 'Communication with God and expressing devotion',
        summary: 'Essential spiritual disciplines for maintaining relationship with God',
        category: 'WORSHIP'
      }
    });

    await prisma.theme.create({
      data: {
        title: 'Prophecy Fulfilled',
        description: 'Old Testament prophecies fulfilled in Christ',
        summary: 'Evidence of God\'s sovereignty and the unity of Scripture',
        category: 'PROPHECY'
      }
    });

    console.log('✅ Themes added');

    // Additional Journey for Exodus
    const moses = await prisma.person.findFirst({ where: { name: 'Moses' } });
    const jesus = await prisma.person.findFirst({ where: { name: 'Jesus' } });

    if (moses) {
      const israeliteExodus = await prisma.journey.create({
        data: {
          title: 'The Exodus from Egypt',
          description: '40-year journey from Egypt to the Promised Land',
          startYear: -1446,
          endYear: -1406,
          distance: 1000,
          duration: '40 years',
          purpose: 'Liberation from slavery',
          personId: moses.id
        }
      });

      // Add journey stops
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
            description: 'Receiving the Ten Commandments'
          },
          {
            journeyId: israeliteExodus.id,
            locationId: jericho.id,
            orderIndex: 3,
            description: 'Entering the Promised Land'
          }
        ]
      });
      console.log('✅ Exodus journey added');
    }

    if (jesus) {
      const jesusMinistry = await prisma.journey.create({
        data: {
          title: 'Jesus\' Ministry Journey',
          description: 'Jesus travels throughout Galilee and Judea',
          startYear: 27,
          endYear: 33,
          duration: '3.5 years',
          purpose: 'Preaching the Kingdom of God',
          personId: jesus.id
        }
      });

      const nazareth = await prisma.location.findFirst({ where: { name: 'Nazareth' } });
      const jerusalem = await prisma.location.findFirst({ where: { name: 'Jerusalem' } });

      if (nazareth && jerusalem) {
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
              description: 'Base of operations'
            },
            {
              journeyId: jesusMinistry.id,
              locationId: jerusalem.id,
              orderIndex: 3,
              description: 'Final week'
            }
          ]
        });
      }
      console.log('✅ Jesus ministry journey added');
    }

    console.log('✅ All additional sample data added successfully');

  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  }
}

seedSimpleData()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });