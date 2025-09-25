import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// Comprehensive biblical footsteps for major persons
const BIBLICAL_FOOTSTEPS: Record<string, any[]> = {
  'Abraham': [
    { year: -2000, location: 'Ur', event: '출생', verse: 'Genesis 11:27-28', description: '갈대아 우르에서 태어남' },
    { year: -1925, location: 'Haran', event: '하란으로 이주', verse: 'Genesis 11:31', description: '아버지 데라와 함께 하란으로 이동' },
    { year: -1921, location: 'Shechem', event: '가나안 도착', verse: 'Genesis 12:6', description: '가나안 땅 세겜에 도착하여 제단을 쌓음' },
    { year: -1920, location: 'Bethel', event: '벧엘에 제단', verse: 'Genesis 12:8', description: '벧엘 동쪽 산으로 이동하여 제단을 쌓음' },
    { year: -1920, location: 'Egypt', event: '애굽 피난', verse: 'Genesis 12:10', description: '기근으로 인해 애굽으로 내려감' },
    { year: -1919, location: 'Bethel', event: '애굽에서 귀환', verse: 'Genesis 13:3', description: '애굽에서 돌아와 벧엘로 귀환' },
    { year: -1918, location: 'Hebron', event: '헤브론 정착', verse: 'Genesis 13:18', description: '마므레 상수리 수풀 근처에 정착' },
    { year: -1913, location: 'Dan', event: '롯 구출', verse: 'Genesis 14:14', description: '단까지 추격하여 롯을 구출' },
    { year: -1913, location: 'Salem', event: '멜기세덱 만남', verse: 'Genesis 14:18', description: '살렘 왕 멜기세덱을 만남' },
    { year: -1900, location: 'Hebron', event: '이삭 출생', verse: 'Genesis 21:2-3', description: '100세에 이삭을 낳음' },
    { year: -1876, location: 'Moriah', event: '이삭 번제', verse: 'Genesis 22:2', description: '모리아 산에서 이삭을 번제로 드리려 함' },
    { year: -1860, location: 'Hebron', event: '사라 사망', verse: 'Genesis 23:2', description: '사라가 헤브론에서 127세에 사망' },
    { year: -1860, location: 'Machpelah', event: '막벨라 굴 구입', verse: 'Genesis 23:19', description: '사라를 위한 매장지 구입' },
    { year: -1825, location: 'Hebron', event: '아브라함 사망', verse: 'Genesis 25:8', description: '175세에 사망하여 막벨라 굴에 매장' },
  ],
  'Moses': [
    { year: -1526, location: 'Egypt', event: '출생', verse: 'Exodus 2:1-2', description: '애굽에서 레위 가문에 태어남' },
    { year: -1526, location: 'Nile River', event: '나일강에 버려짐', verse: 'Exodus 2:3', description: '바로의 딸이 발견하여 양자로 삼음' },
    { year: -1486, location: 'Egypt', event: '애굽인 살해', verse: 'Exodus 2:11-12', description: '히브리인을 때리는 애굽인을 죽임' },
    { year: -1486, location: 'Midian', event: '미디안 도피', verse: 'Exodus 2:15', description: '미디안으로 도망하여 르우엘의 딸들을 도움' },
    { year: -1447, location: 'Horeb', event: '불타는 떨기나무', verse: 'Exodus 3:2', description: '호렙산에서 하나님의 부르심을 받음' },
    { year: -1446, location: 'Egypt', event: '애굽으로 귀환', verse: 'Exodus 4:20', description: '아론과 함께 바로에게 감' },
    { year: -1446, location: 'Rameses', event: '출애굽 시작', verse: 'Exodus 12:37', description: '라암셋에서 출발하여 숙곳으로 이동' },
    { year: -1446, location: 'Red Sea', event: '홍해 도하', verse: 'Exodus 14:22', description: '홍해를 갈라 건너감' },
    { year: -1446, location: 'Marah', event: '마라의 쓴 물', verse: 'Exodus 15:23', description: '쓴 물을 단 물로 만듦' },
    { year: -1446, location: 'Elim', event: '엘림 도착', verse: 'Exodus 15:27', description: '12 샘물과 70 종려나무가 있는 곳' },
    { year: -1446, location: 'Wilderness of Sin', event: '만나와 메추라기', verse: 'Exodus 16:13-14', description: '하나님이 만나와 메추라기를 주심' },
    { year: -1446, location: 'Rephidim', event: '르비딤 전투', verse: 'Exodus 17:8', description: '아말렉과 싸워 이김' },
    { year: -1446, location: 'Mount Sinai', event: '십계명 수령', verse: 'Exodus 19:20', description: '시내산에서 십계명을 받음' },
    { year: -1445, location: 'Mount Sinai', event: '금송아지 사건', verse: 'Exodus 32:19', description: '금송아지를 만든 이스라엘을 징계' },
    { year: -1445, location: 'Kadesh Barnea', event: '정탐꾼 파송', verse: 'Numbers 13:26', description: '12명의 정탐꾼을 가나안에 보냄' },
    { year: -1407, location: 'Kadesh', event: '미리암 사망', verse: 'Numbers 20:1', description: '미리암이 가데스에서 사망' },
    { year: -1407, location: 'Mount Hor', event: '아론 사망', verse: 'Numbers 20:28', description: '호르산에서 아론이 사망' },
    { year: -1406, location: 'Mount Nebo', event: '모세 사망', verse: 'Deuteronomy 34:5', description: '느보산에서 가나안을 바라보며 사망' },
  ],
  'David': [
    { year: -1040, location: 'Bethlehem', event: '출생', verse: '1 Samuel 16:1', description: '베들레헴에서 이새의 아들로 태어남' },
    { year: -1025, location: 'Bethlehem', event: '기름부음', verse: '1 Samuel 16:13', description: '사무엘에게 기름부음을 받음' },
    { year: -1024, location: 'Gibeah', event: '사울 궁전', verse: '1 Samuel 16:21', description: '사울의 무기를 드는 자가 됨' },
    { year: -1023, location: 'Valley of Elah', event: '골리앗 처치', verse: '1 Samuel 17:49', description: '엘라 골짜기에서 골리앗을 물리침' },
    { year: -1020, location: 'Wilderness', event: '광야 도피 시작', verse: '1 Samuel 22:1', description: '사울을 피해 광야로 도망' },
    { year: -1018, location: 'En Gedi', event: '엔게디 동굴', verse: '1 Samuel 24:3', description: '엔게디 동굴에서 사울을 살려줌' },
    { year: -1015, location: 'Ziklag', event: '시글락 정착', verse: '1 Samuel 27:6', description: '블레셋 땅 시글락에 정착' },
    { year: -1010, location: 'Hebron', event: '유다 왕 즉위', verse: '2 Samuel 2:4', description: '헤브론에서 유다 왕이 됨' },
    { year: -1003, location: 'Jerusalem', event: '예루살렘 정복', verse: '2 Samuel 5:7', description: '여부스 족속에게서 예루살렘을 빼앗음' },
    { year: -1002, location: 'Jerusalem', event: '언약궤 운반', verse: '2 Samuel 6:12', description: '언약궤를 예루살렘으로 가져옴' },
    { year: -995, location: 'Jerusalem', event: '성전 건축 계획', verse: '2 Samuel 7:2', description: '성전 건축을 계획하나 거절당함' },
    { year: -985, location: 'Jerusalem', event: '밧세바 사건', verse: '2 Samuel 11:2', description: '밧세바와 간음하고 우리아를 죽임' },
    { year: -982, location: 'Jerusalem', event: '압살롬 반란', verse: '2 Samuel 15:14', description: '아들 압살롬의 반란으로 도피' },
    { year: -982, location: 'Jordan', event: '요단 도하', verse: '2 Samuel 17:22', description: '압살롬을 피해 요단을 건넘' },
    { year: -970, location: 'Jerusalem', event: '솔로몬 즉위', verse: '1 Kings 1:39', description: '솔로몬을 왕으로 세움' },
    { year: -970, location: 'Jerusalem', event: '다윗 사망', verse: '1 Kings 2:10', description: '70세에 예루살렘에서 사망' },
  ],
  'Jesus': [
    { year: -4, location: 'Bethlehem', event: '탄생', verse: 'Luke 2:4-7', description: '베들레헴 마구간에서 태어남' },
    { year: -4, location: 'Jerusalem', event: '성전 봉헌', verse: 'Luke 2:22', description: '생후 40일에 성전에서 봉헌됨' },
    { year: -3, location: 'Egypt', event: '애굽 피난', verse: 'Matthew 2:14', description: '헤롯을 피해 애굽으로 피난' },
    { year: -1, location: 'Nazareth', event: '나사렛 정착', verse: 'Matthew 2:23', description: '애굽에서 돌아와 나사렛에 정착' },
    { year: 8, location: 'Jerusalem', event: '12세 성전 방문', verse: 'Luke 2:42', description: '유월절에 성전에서 교사들과 토론' },
    { year: 27, location: 'Jordan River', event: '세례 받음', verse: 'Matthew 3:13', description: '요단강에서 요한에게 세례받음' },
    { year: 27, location: 'Wilderness', event: '광야 시험', verse: 'Matthew 4:1', description: '40일간 광야에서 시험받음' },
    { year: 27, location: 'Cana', event: '첫 기적', verse: 'John 2:1-11', description: '가나 혼인잔치에서 물을 포도주로 만듦' },
    { year: 27, location: 'Capernaum', event: '가버나움 사역', verse: 'Matthew 4:13', description: '가버나움을 중심으로 사역 시작' },
    { year: 28, location: 'Sea of Galilee', event: '제자 부르심', verse: 'Matthew 4:18-22', description: '갈릴리 바다에서 첫 제자들을 부름' },
    { year: 28, location: 'Mount', event: '산상수훈', verse: 'Matthew 5:1', description: '산에서 팔복을 가르침' },
    { year: 29, location: 'Bethsaida', event: '오병이어', verse: 'John 6:5-13', description: '벳새다에서 5000명을 먹이심' },
    { year: 29, location: 'Caesarea Philippi', event: '베드로 신앙고백', verse: 'Matthew 16:13', description: '가이사랴 빌립보에서 메시아 고백을 받음' },
    { year: 29, location: 'Mount Tabor', event: '변화산 사건', verse: 'Matthew 17:1-2', description: '다볼산에서 변화되심' },
    { year: 30, location: 'Jericho', event: '여리고 통과', verse: 'Luke 19:1', description: '여리고에서 삭개오를 만남' },
    { year: 30, location: 'Bethany', event: '나사로 살림', verse: 'John 11:43-44', description: '베다니에서 나사로를 살림' },
    { year: 30, location: 'Jerusalem', event: '예루살렘 입성', verse: 'Matthew 21:9', description: '종려주일 예루살렘 입성' },
    { year: 30, location: 'Jerusalem', event: '성전 정화', verse: 'Matthew 21:12', description: '성전에서 장사꾼들을 내쫓음' },
    { year: 30, location: 'Upper Room', event: '최후의 만찬', verse: 'Matthew 26:26', description: '다락방에서 마지막 만찬' },
    { year: 30, location: 'Gethsemane', event: '겟세마네 기도', verse: 'Matthew 26:36', description: '겟세마네 동산에서 기도' },
    { year: 30, location: 'Golgotha', event: '십자가 처형', verse: 'Matthew 27:33', description: '골고다에서 십자가에 못박힘' },
    { year: 30, location: 'Jerusalem', event: '부활', verse: 'Matthew 28:6', description: '무덤에서 부활하심' },
    { year: 30, location: 'Mount of Olives', event: '승천', verse: 'Acts 1:9', description: '감람산에서 하늘로 올라가심' },
  ],
  'Paul': [
    { year: 5, location: 'Tarsus', event: '출생', verse: 'Acts 22:3', description: '길리기아 다소에서 태어남' },
    { year: 30, location: 'Jerusalem', event: '스데반 순교 목격', verse: 'Acts 7:58', description: '스데반의 순교를 목격함' },
    { year: 34, location: 'Damascus', event: '다메섹 도상 회심', verse: 'Acts 9:3-4', description: '다메섹 가는 길에서 예수를 만남' },
    { year: 34, location: 'Damascus', event: '아나니아 만남', verse: 'Acts 9:17', description: '아나니아에게 안수받고 시력 회복' },
    { year: 34, location: 'Arabia', event: '아라비아 체류', verse: 'Galatians 1:17', description: '아라비아로 가서 3년간 체류' },
    { year: 37, location: 'Jerusalem', event: '예루살렘 방문', verse: 'Acts 9:26', description: '바나바의 소개로 사도들을 만남' },
    { year: 37, location: 'Tarsus', event: '다소 귀향', verse: 'Acts 9:30', description: '고향 다소로 돌아감' },
    { year: 43, location: 'Antioch', event: '안디옥 사역', verse: 'Acts 11:26', description: '바나바와 함께 안디옥에서 1년간 사역' },
    { year: 46, location: 'Antioch', event: '1차 전도여행 출발', verse: 'Acts 13:3', description: '안디옥에서 첫 전도여행 시작' },
    { year: 46, location: 'Cyprus', event: '키프로스 전도', verse: 'Acts 13:4', description: '살라미스와 바보에서 전도' },
    { year: 47, location: 'Pisidian Antioch', event: '비시디아 안디옥', verse: 'Acts 13:14', description: '비시디아 안디옥에서 설교' },
    { year: 47, location: 'Iconium', event: '이고니온 전도', verse: 'Acts 14:1', description: '이고니온에서 많은 유대인과 헬라인이 믿음' },
    { year: 48, location: 'Lystra', event: '루스드라 치유', verse: 'Acts 14:8-10', description: '나면서 못 걷는 사람을 고침' },
    { year: 48, location: 'Derbe', event: '더베 전도', verse: 'Acts 14:20', description: '더베에서 복음 전파' },
    { year: 49, location: 'Jerusalem', event: '예루살렘 공의회', verse: 'Acts 15:2', description: '할례 문제로 예루살렘 공의회 참석' },
    { year: 50, location: 'Antioch', event: '2차 전도여행 출발', verse: 'Acts 15:40', description: '실라와 함께 2차 여행 시작' },
    { year: 50, location: 'Philippi', event: '빌립보 전도', verse: 'Acts 16:12', description: '루디아와 간수를 개종시킴' },
    { year: 51, location: 'Thessalonica', event: '데살로니가 전도', verse: 'Acts 17:1', description: '3주간 회당에서 설교' },
    { year: 51, location: 'Athens', event: '아테네 설교', verse: 'Acts 17:22', description: '아레오바고에서 철학자들에게 설교' },
    { year: 51, location: 'Corinth', event: '고린도 18개월 체류', verse: 'Acts 18:11', description: '1년 6개월간 고린도에서 사역' },
    { year: 53, location: 'Ephesus', event: '3차 전도여행', verse: 'Acts 19:1', description: '에베소에서 3년간 사역' },
    { year: 56, location: 'Ephesus', event: '에베소 소동', verse: 'Acts 19:23', description: '데메드리오의 소동' },
    { year: 57, location: 'Jerusalem', event: '체포', verse: 'Acts 21:33', description: '성전에서 체포됨' },
    { year: 59, location: 'Caesarea', event: '가이사랴 구금', verse: 'Acts 24:27', description: '2년간 가이사랴에 구금' },
    { year: 59, location: 'Mediterranean', event: '로마 항해', verse: 'Acts 27:1', description: '로마로 호송됨' },
    { year: 60, location: 'Malta', event: '말타 난파', verse: 'Acts 28:1', description: '말타섬에서 3개월 체류' },
    { year: 60, location: 'Rome', event: '로마 도착', verse: 'Acts 28:16', description: '로마에서 2년간 가택연금' },
    { year: 67, location: 'Rome', event: '순교', verse: '2 Timothy 4:6', description: '네로 황제 때 순교' },
  ],
  'John the Baptist': [
    { year: -4, location: 'Judean Hills', event: '출생', verse: 'Luke 1:57', description: '사가랴와 엘리사벳의 아들로 태어남' },
    { year: 26, location: 'Jordan River', event: '세례 사역 시작', verse: 'Matthew 3:1', description: '요단강에서 세례를 다기 시작' },
    { year: 27, location: 'Jordan River', event: '예수 세례', verse: 'Matthew 3:13-17', description: '예수님에게 세례를 주어드림' },
    { year: 29, location: 'Machaerus', event: '순교', verse: 'Matthew 14:10', description: '헤롯 안티파스에게 참수당함' },
  ],
  'Peter': [
    { year: 1, location: 'Bethsaida', event: '출생', verse: 'John 1:44', description: '갈릴리 벳새다에서 태어남' },
    { year: 28, location: 'Sea of Galilee', event: '제자 부름', verse: 'Matthew 4:18-20', description: '갈릴리 바다에서 예수님의 부름을 받음' },
    { year: 29, location: 'Caesarea Philippi', event: '신앙 고백', verse: 'Matthew 16:16', description: '예수님을 메시아로 고백' },
    { year: 30, location: 'Jerusalem', event: '예수 부인', verse: 'Matthew 26:69-75', description: '예수님을 세 번 부인함' },
    { year: 30, location: 'Jerusalem', event: '오순절 설교', verse: 'Acts 2:14', description: '성령 강림 후 첫 번째 설교' },
    { year: 44, location: 'Jerusalem', event: '감옥과 기적적 출옥', verse: 'Acts 12:7-11', description: '헤롯 아그립파에게 감금되었다가 천사의 도움으로 출옥' },
    { year: 50, location: 'Jerusalem', event: '예루살렘 공의회', verse: 'Acts 15:7-11', description: '이방인 선교 문제를 놓고 연설' },
    { year: 64, location: 'Rome', event: '순교', verse: '1 Peter 5:13', description: '로마에서 거꾸로 십자가에 못박혀 순교' },
  ],
  'Mary': [
    { year: -18, location: 'Nazareth', event: '출생', verse: 'Luke 1:26', description: '나사렛에서 태어남' },
    { year: -5, location: 'Nazareth', event: '수태 고지', verse: 'Luke 1:26-38', description: '가브리엘 천사가 예수 수태를 예고' },
    { year: -4, location: 'Bethlehem', event: '예수 출산', verse: 'Luke 2:6-7', description: '베들레헴에서 예수님을 낳음' },
    { year: 30, location: 'Golgotha', event: '십자가 곁에서', verse: 'John 19:25', description: '예수님의 십자가 현장에서 지켜봄' },
    { year: 30, location: 'Jerusalem', event: '성령 강림', verse: 'Acts 1:14', description: '제자들과 함께 성령 강림을 받음' },
  ],
};

