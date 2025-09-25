# 🚨 Railway 긴급 수정 가이드

## ⚠️ 현재 문제
Railway가 `biblemap` 디렉토리를 root로 인식 → package.json 못 찾음

## ✅ 즉시 해결 방법 (Railway 웹에서)

### 🎯 중요: 서비스가 몇 개 있나요?

---

## 옵션 A: 3개 서비스 (Frontend, Backend, PostgreSQL) - 권장

### 1. Backend 서비스 수정
1. Railway 대시보드 → **Backend 서비스** 클릭
2. **Settings** 탭
3. **Service** 섹션에서:
   - **Root Directory**: `biblemap/backend` (⚠️ 정확히 입력!)
   - **Watch Paths**: `biblemap/backend/**`
4. **Save Changes**

### 2. Frontend 서비스 수정
1. Railway 대시보드 → **Frontend 서비스** 클릭
2. **Settings** 탭
3. **Service** 섹션에서:
   - **Root Directory**: `biblemap/frontend` (⚠️ 정확히 입력!)
   - **Watch Paths**: `biblemap/frontend/**`
4. **Save Changes**

### 3. 재배포
각 서비스에서 **Redeploy** 클릭

---

## 옵션 B: 1개 서비스만 있다면 (잘못된 설정)

### 서비스 분리가 필요합니다!

1. **New Service** → **GitHub Repo**
2. Backend용 서비스 생성:
   - Repository: `dentalking/bible-map-01`
   - Root Directory: `biblemap/backend`
   - Service Name: `backend`

3. **New Service** → **GitHub Repo**
4. Frontend용 서비스 생성:
   - Repository: `dentalking/bible-map-01`
   - Root Directory: `biblemap/frontend`
   - Service Name: `frontend`

5. **New Service** → **Database** → **Add PostgreSQL**

---

## 📸 Railway 대시보드 확인 방법

올바른 설정 확인:
```
Project: bible-map
├── 🟢 backend (GitHub Repo)
│   └── Root: biblemap/backend
├── 🟢 frontend (GitHub Repo)
│   └── Root: biblemap/frontend
└── 🟢 postgres (Database)
```

잘못된 설정:
```
Project: bible-map
└── 🔴 bible-map-01 (GitHub Repo)
    └── Root: biblemap (❌ 잘못됨!)
```

---

## 🔍 성공 확인 (빌드 로그)

### ✅ Backend 성공 로그:
```
Using Nixpacks
Using subdirectory "biblemap/backend"
Detected Node.js app
Installing dependencies...
Running prisma generate...
Build successful!
```

### ✅ Frontend 성공 로그:
```
Using Nixpacks
Using subdirectory "biblemap/frontend"
Detected Next.js app
Installing dependencies...
Building Next.js app...
Build successful!
```

### ❌ 실패 로그 (현재 상황):
```
Using subdirectory "biblemap"
Nixpacks was unable to generate a build plan
```

---

## 🆘 여전히 안 된다면?

### Railway CLI로 직접 설정:
```bash
# 터미널에서
railway login
railway link

# Backend 배포
cd biblemap/backend
railway up --service backend

# Frontend 배포
cd ../frontend
railway up --service frontend
```

---

## 💡 핵심 체크리스트

- [ ] Backend 서비스의 Root Directory = `biblemap/backend`
- [ ] Frontend 서비스의 Root Directory = `biblemap/frontend`
- [ ] PostgreSQL 서비스 존재
- [ ] 각 서비스가 독립적으로 존재 (3개)
- [ ] GitHub 리포지토리 연결됨

---

⚠️ **반드시 Root Directory를 정확히 입력하세요!**
- ❌ `biblemap` (틀림)
- ❌ `/biblemap/backend` (슬래시 시작 X)
- ✅ `biblemap/backend` (정확함)