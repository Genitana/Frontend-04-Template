学习笔记
## 广度优先搜索
#### 寻路问题
- 不断把能走到的点加入集合的过程，并且把集合里点的周围能走到的点也加入进集合，这样一个过程
- 用递归来表达的话，会变成深度优先搜索
- 对寻路问题来说，深度优先搜索是不好的，广度优先搜索才是好的
- 在JavaScript数组里面，
   - push和shift--队列；
   - pop跟unshift--队列；
   - push跟pop--栈；
   - shift跟unshift--栈（一般不用shift跟unshift去做栈，因为考虑到JavaScript数组的实现，可能这样的性能会变低）
```
function path(map, start, end) {
   
    //这个集合，是所有搜索算法的灵魂，
    //所有的搜索算法的差异部分其实完全就在于这个queue集合里面
    
    let queue = [start];
    ...
```    