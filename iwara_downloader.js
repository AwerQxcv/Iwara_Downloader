function getSourceURL() {
    let source_url = document.querySelector("div.dropdown:nth-child(3) > div:nth-child(2) > ul:nth-child(1) > li:nth-child(1) > a:nth-child(1)").href;
    console.log("getSourceURL : source URL found", source_url);
    return source_url;
}

// API 호출을 통해 동영상 URL을 가져오는 방식 예시
async function getSourceURL_API() {
    let videoID = getVideoID();
    // Iwara의 실제 파일 API 엔드포인트를 호출
    let response = await fetch(`https://api.iwara.tv/video/${videoID}/file`);
    let data = await response.json();

    // data 배열에서 원하는 화질(예: Source 또는 1080p)의 URL 추출
    let fileUrl = data.find(item => item.name === "Source").src;

    console.log("getSourceURL_API response:", fileUrl);
    return `https:${fileUrl}`; // 보통 "//"로 시작하므로 프로토콜을 붙여줌
}

function getTitle() {
    let title = document.querySelector("div.mb-1").textContent;
    title = sanitizeText(title);
    if (title.length > 100) {
        title = title.slice(0, 100) + "(···)";
    }
    console.log("getTitle : title extracted and sanitized", title);
    return title;
}

function getUserName() {
    let username = document.querySelector(".page-video__byline__info > a:nth-child(1)").innerText;
    console.log("getUserName : username extracted", username);
    return sanitizeText(username);
}

function getUserID() {
    let userid = document.querySelector(".page-video__byline__info > div:nth-child(2)").textContent.substring(1,)
    console.log("getUserID : user ID extracted", userid);
    return userid;
}

function getVideoID() {
    let videoID = location.pathname.match(/(?<=\/video\/)[a-zA-Z0-9-]+/);
    console.log("getVideoID : video ID extracted", videoID[0]);
    return videoID[0];
}

function getDate(num) {
    try {
        let datevalue = document.querySelector(".page-video__details__subtitle").querySelector("div.text.text--muted.text--small").title;
        let replaced = /(\d+)\/(\d+)\/(\d+) (\d+):(\d+):(\d+)/.exec(datevalue);
        console.log("getDate : date extracted", replaced);
        return replaced[num];
    } catch (error) {
        let replaced = ["0", "0000", "00", "00", "00", "00", "00"]
        return replaced[num];
    }
}

function getDateNow(query) {
    dateNow = new Date(Date.now());
    replaced = [
        dateNow,
        dateNow.getFullYear().toString(),
        (dateNow.getMonth() + 1).toString(),
        dateNow.getDate().toString(),
        dateNow.getHours().toString(),
        dateNow.getMinutes().toString(),
        dateNow.getSeconds().toString()
    ];
    return replaced[query];
}

function getExtType() {
    let source_url = getSourceURL();
    let ext_type = source_url.split('.').slice(-1)[0];
    console.log("getExtType : extension type extracted", ext_type);
    return ext_type;
}


// 디렉터리에 사용할 수 없는 문자를 제거 및 변환
function sanitizeText(text, includeDot = true) {
    if (!text) return "";
    text = text.normalize('NFKC');
    text = text.replace(/[\u200B-\u200D\uFEFF\uFE0F]/g, '');
    text = text.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '');
    text = text.replace(/\s+/g, ' ');

    const charMap = {
        ':': '：', '/': '／', '\\': '￥', '*': '＊', '?': '？',
        '"': '”', '<': '＜', '>': '＞', '|': '｜'
    };

    if (includeDot) charMap['.'] = '．';

    const escapedKeys = Object.keys(charMap).map(key =>
        key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );
    const pattern = new RegExp(escapedKeys.join('|'), 'g');

    return text.replace(pattern, (match) => charMap[match]).trim();
}

function checkLike() {
    let check_like;
    if (document.querySelector(".likeButton > div:nth-child(1) > div:nth-child(1) > svg:nth-child(1)").classList[1] == "fa-heart") {
        check_like = "yet"
    } else {
        check_like = "done"
    }
    let like_button = document.getElementsByClassName("likeButton")[0]
    console.log("checkLike : like status checked", check_like);
    browser.storage.local.get({ auto_like: false }, (settings) => {
        if (settings.auto_like && check_like == "yet") {
            console.log(like_button)
            like_button.click()
        }
    });
}

async function dlContent() {
    try {
        const filename = getSavePathAndName();
        const url = getSourceURL();
        checkLike();
        await new Promise((resolve) => {
            dlFile("download", url, filename);
            setTimeout(resolve, 150);
        });
    } catch (error) {
        console.error(`dlContent : error occured`, error);
    }
}

function getSavePathAndName() {
    let ext_type = getExtType();
    let query = convertMacrosInPath(save_location + filename_definition + "." + ext_type);
    console.log("getSavePathAndName : query after macro conversion", query);
    return query;
}

function convertMacrosInPath(query) {
    query = query.replaceAll("$UserName$", getUserName());
    query = query.replaceAll("$UserID$", getUserID());
    query = query.replaceAll("$Title$", getTitle());
    query = query.replaceAll("$VideoID$", getVideoID());
    query = query.replaceAll("$YYYY$", getDate(1));
    query = query.replaceAll("$YY$", getDate(1).slice(-2));
    query = query.replaceAll("$MM$", getDate(2).padStart(2, "0"));
    query = query.replaceAll("$DD$", getDate(3).padStart(2, "0"));
    query = query.replaceAll("$hh$", getDate(4).padStart(2, "0"));
    query = query.replaceAll("$mm$", getDate(5).padStart(2, "0"));
    query = query.replaceAll("$ss$", getDate(6).padStart(2, "0"));
    query = query.replaceAll("$NYYYY$", getDateNow(1));
    query = query.replaceAll("$NYY$", getDateNow(1).slice(-2));
    query = query.replaceAll("$NMM$", getDateNow(2).padStart(2, "0"));
    query = query.replaceAll("$NDD$", getDateNow(3).padStart(2, "0"));
    query = query.replaceAll("$Nhh$", getDateNow(4).padStart(2, "0"));
    query = query.replaceAll("$Nmm$", getDateNow(5).padStart(2, "0"));
    query = query.replaceAll("$Nss$", getDateNow(6).padStart(2, "0"));
    return query.trim();
}

function dlFile(type, url, filename) {
    browser.runtime.sendMessage({
        type: type,
        url: url,
        filename: filename,
    });
}

// Main functions
async function main(str) {
    globalThis.auto_like = str.auto_like;
    globalThis.save_location = str.save_location;
    globalThis.filename_definition = str.filename_definition;
    if (str.auto_like) {
        checkLike(); 
    }
    dlContent();
}

browser.runtime.onMessage.addListener(function (request, sender) {
    browser.storage.local.get(
        ["filename_definition", "save_location", "auto_like"],
        function (str) {
            if (str.save_location == undefined) {
                const version = browser.runtime.getManifest().version;
                const message = browser.i18n.getMessage("alert_first_run", [version]);
                alert(message);
                return browser.runtime.sendMessage({ type: "set" });
            } else {
                main(str);
            }
        }
    );
});