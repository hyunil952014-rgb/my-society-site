# 학회 홈페이지

정적 사이트입니다. HTML/CSS/JS만으로 동작하며, 글 내용은 `content/` 폴더의
JSON 파일에서 불러옵니다.

라이브 주소: https://empkkorea.netlify.app

## 폴더 구조

```
index.html               홈
about.html                학회 소개 (인사말·설립목적·연혁·사무국·정관)
board.html                임원진 소개 (회장단 / 이사진)
conference.html           학술대회 (목록 + 상세)
education.html            교육안내 (목록 + 상세)
notices.html              공지사항 (목록 + 상세)
resources.html            자료실 (목록 + 상세)
gallery.html              갤러리 (앨범별 사진)
join.html                  회원가입 신청서 (Netlify Forms로 접수)
join-success.html          가입 신청 완료 안내
apply-success.html         행사 참가 신청 완료 안내 (+ Netlify Forms 감지용 폼)
404.html                   없는 주소로 들어왔을 때 표시되는 페이지
robots.txt, sitemap.xml    검색엔진 안내 파일
css/style.css              디자인
js/                       각 페이지 스크립트 (board-page.js는 3개 게시판 공용)
admin/                     코드 없이 글을 관리할 수 있는 관리자 화면 (Decap CMS)
files/uploads/             첨부파일이 올라가는 곳
images/                    로고·파비콘·공유 미리보기 이미지

scripts/build_content.py   폴더별 글을 목록 JSON으로 합치고 본문 마크다운을 HTML로 변환
scripts/markdown_lite.py   본문 마크다운 변환기 (외부 라이브러리 없음)

content/site.json          학회 기본 정보 · 인사말 · 연혁 · 연락처 · 정관 (파일 하나)
content/board/*.json        임원진 — 한 명당 파일 하나
content/notices/*.json      공지사항 — 글 하나당 파일 하나
content/education/*.json    교육안내 — 글 하나당 파일 하나
content/resources/*.json    자료실 — 글 하나당 파일 하나
content/conference/*.json   학술대회 — 글 하나당 파일 하나
content/gallery/*.json      갤러리 — 앨범 하나당 파일 하나

content/board.json, notices.json, education.json, resources.json,
conference.json, gallery.json
  → 위 폴더 내용을 합쳐서 자동 생성되는 파일. 사이트는 이 파일들을 읽습니다.
    직접 수정하지 마세요 (배포할 때마다 덮어써집니다).
```

`/admin`에서 글을 저장하면 위 폴더(`content/notices/` 등)에 파일 하나가
새로 생기거나 수정되고, Netlify가 `scripts/build_content.py`를 자동으로
실행해서 목록 JSON을 다시 만들어 배포합니다.

## 로컬 미리보기

`fetch`로 JSON을 불러오므로 반드시 로컬 서버로 열어야 합니다
(파일을 더블클릭해서 여는 `file://` 방식은 동작하지 않습니다).
로그인 버튼(Netlify Identity)은 실제 Netlify에 배포된 사이트에서만 정상 동작합니다.

```bash
cd 학회작업
python3 scripts/build_content.py   # content/*.json 목록 파일 새로 생성
python3 -m http.server 8080
```

이후 브라우저에서 http://localhost:8080 접속.
`content/board`, `content/notices`, `content/education` 폴더 안의 파일을
직접 추가/수정한 뒤에는 `build_content.py`를 다시 실행해야 화면에 반영됩니다
(실제 배포 시에는 Netlify가 자동으로 실행하므로 신경 쓸 필요 없습니다).

## 무료 배포 (GitHub + Netlify) — 완료된 상태

