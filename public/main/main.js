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
    "public/jquery.actual-master/jquery.actual.min.js", // jquery.actual
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
// ----------------------------------------------------------------------------------
/* 
    20230516 Maria 顯示警示訊息之 有ok版本(共用)
    參數說明：
    title:		標題（字較大）,
    text:		文字內容（字較小）,
    type:		顯示圖標 https://sweetalert2.github.io/#icons
        warning:警示符號
        error:錯誤符號
        success:正確符號
*/
// ----------------------------------------------------------------------------------
function showMsg(title, text, type) {
  Swal.fire({
      title: title,
      html: text,
      icon: type,
      width: 800,
      allowOutsideClick: false,
  })
}
// ----------------------------------------------------------------------------------
/* 
    20230516 Maria 顯示ajax傳回的錯誤訊息（共用）
*/
// ----------------------------------------------------------------------------------
function error_msg(jqXHR, textStatus, errorThrown) {
  // 20231110 Maria 新增兩個錯誤訊息判斷
  if (jqXHR.hasOwnProperty('responseJSON')) {
      if (jqXHR.responseJSON.message == "NOLOGIN") {
          window.location.reload();
      } else if (jqXHR.responseJSON.message == "RELOGIN") {
          window.location.reload();
      } else {
          // 先取得錯誤訊息
          var errorMsg = jqXHR.responseJSON.message;
          var errorLine = jqXHR.responseJSON.line == undefined?"":jqXHR.responseJSON.line;
          // 如果是 SQL 的錯誤，會包含 (Connection)
          if (  errorMsg.indexOf("Connection") >= 0 ){
              var errorTitle = "SQL ERROR";
              // 先從 trace 裡面撈到 Database 的下一個
              var errorTrace = jqXHR.responseJSON.trace ;
              let k = 0;
              while (k < errorTrace.length) {
                  var errorFile = errorTrace[k].file;
                  errorLine = errorTrace[k].line;
                  if ( (errorTrace[k].file).includes("Connection.php") === false ) {
                      break;
                  } else {
                      k++;
                  }
              }
              var SqlPos = errorMsg.indexOf("(Connection");
              errorMsg = errorMsg.substring(0,SqlPos);
          }else{
              var errorTitle = "Program ERROR";
              var errorFile = jqXHR.responseJSON.file;
          }
          // 新的字串擷取到前一個字
          showMsg(
              errorTitle, 
              `<div style="text-align:left;">'
                  <table class="table table-sm">
                      <tbody>
                          <tr class="table-secondary">
                              <td>Message</td>
                              <td>`+errorMsg+`</td>
                          </tr>
                          <tr >
                              <td>File</td>
                              <td>`+errorFile+`</td>
                          </tr>
                          <tr >
                              <td>Line</td>
                              <td>`+errorLine+`</td>
                          </tr>
                      </tbody>
                  </table>
              </div>`, 
              "error");
      }
  } else {
      var errorTitle = textStatus;
      var errorMsg = jqXHR.responseText;
      // 新的字串擷取到前一個字
      showMsg(errorTitle, '<div style="text-align:left;">'+errorMsg+'</div>', "error");
  }
}
//---------------------------------------------------------------------
/* 
    20241119 Maria 格式化日期區間
    將傳入的字串依照 ~ 作為分割符號取得一個日期區間
    若不符合任何日期規則(EX:非日期格式 OR 錯誤的日期)，會轉換為空
    日期格式可接受 xxxx-xx-xx 跟 xxxx/xx/xx，其他都不接受
    EX:
    2024-2025       =>  start:"",end:""
    2024~2025       =>  start:"2024-01-01",end:"2025-12-31"
    2024-11         =>  start:"2024-11-01",end:"2024-11-30"
    2024-11~2025-02 =>  start:"2024-11-01",end:"2025-02-28"
    2024*asf        =>  start:"",end:""
    傳入參數:
    dateString  要格式化的字串
    回傳參數:
    start       xxxx-xx-xx
    end         xxxx-xx-xx
*/ 
//---------------------------------------------------------------------
function dateRangeParse(dateString) {
  // 取得使用者輸入得字元，避免有人白目輸入其他日期格式，這邊先替換
  var dateString =  dateString.replace(/\//g,"-");
  var start,end;
  //先判斷有沒有輸入到區間
  if ( dateString.includes("~")){
      // 先分割出 start 跟 end
      start = dateString.split("~")[0];
      end = dateString.split("~")[1];
      // 分別檢查一下兩者是不是正確的日期格式
      if ( isNaN(Date.parse(start))){
          start =  "";
      }else{
          start = showDate(new Date(start)) == undefined?"":showDate(new Date(start));
      }
      if ( isNaN(Date.parse(end))){
          end = "";
      }else{
          var tmp_str = end.split("-");
          // 只有年
          if ( tmp_str.length == 1){
              // 沒有輸入日期格式，直接設定為一整年
              let Year = new Date(end).getFullYear();
              // 如果有人年輸入超過4碼，自動只截取前四碼
              Year += "";
              Year = Year.length > 4 ? Year.substring(0, 4):Year;
              end = Year+"-12-31";
          }
          // 只有 年 跟 月
          else if ( tmp_str.length == 2){
              end = GetLastDay(new Date(end));
          }
          // 有 年、月、日
          else if (tmp_str.length == 3){
              end =showDate(new Date(end)) == undefined?"":showDate(new Date(end));
          }else{
              end = "";
          }
      }
  }
  // 沒有的話，直接以單一日期做格式化
  else{
      // 如果本身就不是 日期格式，直接回傳空值
      if ( isNaN(Date.parse(dateString))){
          start =  "";
          end = "";
      }
      // 如果是可以解析的日期格式，先把它解析出來
      else{
          var tmp_str = dateString.split("-");
          // 只有年
          if ( tmp_str.length == 1){
              // 沒有輸入日期格式，直接設定為一整年
              let Year = new Date(dateString).getFullYear();
              if (isNaN(Year)){
                  start =  "";
                  end = "";
              }else{
                  // 如果有人年輸入超過4碼，自動只截取前四碼
                  Year += "";
                  Year = Year.length > 4 ? Year.substring(0, 4):Year;
                  start =  Year+"-01-01";
                  end = Year+"-12-31";
              }
          }
          // 只有 年 跟 月
          else if ( tmp_str.length == 2){
              dateString =showDate(new Date(dateString)) == undefined?"":showDate(new Date(dateString));
              if ( dateString == ""){
                  start =  "";
                  end = "";
              }else{
                  start =  dateString;
                  end =  GetLastDay(new Date(start));
              }
          }
          // 有 年、月、日
          else if (tmp_str.length == 3){
              dateString =showDate(new Date(dateString)) == undefined?"":showDate(new Date(dateString));
              if ( dateString == ""){
                  start =  "";
                  end = "";
              }else{
                  start =  dateString;
                  end =  start;
              }
          }
          // 超過、大於 都有問題，都歸零
          else{
              start =  "";
              end = "";
          }
      }
  }

  return start +"~"+end;
}
// ----------------------------------------------------------------------------------
/* 
  取得目前月份的最後一天
  參數說明：
  DateValue   -> 傳入的日期(傳入new Date()格式的日期)
*/
// ----------------------------------------------------------------------------------
function GetLastDay(DateValue) {
  var date = new Date(DateValue);
  var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0); //設定為下個月的第 0 天（即本月的最後一天）
  return showDate(lastDay);
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
    "總經理":["張總","祐寧"],
    "一樓":["竹君","美淑","麗華","惠貞","Jany","Mia","May","Bernice","Debby","Amy","Sandy","小Hank","Bella","Sophi","Melanie","Ariel"],
    "二樓":["藝芬","文琪","曜","怡廷","莠惠","享","明倫","宜芬","坤琳","兆閎","聖安","商榮"],
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