// Get detailed timeline with all biblical footsteps
export const getDetailedTimeline = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Get person basic data
    const person = await prisma.person.findUnique({
      where: { id },
      include: {
        birthPlace: true,
        deathPlace: true,
        events: {
          include: {
            location: true,
          },
        },
        journeys: {
          include: {
            stops: {
              include: {
                location: true,
              },
            },
          },
        },
        verses: true,
      },
    });

    if (!person) {
      res.status(404).json({ error: 'Person not found' });
      return;
    }

    // Get biblical footsteps if available
    // Handle name variations
    const nameMapping: Record<string, string> = {
      'Jesus Christ': 'Jesus',
      'Jesus': 'Jesus',
      'Paul the Apostle': 'Paul',
      'Apostle Paul': 'Paul',
      'Paul (Saul)': 'Paul',
      'Paul': 'Paul',
      'Abraham': 'Abraham',
      'Moses': 'Moses',
      'David': 'David',
      'King David': 'David',
      'John the Baptist': 'John the Baptist',
      'Peter (Simon)': 'Peter',
      'Peter': 'Peter',
      'Simon Peter': 'Peter',
      'Mary (Mother of Jesus)': 'Mary',
    };

    const biblicalName = person.name;
    const mappedName = nameMapping[biblicalName] || biblicalName;
    const additionalFootsteps = BIBLICAL_FOOTSTEPS[mappedName] || [];

    console.log(`Looking for footsteps for: ${biblicalName} -> ${mappedName} (found ${additionalFootsteps.length} events)`);

    // Get all locations for mapping
    const locationMap = await getLocationMap();

    // Combine database events with biblical footsteps
    const completeTimeline = [];

    // Add biblical footsteps with location data
    for (const footstep of additionalFootsteps) {
      // First try manual mapping, then database
      let locationData = locationMap[footstep.location];

      if (!locationData) {
        console.warn(`Location not found in mapping: ${footstep.location} for ${biblicalName}`);
      }

      // Always add the footstep with location data
      completeTimeline.push({
        type: 'biblical_event',
        year: footstep.year,
        title: footstep.event,
        description: footstep.description,
        verse: footstep.verse,
        location: {
          name: footstep.location,
          latitude: locationData?.latitude || 31.7683,  // Jerusalem default
          longitude: locationData?.longitude || 35.2137,
          modernName: locationData?.modernName || footstep.location,
        },
      });
    }

    // Add existing database events
    person.events.forEach((event) => {
      if (event.location && event.year) {
        completeTimeline.push({
          type: 'database_event',
          year: event.year,
          title: event.title,
          description: event.description,
          location: {
            id: event.location.id,
            name: event.location.name,
            latitude: event.location.latitude,
            longitude: event.location.longitude,
            modernName: event.location.modernName,
          },
        });
      }
    });

    // Sort by year
    completeTimeline.sort((a, b) => {
      const yearA = a.year || 0;
      const yearB = b.year || 0;
      return yearA - yearB;
    });

    // Calculate statistics
    const stats = {
      totalEvents: completeTimeline.length,
      biblicalEvents: completeTimeline.filter(e => e.type === 'biblical_event').length,
      databaseEvents: completeTimeline.filter(e => e.type === 'database_event').length,
      yearSpan: completeTimeline.length > 0 ? {
        start: completeTimeline[0].year,
        end: completeTimeline[completeTimeline.length - 1].year,
      } : null,
    };

    res.json({
      person: {
        id: person.id,
        name: person.name,
        nameHebrew: person.nameHebrew,
        birthYear: person.birthYear,
        deathYear: person.deathYear,
      },
      timeline: completeTimeline,
      stats,
    });
  } catch (error) {
    console.error('Error fetching detailed timeline:', error);
    res.status(500).json({ error: 'Failed to fetch detailed timeline' });
  }
};

