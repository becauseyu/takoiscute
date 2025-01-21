var gas = "https://script.google.com/macros/s/AKfycbyW5Se0hIHNM4fGLvvfwLWbYd8kn-irHlduxpi1l3cj3LzwhcPXBZsJCgc-uMmD6T7FBA/exec";
// 20250121 Maria 用於取得ㄓ用於取得 試算表的資料
function GetBirthDay (){
    var data ;
    $.ajax({
        async: false,
        type: "post",
        data: {
            "method": "read",
            "sheetName": "生日",
        },
        // 填入網路應用程式網址
        url: gas,
        success:
            function (result) {
                data =  result;
            }
    });
    return data;
}
