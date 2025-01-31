// 20250121 Maria 用於取得ㄓ用於取得 試算表的資料
const GAS_URL = "https://script.google.com/macros/s/AKfycbxkS21rC1mPLbmSUr8DCSYz0-lyX_kvJcIM-9PH-noaENZXg89faKjzmc4qIZtiHLbVwA/exec";
const GAS_token = "Bearer" + "AKfycbwMdriL5N0SjN7cECcyXJn9yvRe5MKA3kyYxZOaOw-U"
function GetGasData (sheetName,para = {}){
    var data ;
    $.ajax({
        // 因為我用git 去通過驗證，所以必須給 token 讓他通過
        headers: {authorization: token},
        async: false,
        type: "post",
        data: {
            "method": "read",
            "sheetName": sheetName,
        },
        // 填入網路應用程式網址
        url: GAS_URL,
        success:
            function (result) {
                data =  result;    
            }
    });
    return data;
}

function InsertGasData (sheetName,para = {}){
    var data ;
    $.ajax({
        // 因為我用git 去通過驗證，所以必須給 token 讓他通過
        headers: {authorization: token},
        async: false,
        type: "post",
        data: {
            "method": "write",
            "sheetName": sheetName,
        },
        // 填入網路應用程式網址
        url: GAS_URL,
        success:
            function (result) {
                data =  result;    
            }
    });
    return data;
}
