// 20250121 Maria 用於取得用於取得 試算表的資料
const GAS_URL = "https://script.google.com/macros/s/AKfycbyPEfcv34-WOFadVhgWjLv2H3StMKL4IXnuFeIZAH_p7ipexFd2m22FD9PHB6LUjB1nCg/exec";
function GetGasData (sheetName,para = {}){
    var data ;
    $.ajax({
        async: false,
        type: "POST",
        data: {
            "method": "select",
            "sheetName": sheetName,
            'other_para':para,
        },
        // 填入網路應用程式網址
        url: GAS_URL,
        success:function (result) {
            if ( result.status == 1){
                data =  result.dataList;
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            error_msg(jqXHR, textStatus, errorThrown);					
        },
    });
    return data;
}

function InsertGasData (sheetName,para = {}){
    $.ajax({
        type: "post",
        data:  data = {
            "method": "insert",
            "sheetName": sheetName,
            'other_para':JSON.stringify(para) ,
        },
        // 填入網路應用程式網址
        url: GAS_URL,
        success:function (result) {
        },
        error: function(jqXHR, textStatus, errorThrown) {
            error_msg(jqXHR, textStatus, errorThrown);					
        },
    });
}

function UpdateGasData (sheetName,para = {}){
    $.ajax({
        type: "post",
        data:  data = {
            "method": "update",
            "sheetName": sheetName,
            'other_para':JSON.stringify(para) ,
        },
        // 填入網路應用程式網址
        url: GAS_URL,
        success:function (result) {
        },
        error: function(jqXHR, textStatus, errorThrown) {
            error_msg(jqXHR, textStatus, errorThrown);					
        },
    });
}

function DeleteGasData (sheetName,para = {}){
    $.ajax({
        type: "post",
        data:  data = {
            "method": "delete",
            "sheetName": sheetName,
            'other_para':JSON.stringify(para) ,
        },
        // 填入網路應用程式網址
        url: GAS_URL,
        success:function (result) {
        },
        error: function(jqXHR, textStatus, errorThrown) {
            error_msg(jqXHR, textStatus, errorThrown);					
        },
    });
}