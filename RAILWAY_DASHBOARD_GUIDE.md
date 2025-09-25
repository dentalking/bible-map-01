# 🗺️ Railway 대시보드 네비게이션 가이드

## 🎯 Root Directory 설정 찾기

### 1️⃣ 프로젝트 메인 페이지에서
1. Railway 대시보드: https://railway.app
2. **soothing-curiosity** 프로젝트 클릭

### 2️⃣ 서비스 클릭
- 프로젝트 페이지에서 **bible-map-01** 서비스 박스/카드 클릭
- 또는 사이드바에서 **bible-map-01** 선택

### 3️⃣ 서비스 설정 찾기

#### 옵션 A: 새로운 UI
- 서비스 페이지 상단에 **Settings** 탭
- 또는 우측 상단 ⚙️ 아이콘 클릭

#### 옵션 B: 서비스 카드에서
- 서비스 카드에 **⋮** (3점 메뉴) 클릭
- **Settings** 또는 **Configure** 선택

### 4️⃣ Root Directory 설정

#### 찾아야 할 항목:
- **Root Directory** 필드
- **Source Directory** 필드
- **Build Root** 필드
- **Working Directory** 필드

#### 설정할 값:
```
biblemap/frontend
```

### 5️⃣ 기타 확인 사항

#### Build 설정:
- **Builder**: Nixpacks (선택)
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm start`

#### Dockerfile 설정:
- **Dockerfile Path**: 비워두기 (삭제)

### 6️⃣ 저장 및 재배포
1. **Save** 또는 **Apply Changes** 버튼 클릭
2. **Redeploy** 버튼 클릭

---

## 🔍 대체 방법: Variables 탭에서 확인

만약 Settings가 안 보인다면:
1. **Variables** 탭으로 이동
2. `RAILWAY_ROOT_DIRECTORY` 환경 변수 확인
3. 값이 `biblemap/frontend`인지 확인

---

## 🆘 긴급 해결책: 새 서비스 생성

만약 설정을 찾을 수 없다면:

1. 현재 서비스 삭제:
   - 서비스 페이지 → Settings → Danger Zone → Delete Service

2. 새 서비스 생성:
   - **New** → **GitHub Repo**
   - Repository: `dentalking/bible-map-01`
   - **중요**: 생성 시 **Root Directory** 설정
   - `biblemap/frontend` 입력

3. 환경 변수 재설정:
   ```
   PORT=3000
   NEXT_PUBLIC_MAPBOX_TOKEN=[your-token]
   NEXT_PUBLIC_API_URL=https://[new-domain].railway.app
   ```

---

## 📞 도움 받기

만약 여전히 찾을 수 없다면:
- Railway Discord: https://discord.gg/railway
- Railway 지원: https://railway.app/support