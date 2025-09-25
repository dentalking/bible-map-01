# 🚨 Railway Monorepo 배포 해결 가이드

## 문제 원인
Railway가 프로젝트 루트를 보고 있어서 `biblemap/frontend`와 `biblemap/backend`를 찾지 못함

## ✅ 해결 방법: 서비스 분리

### 옵션 1: Railway 대시보드에서 설정 (권장)

#### 1️⃣ 현재 서비스 삭제
1. Railway 대시보드 접속: https://railway.app
2. `soothing-curiosity` 프로젝트 선택
3. `bible-map-01` 서비스 → Settings → Delete Service

#### 2️⃣ Frontend 서비스 생성
1. **New Service** → **GitHub Repo**
2. Repository: `dentalking/bible-map-01` 선택
3. **Settings** 탭에서:
   ```
   Service Name: frontend
   Root Directory: biblemap/frontend
   Watch Paths: biblemap/frontend/**
   ```
4. **Variables** 탭에서:
   ```env
   PORT=3000
   NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoiZ2VudGxlaHIiLCJhIjoiY21meGJzbW40MDBvbzJxcTBtYjZxYzk1dCJ9.UtMLmHnO1OMQkE3-dLOj6Q
   NEXT_PUBLIC_API_URL=https://backend-production.up.railway.app
   ```

#### 3️⃣ Backend 서비스 생성
1. **New Service** → **GitHub Repo**
2. Repository: `dentalking/bible-map-01` 선택
3. **Settings** 탭에서:
   ```
   Service Name: backend
   Root Directory: biblemap/backend
   Watch Paths: biblemap/backend/**
   ```
4. **Variables** 탭에서:
   ```env
   PORT=4000
   NODE_ENV=production
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=bible-map-jwt-secret-production-2024
   CORS_ORIGIN=https://frontend-production.up.railway.app
   ```

#### 4️⃣ PostgreSQL 추가
1. **New Service** → **Database** → **Add PostgreSQL**
2. 자동으로 `DATABASE_URL`이 Backend 서비스에 연결됨

---

### 옵션 2: CLI로 진행 (제한적)

```bash
# Frontend 배포
cd /Users/heerackbang/Desktop/bible-map-01/biblemap/frontend
railway up --service frontend

# Backend 배포
cd /Users/heerackbang/Desktop/bible-map-01/biblemap/backend
railway up --service backend
```

⚠️ 주의: CLI로는 새 서비스 생성이 어려우므로 대시보드 사용 권장

---

## 🎯 성공 확인

### ✅ 올바른 구조:
```
Project: soothing-curiosity
├── frontend (GitHub Repo)
│   └── Root: biblemap/frontend
├── backend (GitHub Repo)
│   └── Root: biblemap/backend
└── postgres (Database)
```

### ❌ 현재 잘못된 구조:
```
Project: soothing-curiosity
└── bible-map-01 (GitHub Repo)
    └── Root: / (전체 프로젝트)
```

---

## 📝 체크리스트

- [ ] 기존 `bible-map-01` 서비스 삭제
- [ ] `frontend` 서비스 생성 (Root: biblemap/frontend)
- [ ] `backend` 서비스 생성 (Root: biblemap/backend)
- [ ] PostgreSQL 데이터베이스 추가
- [ ] 환경 변수 설정
- [ ] 각 서비스 Redeploy

---

## 🔗 빠른 링크

- Railway 대시보드: https://railway.app
- 프로젝트: https://railway.app/project/9ace7c80-6892-4e42-900a-ae9fea2fa3ec
- GitHub Repo: https://github.com/dentalking/bible-map-01