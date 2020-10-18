# CSS计算

### 第一步(收集CSS规则)
- 遇到style标签时，我们把CSS规则保存起来
- 这里我们调用CSS parser（npm的CSS包里的parser()函数）来分析CSS规则
- 这里我们必须要仔细研究此库分析CSS规则的格式

### 第二步(添加调用)
- 当我们创建一个元素后，立即计算CSS
- 理论上，我们分析一个元素时，所有CSS规则已经收集完毕
- 在真实浏览器中，可能遇到写在body的style标签，需要重新计算CSS的情况，这里我们忽略

### 第三步总结（获取父元素序列）
- 在computeCSS函数中，我们必须知道元素的所有父元素才能判断元素与规则是否匹配
- 我们从上一步的stack可以获取本元素的所有的父元素
- 因为我们首先获取的是“当前元素”，所以我们获得和计算父元素匹配的顺序是从内向外<br>
 <img src="./image/获取父元素序列.png" width = "350" height = "100" alt="ISO-OSI七层网络模型" align=center />

### 第四步总结（选择器与元素的匹配）
- 选择器也要从当前元素向外排列
- 复杂选择器拆成针对单个元素的选择器，用循环匹配父元素队列

### 第五步总结（计算选择器与元素匹配）
- 根据选择器的类型和元素属性，计算是否与当前元素匹配
- 这里仅仅实现了三种基本选择器，实际的浏览器中要处理复合选择器 

### 第六步总结（生成computed属性）
- 一旦选择匹配，就应用选择器到元素上，形成computedStyle

### 第七步总结（specificity的计算逻辑）
- CSS规则根据specificity和后来优先规则覆盖
- specificity是个四元组，越左边权重越高
- 一个CSS规则的specificity根据包含的简单选择器相加而成


<br><br>
在CSS设计里面，有一条隐藏的潜规则，CSS设计会尽量保证所有的选择器都能够在startTag进入的时候就能够被判断。大部分的规则任然是遵循这个规则的，就是当DOM树构建到元素的startTag的步骤，就已经可以判断出来它能匹配哪些CSS规则了。

priority 优先级
specificity 特性、专一性（被翻译为css里的优先级）

### specificity的计算逻辑

specificity的计算是根据单个的复杂选择器去加起来去计算的

specificity是一个四元组[inline, id, class, tagName],依次优先级会下降

[0, &nbsp;&nbsp;&nbsp;&nbsp;0, &nbsp;&nbsp;&nbsp;&nbsp;0, &nbsp;&nbsp;&nbsp;&nbsp;0]

inline   id   class  tagName

例如：div div #id，那么是[0, 1, 0, 2] tagName重复了两次，所以是2

