## 使用LL算法构建AST
- AST:抽象语法书
- 我们的代码在计算机的分析过程中（构建AST语法树的过程叫语法分析）
   1. 首先把我们的编程语言去分词
   2. 把这些词构成层层嵌套的语法树的树形结构
   3. 解析代码执行
- 最著名的语法算法，核心的思想有两种
   - LL算法 （Left Left：从左到右扫描，然后从左到右规约的缩写）
   - LR算法 
   - (这里的L是Left的缩写)  

#### 四则运算
词法的定义：
- TokenNumber：1 2 3 4 5 6 7 8 9 0 的组合
- Operator：+、-、*、/ 之一
- WhiteSpace：\<SP\>
- LineTerminator: \<LF\>、\<CR\>

语法的定义：

\<Expression\>::=<br>
 &nbsp;&nbsp;&nbsp;&nbsp;\<AdditiveExpression\><span style="background-color:Teal;">\<EOF\></span>

 \<AdditiveExpression\>::=<br>
 &nbsp;&nbsp;&nbsp;&nbsp;\<MultiplicativeExpression\><br>
 &nbsp;&nbsp;&nbsp;&nbsp;|\<AdditiveExpression\><span style="background-color:Teal;">\<+\></span>\<MultiplicativeExpression\><br>
 &nbsp;&nbsp;&nbsp;&nbsp;|\<AdditiveExpression\><span style="background-color:Teal;">\<-\></span>\<MultiplicativeExpression\><br>
 
 \<MultiplicativeExpression\>::=<br>
&nbsp;&nbsp;&nbsp;&nbsp;<span style="background-color:Teal;">\<Number\></span><br>
 &nbsp;&nbsp;&nbsp;&nbsp;|\<MultiplicativeExpression\><span style="background-color:Teal;">\<*\>\<Number\></span><br>
 &nbsp;&nbsp;&nbsp;&nbsp;|\<MultiplicativeExpression\><span style="background-color:Teal;">\</\>\<Number\></span><br>
</br>

语法的定义，我们可以认为,因为加号和乘号(加法和乘法),它是有一个优先级关系的，所以说我们需要用JavaScript部分的产生式去定义它的加法和乘法运算，所以说我们需要把加减乘除给它做成一个嵌套的解构。我们认为加法是由左右两个乘法组成的。并且加法还是可以进行连加的，所以说加法应该是一个重复自身的一个序列。

MultiplicativeExpression就是乘法运算的，我们把一个单独的数字，认为它是一种特殊的乘法，就是它是只有一项的乘法。**我们把只有乘号的，我们把它认为是一种特殊的加法，只有一项的加法**(所以加法的产生式里有一个MultiplicativeExpression)，这样比较方便我们去递归的定义整个表达式。我们把一个单独的乘法，也视作一种特殊的加法，就是0次的一个加法。

MultiplicativeExpression,它的定义是一个用乘号或除号相连接的Number的序列。我们规定它可以是一个单独的Number，它也可以是一个乘法表达式后边缀上一个乘号再加上一个Number。

这里标成蓝绿背景的是我们定义里的终结符，就是TerminalSymbol。TerminalSymbol就是我们直接从词法里扫描出来的；而这些白色的没有标出来的部分，就是NoneTerminalSymbol，非终结符。非终结符就是我们拿终结符的组合定义出来的。

我们去定义乘法表达式的非终结符，那么它可以是一个单独的Number；也可以是它自身加上一个乘号，然后再加上一个Number；当然也可以是它自身加上除号，加上一个Number；这是乘法表达式的这样一个结构，我们遇到这样的结构，就可以认为它是一个乘法表达式了。

加法的结构跟乘法类似，只不过是它的基本单元换成了一个非终结符MultiplicativeExpression，就是数个乘法用加号或减号连接在一起，那么它就是加法的结构。

最后我们认为，整体的我们能处理的表达式Expression，它就是一个加法表达式。后面我们引入了一个特殊的符号 EOF,EOF并不是一个真实可见的字符，但是因为我们的语法需要一个终结，因为有的时候在分析的过程中，如果有一些结构，是要求一定要到尾巴上才结束的，所以说EOF就是这样的一个符号，它标识了我们所有的源代码的结束。EOF这是End of File的缩写，它也常常被用在计算机里各种表示终结的场景。

#### LL语法分析是怎么做的
以加法表达式为例：

 \<AdditiveExpression\>::=<br>
 &nbsp;&nbsp;&nbsp;&nbsp;\<MultiplicativeExpression\><br>
 &nbsp;&nbsp;&nbsp;&nbsp;|\<AdditiveExpression\><span style="background-color:Teal;">\<+\></span>\<MultiplicativeExpression\><br>
 &nbsp;&nbsp;&nbsp;&nbsp;|\<AdditiveExpression\><span style="background-color:Teal;">\<-\></span>\<MultiplicativeExpression\><br>
 
 我们总是从输入的序列里面，我们去看它当前我们能够拿到的是什么样的东西。上面这三条产生式的规则里面，如果我们在处理AdditiveExpression，那么它的找到的第一个符号symbol会是什么呢？我们从上面产生式里看到，它可能会面临两种情况，第一种就是开头是一个MultiplicativeExpression，第二种情况就是一个AdditiveExpression。那么是不是就只有这两种情况呢？当然不是了，因为这个乘法表达式很可能还是一个未解析的状态，所以我们需要把乘法展开，把MultiplicativeExpression展开后如下：
  \<AdditiveExpression\>::=<br>
&nbsp;&nbsp;&nbsp;&nbsp;<span style="background-color:Teal;">\<Number\></span><br>
 &nbsp;&nbsp;&nbsp;&nbsp;|\<MultiplicativeExpression\><span style="background-color:Teal;">\<*\>\<Number\></span><br>
 &nbsp;&nbsp;&nbsp;&nbsp;|\<MultiplicativeExpression\><span style="background-color:Teal;">\</\>\<Number\></span><br>
 &nbsp;&nbsp;&nbsp;&nbsp;|\<AdditiveExpression\><span style="background-color:Teal;">\<+\></span>\<MultiplicativeExpression\><br>
 &nbsp;&nbsp;&nbsp;&nbsp;|\<AdditiveExpression\><span style="background-color:Teal;">\<-\></span>\<MultiplicativeExpression\><br>

 那么所以说，它的第一种符号有3种可能性：Number、MultiplicativeExpression、AdditiveExpression。如果我们遇到了Number或MultiplicativeExpression，我们是不是就应该直接把它当做乘法处理呢？我们只看一个字符是不够的，我们需要看它第二个输入的元素，它是乘号除号，还是加号减号，因为原来的MultiplicativeExpression还是在的(<span style="color:red">什么意思？待理解</span>)。所以说，我们通过这个就可以得出来一个从左到右扫描，然后从左到右去归并的这样一个语法分析的算法，即 **LL语法分析**。


#### 正则表达式
正则里面，圆括号表示捕获，一旦我们对它进行了捕获，除了正则表达式整体表示的字符串，那么对圆括号里面的内容它也会直接被匹配出来

#### yield
当我们要返回一个序列的时候，可以用yield
