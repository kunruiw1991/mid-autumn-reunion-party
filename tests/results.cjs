const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function element(){return {children:[],attributes:{},hidden:false,textContent:'',classList:{add(){},remove(){}},append(x){this.children.push(x)},replaceChildren(){this.children=[]},setAttribute(k,v){this.attributes[k]=v},addEventListener(){},play(){return Promise.resolve()},pause(){},getContext(){return {}}}}
const nodes={};const get=id=>nodes[id]??=element();
const context={document:{getElementById:get,createElement:element,querySelectorAll:()=>[],addEventListener(){}},window:{addEventListener(){}},Image:class{},performance:{now:()=>0},requestAnimationFrame(){},setTimeout(){},clearTimeout(){},localStorage:{getItem(){return null},setItem(){}}};
vm.createContext(context);
vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../game.js'),'utf8').replace('refreshBest();requestAnimationFrame(frame);','globalThis.test={start,finish,pause,get game(){return game}};'),context);
function check(scores,winners){
 context.test.start();context.test.game.actors.forEach((a,i)=>a.score=scores[i]);context.test.finish();
 const cards=get('results').children;
 assert.deepEqual(cards.map(c=>Number(c.children[2].textContent.replaceAll(',',''))),[...scores].sort((a,b)=>b-a));
 const crowned=cards.filter(c=>c.children[0].textContent==='👑').map(c=>c.attributes['aria-label'].split(':')[0]);
 assert.deepEqual(crowned,winners);
 assert.equal(get('introFriends').hidden,true);
 assert.equal(get('results').hidden,false);
 assert.equal(get('scoreLabel').textContent,scores[0].toLocaleString());
 assert.equal(get('timeLabel').textContent,0);
 assert.deepEqual(Array.from(context.test.game.actors,a=>a.score),scores);
 context.test.finish();assert.equal(get('results').children.length,4);
}
check([2500,300,200,100],['你 · 玉兔']);
check([100,900,300,200],['DogDay']);
check([100,300,900,200],['Mikey']);
check([100,300,200,900],['JJ']);
check([900,900,200,100],['你 · 玉兔','DogDay']);
check([0,0,0,0],[]);
context.test.start();assert.equal(get('results').hidden,true);assert.equal(get('introFriends').hidden,false);assert.equal(get('results').children.length,0);
context.test.pause();assert.equal(get('results').hidden,true);
console.log('PASS: player, every bot, ties, zero scores, repeat finish, replay, pause; portraits/crowns match real scores.');
