# 🚀 Railway CLI 배포 가이드

## 1️⃣ Railway CLI 로그인

터미널에서 직접 실행하세요:
```bash
railway login
```
브라우저가 열리면 Railway 계정으로 로그인하세요.

## 2️⃣ 프로젝트 연결

```bash
# 프로젝트 루트 디렉토리로 이동
cd /Users/heerackbang/Desktop/bible-map-01

# Railway 프로젝트 연결
railway link
```

프로젝트 목록이 나타나면 `bible-map` 프로젝트를 선택하세요.

## 3️⃣ 서비스별 배포

### Backend 배포:
```bash
# Backend 디렉토리로 이동
cd biblemap/backend

# Backend 서비스 선택 및 배포
railway service backend
railway up
```

### Frontend 배포:
```bash
# Frontend 디렉토리로 이동
cd ../frontend

# Frontend 서비스 선택 및 배포
railway service frontend
railway up
```

## 4️⃣ 환경 변수 설정

### Backend 환경 변수:
```bash
railway service backend
railway variables set NODE_ENV=production
railway variables set PORT=4000
railway variables set CORS_ORIGIN=https://${{RAILWAY_PUBLIC_DOMAIN}}
```

### Frontend 환경 변수:
```bash
railway service frontend
railway variables set PORT=3000
railway variables set NEXT_PUBLIC_API_URL=https://[backend-url].railway.app
railway variables set NEXT_PUBLIC_MAPBOX_TOKEN=[your-mapbox-token]
```

## 5️⃣ 배포 상태 확인

```bash
# 프로젝트 상태 확인
railway status

# 로그 확인
railway logs
```

## 6️⃣ 문제 해결

### "Service not found" 에러:
```bash
# 서비스 목록 확인
railway service

# 서비스가 없으면 생성
railway service create backend
railway service create frontend
```

### Root Directory 설정:
```bash
# Backend 서비스
railway service backend
railway variables set RAILWAY_ROOT_DIRECTORY=biblemap/backend

# Frontend 서비스
railway service frontend
railway variables set RAILWAY_ROOT_DIRECTORY=biblemap/frontend
```

## 📝 전체 스크립트

다음 명령어들을 순서대로 실행하세요:

```bash
# 1. 로그인
railway login

# 2. 프로젝트 연결
cd /Users/heerackbang/Desktop/bible-map-01
railway link

# 3. Backend 배포
cd biblemap/backend
railway service backend
railway up

# 4. Frontend 배포
cd ../frontend
railway service frontend
railway up

# 5. 상태 확인
railway status
```

---

⚠️ **주의**: Mapbox 토큰을 실제 값으로 교체하는 것을 잊지 마세요!