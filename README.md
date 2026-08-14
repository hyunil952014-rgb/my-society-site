# 학회 홈페이지

빌드 과정 없는 순수 정적 사이트입니다. HTML/CSS/JS만으로 동작하며,
글 내용은 `content/` 폴더의 JSON 파일에서 불러옵니다.

## 폴더 구조

```
index.html        홈
about.html         학회 소개 (+ 연혁)
board.html         임원진 소개
notices.html       공지사항 (목록 + 상세)
css/style.css       디자인
js/                각 페이지 스크립트
content/site.json    학회 기본 정보 · 소개글 · 연혁 · 연락처
content/board.json   임원진 목록
content/notices.json 공지사항 목록
admin/               코드 없이 글을 관리할 수 있는 관리자 화면 (Decap CMS)
```

콘텐츠를 직접 고치고 싶다면 `content/` 안의 JSON 파일만 수정하면 됩니다.
페이지 디자인/구조를 바꾸지 않는 한 html·js 파일은 건드릴 필요 없습니다.

## 로컬 미리보기

정적 파일이라 그냥 열어도 되지만, `fetch`로 JSON을 불러오므로 반드시
로컬 서버로 열어야 합니다 (파일을 더블클릭해서 여는 `file://` 방식은 동작하지 않습니다).

```bash
cd 학회작업
python3 -m http.server 8080
```

이후 브라우저에서 http://localhost:8080 접속.

## 무료 배포 (GitHub + Netlify)

1. **GitHub 저장소 생성**: github.com 에서 새 저장소를 만들고, 이 폴더를 푸시합니다.
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <저장소 주소>
   git push -u origin main
   ```
2. **Netlify 연결**: netlify.com 무료 계정으로 로그인 → "Add new site" → "Import an existing project" →
   방금 만든 GitHub 저장소 선택. Build command는 비워두고 Publish directory는 `.` 로 둡니다.
   배포가 끝나면 `무언가.netlify.app` 형태의 무료 주소가 생성됩니다. (Site settings에서 주소 이름 변경 가능)
3. **Identity 켜기**: Netlify 대시보드 → Site configuration → Identity → "Enable Identity".
4. **Git Gateway 켜기**: 같은 Identity 설정 화면 → Services → Git Gateway → "Enable Git Gateway".
5. **가입 방식 설정**: Identity → Registration preferences → "Invite only" 로 설정 (아무나 가입 못하게).
6. **관리자 초대**: Identity 탭 → "Invite users" → 학회 관계자 이메일 입력 → 초대 메일 수신 후
   비밀번호 설정하면 `무언가.netlify.app/admin` 에서 로그인해 코드 없이 글을 쓸 수 있습니다.

이후로는 `/admin` 페이지에서 로그인만 하면:
- 학회 소개 / 연혁 / 연락처 수정
- 임원진 추가·수정·삭제 (사진 업로드 포함)
- 공지사항 추가·수정·삭제

모두 클릭 몇 번으로 가능하고, 저장하면 자동으로 사이트에 반영됩니다.

## 커스텀 도메인 (나중에 필요하면)

Netlify Site settings → Domain management 에서 무료 서브도메인 이름을
`학회이름.netlify.app` 형태로 바꾸거나, 별도로 구매한 도메인을 연결할 수 있습니다.