// Helper function to get location coordinates
async function getLocationMap() {
  const locationMap: Record<string, any> = {};

  // First add all manual mappings for biblical locations
  const manualLocations: Record<string, any> = {
    'Ur': { latitude: 30.9626, longitude: 46.1025, modernName: 'Tell el-Muqayyar, Iraq' },
    'Haran': { latitude: 36.8650, longitude: 39.0317, modernName: 'Harran, Turkey' },
    'Shechem': { latitude: 32.2137, longitude: 35.2821, modernName: 'Nablus' },
    'Salem': { latitude: 31.7683, longitude: 35.2137, modernName: 'Jerusalem' },
    'Moriah': { latitude: 31.7767, longitude: 35.2354, modernName: 'Temple Mount, Jerusalem' },
    'Machpelah': { latitude: 31.5246, longitude: 35.1108, modernName: 'Hebron' },
    'Horeb': { latitude: 28.5395, longitude: 33.9751, modernName: 'Mount Sinai' },
    'Mount Sinai': { latitude: 28.5395, longitude: 33.9751, modernName: 'Jebel Musa, Egypt' },
    'Red Sea': { latitude: 29.5469, longitude: 34.9529, modernName: 'Gulf of Suez' },
    'Rameses': { latitude: 30.8074, longitude: 31.8238, modernName: 'Qantir, Egypt' },
    'Marah': { latitude: 29.2000, longitude: 33.0667, modernName: 'Ain Hawarah' },
    'Elim': { latitude: 29.1589, longitude: 33.0856, modernName: 'Wadi Gharandel' },
    'Wilderness of Sin': { latitude: 29.0000, longitude: 33.3333, modernName: 'Debbet er-Ramleh' },
    'Rephidim': { latitude: 28.7247, longitude: 33.8456, modernName: 'Wadi Refayid' },
    'Kadesh Barnea': { latitude: 30.6875, longitude: 34.4947, modernName: 'Ein Qadis' },
    'Kadesh': { latitude: 30.6875, longitude: 34.4947, modernName: 'Ein Qadis' },
    'Mount Hor': { latitude: 30.3172, longitude: 35.4072, modernName: 'Jebel Harun, Jordan' },
    'Mount Nebo': { latitude: 31.7683, longitude: 35.7253, modernName: 'Siyagha, Jordan' },
    'Valley of Elah': { latitude: 31.6903, longitude: 34.9639, modernName: 'Wadi es-Sunt' },
    'Gibeah': { latitude: 31.8239, longitude: 35.2308, modernName: 'Tell el-Ful' },
    'En Gedi': { latitude: 31.4614, longitude: 35.3922, modernName: 'Ein Gedi' },
    'Ziklag': { latitude: 31.3778, longitude: 34.8736, modernName: 'Tell esh-Sharia' },
    'Jordan': { latitude: 31.8567, longitude: 35.5500, modernName: 'Jordan River' },
    'Jordan River': { latitude: 32.3094, longitude: 35.5547, modernName: 'Yardenit' },
    'Cana': { latitude: 32.7469, longitude: 35.3394, modernName: 'Kafr Kanna' },
    'Sea of Galilee': { latitude: 32.8258, longitude: 35.5908, modernName: 'Lake Kinneret' },
    'Capernaum': { latitude: 32.8808, longitude: 35.5753, modernName: 'Tel Hum' },
    'Mount': { latitude: 32.7279, longitude: 35.3658, modernName: 'Mount of Beatitudes' },
    'Bethsaida': { latitude: 32.9097, longitude: 35.6308, modernName: 'Et-Tell' },
    'Caesarea Philippi': { latitude: 33.2483, longitude: 35.6944, modernName: 'Banias' },
    'Mount Tabor': { latitude: 32.6868, longitude: 35.3907, modernName: 'Har Tavor' },
    'Jericho': { latitude: 31.8571, longitude: 35.4442, modernName: 'Ariha' },
    'Bethany': { latitude: 31.7717, longitude: 35.2561, modernName: 'Al-Eizariya' },
    'Upper Room': { latitude: 31.7717, longitude: 35.2292, modernName: 'Mount Zion, Jerusalem' },
    'Gethsemane': { latitude: 31.7794, longitude: 35.2397, modernName: 'Garden of Gethsemane' },
    'Golgotha': { latitude: 31.7786, longitude: 35.2294, modernName: 'Church of the Holy Sepulchre' },
    'Mount of Olives': { latitude: 31.7767, longitude: 35.2428, modernName: 'Har HaZeitim' },
    'Tarsus': { latitude: 36.9177, longitude: 34.8948, modernName: 'Tarsus, Turkey' },
    'Arabia': { latitude: 30.3285, longitude: 35.4444, modernName: 'Petra region' },
    'Antioch': { latitude: 36.2012, longitude: 36.1608, modernName: 'Antakya, Turkey' },
    'Cyprus': { latitude: 35.1264, longitude: 33.4299, modernName: 'Cyprus' },
    'Pisidian Antioch': { latitude: 38.3063, longitude: 31.1891, modernName: 'Yalvaç, Turkey' },
    'Iconium': { latitude: 37.8746, longitude: 32.4932, modernName: 'Konya, Turkey' },
    'Lystra': { latitude: 37.5781, longitude: 32.4534, modernName: 'Hatunsaray, Turkey' },
    'Derbe': { latitude: 37.3489, longitude: 33.3878, modernName: 'Kerti Hüyük, Turkey' },
    'Philippi': { latitude: 41.0136, longitude: 24.2886, modernName: 'Filippoi, Greece' },
    'Thessalonica': { latitude: 40.6401, longitude: 22.9444, modernName: 'Thessaloniki, Greece' },
    'Athens': { latitude: 37.9838, longitude: 23.7275, modernName: 'Athens, Greece' },
    'Corinth': { latitude: 37.9058, longitude: 22.8797, modernName: 'Korinthos, Greece' },
    'Ephesus': { latitude: 37.9493, longitude: 27.3681, modernName: 'Selçuk, Turkey' },
    'Caesarea': { latitude: 32.4989, longitude: 34.8925, modernName: 'Caesarea Maritima' },
    'Malta': { latitude: 35.9375, longitude: 14.3754, modernName: 'Malta' },
    'Rome': { latitude: 41.9028, longitude: 12.4964, modernName: 'Rome, Italy' },
    'Mediterranean': { latitude: 35.0000, longitude: 18.0000, modernName: 'Mediterranean Sea' },
    'Nile River': { latitude: 30.0444, longitude: 31.2357, modernName: 'Cairo, Egypt' },
    'Egypt': { latitude: 30.0444, longitude: 31.2357, modernName: 'Cairo, Egypt' },
    'Wilderness': { latitude: 30.5852, longitude: 34.7668, modernName: 'Negev Desert' },
    'Midian': { latitude: 28.3969, longitude: 34.8613, modernName: 'Northwest Saudi Arabia' },
    'Judean Hills': { latitude: 31.7500, longitude: 35.2000, modernName: 'Judean Hills, Israel' },
    'Machaerus': { latitude: 31.5397, longitude: 35.6653, modernName: 'Mukawir, Jordan' },
  };

  // Add all manual locations first
  Object.keys(manualLocations).forEach(key => {
    locationMap[key] = {
      name: key,
      ...manualLocations[key]
    };
  });

  // Then overlay database locations (they might have more accurate/updated coordinates)
  const dbLocations = await prisma.location.findMany();
  dbLocations.forEach(loc => {
    // Only override if not manually defined, or merge with manual data
    if (!locationMap[loc.name]) {
      locationMap[loc.name] = loc;
    } else {
      // Keep manual coordinates but add any database fields
      locationMap[loc.name] = {
        ...locationMap[loc.name],
        id: loc.id,
        // Prefer database coordinates if available
        latitude: loc.latitude,
        longitude: loc.longitude,
        modernName: loc.modernName || locationMap[loc.name].modernName,
      };
    }

    if (loc.modernName && !locationMap[loc.modernName]) {
      locationMap[loc.modernName] = loc;
    }
  });

  console.log(`Loaded ${Object.keys(locationMap).length} locations (${Object.keys(manualLocations).length} manual, ${dbLocations.length} from database)`);

  return locationMap;
}