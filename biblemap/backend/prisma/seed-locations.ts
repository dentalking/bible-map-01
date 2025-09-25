import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Biblical locations with coordinates
interface LocationData {
  name: string;
  nameHebrew?: string;
  nameGreek?: string;
  latitude: number;
  longitude: number;
  modernName?: string;
  description: string;
  significance: string;
}

const BIBLICAL_LOCATIONS: LocationData[] = [
  { name: 'Ur', nameHebrew: 'אוּר', latitude: 30.9626, longitude: 46.1025, modernName: 'Tell el-Muqayyar, Iraq', description: 'Ancient city in Mesopotamia', significance: 'Birthplace of Abraham' },
  { name: 'Haran', nameHebrew: 'חָרָן', latitude: 36.8650, longitude: 39.0317, modernName: 'Harran, Turkey', description: 'Ancient city in upper Mesopotamia', significance: 'Where Abraham lived before going to Canaan' },
  { name: 'Shechem', nameHebrew: 'שְׁכֶם', latitude: 32.2137, longitude: 35.2821, modernName: 'Nablus', description: 'Ancient Canaanite city', significance: 'First place Abraham camped in Canaan' },
  { name: 'Salem', nameHebrew: 'שָׁלֵם', latitude: 31.7683, longitude: 35.2137, modernName: 'Jerusalem', description: 'Ancient name for Jerusalem', significance: 'Where Abraham met Melchizedek' },
  { name: 'Moriah', nameHebrew: 'מֹרִיָּה', latitude: 31.7767, longitude: 35.2354, modernName: 'Temple Mount, Jerusalem', description: 'Mountain in Jerusalem', significance: 'Where Abraham offered Isaac' },
  { name: 'Machpelah', nameHebrew: 'מַכְפֵּלָה', latitude: 31.5246, longitude: 35.1108, modernName: 'Hebron', description: 'Cave of the Patriarchs', significance: 'Burial place of Abraham, Sarah, Isaac, Rebecca, Jacob, and Leah' },
  { name: 'Hebron', nameHebrew: 'חֶבְרוֹן', latitude: 31.5246, longitude: 35.1108, modernName: 'Al-Khalil', description: 'Ancient city in Judah', significance: 'Where David was anointed king' },
  { name: 'Dan', nameHebrew: 'דָּן', latitude: 33.2486, longitude: 35.6525, modernName: 'Tel Dan', description: 'Northernmost city of ancient Israel', significance: 'Northern boundary of Israel' },
  { name: 'Horeb', nameHebrew: 'חֹרֵב', latitude: 28.5395, longitude: 33.9751, modernName: 'Mount Sinai', description: 'Mountain of God', significance: 'Where Moses received the burning bush vision' },
  { name: 'Mount Sinai', nameHebrew: 'הַר סִינַי', latitude: 28.5395, longitude: 33.9751, modernName: 'Jebel Musa, Egypt', description: 'Mountain in Sinai Peninsula', significance: 'Where Moses received the Ten Commandments' },
  { name: 'Red Sea', nameHebrew: 'יַם סוּף', latitude: 29.5469, longitude: 34.9529, modernName: 'Gulf of Suez', description: 'Sea between Egypt and Sinai', significance: 'Where Israelites crossed during the Exodus' },
  { name: 'Rameses', nameHebrew: 'רַעְמְסֵס', latitude: 30.8074, longitude: 31.8238, modernName: 'Qantir, Egypt', description: 'City in ancient Egypt', significance: 'Starting point of the Exodus' },
  { name: 'Marah', nameHebrew: 'מָרָה', latitude: 29.2000, longitude: 33.0667, modernName: 'Ain Hawarah', description: 'Oasis in the wilderness', significance: 'Where bitter water was made sweet' },
  { name: 'Elim', nameHebrew: 'אֵילִם', latitude: 29.1589, longitude: 33.0856, modernName: 'Wadi Gharandel', description: 'Oasis with twelve springs', significance: 'Rest stop during the Exodus' },
  { name: 'Wilderness of Sin', nameHebrew: 'מִדְבַּר סִין', latitude: 29.0000, longitude: 33.3333, modernName: 'Debbet er-Ramleh', description: 'Desert between Elim and Sinai', significance: 'Where manna was first given' },
  { name: 'Rephidim', nameHebrew: 'רְפִידִים', latitude: 28.7247, longitude: 33.8456, modernName: 'Wadi Refayid', description: 'Desert oasis', significance: 'Where Moses struck the rock for water' },
  { name: 'Kadesh Barnea', nameHebrew: 'קָדֵשׁ בַּרְנֵעַ', latitude: 30.6875, longitude: 34.4947, modernName: 'Ein Qadis', description: 'Oasis in the Negev', significance: 'Where spies were sent to Canaan' },
  { name: 'Kadesh', nameHebrew: 'קָדֵשׁ', latitude: 30.6875, longitude: 34.4947, modernName: 'Ein Qadis', description: 'Desert oasis', significance: 'Where Miriam died' },
  { name: 'Mount Hor', nameHebrew: 'הֹר הָהָר', latitude: 30.3172, longitude: 35.4072, modernName: 'Jebel Harun, Jordan', description: 'Mountain near Petra', significance: 'Where Aaron died' },
  { name: 'Mount Nebo', nameHebrew: 'הַר נְבוֹ', latitude: 31.7683, longitude: 35.7253, modernName: 'Siyagha, Jordan', description: 'Mountain overlooking the Promised Land', significance: 'Where Moses died' },
  { name: 'Valley of Elah', nameHebrew: 'עֵמֶק הָאֵלָה', latitude: 31.6903, longitude: 34.9639, modernName: 'Wadi es-Sunt', description: 'Valley in the Shephelah', significance: 'Where David defeated Goliath' },
  { name: 'Gibeah', nameHebrew: 'גִּבְעָה', latitude: 31.8239, longitude: 35.2308, modernName: 'Tell el-Ful', description: "Saul's hometown", significance: 'First capital of united Israel' },
  { name: 'En Gedi', nameHebrew: 'עֵין גֶּדִי', latitude: 31.4614, longitude: 35.3922, modernName: 'Ein Gedi', description: 'Oasis near the Dead Sea', significance: 'Where David hid from Saul' },
  { name: 'Ziklag', nameHebrew: 'צִקְלַג', latitude: 31.3778, longitude: 34.8736, modernName: 'Tell esh-Sharia', description: 'Philistine city', significance: "David's city during exile" },
  { name: 'Jordan', nameHebrew: 'יַרְדֵּן', latitude: 31.8567, longitude: 35.5500, modernName: 'Jordan River', description: 'Major river in the region', significance: 'Crossed by Israelites entering Canaan' },
  { name: 'Jordan River', nameHebrew: 'נְהַר הַיַּרְדֵּן', latitude: 32.3094, longitude: 35.5547, modernName: 'Yardenit', description: 'River flowing to Dead Sea', significance: 'Where Jesus was baptized' },
  { name: 'Cana', nameHebrew: 'קָנָה', latitude: 32.7469, longitude: 35.3394, modernName: 'Kafr Kanna', description: 'Village in Galilee', significance: "Jesus' first miracle (water to wine)" },
  { name: 'Capernaum', nameHebrew: 'כְּפַר נַחוּם', latitude: 32.8808, longitude: 35.5753, modernName: 'Tel Hum', description: 'Fishing village on Sea of Galilee', significance: "Jesus' ministry headquarters" },
  { name: 'Mount of Beatitudes', nameHebrew: 'הַר הַאושר', latitude: 32.7279, longitude: 35.3658, modernName: 'Mount of Beatitudes', description: 'Hill overlooking Sea of Galilee', significance: 'Where Jesus gave the Sermon on the Mount' },
  { name: 'Bethsaida', nameHebrew: 'בֵּית צַיְדָה', latitude: 32.9097, longitude: 35.6308, modernName: 'Et-Tell', description: 'Fishing town', significance: 'Home of Peter, Andrew, and Philip' },
  { name: 'Caesarea Philippi', nameHebrew: 'קֵיסָרְיָה פִילִיפִּי', latitude: 33.2483, longitude: 35.6944, modernName: 'Banias', description: 'City at foot of Mount Hermon', significance: "Peter's confession of Christ" },
  { name: 'Mount Tabor', nameHebrew: 'הַר תָּבוֹר', latitude: 32.6868, longitude: 35.3907, modernName: 'Har Tavor', description: 'Mountain in Lower Galilee', significance: 'Traditional site of Transfiguration' },
  { name: 'Jericho', nameHebrew: 'יְרִיחוֹ', latitude: 31.8571, longitude: 35.4442, modernName: 'Ariha', description: 'Ancient city near Jordan River', significance: 'First city conquered by Joshua' },
  { name: 'Bethany', nameHebrew: 'בֵּית עַנְיָה', latitude: 31.7717, longitude: 35.2561, modernName: 'Al-Eizariya', description: 'Village near Jerusalem', significance: 'Home of Lazarus, Mary, and Martha' },
  { name: 'Upper Room', nameHebrew: 'עֲלִיַּת הַגַּג', latitude: 31.7717, longitude: 35.2292, modernName: 'Mount Zion, Jerusalem', description: 'Room in Jerusalem', significance: 'Site of Last Supper' },
  { name: 'Gethsemane', nameHebrew: 'גַּת שְׁמָנִים', latitude: 31.7794, longitude: 35.2397, modernName: 'Garden of Gethsemane', description: 'Garden at foot of Mount of Olives', significance: "Jesus' prayer before arrest" },
  { name: 'Golgotha', nameHebrew: 'גֻּלְגֹּלְתָּא', latitude: 31.7786, longitude: 35.2294, modernName: 'Church of the Holy Sepulchre', description: 'Hill outside Jerusalem', significance: "Jesus' crucifixion site" },
  { name: 'Mount of Olives', nameHebrew: 'הַר הַזֵּיתִים', latitude: 31.7767, longitude: 35.2428, modernName: 'Har HaZeitim', description: 'Mountain east of Jerusalem', significance: "Jesus' ascension site" },
  { name: 'Tarsus', nameGreek: 'Ταρσός', latitude: 36.9177, longitude: 34.8948, modernName: 'Tarsus, Turkey', description: 'City in Cilicia', significance: "Paul's birthplace" },
  { name: 'Arabia', nameHebrew: 'עֲרָב', latitude: 30.3285, longitude: 35.4444, modernName: 'Petra region', description: 'Desert region', significance: "Paul's retreat after conversion" },
  { name: 'Antioch', nameGreek: 'Ἀντιόχεια', latitude: 36.2012, longitude: 36.1608, modernName: 'Antakya, Turkey', description: 'Major city in Syria', significance: 'First Gentile church, believers first called Christians' },
  { name: 'Cyprus', nameGreek: 'Κύπρος', latitude: 35.1264, longitude: 33.4299, modernName: 'Cyprus', description: 'Mediterranean island', significance: "Paul's first missionary journey" },
  { name: 'Pisidian Antioch', nameGreek: 'Ἀντιόχεια τῆς Πισιδίας', latitude: 38.3063, longitude: 31.1891, modernName: 'Yalvaç, Turkey', description: 'City in Pisidia', significance: "Paul's first recorded sermon" },
  { name: 'Iconium', nameGreek: 'Ἰκόνιον', latitude: 37.8746, longitude: 32.4932, modernName: 'Konya, Turkey', description: 'City in Lycaonia', significance: 'Paul and Barnabas preached here' },
  { name: 'Lystra', nameGreek: 'Λύστρα', latitude: 37.5781, longitude: 32.4534, modernName: 'Hatunsaray, Turkey', description: 'City in Lycaonia', significance: 'Timothy\'s hometown, Paul stoned here' },
  { name: 'Derbe', nameGreek: 'Δέρβη', latitude: 37.3489, longitude: 33.3878, modernName: 'Kerti Hüyük, Turkey', description: 'City in Lycaonia', significance: 'Paul made many disciples here' },
  { name: 'Philippi', nameGreek: 'Φίλιπποι', latitude: 41.0136, longitude: 24.2886, modernName: 'Filippoi, Greece', description: 'City in Macedonia', significance: 'First European church, Lydia converted' },
  { name: 'Thessalonica', nameGreek: 'Θεσσαλονίκη', latitude: 40.6401, longitude: 22.9444, modernName: 'Thessaloniki, Greece', description: 'Capital of Macedonia', significance: 'Paul established church here' },
  { name: 'Athens', nameGreek: 'Ἀθῆναι', latitude: 37.9838, longitude: 23.7275, modernName: 'Athens, Greece', description: 'Center of Greek philosophy', significance: "Paul's sermon on Mars Hill" },
  { name: 'Corinth', nameGreek: 'Κόρινθος', latitude: 37.9058, longitude: 22.8797, modernName: 'Korinthos, Greece', description: 'Major commercial city', significance: 'Paul spent 18 months here' },
  { name: 'Ephesus', nameGreek: 'Ἔφεσος', latitude: 37.9493, longitude: 27.3681, modernName: 'Selçuk, Turkey', description: 'Major city in Asia Minor', significance: 'Paul spent 3 years here, riot over Diana' },
  { name: 'Caesarea', nameHebrew: 'קֵיסָרְיָה', latitude: 32.4989, longitude: 34.8925, modernName: 'Caesarea Maritima', description: 'Roman administrative center', significance: 'Paul imprisoned here for 2 years' },
  { name: 'Malta', nameGreek: 'Μελίτη', latitude: 35.9375, longitude: 14.3754, modernName: 'Malta', description: 'Mediterranean island', significance: 'Paul shipwrecked here' },
  { name: 'Rome', nameGreek: 'Ῥώμη', latitude: 41.9028, longitude: 12.4964, modernName: 'Rome, Italy', description: 'Capital of Roman Empire', significance: 'Paul imprisoned and martyred here' },
  { name: 'Mediterranean', nameHebrew: 'הַיָּם הַגָּדוֹל', latitude: 35.0000, longitude: 18.0000, modernName: 'Mediterranean Sea', description: 'The Great Sea', significance: 'Major travel route for apostles' },
  { name: 'Nile River', nameHebrew: 'יְאֹר', latitude: 30.0444, longitude: 31.2357, modernName: 'Cairo, Egypt', description: 'Major river in Egypt', significance: 'Moses hidden here as baby' },
  { name: 'Egypt', nameHebrew: 'מִצְרַיִם', latitude: 30.0444, longitude: 31.2357, modernName: 'Cairo, Egypt', description: 'Land of the Pharaohs', significance: 'Israel enslaved here, Jesus fled here' },
  { name: 'Wilderness', nameHebrew: 'מִדְבָּר', latitude: 30.5852, longitude: 34.7668, modernName: 'Negev Desert', description: 'Desert region', significance: 'Israel wandered 40 years' },
  { name: 'Midian', nameHebrew: 'מִדְיָן', latitude: 28.3969, longitude: 34.8613, modernName: 'Northwest Saudi Arabia', description: 'Desert region east of Gulf of Aqaba', significance: 'Where Moses fled after killing Egyptian' },
];

