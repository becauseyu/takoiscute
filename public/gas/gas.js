// 20250121 Maria 用於取得用於取得 試算表的資料
const GAS_URL = "https://script.google.com/macros/s/AKfycbxIZezO5otCSxIaasRMO81nCXpOR_zBWTDr0m33KxKyh7kBmlgs4qxGX8RT-LGkosBa4w/exec";
const GAS_token = "Bearer " + "AKfycbwMdriL5N0SjN7cECcyXJn9yvRe5MKA3kyYxZOaOw-U"
function GetGasData (sheetName,para = {}){
    var data ;
    $.ajax({
        // 因為我用git 去通過驗證，所以必須給 token 讓他通過
        // headers: {
        //     "Authorization": GAS_token,
        // },
        async: false,
        type: "POST",
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
        headers: {authorization: GAS_token},
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
