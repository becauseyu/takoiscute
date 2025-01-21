var gas = "https://script.google.com/macros/s/AKfycbxkS21rC1mPLbmSUr8DCSYz0-lyX_kvJcIM-9PH-noaENZXg89faKjzmc4qIZtiHLbVwA/exec";
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