1. GitHub 저장소 생성 및 push 완료
2. Netlify 연결 완료 (https://empkkorea.netlify.app)
3. Build command로 `python3 scripts/build_content.py` 설정됨 (netlify.toml)

코드를 수정한 뒤에는:
```bash
cd "/Users/hyeonilkim/Desktop/학회작업"
git add .
git commit -m "설명"
git push
```
푸시하면 Netlify가 자동으로 빌드(목록 JSON 생성) 후 재배포합니다 (1~2분).

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

- **학회 소개 / 기본 정보** — 인사말, 소개글, 설립 목적, 연혁, 연락처·사무국 안내,
  정관·규정 파일, 학회 채널(페이스북·네이버 카페) 주소
- **임원진 소개 / 공지사항 / 교육안내 / 자료실** — 게시판처럼 글 목록이 뜨고,
  **New** 버튼으로 새 글 추가, 목록에서 항목을 클릭해 개별 수정·삭제

저장 버튼만 누르면 자동으로 GitHub에 커밋되고, Netlify가 목록을 다시 만들어
1~2분 안에 사이트에 반영됩니다.

### 글 쓸 때 쓸 수 있는 것

- **첨부파일**: 공지·교육안내·자료실 글에 파일을 여러 개 올릴 수 있습니다
  (한글 파일, PDF 등). 목록에서는 제목 옆에 📎 표시가 붙습니다.
- **본문 서식**: 굵게, 기울임, 목록, 제목, 인용, 링크, 이미지 삽입이 됩니다.
  편집기 툴바를 쓰면 되고, 저장 시 안전하게 변환되어 표시됩니다.
- **중요 공지 고정**: 체크하면 목록 맨 위에 "중요" 표시와 함께 고정됩니다.
- 목록에는 **검색창**이 있고, 글이 15개를 넘으면 자동으로 페이지가 나뉩니다.

### 정관·규정 올리기

`/admin` → 학회 기본 정보 → **정관 및 규정** 에서 문서 이름과 파일을 추가하면
학회 소개 페이지에 다운로드 목록이 생깁니다. 하나도 없으면 그 항목은
페이지에서 자동으로 숨겨집니다. (인사말·사무국 안내도 마찬가지)

### 참가 신청 받기

교육안내·학술대회 글에서 **"이 페이지에서 참가 신청 받기"** 를 켜면 글 아래에
신청 폼이 생깁니다. 신청 내용은 Netlify 대시보드 **Forms → event-application**
에 쌓이며, 어떤 행사에 대한 신청인지 "행사명" 항목으로 구분됩니다.

새 신청이 올 때 메일을 받으려면 Netlify **Site configuration → Forms →
Form notifications** 에서 알림을 추가하세요. (회원가입 폼과 별도로 설정해야 합니다)

### 회원 전용 자료 — 중요한 한계

자료실 글에 **"회원 전용"** 을 켜면 로그인하지 않은 방문자에게는 첨부파일이
보이지 않고 로그인 안내가 대신 표시됩니다.

다만 이것은 **화면에서 가리는 수준의 제한**입니다. 파일 자체는 여전히
`https://.../files/uploads/파일이름` 주소를 정확히 아는 사람이라면 로그인 없이
받을 수 있습니다. 파일 주소를 서버에서 막으려면 Netlify의 유료(Enterprise)
기능이 필요합니다.

따라서 **외부에 유출되면 곤란한 자료(개인정보, 미공개 논문, 계약서 등)는
올리지 마세요.** "회원 전용"은 비회원이 굳이 찾아 쓰지 않도록 하는 용도로만
쓰시고, 민감한 자료는 이메일로 개별 발송하시는 편이 안전합니다.

## 실수로 지운 글 되살리기

`/admin`에서 글을 지워도 GitHub에 기록이 남아 있어 복구할 수 있습니다.

1. GitHub 저장소 → **Commits** (커밋 목록) 열기
2. 글을 지운 시점의 커밋을 찾습니다 (메시지에 파일 이름이 보입니다)
3. 그 커밋을 클릭하면 삭제된 파일 내용이 빨간색으로 보입니다
4. 내용을 복사해서 `/admin`에서 같은 제목으로 새 글을 만들어 붙여넣으면 됩니다

파일을 통째로 되돌리려면 터미널에서:

```bash
git log --oneline -- content/notices
git checkout <커밋해시> -- content/notices/파일이름.json
git commit -m "실수로 지운 공지 복구"
git push
```

## 검색엔진 · 링크 공유

- 카카오톡·페이스북에 주소를 공유하면 학회 로고 카드와 설명이 함께 표시됩니다
  (`images/og-image.png`). 로고나 학회명이 바뀌면 이 이미지도 다시 만들어야 합니다.
- 개별 공지 글은 주소가 `?id=...` 형태라, 공유 시 미리보기는 학회 대표 정보로
  표시됩니다. 글마다 다른 미리보기가 필요하면 별도 작업이 필요합니다.
- 새 페이지를 추가하면 `sitemap.xml`에도 주소를 넣어주세요.

## 커스텀 도메인 (나중에 필요하면)

Netlify Site settings → Domain management 에서 무료 서브도메인 이름을
바꾸거나, 별도로 구매한 도메인을 연결할 수 있습니다.
