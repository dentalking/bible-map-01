# 🚂 Railway CLI 명령어 가이드

## 📋 순서대로 실행하세요

### 1. Railway 로그인
```bash
railway login
```
→ 브라우저가 열리면 Railway 계정으로 로그인

### 2. 프로젝트 연결
```bash
railway link
```
→ 목록에서 bible-map 프로젝트 선택

### 3. 서비스 확인
```bash
railway service
```
→ backend, frontend, postgres 서비스가 보여야 함

### 4. PostgreSQL URL 확인
```bash
railway variables --service postgres
```
→ DATABASE_URL 복사

### 5. Backend 환경 변수 설정
```bash
# Backend 서비스 선택
railway service backend

# 환경 변수 설정
railway variables set NODE_ENV=production
railway variables set PORT=4000
railway variables set DATABASE_URL=[위에서 복사한 URL]
railway variables set CORS_ORIGIN=https://bible-map-frontend.up.railway.app
```

### 6. Frontend 환경 변수 설정
```bash
# Frontend 서비스 선택
railway service frontend

# 환경 변수 설정
railway variables set NEXT_PUBLIC_API_URL=https://bible-map-backend.up.railway.app
railway variables set NEXT_PUBLIC_MAPBOX_TOKEN=[당신의 Mapbox 토큰]
railway variables set PORT=3000
```

### 7. 배포 트리거
```bash
# Backend 배포
cd biblemap/backend
railway up --service backend

# Frontend 배포
cd ../frontend
railway up --service frontend
```

### 8. 데이터베이스 마이그레이션
```bash
# Backend 서비스에서 실행
railway run --service backend npm run migrate
railway run --service backend npm run seed
```

### 9. 로그 확인
```bash
# Backend 로그
railway logs --service backend

# Frontend 로그
railway logs --service frontend
```

### 10. 도메인 생성 (웹에서)
1. https://railway.app 접속
2. 프로젝트 선택
3. Frontend 서비스 → Settings → Generate Domain
4. Backend 서비스 → Settings → Generate Domain

## 🎯 배포 완료 후

### URL 확인
- Frontend: `https://[생성된-도메인].up.railway.app`
- Backend: `https://[생성된-도메인].up.railway.app/api`
- Health: `https://[생성된-도메인].up.railway.app/health`

### 문제 해결
```bash
# 전체 상태 확인
railway status

# 서비스 재시작
railway restart --service backend
railway restart --service frontend

# 환경 변수 확인
railway variables --service backend
railway variables --service frontend
```

## ⚠️ 주의사항
- Mapbox 토큰은 반드시 필요
- DATABASE_URL은 자동으로 연결되어야 함
- CORS 설정이 Frontend 도메인과 일치해야 함