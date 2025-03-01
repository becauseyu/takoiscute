/*---------------------------------------------*/
/*動態設定路由*/
/*---------------------------------------------*/
const href_create = [
    // "public/easyui/themes/icon.min.css", // easyui css
    "public/easyui/metro-orange/easyui.css",
    "public/bootstrap/bootstrap.min.css", // bootstrap css
    "public/bootstrap/bootstrap-icons.min.css",
    "public/sweetalert/sweetalert2.min.css", // swal css
    "public/daterangepicker/daterangepicker.css", // datetimerange
    "public/main/main.css", // 主 css
];
const src_creat = [
    "public/easyui/jquery.min.js", // jquery js
    "public/easyui/jquery.easyui.min.js", // easyui js
    "public/easyui/locale/easyui-lang-zh_TW.js", // easyui js
    "public/bootstrap/bootstrap.min.js", // bootstrap js
    "public/sweetalert/sweetalert2.min.js", // swal js
    "public/daterangepicker/moment.min.js", // moment
    "public/daterangepicker/daterangepicker.js", // datetimerange
    "public/gas/gas.js", // gas js
    "public/animation/anime.min.js", // gas js
];

if ( location.href.includes("github")){
    url = '/takoiscute/';
}else{
    url = "../../";
}
// 加載 CSS
function loadCSS(href) {
    return new Promise((resolve, reject) => {
        let link = document.createElement("link");
        link.rel = "stylesheet";
        link.type = "text/css";
        link.href = url +href;
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
        script.src = url + src;
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
/*---------------------------------------------*/
// bootstrap form 驗證
/*---------------------------------------------*/
(function() {
    'use strict';
    window.addEventListener('load', function() {
      // Fetch all the forms we want to apply custom Bootstrap validation styles to
      var forms = document.getElementsByClassName('needs-validation');
      // Loop over them and prevent submission
      var validation = Array.prototype.filter.call(forms, function(form) {
        form.addEventListener('submit', function(event) {
          if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
          }
          form.classList.add('was-validated');
        }, false);
      });
    }, false);
  })();
/*---------------------------------------------*/
// 把樓上樓下的名單設置為常數
/*---------------------------------------------*/
  const member_list = {
    manager:["張總","劉總","祐寧"],
    first_floor:["竹君","美淑","麗華","易儒","惠貞","Jany","Mia","May","Bernice","Debby","Amy","Sandy","小Hank","Bella","Sophi","Melanie","Ariel"],
    second_floor:["藝芬","文琪","曜","怡廷","莠惠","享","明倫","宜芬","坤琳","展豪","聖安","商榮"],
  };
/*---------------------------------------------*/
// 日期顯示格式化
/*---------------------------------------------*/
function showDate(value){
    var dateValue = new Date(value);;
    var val_Y = dateValue.getFullYear();
    // 如果有人輸入的年大於4位數，就自動只取前四碼
    val_Y = val_Y+="";
    val_Y = val_Y.length > 4?val_Y.substring(0,4):val_Y;
    var val_M = (dateValue.getMonth() + 1 < 10 ? '0' + (dateValue.getMonth() + 1) : dateValue.getMonth() + 1);
    var val_D = (dateValue.getDate() < 10 ? '0' + dateValue.getDate() : dateValue.getDate());
    // yyyy-mm-dd
    var val_date = val_Y + '-' + val_M + '-' + val_D
    return val_date;
}
/*---------------------------------------------*/
// 日期時間顯示格式化
/*---------------------------------------------*/
function showDateTime(value){
    var timeValue = new Date(value);
    var val_Y = timeValue.getFullYear();
    // 如果有人輸入的年大於4位數，就自動只取前四碼
    val_Y = val_Y+="";
    val_Y = val_Y.length > 4?val_Y.substring(0,4):val_Y;
    var val_M = (timeValue.getMonth() + 1 < 10 ? '0' + (timeValue.getMonth() + 1) : timeValue.getMonth() + 1);
    var val_D = (timeValue.getDate() < 10 ? '0' + timeValue.getDate() : timeValue.getDate());
    var val_Time = timeValue.toTimeString().substr(0, 8);
    // yyyy-mm-dd hh:mm:ss
    var val_time = val_Y + '-' + val_M + '-' + val_D + ' ' + val_Time
    return val_time;
}