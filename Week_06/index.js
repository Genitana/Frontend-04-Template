function findstr(param){
    for(var i = 0; i < param.length -1; i++){
        if ("a" === param.charAt(i)) {
            return true;
        }
    }
    return false;
}

console.log( findstr(" hello world , i am robert"));

/************************************************* */

function findAb(param){
    for(var i = 0; i < param.length -1; i++){
        if ("ab" === param.charAt(i) + param.charAt(i+1)) {
            return true;
        }
    }
    return false;
}

console.log(findAb(" i am ab"));

/************************************************* */

function findAbcdef(param){
    for(var i = 0; i < param.length -1; i++){
        if ("abcdef" === param.charAt(i) + param.charAt(i+1)+ param.charAt(i+2)+ param.charAt(i+3)+ param.charAt(i+4)+ param.charAt(i+5)) {
            return true;
        }
    }
    return false;
}

console.log(findAbcdef(" i am ab abcdef"));

/************************************************* */
function match(param){
    //abcabx
    let state =  start;
    for(let char of param) {
        state = state(char);
    }
    return state === end;
}

function start(c){
    if('a' === c) {
        return findA1;
    }else {
        return start;
    }
}

function end(){
    return end;
}

function findA1(c){
    if ('b' ===  c) {
        return findB1;
    }
    return start(c);
}
function findB1(c){
    if ('c' ===  c) {
        return findC;
    }
    return start(c);
}
function findC(c){
    if ('a' ===  c) {
        return findA2;
    }
    return start(c);
}
function findA2(c){
    if ('b' ===  c) {
        return findB2
    }
    return start(c);
}
function findB2(c){
    if ('x' ===  c) {
        return end;
    }
    return start(c);
}
console.log(match( "i am abcabc"));