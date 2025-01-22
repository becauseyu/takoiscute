// 先設定路由的全域變數
if ( location.href.includes("github")){
  // 取得所有的 <script> 元件
    var scripts = document.querySelectorAll('script');
    // 遍歷每個 <script> 元件
    scripts.forEach(function(script) {
        // 確保 src 存在且不是空字串
        if (script.src) {
            // 將 src 修改為原本的 src 加上 "aaa/"
            var originalSrc = script.getAttribute('src');
            var newSrc = originalSrc + '/takoiscute/';
            script.setAttribute('src', newSrc);
        }
    });
}

