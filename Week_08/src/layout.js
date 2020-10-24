/**
 * 对style进行预处理
 */
function getStyle(element){
    if(!element.style){
        element.style = {};
    }
    
    for(let prop in element.computedStyle) {
        var p = element.computedStyle.value;
        //用style属性存这些值
        element.style[prop] = element.computedStyle[prop].value;

        // 把px的string值转成int型
        if(element.style[prop].toString().match(/px$/)){
            element.style[prop] = parseInt(element.style[prop]);
        }
        //把string的数字转为int型
        if(element.style[prop].toString().match(/^[0-9\.]+$/)){
            element.style[prop] = parseInt(element.style[prop]);
        }
    }
    return element.style;
}

function layout(element){
    if(!element.computedStyle)
        return;
    
    var elementStyle = getStyle(element);

    //暂时只处理flex类型的
    if(elementStyle.display !== "flex")
        return;

    //把文本节点过滤出去
     var items = element.children.filter(e => e.type === "element");
     
     // 支持sort属性
     items.sort(function (a, b){
         return (a.order || 0) - (b.order || 0);
     });

     var style = elementStyle;

     //width和height为空的话，初始化为null
     ['width', 'height'].forEach(size => {
         if(style[size] === 'auto' || style[size] === ''){
             style[size] = null;
         }
     })

     // 设置初始值
     if(!style.flexDirection || style.flexDirection === 'auto')
        style.flexDirection = 'row';
     if(!style.alignItems || style.alignItems === 'auto')
        style.alignItems = 'stretch';
     if(!style.justifyContent || style.justifyContent === "auto")
        style.justifyContent = "flex-start";
     if(!style.flexWrap || style.flexWrap === "auto")
        style.flexWrap = "nowrap";
     if(!style.aliginContent || style.aliginContent === "auto")
        style.aliginContent = "stretch";

      var mainSize, mainStart, mainEnd, mainSign, mainBase,
          crossSize, crossStart, crossEnd, crossSign, crossBase;
      
      if(style.flexDirection === "row"){
          mainSize = "width";
          mainStart = "left";
          mainEnd = "right";
          mainSign = +1;
          mainBase = 0;

          crossSize = "height";
          crossStart = "top";
          crossEnd = "bottom";
      }      
      if(style.flexDirection === "row-reverse"){
        mainSize = "width";
        mainStart = "right";
        mainEnd = "left";
        mainSign = -1;
        //从最右边开始，自然就是从width的最右边开始
        mainBase = style.width;

        crossSize = "height";
        crossStart = "top";
        crossEnd = "bottom";
      }
      if(style.flexDirection === "column"){
        mainSize = "height";
        mainStart = "top";
        mainEnd = "bottom";
        mainSign = +1;
        mainBase = 0;

        crossSize = "width";
        crossStart = "left";
        crossEnd = "right";
      }
      if(style.flexDirection === "column-reverse"){
        mainSize = "height";
        mainStart = "bottom";
        mainEnd = "top";
        mainSign = -1;
        mainBase = style.height;

        crossSize = "width";
        crossStart = "left";
        crossEnd = "right";
      }
      if(style.flexWrap === "wrap-reverse"){
          //如果是反向换行的话，设置交叉轴的开始和结束互换一下
          var tmp = crossStart;
          crossStart = crossEnd;
          crossEnd = tmp;
          crossSign = -1;
      }else{
          crossBase = 0;
          crossSign = 1;
      }

      // 父元素如果没有设置主轴尺寸，就会进入到一个模式autoMainSize，就是子元素把父元素撑开，这种情况子元素的尺寸无论如何也不会超
      var isAutoMainSize = false;
      if(!style[mainSize]) { //父元素没有设置mainSize，则是auto sizing
        
          elementStyle[mainSize] = 0; //mainSize设置为0
          //把所有子元素的mainSize加起来就是它的主轴的size了
          for(var i  = 0; i < items.length; i++){
              var item = items[i];
              if(itemStyle[mainSIze] !== null || itemStyle[mainSize] !== (void 0))
                elementStyle[mainSize] = elementStyle[mainSize] + itemStyle[mainSize];
          }
          isAutoMainSize = true;
      }

      /** 把元素收进行 */
      
      var flexLine = [];  //行
      var flexLines = [flexLine];

      var mainSpace = elementStyle[mainSize]; //剩余空间
      var crossSpace = 0;

      for(var i = 0; i < items.length; i++){
        var item = items[i];
        var itemStyle = getStyle(item);

        if(itemStyle[mainSize] === null) {
            //没有设置主轴尺寸，给默认值0
            itemStyle[mainSize] = 0;
        }

        if(itemStyle.flex){
            //如果有flex属性，则说明这个元素是可伸缩的，它一定可以放到flexLine(行)里面
            flexLine.push(item);
        }else if (style.flexWrap === 'nowrap' && isAutoMainSize){ //不换行（no wrap）
            mainSpace -= itemStyle[mainSIze];
            // 如果item的交叉轴尺寸不为null，crossSpace取最高的那个值，因为flex布局里面，一行有多高取决于这一行里最高的元素有多高
            if (itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0))
                crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
            
                flexLine.push(item);    
        }else{ // 换行
            if(itemStyle[mainSize] > style[mainSize]){
                //如果item元素比父元素主轴尺寸还大，则压到跟父元素主轴尺寸一样大
                itemStyle[mainSize] = style[mainSize];
            }
            // 如果主轴剩余空间小于元素的尺寸了，那么就要采取换行的策略了
            if(mainSpace < itemStyle[mainSize]){
                //放不下，则换行
                
                // 给数组加属性（第一次看到这种写法）
                flexLine.mainSize = mainSize; //主轴剩余的空间
                flexLine.crossSpace = crossSpace; //交叉轴的空间
                flexLine = [item];  // 创建一个新行
                flexLines.push(flexLine);
                
                // 重置mainSpace和crossSpace两个属性
                mainSpace = style[mainSize];
                crossSpace = 0;
            }else {
                // 放得下，不换行
                flexLine.push(item);
            }
            //算一下主轴和交叉轴的尺寸
            if(itemStyle[crossSize] !== null && itemStyle !== (void 0))
                crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
            
            mainSpace -= itemStyle[mainSpace]
        }
      }
      //元素已经没有了的话，给最后一行flexLine加上mainSpace
      flexLine.mainSpace = mainSpace;

      console.log(items);
}

module.export = layout;