# 🚂 Railway 통합 배포 가이드

Railway에서 Frontend, Backend, PostgreSQL을 모두 배포하는 방법입니다.

## 🎯 왜 Railway만 사용하나요?

- **간편함**: 한 곳에서 모든 서비스 관리
- **비용 효율**: $5 무료 크레딧으로 충분
- **내부 네트워킹**: 서비스 간 빠른 통신
- **통합 모니터링**: 모든 로그를 한 곳에서 확인

## 📋 배포 구조

```
Railway Project (bible-map)
├── 🌐 Frontend (Next.js)
├── ⚙️ Backend (Express)
└── 🗄️ Database (PostgreSQL)
```

## 🚀 배포 단계별 가이드

### 1단계: Railway 프로젝트 생성

1. [Railway.app](https://railway.app) 접속
2. **New Project** 클릭
3. **Empty Project** 선택
4. 프로젝트 이름: `bible-map`

### 2단계: PostgreSQL 추가

1. 프로젝트 대시보드에서 **+ New**
2. **Database** → **Add PostgreSQL**
3. 자동으로 생성된 `DATABASE_URL` 확인

### 3단계: Backend 서비스 배포

1. **+ New** → **GitHub Repo**
2. 리포지토리 선택
3. **Settings** 설정:
   ```
   Root Directory: /biblemap/backend
   Build Command: npm install && npx prisma generate
   Start Command: npm run migrate && npm run seed && npm start
   ```

4. **Variables** 추가:
   ```env
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   NODE_ENV=production
   PORT=4000
   CORS_ORIGIN=https://${{RAILWAY_PUBLIC_DOMAIN}}
   ```

5. **Generate Domain** 클릭하여 도메인 생성

### 4단계: Frontend 서비스 배포

1. **+ New** → **GitHub Repo** (같은 리포지토리)
2. **Settings** 설정:
   ```
   Root Directory: /biblemap/frontend
   Build Command: npm install && npm run build
   Start Command: npm start
   Watch Paths: /biblemap/frontend/**
   ```

3. **Variables** 추가:
   ```env
   NEXT_PUBLIC_API_URL=https://${{backend.RAILWAY_PUBLIC_DOMAIN}}
   NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
   PORT=3000
   ```

4. **Generate Domain** 클릭

### 5단계: 서비스 연결 설정

Railway 내부 네트워킹 사용:
```env
# Frontend → Backend (내부)
NEXT_PUBLIC_API_URL=http://backend.railway.internal:4000

# Backend → Database (자동 연결)
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

## 🔧 배포 확인

### 상태 체크
1. 각 서비스의 **Deployments** 탭 확인
2. 모든 서비스가 `Active` 상태인지 확인
3. **Logs** 탭에서 에러 확인

### 테스트 URL
- Frontend: `https://bible-map-frontend.up.railway.app`
- Backend API: `https://bible-map-backend.up.railway.app/api`
- Health Check: `https://bible-map-backend.up.railway.app/health`

## 📱 친구에게 공유

```
🎉 BibleMap 배포 완료!

🌐 접속 링크: https://bible-map-frontend.up.railway.app

✨ 성경 인물들의 여정을 지도로 탐험해보세요!
- 8명의 주요 인물 (아브라함, 모세, 다윗, 예수 등)
- 시간순 번호 마커
- 타임라인 애니메이션
- 7가지 지도 스타일

피드백 환영합니다! 😊
```

## 💰 비용 관리

### 무료 플랜 한계
- CPU: 500 실행 시간/월
- 메모리: 512MB RAM
- 대역폭: 100GB/월
- 무료 크레딧: $5

### 최적화 팁
1. **자동 슬립 모드**: 트래픽이 없을 때 자동으로 절전
2. **리소스 제한 설정**:
   ```toml
   [deploy]
   numReplicas = 1
   sleepTimeout = 300  # 5분 후 슬립
   ```

3. **데이터베이스 크기 관리**: 불필요한 로그 정기 삭제

## 🛠️ 트러블슈팅

### 일반적인 문제

#### 1. Build 실패
```bash
# package.json에 build 스크립트 확인
"scripts": {
  "build": "next build"  # Frontend
  "build": "tsc"         # Backend
}
```

#### 2. 환경 변수 누락
- Railway 대시보드 → Variables 탭 확인
- 모든 `NEXT_PUBLIC_` 변수가 설정되어 있는지 확인

#### 3. 데이터베이스 연결 실패
```bash
# Railway CLI로 확인
railway logs --service=backend

# 데이터베이스 재시작
railway restart --service=postgres
```

#### 4. CORS 에러
Backend 환경 변수 확인:
```env
CORS_ORIGIN=https://bible-map-frontend.up.railway.app
```

## 🔄 업데이트 방법

### 자동 배포 (추천)
1. GitHub에 push하면 자동 배포
2. Railway가 변경사항 감지하고 재배포

### 수동 배포
```bash
# Railway CLI 사용
railway up --service=frontend
railway up --service=backend
```

## 📊 모니터링

### Railway 대시보드
- **Metrics**: CPU, 메모리, 네트워크 사용량
- **Logs**: 실시간 로그 스트리밍
- **Deployments**: 배포 히스토리

### 사용량 알림 설정
1. Settings → Notifications
2. Usage alerts 활성화
3. 80% 도달 시 이메일 알림

## 🎯 배포 체크리스트

- [ ] GitHub 리포지토리 생성 및 푸시
- [ ] Railway 프로젝트 생성
- [ ] PostgreSQL 데이터베이스 추가
- [ ] Backend 서비스 배포
- [ ] Frontend 서비스 배포
- [ ] 환경 변수 설정
- [ ] 도메인 생성
- [ ] CORS 설정 확인
- [ ] 테스트 및 검증
- [ ] 친구에게 링크 공유

## 🚀 완료!

축하합니다! BibleMap이 Railway에서 실행 중입니다.

**접속 URL**: https://bible-map-frontend.up.railway.app

문제가 있으면 Railway 대시보드의 Logs를 확인하세요!