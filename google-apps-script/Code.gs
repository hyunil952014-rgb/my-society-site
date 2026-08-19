/**
 * EMPK 학회 홈페이지 — 회원가입/참가 신청을 구글 시트에 자동 기록
 *
 * 설치 방법은 README.md의 "구글 시트 자동 연동" 항목을 그대로 따라 하시면 됩니다.
 * 이 파일은 코드를 그대로 복사해서 script.google.com 편집기에 붙여넣는 용도입니다
 * (직접 실행하는 파일이 아닙니다).
 *
 * 동작 방식:
 *   1) 홈페이지에서 누가 회원가입/참가 신청을 제출하면
 *   2) 브라우저가 이 스크립트의 웹 앱 주소로 신청 내용을 함께 보내고
 *   3) 이 스크립트가 스프레드시트에 한 줄을 추가합니다.
 *
 * 참고: 이건 Netlify Forms를 대체하는 게 아니라 "보기 편한 사본"입니다.
 * 신청이 정말 들어왔는지 확인하는 원본은 항상 Netlify Forms입니다.
 */

function doPost(e) {
  try {
    var params = parseParams_(e);
    var formType = params.formType === "참가신청" ? "참가신청" : "회원가입";
    var sheet = getOrCreateSheet_(formType);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headerRow_(formType));
    }
    sheet.appendRow(dataRow_(formType, params));

    return jsonOutput_({ ok: true });
  } catch (err) {
    return jsonOutput_({ ok: false, error: String(err) });
  }
}

// Browsers send this via navigator.sendBeacon as a plain-text body
// ("key1=value1&key2=value2", URL-encoded), not as a normal form post, so
// Apps Script's automatic e.parameter parsing does not fill in — this parses
// e.postData.contents by hand instead.
function parseParams_(e) {
  var out = {};
  var raw = (e.postData && e.postData.contents) || "";
  raw.split("&").forEach(function (pair) {
    if (!pair) return;
    var idx = pair.indexOf("=");
    if (idx === -1) return;
    var key = decodeURIComponent(pair.slice(0, idx).replace(/\+/g, " "));
    var value = decodeURIComponent(pair.slice(idx + 1).replace(/\+/g, " "));
    out[key] = value;
  });
  return out;
}

function getOrCreateSheet_(formType) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var name = formType === "참가신청" ? "참가신청" : "회원가입";
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  return sheet;
}

function headerRow_(formType) {
  if (formType === "참가신청") {
    return ["접수일시", "행사명", "이름", "소속", "연락처", "이메일", "남기신 말씀"];
  }
  return ["접수일시", "이름", "소속", "연락처", "이메일", "가입 동기"];
}

function dataRow_(formType, p) {
  var now = Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd HH:mm:ss");
  if (formType === "참가신청") {
    return [now, p["행사명"] || "", p["이름"] || "", p["소속"] || "", p["연락처"] || "", p["이메일"] || "", p["메모"] || ""];
  }
  return [now, p["name"] || "", p["affiliation"] || "", p["phone"] || "", p["email"] || "", p["message"] || ""];
}

function jsonOutput_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
