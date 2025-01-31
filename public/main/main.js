/*動態設定路由*/
const href_create = [
    // "public/easyui/themes/icon.min.css", // easyui css
    "public/easyui/metro-orange/easyui.css",
    "public/bootstrap/bootstrap.min.css", // bootstrap css
    // "public/bootstrap/bootstrap-icons.min.css",
    "public/sweetalert/sweetalert2.min.css", // swal css
    "public/main/main.css", // 主 css
];
const src_creat = [
    "public/easyui/jquery.min.js", // jquery js
    "public/easyui/jquery.easyui.min.js", // easyui js
    "public/easyui/locale/easyui-lang-zh_TW.js", // easyui js
    "public/bootstrap/bootstrap.min.js", // bootstrap js
    "public/sweetalert/sweetalert2.min.js", // swal js
    "public/gas/gas.js", // gas js
];
if ( location.href.includes("github")){
    url = '/takoiscute/';
}else{
    url = "../../";
}
// 定義前綴詞
// prefer = typeof(prefer) === "undefined"?"../../":prefer;
// 加載 CSS
function loadCSS(href) {
    return new Promise((resolve, reject) => {
        let link = document.createElement("link");
        link.rel = "stylesheet";
        link.type = "text/css";
        link.href = url + prefer+href;
        link.onload = () => resolve(href);
        link.onerror = () => reject(new Error(`CSS 加載失敗: ${href}`));
        document.head.appendChild(link);
    });
}

// 加載 JS
function loadJS(src) {
    return new Promise((resolve, reject) => {
        let script = document.createElement("script");
        script.type = "text/javascript";
        script.src = url + prefer+src;
        script.onload = () => resolve(src);
        script.onerror = () => reject(new Error(`JS 加載失敗: ${src}`));
        document.head.appendChild(script);
    });
}
async function loadResourcesAndRun() {
    try {
        // 先載入 CSS
        await Promise.all(href_create.map(loadCSS));
        console.log("所有 CSS 加載完成");
        // 再載入 JS
        await Promise.all(src_creat.map(loadJS));
        console.log("所有 JS 加載完成");
    } catch (error) {
        console.error(error);
    }
}
