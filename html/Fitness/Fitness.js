/*---------------------------------------------*/
// 設定常數
/*---------------------------------------------*/
const event_member =["洗衣粉","Jill","Yao","Luna","黑柴薩克","享","明倫","Maria","坤哥","Debby","Hao","香蕉","Jason"];
/*---------------------------------------------*/
// 導到頁面
/*---------------------------------------------*/
function GoBackIdx(type){
    if (location.href.includes("github")) {
        location.href = '/takoiscute/html/Fitness/Fitness_'+type+'.html';
    } else {
        location.href = "Fitness_"+type+".html";
    }
}
/*---------------------------------------------*/
// 取得範例html
/*---------------------------------------------*/
function GetEventHtml(event_list){
    var event_html = "";
    for ( let i = 0 ; i < event_list.length  ; i++){
        if ( event_list[i].id !== ""){
            /*---------------------------------------------*/
            // 成團狀態
            /*---------------------------------------------*/
            var status_group = event_list[i].status_group;
            switch (status_group){
                case "報名中" :
                status_group_class = "btn-warning";
                break;
                case "已成團" :
                status_group_class = "btn-success";
                break;
                case "已流團" :
                status_group_class = "btn-secondary";
                break;
            }
            /*---------------------------------------------*/
            // 是否顯示我要報名(大於昨天的時候，不給報名)
            /*---------------------------------------------*/
            var event_time = event_list[i].event_time;
            var today = new Date(); // 複製一份現在時間
            var yesterday = new Date(); // 複製一份現在時間
            yesterday.setDate(yesterday.getDate() - 1); // 將日期設定為昨天
            yesterday.setHours(23, 59, 0, 0); // 設定時、分、秒、毫秒
            var sign_in_status =  new Date(event_time) < (new Date(yesterday))?"d-none":"";
            /*---------------------------------------------*/
            // 倒數時間
            /*---------------------------------------------*/
            var target = new Date(event_time); // 轉換目標日期為 Date 物件
            // 將時間部分歸零，只比較日期
            today.setHours(0, 0, 0, 0);
            target.setHours(0, 0, 0, 0);
            if ( target.getTime() > today.getTime()){
                var timeDiff = target.getTime() - today.getTime(); // 計算時間差（毫秒）
                var daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)); // 轉換為天數
            }else{
                var daysDiff = 0;
            }
            /*---------------------------------------------*/
            // 第一個顯示 show
            /*---------------------------------------------*/
            var show = i == 0?"show":"";
            /*---------------------------------------------*/
            event_html += `
                <div class="card">
                    <div class="card-header">
                        <button class="btn btn-link btn-block text-left" type="button" data-toggle="collapse"
                            data-target="#collapse_`+i+`" aria-expanded="true" aria-controls="collapse_`+i+`">
                            <span style="font-size: 18px;font-family:'cjkFonts_allseto';">`+event_list[i].event_name+`</span>
                            <span style="font-size: 14px;color: red;">-倒數`+daysDiff+`天</span>
                            <input type="button" class="label_show `+status_group_class+`" value="`+event_list[i].status_group+`" />
                        </button>
                    </div>
                    <div id="collapse_`+i+`" class="collapse `+show+`" aria-labelledby="headingOne"
                        data-parent="#event_list">
                        <div class="card-body">
                            <div class="input-group mb-3">
                                <div class="input-group-prepend">
                                    <span class="input-group-text">活動時間</span>
                                </div>
                                <input type="text" class="form-control" value="`+showDateTime(event_list[i].event_time)+`" disabled="disabled">
                            </div>
                            <div class="input-group mb-3">
                                <div class="input-group-prepend">
                                    <span class="input-group-text">活動地點</span>
                                </div>
                                <input type="text" class="form-control" value="`+event_list[i].event_local+`" disabled="disabled">
                            </div>
                            <div class="input-group mb-3">
                                <div class="input-group-prepend">
                                    <span class="input-group-text">每人自費</span>
                                </div>
                                <input type="text" class="form-control" value="`+event_list[i].pre_cost+`" disabled="disabled">
                            </div>
                            <div class="input-group mb-3">
                                <div class="input-group-prepend">
                                    <span class="input-group-text">報名人員</span>
                                </div>
                                <input type="text" class="form-control" value="`+event_list[i].sign_on+`" disabled="disabled">
                            </div>
                            <div class="input-group mb-3">
                                <div class="input-group-prepend">
                                    <span class="input-group-text">活動詳情</span>
                                </div>
                                <textarea class="form-control" disabled="disabled" >`+event_list[i].event_detail+`</textarea>
                            </div>
                            <div class="modal-footer `+sign_in_status+`">
                                <input type="button" class="btn btn-primary" value="我要報名" />
                            </div>
                            <footer class="blockquote-footer text-center">發起人: <cite title="Source Title">`+event_list[i].event_leader+`</cite>
                            </footer>
                        </div>
                    </div>
                </div>
            `;
        }
        
    }
    return event_html;
}
