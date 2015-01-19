/*
 categorySelector 1.0.0
 Licensed under the MIT license.
 https://github.com/VaJoy/categorySelector
 */

(function ($, window, undefined) {
    $.fn.bindCategory = function (option) {
        var $win = $(window),
            $body = $("body"),
            $html = $("html"),
            $initInput = $(this);//被绑定的组件
        option = option || {};
        option = $.extend({
            data: [
                {"id": "1", "name": "游戏", "items": [
                    {"id": "21", "name": "益智游戏"},
                    {"id": "22", "name": "角色扮演"},
                    {"id": "23", "name": "儿童游戏"}
                ]},
                {"id": "2", "name": "书籍", "items": [
                    {"id": "31", "name": "地图雏形"},
                    {"id": "32", "name": "商务理财"},
                    {"id": "33", "name": "浪漫偶像"},
                    {"id": "34", "name": "社交人文"},
                    {"id": "35", "name": "儿童教学"},
                    {"id": "36", "name": "建筑工程"},
                    {"id": "37", "name": "科学技术"}
                ]},
                {"id": "3", "name": "应用", "items": [
                    {"id": "50", "name": "网络工具"},
                    {"id": "52", "name": "系统必备"},
                    {"id": "53", "name": "辅助工具"}
                ]}
            ],
            theme: "#2cbaa0", //主题颜色
            title: "请选择类别",  //弹出框标题
            emptyText:"", //如果初始值为空，可自定义初始内容
            itemNum: 3,   //最多可选择的个数
            groupTitle_enable: true,  //小组标题是否可选
            splitor: ",", //分隔符
            callback: !1,  //回调
            emptyEnable:!1  //是否选项可为空
        }, option);

        $html.css("minHeight", "100%");

        var win_h, sroll_t, sroll_l,
            addedNum = 0,
            doc_h = Math.max($body.height(), $html.height()),
            $clearFixed = $("<style id='cs-clearFixed'>.cs-fontInit{font:12px/1.2 \"Arial\",\"Microsoft Yahei\";}.cs-clearfixed:after{content:'\\200B';display:block;height:0;clear:both;}.cs-a-hover,.cs-btn-hover{transition:all .3s;}.cs-a-hover{color:#ccc;}.cs-a-hover:hover{color:" + option.theme + ";}.cs-btn-hover{color:#333;}.cs-btn-hover:hover{color:white;background:" + option.theme + ";}.cs-selected{color:white;background:" + option.theme + ";}</style>"),
            $bg = $("<div style='position:absolute;z-index:9999996;top:0;left:0;width:100%;height:" + doc_h + "px;background:black;opacity:0.6;'></div>"),
            $wrap = $("<div class='cs-fontInit' style='position:absolute;padding-bottom:13px;z-index:9999997;left:50%;width:750px;color:#666;background:white;'></div>"),
            $top = $("<h3 style='padding:10px;margin:0;border-bottom:solid 1px #ccc;font-size:14px;background:#F3F3F3;'>" + option.title + "<label id='maxNum' style='font-weight:normal;'></label><div style='float: right;width:130px;text-align: right;font-size:12px;font-weight:normal;'><span>[ <a style='text-decoration:none;color:" + option.theme + ";' id='cs_save' href='javascript:void(0);'>确定</a> ]</span>&nbsp;&nbsp;<span>[ <a style='text-decoration:none;color:" + option.theme + ";' id='cs_cancle' href='javascript:void(0);'>取消</a> ]</span></div></h3>"),
            $candidateArea = $("<div class='cs-clearfixed' style='padding:10px;padding-bottom:5px;border-bottom: dotted 1px #ccc;'><span style='display:block;float: left;padding-top:4px;'>已添加：</span><div id='addedArea' style='float: left;width:580px;'></div><a id='cs-clearAll' style='display:block;float:right;padding:2px 5px;border-radius:3px;color:white;text-decoration:none;background:" + option.theme + ";' href='javascript:void(0);' title='情况全部选项'>清空</a></div>"),
            $selectArea = $("<div class='cs-clearfixed' style='padding:20px 10px 0 10px;height:380px;border-bottom: dotted 1px #ccc;overflow-y:scroll;'></div>");

        if ($initInput.data("bindCategory")) $initInput.off("click", showCategory);  //单例模式
        else {
            $initInput.data("bindCategory", "bound");
            $initInput.on("click", showCategory);
            setDefaultVal(option.emptyText);
        }
        if ($("#cs-clearFixed").length < 1) $("head").append($clearFixed);

        /**
         * 展示分类选择框，整体事件
         */
        function showCategory() {
            initUI();
            bindBtn();
            bindData();
            addDefaultData();
            resetAll();
        }

        /**
         * 无初始化数据时，绑定控件要显示的内容
         * @param text - 文本内容
         */
        function setDefaultVal(text){
            if($initInput.attr("data-id")==="" && text!==""){ //没有初始数据,且配置文本不为空
                $initInput.val(text).text(text);
            }
        }

        /**
         * 绑定初始化数据（全部选项）
         */
        function bindData() {
            var isMulLevel = option.data[0].items ? !0 : !1;
            if (isMulLevel) { //两级数据
                for (var i = 0, l = option.data.length; i < l; i++) {
                    addGroupTitle(option.data[i].id, option.data[i].name); //添加组标题
                    addGroupItems(option.data[i].items,option.data[i].id);  //添加组选项
                }
            }else{ //单级数据
                addGroupItems(option.data);
            }
        }

        /**
         * 清空
         */
        function resetAll(){
            $("#cs-clearAll").click(function(){
                $("a","#addedArea").each(function(){
                    $(this).click();
                })
            })
        }

        /**
         * 交替修改选项按钮背景色
         * @param id - 选项键值
         */
        function toggleBg(id){
            $selectArea.find("a[data-id="+id+"]").toggleClass("cs-selected");
        }

        /**
         * 添加组标题到选择区
         * @param id - 选项键值
         * @param name - 选项名称
         */
        function addGroupTitle(id, name) {
            var $gtitle = $("<a data-id='" + id + "' style='display:inline-block;padding:3px 8px;min-width:60px;text-align:center;font-weight:bold;font-size:14px;text-decoration:none;' href='javascript:void(0);'>" + name + "</a>");
            if (option.groupTitle_enable) {
                $gtitle.css("border", "solid 1px " + option.theme).addClass("cs-btn-hover");
                $gtitle.click(function () {
                    AddItem(id, name)
                });
            } else {
                $gtitle.css({"cursor": "default", "color": "#666"});
            }
            $gtitle.appendTo($selectArea);
        }

        /**
         * 添加组内选项
         * @param data - 选项json数据
         * @param groupid - 组标题项键值
         */
        function addGroupItems(data,groupid) {
            groupid = groupid?groupid:"";
            var $itemsWrap = $("<div style='margin:8px 0 30px 0;'></div>");
            for (var i = 0, l = data.length; i < l; i++) {
                var $item = $("<a class='cs-btn-hover' data-id='" + data[i].id + "' style='display:inline-block;margin:5px 10px 0 0;padding:4px 8px;min-width:60px;text-align:center;text-decoration:none;border:solid 1px #ccc' href='javascript:void(0);'>" + data[i].name + "</a>");
                (function (id,name) {
                    $item.click(function () {
                        AddItem(id,name,groupid);
                    });
                    $item.appendTo($itemsWrap);
                }(data[i].id, data[i].name))
            }
            $itemsWrap.appendTo($selectArea);
        }

        /**
         * 添加已选择的数据
         */
        function addDefaultData() {
            var boundnames = $initInput.val() || $initInput.text(),
                boundids = $initInput.attr("data-id");
            if (!boundids) return false;  //没有默认数据则忽略
            var name_arr = boundnames.split(option.splitor),
                id_arr = boundids.split(option.splitor);
            for (var i = 0, l = id_arr.length; i < l; i++) {
                AddItem(id_arr[i], name_arr[i]);
            }
        }

        /**
         * 添加选项到候选区
         * @param id - 选项键值
         * @param name - 选项名称
         * @param groupid - 组标题项键值（可选）
         */
        function AddItem(id, name, groupid) {
            var $addedArea = $("#addedArea"),
                $btn = $addedArea.find("span[data-id="+id+"]");
            if ($btn.length > 0){ //选择的选项已在选中队列则删除
                deleteItem($btn);
                return false;
            }
            if(option.itemNum==1){  //单选状态下，如果已有选项，那么新选项直接替换掉旧选项
                var $span = $addedArea.find("span");
                if ($span.length > 0){
                    deleteItem($span);
                }
            }
            if (addedNum >= option.itemNum) return false;  //超过可选次数则忽略
            var $added = $("<span data-id='" + id + "' data-name='" + name + "' style='display:block;float:left;padding:3px 8px;margin:0 5px 5px 5px;min-width:68px;border:solid 1px " + option.theme + ";'>" + name + " <a class='cs-a-hover' style='display:block;float:right;margin-left:5px;text-decoration:none;' title='删除该选项' href='javascript:void(0);'>X</a></span>")
                .appendTo("#addedArea");
            toggleBg(id);
            if(groupid) $added.attr("data-group",groupid);
            $added.find("a").click(function () {
                deleteItem(id);
            });
            ++addedNum;
            $("#sc-errorInfo").hide();
        }

        /**
         * 删除已选的选项
         * @param id - 选项键值
         */
        function deleteItem(id){
            var $btn;
            if(typeof id === "object"){
                $btn = id;
                id = $btn.attr("data-id");
            }else $btn = $("#addedArea").find("span[data-id="+id+"]");
            $btn.remove();
            toggleBg(id);
            --addedNum;
        }

        /**
         * 初始化UI
         */
        function initUI() {
            win_h = window.innerHeight || document.documentElement.clientHeight;
            sroll_t = $win.scrollTop();
            sroll_l = $win.scrollLeft();
            $bg.appendTo($body).hide().fadeIn(200);
            $wrap.append($top).append($candidateArea).append($selectArea).appendTo($body).css({"top": win_h / 2 + sroll_t, "marginTop": "-247px", "marginLeft": "-375px"});
            var info = option.itemNum > 1 ? "最多可选" : "只能选择";
            $("#maxNum").html("（" + info + " <strong style='color:" + option.theme + ";'>" + option.itemNum + "</strong> 项<lable id='sc-errorInfo' style='display: none;'>，<strong style='color:" + option.theme + ";'>请至少先选择一项</strong></lable>）");
        }

        /**
         * 绑定“确定”/“取消”按钮事件
         */
        function bindBtn() {
            //“取消”按钮
            $("#cs_cancle").on("click", closeAll);
            //“确定”按钮
            $("#cs_save").click(function () {
                var $itemSpans = $("#addedArea").children("span"),
                    names = "", ids = "";
                if (!option.emptyEnable && $itemSpans.length < 1) {
                    $("#sc-errorInfo").show(200);
                    return false;
                }
                $itemSpans.each(function (i) {
                    names += (i > 0 ? option.splitor : "") + $(this).attr("data-name");
                    ids += (i > 0 ? option.splitor : "") + $(this).attr("data-id");
                });
                $initInput.attr("data-id", ids).text(names).val(names);
                if(ids==="") setDefaultVal(option.emptyText);
                closeAll();
                if(typeof option.callback ==="function"){
                    option.callback(ids);
                }
            })
        }

        /**
         * 关闭分类选择框
         */
        function closeAll() {
            $("#addedArea").empty();
            $selectArea.empty();
            $wrap.empty().add($bg).remove();

            addedNum = 0;
        }

    }
}(jQuery, window, undefined));