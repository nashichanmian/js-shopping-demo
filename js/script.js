window.onload = function () {
    //兼容ie
    if (!document.getElementsByClassName) {
        document.getElementsByClassName = function (cls) {
            var ret = [];
            var els = document.getElementsByTagName('*');
            for (var i = 0, len = els.length; i < len; i++) {
                if (els[i].className === cls
                    || els[i].className.indexOf(cls + ' ') >= 0
                    || els[i].className.indexOf(' ' + cls + ' ') >= 0
                    || els[i].className.indexOf(' ' + cls) >= 0) {
                    ret.push(els[i]);
                }
            }
            return ret;
        }
    }

    var cartTable = document.getElementById('cartTable');
    var tr = cartTable.children[1].rows; //获取所有的行
    var checkInputs = document.getElementsByClassName('check'); //获取所有的选框
    var checkALLinputs = document.getElementsByClassName('check-all');//获取全选框
    var selectedTotal = document.getElementById('selectedTotal');//商品总数
    var priceTotal = document.getElementById('priceTotal');//所有选中商品的总价格
    var selected = document.getElementById('selected');//浮层按钮
    var foot = document.getElementById('foot');//浮层容器
    var selectedViewList = document.getElementById('selectedViewList');//包裹浮层内容的DIV
    var deleteAll = document.getElementById('deleteAll');//全部删除

    //计算函数
    var getTotal =() =>{
        var seletd = 0; //数量
        var price =0 ; //价格
        var HTMLstr = '';//底部已选中商品汇总
        for(var i = 0; i < tr.length; i++){//循环所有行
            if(tr[i].getElementsByTagName('input')[0].checked){ //如果当前行的选框是选中状态
                tr[i].className = 'on';//为选中的框添加背景颜色
                seletd += parseInt(tr[i].getElementsByTagName('input')[1].value); //商品数量input
                price += parseFloat(tr[i].cells[4].innerHTML);  //商品价格
                HTMLstr += '<div><img src="' + tr[i].getElementsByTagName('img')[0].src + '"><span class="del" index="' + i + '">取消选择</span></div>'
            }else{
                tr[i].className = '';
            }
        }
        selectedTotal.innerHTML = seletd; //所有选中的商品数量赋值给 下面的商品总数
        priceTotal.innerHTML = price.toFixed(2); //所有选中的商品价格 赋值给下面的商品总价
        selectedViewList.innerHTML = HTMLstr; //把选中的商品添加到浮层；

        if(seletd == 0){
            foot.className = 'foot';
        }
    }

    //单行小计
    getSubTotal = (tr) =>{
        var tds = tr.cells; //当前行所有td;
        var price = parseFloat(tds[2].innerHTML);//单价
        var count = parseInt(tr.getElementsByTagName('input')[1].value);//数量
        var subTotal = parseFloat(price * count);//总价
        tds[4].innerHTML = subTotal.toFixed(2);//赋值给总价取2位小数
    }

    //选中事件
    for(var i=0; i<checkInputs.length;i++){ //循环所有选框，选中时调用计算函数
        checkInputs[i].onclick = function(){
            if(this.className === 'check-all check'){ //如果是全选框被勾选 则循环所有的单选框把状态改为checked;
                for(var j = 0; j<checkInputs.length; j++){
                    checkInputs[j].checked = this.checked;
                }
            }
            if(!this.checked){ //如果有一个选框是未勾选状态，则全选框的状态为false;
                for(var k = 0; k < checkALLinputs.length; k++){
                    checkALLinputs[k].checked = false;
                }
            }
            getTotal();
        }
    }

    //浮层控制
    selected.onclick = () => { //控制浮层的现实隐藏
        if(foot.className == 'foot'){
            if(selectedTotal.innerHTML != 0){
                foot.className = 'foot show';
            }

        }
        else{
            foot.className = 'foot';
        }
    }
    //通过事件代理控制浮层商品的取消选择
    selectedViewList.onclick = (e) =>{ //浮层的商品-》取消选择    通过e.srcElement事件代理
        e = e || window.event; //兼容IE；
        var el = e.srcElement;
        if(el.className == 'del'){//如果当前点击的元素是 span(del是创建span时加的类)
            var index = el.getAttribute('index'); //获取当前点击span的index
            var input = tr[index].getElementsByTagName('input')[0]; //获取对应的行的选框
            input.checked = false; //选框设为false
            input.onclick(); //调用点击方法；
        }
    }

    //单行的数量加减事件
    for (var i = 0; i < tr.length; i++){
        //加减click
        tr[i].onclick = function (e){
            e = e || window.event;
            var el = e.srcElement;
            var cls = el.className;
            var input = this.getElementsByTagName('input')[1];//获取当前点击行的商品数量input
            var val = parseInt(input.value); //商品数量
            var reduce = this.getElementsByTagName('span')[1];//当前点击行的减号
            switch (cls) {
                case 'add': //（add是加号的类）加号的事件
                    input.value = val + 1;//更新当前行商品数量
                    reduce.innerHTML = '-'//让减号显示
                    getSubTotal(this);//调用单行计算
                    break;
                case 'reduce'://（reduce减号的类）
                    if (val > 1){
                        input.value = val - 1; //如果当前数量大于1 更新数量
                    }
                    if (input.value <=1){
                        reduce.innerHTML = ''; //如果当前数量<=1 减号取消
                    }
                    getSubTotal(this);
                    break;
                case 'delete' :
                   var conf = confirm("确定要删除吗？");
                   if(conf){
                    this.parentNode.removeChild(this);
                   }
                   break;
            }
            getTotal();
        }
        //输入
        tr[i].getElementsByTagName('input')[1].onkeyup = function(){
            var val = parseInt(this.value); //当前值
            var tr = this.parentNode.parentNode; //获取当前Input所在行
            var reduce = tr.getElementsByTagName('span')[1];//该行的减号
            if(isNaN(val) || val <1){ //当前值判断确保输入值合法
                val = 1;
            }
            this.value = val;
            if(val <= 1){
                reduce.innerHTML = '';
            }
            else{
                reduce.innerHTML = '-';
            }
            getSubTotal(tr);//调用计算函数
            getTotal();
        }

    }
    //多个删除
    deleteAll.onclick = function(){
       if(selectedTotal.innerHTML != 0){
        var conf = confirm("确定删除吗?");
        if(conf){
            for(var i = 0; i < tr.length; i++){
                var input = tr[i].getElementsByTagName('input')[0];
                if (input.checked) {
                    tr[i].parentNode.removeChild(tr[i]);
                    i--;
                }
            }
         }
       }
    }

    //初始全选状态
    checkALLinputs[0].checked = true;
    checkALLinputs[0].onclick();
}
