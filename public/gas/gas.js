// 20250121 Maria 用於取得用於取得 試算表的資料
const GAS_URL = "https://script.google.com/macros/s/AKfycbzFSe7HRfjTl8y8PjoGKoEk7rV8cxBreGCnucoLy78jss5NrO_IKEQs7DGU4tYiN41pqQ/exec";
function GetGasData (sheetName,para = {}){
    var data ;
    $.ajax({
        async: false,
        type: "POST",
        data: {
            "method": "read",
            "sheetName": sheetName,
            'other_para':para,
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
    $.ajax({
        type: "post",
        data:  data = {
            "method": "write",
            "sheetName": sheetName,
            'other_para':JSON.stringify(para) ,
        },
        // 填入網路應用程式網址
        url: GAS_URL,
        success:
            function (result) {
                data =  result;    
            }
    });
}
