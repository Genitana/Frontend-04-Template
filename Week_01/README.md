学习笔记

## javascript 的异步机制

### callback
- 容易造成回到地狱
### Promise
- Promise/A+ 设计
- 可以链式调用，避免造成回调地狱
- 有Promise.all()、Promise.race()等方法
### async/await
- 底层基于Promise实现
- 语法更简单，让传统上描述同步代码的分支顺序循环也能用于描述async/await的执行
### generator
- 现在已经不推荐使用了
- 在没有async/await的时代，做出的用同步代码模拟异步的方案
### generator与异步
- generator模拟async/await
- synsc generator（for await of）  可以用来产出一些异步的迭代器