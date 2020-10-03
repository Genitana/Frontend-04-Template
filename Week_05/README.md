# JavaScript
- Atom
- Expression
- Statement
- Structure
- Program/Module

# Expression
- Member 
   - a.b
   - a[b]
   - foo\`string\` (反引号的字符串，它的前面如果加一个函数名，他会把反引号的字符串部分拆开，然后传进这个函数当做参数)
   - super.b
   - super['b']
   - new.target
   - new Foo()  (带括号的new跟前面这些的优先级是相同的)

运算符优先级最高的是Member运算，Member运算它的典型代表就是a.b这样的结构 

- New
   - new Foo

不带括号的new被单独设为一个优先级，称作New Expression

**new带括号的优先级比不带括号的更高**
Example:
- new a()()  &nbsp;&nbsp;:先执行的是 new a（）
- new new a()  &nbsp;&nbsp;:先执行的是后边的new a()

## Reference
- Object
- Key

一个reference分成两个部分，第一个部分是一个对象，第二个部分是一个key。对象是JavaScript对象，key可以是string也可以是symbol。一个reference类型，取出来的是一个Object和一个key。

a.b访问了一个属性，但是它从属性取出来的不是属性的值，是一个引用（??这句不太懂）。引用类型并非JavaScript的7种类型之一，但是引用类型也是确确实实存在于运行时中的一个JavaScript类型，这种我们把它称作标准中的类型，而不是语言中的类型。


- delete
- assign

delete和assign这样的基础设施就会用到Reference类型。如果我们做加法或者减法的运算，我们会把Reference直接解引用，然后像普通的变量一样使用。但是Member表达式出来的，如果是放在delete之后，那么我们就需要用到引用的特性。因为我们要知道删除的是哪一个对象的哪一个key。assign也是一样，当我们进行赋值的时候，也就是当我们把Member运算放在一个等号的左边，我们也同样要知道我们把右边的这个表达式赋值给哪一个对象的哪一个属性。这就是引用类型的一个关键特征。JavaScript语言就是用引用类型在运行时来处理删除或者是赋值这样的写相关的操作的。（?? 有点绕，没看懂，后面记得查一下资料看看）

## Expressions
- Call  
   - foo()
   - super()
   - foo()['b']
   - foo().b
   - foo()\`abc\`

example：<br>
- new a()['b'] &nbsp;&nbsp;:圆括号是先跟a结合然后传给new还是先跟new相结合 ？显然应该跟new先结合，带圆括号的new是Member Expression，它的优先级高于Call Expression，后边带方括号的属性访问，它也因为被圆括号，被call expression拉低了优先级。正确的理解是：new出来一个a对象，然后访问它的b属性。

Call Expression，函数调用。Call Expression是一个统称，最基础的Call Expression就是一个函数后面跟了一对圆括号。它的优先级要低于new，也低于前面所有的Member运算。

但是在括号之后，如果加上取属性，比如方括号、.b、反引号，它会让表达式降级为call expression，也就是后边的点运算它的优先级也降低了。


- Unary  (单目运算符)
   - delete a.b
   - void foo() &nbsp;(void运算符是把不管后边什么东西，都返回undefined)
   - typeof a
   - \+ a
   - \- a
   - ~ a  &nbsp;（位运算，把一个整数按位取返，如果不是整数，会强制转为整数）
   - ! a
   - await a

- Exponental
   - **  (表示乘方，JavaScript唯一一个右结合运算符)

 Example:
- 3 ** 2 ** 3  &nbsp;(先算2的3次方，再算3的8次方)
- = 3 ** (2 ** 3)

## Type Convertion
- 推荐尽量使用三等号，或者是做完了类型转换再比较（双等号由于会发生类型转换，不推荐使用）

### Unboxing (拆箱，把Object转为基本类型)
- ToPremitive (最主要的过程，ToPremitive过程发生在我们表达式定义的方方面面)
- toString
- valueOf
- Symbol.toPremitive

### Boxing (装箱)
类型|对象|值
-   |:-:|:-:
Number|new Number(1)|1
String|new String('a')|'a'
Boolean|new Boolean(true)|true
Symbol|new Object(Symbol('a'))|Symbol('a')

undefined和null没有包装类型

# Statement
### Runtime
- Completion Record
- Lexical Environment

#### Completion Record
- [[type]]: normal, break, continue, return, or throw
- [[value]]: 基本类型
- [[target]]: label

#### Iteration
- while(){}
- do while(){}
- for( ; ; ;){}
- for(  in ){}  &nbsp;&nbsp;（最初就有）
- for(  of ){}  &nbsp;&nbsp;(比较新的特性)
- for await( of ) &nbsp;&nbsp;(for of的await版本，对应的是Async Generator)

let声明的域，for语句是会产生一个独立的let声明的作用域的

# JS执行粒度（运行时）
- 宏任务 --(传给JavaScript引擎的任务)
- 微任务（Promise）--(在JavaScript引擎内部的任务，在JavaScript里面，只有Promise会产生微任务)
- 函数调用（Execution Context）
- 语句/声明（Completion Record）
- 表达式（Reference）
- 直接变量/变量/this......

Execution Context stack是一个栈结构，里面保存Execution Context(执行上下文)。执行一个语句的时候，所需要的所有信息都会保存在Execution Context里面。执行到当前语句的时候，栈有一个栈顶元素，也就是当前能访问到的所有变量，这些变量又叫Running Execution Context，代码里所需要的一切信息都会从Running Execution Context里去取回来。

## Execution Context
- code evaluation state --（用于async和generator函数的，代码执行到哪儿的保存信息）
- Function --（由Function来初始化的Execution Context会有）
- Script or Module --（要么有Script，要么有Module，Script或者Module里面的代码会有这个部分）
- Generator --（只有generator函数会需要，它不是generator，它是generator函数每次执行所生成的隐藏在背后的generator，只有generator函数创建的Execution Context才会有Generator字段）
- Realm --（保存着我们所有使用的内置对象的这样的一个王国或者领域）
- LexicalEnvironment --（代表我们执行代码中所需要访问的环境，也就是保存变量的）
- VariableEnvironment --（代表我们执行代码中所需要访问的环境，也就是保存变量的，决定了我们用var去声明变量会声明到哪儿的这样的一个环境）

LexicalEnvironment，在更老的版本里，它表示里面只存变量；在2018以后的标准里， 所有执行的时候存的东西几乎都保存在了LexicalEnvironment里，比如this值。<br>
VariableEnvironment，是历史遗留包袱，它仅仅是用来处理var声明的

在JavaScript里面，**每一个函数**都会生成一个闭包。

闭包是分成了两个部分，代码部分和环境部分。环境部分由一个object和一个变量的序列组成。在JavaScript里面，每一个函数都会带一个它定义时所在的Environment Records，它会把Environment Records保存到自己的函数对象身上，变成一个属性。
```
var y = 2;
function foo2(){
    console.log(y);
}
export foo2;
```
这个例子中，foo2在定义时，它的外边有一个y=2，所以不管这个foo2最后被通过参数或者是export、import传到哪里去，它都会带上y=2的Environment Records。这个就是我们的闭包，也是Environment Records最后能形成链的一个关键的设施。

## Realm

规定了在一个JavaScript引擎的实例里面，它所有的内置对象会被放进一个Realm里面去。在不同的Realm实例之间，它们是完全互相独立的，也就意味着我们用instanceof可能会失效。<br>比如我们使用点做隐式转换的时候，我们也会创建这种对象，它可能产生Number对象，它们也同样需要用到Realm，有了Realm后，我们就可以去执行对应的表达式，去描述它们的行为了。<br>而Realm这个东西，它是会根据一些外部的条件，JavaScript里面没有规定什么时候会创建Realm，但是它会有可能根据外部的条件去创建不同的Realm。不同的Realm之间，它们也可以互相传递对象，但是传递过来之后，它的Prototype是不一致的。（有点不好理解，待多查点资料。。。）

在JS中，函数表达式和对象直接量均会创建对象。

使用.做隐式转换也会创建对象。

这些对象也是有原型的，如果我们没有Realm，就不知道它们的原型是什么。


**G6，蚂蚁前端的可视化框架，比较适合去做对象的可视化。**