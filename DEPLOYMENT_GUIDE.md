# 🚀 배포 가이드 - Vercel + Railway

이 가이드는 BibleMap을 온라인으로 배포하는 방법을 안내합니다.

## 📋 전체 구조
- **Frontend**: Vercel (무료)
- **Backend + DB**: Railway (무료 크레딧 $5/월)
- **총 예상 비용**: 무료 ~ $5/월

## 🛤️ Railway 배포 (Backend + PostgreSQL)

### 1단계: Railway 계정 생성
1. [Railway.app](https://railway.app) 접속
2. GitHub으로 가입
3. 무료 크레딧 $5 확인

### 2단계: PostgreSQL 데이터베이스 생성
```bash
# Railway CLI 설치 (선택)
npm install -g @railway/cli

# 또는 웹에서 진행
```

1. New Project → Deploy PostgreSQL
2. PostgreSQL 서비스 생성 완료
3. Variables 탭에서 DATABASE_URL 복사

### 3단계: Backend 서비스 배포
1. New Service → GitHub Repo 선택
2. `biblemap/backend` 디렉토리 선택
3. Environment Variables 설정:
```env
DATABASE_URL=postgresql://[복사한 URL]
NODE_ENV=production
PORT=4000
CORS_ORIGIN=https://your-app.vercel.app
```

4. Settings → Root Directory: `/biblemap/backend`
5. Deploy 클릭

### 4단계: 데이터베이스 초기화
Railway Shell에서:
```bash
npm run migrate
npm run seed
```

### 🎯 Railway 배포 URL
```
https://biblemap-backend-production.up.railway.app
```

---

## ▲ Vercel 배포 (Frontend)

### 1단계: Vercel 계정 생성
1. [Vercel.com](https://vercel.com) 접속
2. GitHub으로 가입
3. Hobby Plan (무료) 선택

### 2단계: 프로젝트 Import
1. New Project → Import Git Repository
2. GitHub 리포지토리 선택
3. Framework Preset: Next.js (자동 감지)
4. Root Directory: `biblemap/frontend`

### 3단계: 환경 변수 설정
Environment Variables에 추가:
```
NEXT_PUBLIC_API_URL=https://biblemap-backend-production.up.railway.app
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoiXXXXXXXXXXXXXXXXXXX
```

### 4단계: 배포
1. Deploy 클릭
2. 2-3분 대기
3. 배포 완료!

### 🎯 Vercel 배포 URL
```
https://bible-map.vercel.app
```

---

## 🔧 배포 후 설정

### CORS 설정 업데이트
Backend의 `app.ts`에서 CORS origin 업데이트:
```typescript
app.use(cors({
  origin: [
    'http://localhost:3001',
    'https://bible-map.vercel.app', // Vercel URL
  ],
  credentials: true
}));
```

### 환경 변수 체크리스트

#### Railway (Backend)
- [x] DATABASE_URL
- [x] NODE_ENV=production
- [x] PORT
- [x] CORS_ORIGIN

#### Vercel (Frontend)
- [x] NEXT_PUBLIC_API_URL
- [x] NEXT_PUBLIC_MAPBOX_TOKEN

---

## 📱 친구에게 공유하기

배포 완료 후 친구에게 보낼 메시지:

```
🎉 BibleMap 온라인 배포 완료!

🌐 사이트: https://bible-map.vercel.app
📱 모바일에서도 접속 가능!

✨ 주요 기능:
• 8명의 성경 인물 여정 탐험
• 시간순 번호 마커 (1→2→3...)
• 타임라인 애니메이션
• 7가지 지도 스타일

피드백 환영합니다! 😊
```

---

## 🐛 트러블슈팅

### Railway 이슈
```bash
# 로그 확인
railway logs

# 재배포
railway up

# 데이터베이스 리셋
railway run npm run migrate:reset
railway run npm run seed
```

### Vercel 이슈
```bash
# 로그 확인
vercel logs

# 재배포
vercel --prod

# 환경 변수 확인
vercel env ls
```

### 일반적인 문제
1. **CORS 에러**: Backend CORS 설정 확인
2. **DB 연결 실패**: DATABASE_URL 확인
3. **Mapbox 지도 안 나옴**: 토큰 확인
4. **빌드 실패**: Node 버전 확인 (18+)

---

## 💰 비용 관리

### 무료 한도
- **Vercel**: 100GB 대역폭/월
- **Railway**: $5 크레딧/월
- **Mapbox**: 50,000 맵 로드/월

### 비용 절감 팁
1. Railway는 사용하지 않을 때 일시정지
2. Mapbox 스타일 캐싱 활용
3. 이미지 최적화로 대역폭 절약

---

## 🔐 보안 체크리스트
- [ ] 환경 변수 노출 방지
- [ ] CORS 설정 제한
- [ ] Rate limiting 설정
- [ ] SQL Injection 방지 (Prisma ORM)
- [ ] Mapbox 토큰 도메인 제한

---

## 📈 모니터링
- **Vercel Analytics**: 자동 포함
- **Railway Metrics**: 대시보드에서 확인
- **Mapbox Statistics**: Mapbox 계정에서 확인

---

## 🎯 배포 완료!
축하합니다! 이제 BibleMap이 온라인에서 실행됩니다.

문제가 있으면 Issues에 남겨주세요!