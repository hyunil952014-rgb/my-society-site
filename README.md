# 학회 홈페이지

빌드 과정 없는 순수 정적 사이트입니다. HTML/CSS/JS만으로 동작하며,
글 내용은 `content/` 폴더의 JSON 파일에서 불러옵니다.

라이브 주소: https://empkkorea.netlify.app

## 폴더 구조

```
index.html            홈
about.html             학회 소개 (+ 연혁)
board.html             임원진 소개
education.html         교육안내 (목록 + 상세)
notices.html           공지사항 (목록 + 상세)
join.html               회원가입 신청서 (Netlify Forms로 접수)
join-success.html       가입 신청 완료 안내
css/style.css           디자인
js/                    각 페이지 스크립트
content/site.json       학회 기본 정보 · 소개글 · 연혁 · 연락처
content/board.json      임원진 목록
content/notices.json    공지사항 목록
content/education.json  교육안내 목록
admin/                  코드 없이 글을 관리할 수 있는 관리자 화면 (Decap CMS)
```

콘텐츠를 직접 고치고 싶다면 `content/` 안의 JSON 파일만 수정하면 됩니다.
페이지 디자인/구조를 바꾸지 않는 한 html·js 파일은 건드릴 필요 없습니다.

## 로컬 미리보기

정적 파일이라 그냥 열어도 되지만, `fetch`로 JSON을 불러오므로 반드시
로컬 서버로 열어야 합니다 (파일을 더블클릭해서 여는 `file://` 방식은 동작하지 않습니다).
로그인 버튼(Netlify Identity)은 실제 Netlify에 배포된 사이트에서만 정상 동작합니다.

```bash
cd 학회작업
python3 -m http.server 8080
```

이후 브라우저에서 http://localhost:8080 접속.

## 무료 배포 (GitHub + Netlify) — 완료된 상태

1. GitHub 저장소 생성 및 push 완료
2. Netlify 연결 완료 (https://empkkorea.netlify.app)

코드를 수정한 뒤에는:
```bash
cd "/Users/hyeonilkim/Desktop/학회작업"
git add .
git commit -m "설명"
git push
```
푸시하면 Netlify가 자동으로 재배포합니다 (1분 이내).

## 로그인 / 회원가입 켜기 (Netlify Identity)

1. Netlify 대시보드 → 사이트 선택 → **Site configuration → Identity → Enable Identity**
2. 같은 화면 **Registration preferences → Invite only** 선택
   (회원가입은 `join.html` 신청서로만 받고, 실제 로그인 계정은 관리자가 승인 후 초대하는 방식이기 때문입니다)
3. 아래로 스크롤 → **Services → Git Gateway → Enable Git Gateway**
4. **매우 중요**: 같은 Git Gateway 설정에서 **Roles**에 `admin` 을 추가하세요.
   이렇게 해야 "admin" 권한을 받은 사람만 `/admin`에서 글을 수정할 수 있고,
   그냥 로그인만 한 일반 회원은 글을 고칠 수 없습니다.

## 회원가입 → 승인 흐름

1. 신청자가 사이트의 **회원가입** 메뉴(`/join.html`)에서 이름·소속·연락처·이메일을 입력해 제출
2. 제출 내용은 Netlify 대시보드 **Forms** 탭에 자동으로 쌓입니다 (회원 명단처럼 확인/CSV 다운로드 가능)
   - Forms → Settings and usage → Form notifications 에서 새 신청이 올 때마다 이메일 알림도 설정 가능
3. 관리자가 신청 내용을 검토 → 승인할 사람만 **Identity 탭 → Invite users** 에서 그 이메일로 초대
4. 신청자가 초대 메일을 받고 비밀번호를 설정하면 로그인 회원이 됩니다 (사이트 우측 상단에 로그인 버튼으로 로그인)

## 관리자(사이트 편집 권한) 지정하기

학회 소개·임원진·공지사항 등을 실제로 수정할 사람에게는 관리자 권한을 별도로 줘야 합니다.

1. Netlify 대시보드 → **Identity** 탭에서 해당 사용자 클릭
2. **Roles** 항목에 `admin` 입력 후 저장
3. 이제 그 사람이 로그인하면 사이트 헤더에 **"사이트 편집"** 링크가 나타나고,
   `/admin`에서 학회 소개 / 임원진 / 공지사항 / 교육안내를 추가·수정·삭제할 수 있습니다.

일반 회원(admin 권한 없음)은 로그인은 되지만 `/admin`에서 실제로 글을 저장할 수는 없습니다
(위 Git Gateway Roles 설정 덕분입니다).

## 콘텐츠 관리 (관리자 로그인 후 `/admin`)

- **학회 소개 / 기본 정보** — 소개글, 연혁, 연락처 수정
- **임원진 소개** — 이름/직함/소속/약력/사진 추가·수정·삭제
- **교육안내** — 세미나·워크숍 등 안내 추가·수정·삭제
- **공지사항** — 새 글 작성, 수정, 삭제

저장 버튼만 누르면 자동으로 GitHub에 커밋되고 사이트에 반영됩니다.

## 커스텀 도메인 (나중에 필요하면)

Netlify Site settings → Domain management 에서 무료 서브도메인 이름을
바꾸거나, 별도로 구매한 도메인을 연결할 수 있습니다.
