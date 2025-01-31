// 20250121 Maria 用於取得用於取得 試算表的資料
const GAS_URL = "https://script.google.com/macros/s/AKfycbwmqnoFT-DrDCuuLNMMU-iBnw0ila0HowpaPdy46AHeq1nBfybXoGC12aTJAiVZoaLgAA/exec";
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
    var data ;
    $.ajax({
        type: "post",
        data: {
            "method": "write",
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
