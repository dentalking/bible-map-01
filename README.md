# 📖 BibleMap - 성경 인물 지도 서비스

성경 인물들의 생애와 여정을 인터랙티브 지도로 탐험할 수 있는 웹 애플리케이션입니다.

![Bible Map Preview](docs/preview.png)

## ✨ 주요 기능

### 🗺️ 인물별 여정 시각화
- **숫자 마커**: 시간순으로 1, 2, 3... 번호가 매겨진 깔끔한 마커
- **색상 구분**: 시작(녹색), 중간(파란색), 종료(빨간색)으로 직관적 표시
- **중복 위치 처리**: 같은 장소의 여러 이벤트를 원형으로 배치하여 모두 표시

### ⏱️ 타임라인 모드
- 인물의 생애를 시간 순서대로 재생
- 슬라이더로 특정 시점으로 이동
- 각 이벤트의 상세 정보 표시

### 🎨 다양한 지도 스타일
- 7가지 Mapbox 스타일 (거리, 위성, 라이트, 다크, 아웃도어, 위성(순수), 깔끔)
- **깔끔 모드**: 불필요한 지명을 제거한 깨끗한 지도

### 📊 현재 지원 인물 (8명)
- **구약**: 아브라함, 모세, 다윗
- **신약**: 예수, 바울, 베드로, 세례 요한, 마리아

## 🚀 시작하기

### 필수 요구사항
- Node.js 18.0 이상
- Docker & Docker Compose
- Mapbox 계정 (무료 가입 가능)

### 1. 프로젝트 클론
```bash
git clone https://github.com/yourusername/bible-map-01.git
cd bible-map-01
```

### 2. 환경 변수 설정

#### Frontend (.env)
`biblemap/frontend/.env` 파일 생성:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

#### Backend (.env)
`biblemap/backend/.env` 파일 생성:
```env
DATABASE_URL=postgresql://postgres:postgres@db:5432/biblemap
NODE_ENV=development
PORT=4000
```

### 3. Mapbox 토큰 발급
1. [Mapbox](https://www.mapbox.com/) 가입
2. Account → Tokens에서 Default public token 복사
3. Frontend .env 파일에 추가

### 4. Docker로 실행
```bash
# 프로젝트 루트에서
docker-compose up -d

# 데이터베이스 초기화 (첫 실행 시)
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed
```

### 5. 접속
- 웹사이트: http://localhost:3001
- API 서버: http://localhost:4000
- Prisma Studio: http://localhost:5555

## 🛠️ 기술 스택

### Frontend
- **Next.js 15**: React 프레임워크
- **TypeScript**: 타입 안전성
- **Mapbox GL JS**: 인터랙티브 지도
- **Tailwind CSS**: 스타일링

### Backend
- **Node.js + Express**: API 서버
- **Prisma ORM**: 데이터베이스 ORM
- **PostgreSQL + PostGIS**: 지리 데이터 저장
- **TypeScript**: 타입 안전성

### Infrastructure
- **Docker Compose**: 컨테이너 오케스트레이션
- **Nginx**: 리버스 프록시

## 📁 프로젝트 구조
```
bible-map-01/
├── biblemap/
│   ├── frontend/         # Next.js 프론트엔드
│   │   ├── src/
│   │   │   ├── app/      # 페이지 라우팅
│   │   │   ├── components/
│   │   │   │   └── maps/ # 지도 컴포넌트
│   │   │   └── lib/      # API 클라이언트
│   │   └── public/
│   └── backend/          # Express 백엔드
│       ├── src/
│       │   ├── controllers/
│       │   ├── routes/
│       │   └── server.ts
│       └── prisma/       # DB 스키마 & 시드
├── docker-compose.yml
└── README.md
```

## 🎯 주요 개선 사항

### v1.0 (최신)
- ✅ 인물 중심 서비스로 전면 개편
- ✅ 숫자 기반 마커 시스템
- ✅ 중복 위치 문제 해결 (원형 배치)
- ✅ 라벨 필터링 (깔끔 모드)
- ✅ 타임라인 애니메이션
- ✅ 60개 성경 지역 데이터베이스

## 📝 API 엔드포인트

```
GET /api/persons                     # 인물 목록
GET /api/persons/:id                 # 인물 상세
GET /api/persons/:id/timeline/detailed  # 인물 여정 (상세)
GET /api/locations                   # 지역 목록
```

## 🐛 알려진 이슈
- 일부 고대 지명의 현대 좌표가 부정확할 수 있음
- 모바일 반응형 디자인 개선 필요

## 🤝 기여하기
1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 라이선스
MIT License

## 💬 문의
질문이나 피드백이 있으시면 Issues 탭에 남겨주세요!

---
Made with ❤️ for Bible study enthusiasts# Trigger deployment for backend root directory fix