async function seedLocations() {
  console.log('🌍 Starting to seed biblical locations...');

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const location of BIBLICAL_LOCATIONS) {
    try {
      // Check if location already exists
      const existing = await prisma.location.findFirst({
        where: {
          OR: [
            { name: location.name },
            { modernName: location.modernName },
            {
              AND: [
                { latitude: location.latitude },
                { longitude: location.longitude },
              ],
            },
          ],
        },
      });

      if (existing) {
        // Update existing location with any missing data
        await prisma.location.update({
          where: { id: existing.id },
          data: {
            nameHebrew: location.nameHebrew || existing.nameHebrew,
            nameGreek: location.nameGreek || existing.nameGreek,
            modernName: location.modernName || existing.modernName,
            description: location.description || existing.description,
            significance: location.significance || existing.significance,
            // Keep existing coordinates if they're different (might be more accurate)
            latitude: existing.latitude,
            longitude: existing.longitude,
          },
        });
        console.log(`✅ Updated: ${location.name}`);
        updated++;
      } else {
        // Create new location
        await prisma.location.create({
          data: location,
        });
        console.log(`✅ Created: ${location.name}`);
        created++;
      }
    } catch (error) {
      console.error(`❌ Error with ${location.name}:`, error);
      skipped++;
    }
  }

  console.log(`
📊 Seed completed:
   - Created: ${created} locations
   - Updated: ${updated} locations
   - Skipped: ${skipped} locations
   - Total: ${BIBLICAL_LOCATIONS.length} locations processed
  `);
}

seedLocations()
  .catch((error) => {
    console.error('Error seeding locations:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });