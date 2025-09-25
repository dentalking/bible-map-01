# 📋 Railway 배포 현재 상태

## 🔴 문제
- 서비스가 404 응답 반환 (Application not found)
- Root Directory 설정이 적용되지 않는 것으로 보임

## ✅ 완료된 설정
```
RAILWAY_ROOT_DIRECTORY=biblemap/frontend
NIXPACKS_BUILD_CMD=npm ci && npm run build
NIXPACKS_START_CMD=npm start
PORT=3000
NEXT_PUBLIC_MAPBOX_TOKEN=[설정됨]
NEXT_PUBLIC_API_URL=https://bible-map-01-production.up.railway.app
```

## 🎯 해결 방법

### ❗ Railway 대시보드에서 직접 설정 필요

1. **Railway 대시보드 접속**: https://railway.app
2. **프로젝트**: soothing-curiosity
3. **서비스**: bible-map-01

### 필수 설정 항목:

#### Settings 탭에서:
1. **Service** 섹션:
   - **Root Directory**: `biblemap/frontend` (⚠️ 가장 중요!)
   - **Watch Paths**: `biblemap/frontend/**`
   
2. **Build & Deploy** 섹션:
   - **Builder**: Nixpacks
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`

3. **Dockerfile Path**: 비워두기 (삭제)

### 배포 로그 확인:
- 최신 배포: https://railway.com/project/9ace7c80-6892-4e42-900a-ae9fea2fa3ec/service/05751653-814a-4b5b-8633-71dea74d21f8?id=c63a78e0-8a77-40fe-8d50-38464e99221b

## 🔍 진단

CLI로 설정한 `RAILWAY_ROOT_DIRECTORY`가 서비스 설정에 반영되지 않고 있습니다.
**대시보드에서 직접 Root Directory를 설정해야 합니다.**

## 💡 대체 방안: 새 서비스 생성

만약 계속 실패한다면:

1. 현재 `bible-map-01` 서비스 삭제
2. **New Service** → **GitHub Repo**
3. Repository: `dentalking/bible-map-01`
4. **처음부터 Root Directory 설정**: `biblemap/frontend`
5. 환경 변수 재설정

---

⚠️ **중요**: Railway CLI는 모든 설정을 변경할 수 없습니다. 
**Root Directory** 설정은 반드시 **웹 대시보드**에서 해야 합니다.