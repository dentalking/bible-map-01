# ✅ Railway 배포 최종 해결책

## 🔴 문제 진단
Railway CLI는 Root Directory 설정을 직접 변경할 수 없습니다.

## 🎯 해결 방법

### 방법 1: Railway 대시보드에서 설정 (가장 확실)

1. **빌드 로그 페이지 접속**:
   https://railway.com/project/9ace7c80-6892-4e42-900a-ae9fea2fa3ec/service/05751653-814a-4b5b-8633-71dea74d21f8

2. **서비스 페이지로 이동**:
   - 빌드 로그 페이지에서 `bible-map-01` 서비스 이름 클릭
   - 또는 사이드바에서 서비스 선택

3. **Settings 찾기**:
   - 서비스 페이지 상단 탭에서 **Settings** 찾기
   - 또는 **Deploy** 탭 → **Configuration**
   - 또는 **Build & Deploy** 섹션

4. **Root Directory 설정**:
   ```
   Root Directory: biblemap/frontend
   ```
   - 이 필드가 없다면 **Advanced** 옵션 확인

5. **Save & Redeploy**

### 방법 2: 새 서비스 생성 (Root Directory 처음부터 설정)

```bash
# 현재 서비스 삭제 (Railway 대시보드에서)
# Settings → Danger → Delete Service

# CLI로 새 프로젝트 생성
railway init
# "Empty Project" 선택

# GitHub 연결 (Railway 대시보드에서)
# New → GitHub Repo
# dentalking/bible-map-01 선택
# Root Directory: biblemap/frontend 설정
```

### 방법 3: Railway.app에서 직접 생성

1. https://railway.app/new 접속
2. **Deploy from GitHub repo** 선택
3. `dentalking/bible-map-01` 선택
4. **Configure** 클릭
5. **Root Directory**: `biblemap/frontend` 입력
6. **Deploy Now** 클릭

## 📝 CLI 제한사항

Railway CLI로는 다음을 할 수 없습니다:
- Root Directory 직접 설정
- Build 설정 세부 변경
- Monorepo 구조 자동 인식

## ✅ 확인 방법

배포 성공 후:
```bash
# 도메인 확인
curl https://[your-domain].railway.app

# 로그 확인
railway logs
```

## 🔗 필수 링크

- 프로젝트: https://railway.app/project/9ace7c80-6892-4e42-900a-ae9fea2fa3ec
- GitHub: https://github.com/dentalking/bible-map-01
- Railway Docs: https://docs.railway.com

---

**결론**: Railway 웹 대시보드에서 Root Directory를 설정해야 합니다.
CLI로는 이 설정을 변경할 수 없습니다.