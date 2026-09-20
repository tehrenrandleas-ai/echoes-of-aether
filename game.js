const HEROES=[
{name:"Alden",cls:"Warrior",icon:"⚔",maxHp:150,hp:150,atk:19,spd:1.15,level:1,xp:0,nextXp:60},
{name:"Lyra",cls:"Ranger",icon:"➶",maxHp:110,hp:110,atk:15,spd:.82,level:1,xp:0,nextXp:55},
{name:"Elias",cls:"Mage",icon:"✦",maxHp:90,hp:90,atk:23,spd:1.35,level:1,xp:0,nextXp:58},
{name:"Mira",cls:"Cleric",icon:"✚",maxHp:105,hp:105,atk:11,spd:1.5,level:1,xp:0,nextXp:52}
];
const enemies=[
["Green Slime",70,8,12],["Forest Goblin",90,10,15],["Dire Bat",105,11,18],["Wild Wolf",125,12,21],
["Goblin Guard",155,14,25],["Forest Imp",180,15,30],["Moss Golem",220,17,36],["Dark Wolf",250,19,42],
["Goblin Captain",310,21,50],["ELDER WYRM",700,27,140]
];
let state={stage:1,gold:0,paused:false,enemy:null,heroTimers:[0,0,0,0],enemyTimer:0,ended:false};
const $=id=>document.getElementById(id);
function makeEnemy(){let e=enemies[state.stage-1];state.enemy={name:e[0],maxHp:e[1],hp:e[1],atk:e[2],gold:e[3]};render();}
function render(){
 $("stage").textContent=state.stage+" / 10";$("gold").textContent=state.gold;
 $("enemyName").textContent=state.enemy.name;$("enemyLevel").textContent="LV "+state.stage;
 $("enemyHp").textContent=Math.max(0,Math.ceil(state.enemy.hp))+" / "+state.enemy.maxHp+" HP";
 $("enemyHpBar").style.width=Math.max(0,state.enemy.hp/state.enemy.maxHp*100)+"%";
 $("enemySprite").textContent=state.stage===10?"♜":"♟";$("enemySprite").className="pixel enemy"+(state.stage===10?" boss":"");
 $("partyField").innerHTML=HEROES.map((h,i)=>'<div class="hero-sprite '+(h.hp<=0?'dead':'')+'" id="sprite'+i+'"><span class="hero-icon">'+h.icon+'</span><label>'+h.name+'</label></div>').join("");
 $("partyPanel").innerHTML=HEROES.map((h,i)=>'<div class="card" id="card'+i+'"><div class="card-top"><b>'+h.name+'</b><b>LV '+h.level+'</b></div><div class="class">'+h.cls+'</div><div class="stats">HP '+Math.ceil(h.hp)+' / '+h.maxHp+'</div><div class="hpbar"><i style="width:'+Math.max(0,h.hp/h.maxHp*100)+'%"></i></div><div class="stats xp">XP '+h.xp+' / '+h.nextXp+'</div></div>').join("");
}
function log(t){$("battleLog").textContent=t}
function attack(i){
 let h=HEROES[i];if(h.hp<=0||state.enemy.hp<=0)return;
 let crit=Math.random()<.12, dmg=Math.floor(h.atk*(.85+Math.random()*.3)*(crit?1.8:1));
 state.enemy.hp-=dmg;log(h.name+" attacks "+state.enemy.name+" for "+dmg+(crit?" CRITICAL!":""));
 let s=$("sprite"+i);if(s){s.classList.add("attack");setTimeout(()=>s&&s.classList.remove("attack"),140)}
 $("enemySprite").classList.add("hit");setTimeout(()=>$("enemySprite").classList.remove("hit"),180);
 if(state.enemy.hp<=0)victory();else render();
}
function enemyAttack(){
 let alive=HEROES.map((h,i)=>h.hp>0?i:null).filter(i=>i!==null);if(!alive.length)return;
 let i=alive[Math.floor(Math.random()*alive.length)],h=HEROES[i],dmg=Math.floor(state.enemy.atk*(.8+Math.random()*.4));
 h.hp=Math.max(0,h.hp-dmg);log(state.enemy.name+" hits "+h.name+" for "+dmg+"!");
 if(HEROES.every(x=>x.hp<=0))defeat();else render();
}
function victory(){
 let reward=state.enemy.gold;state.gold+=reward;
 HEROES.forEach((h,i)=>{if(h.hp>0){h.xp+=Math.floor(18+state.stage*5);while(h.xp>=h.nextXp){h.xp-=h.nextXp;h.level++;h.nextXp=Math.floor(h.nextXp*1.28);h.maxHp+=12;h.hp=h.maxHp;h.atk+=3;setTimeout(()=>{let c=$("card"+i);if(c)c.classList.add("levelup")},50)}}});
 if(state.stage===10){state.ended=true;render();log("VICTORY! The Elder Wyrm falls. Prototype 0.1 complete!");return}
 log(state.enemy.name+" defeated! +"+reward+" gold. Advancing...");
 state.paused=true;render();setTimeout(()=>{state.stage++;HEROES.forEach(h=>h.hp=Math.min(h.maxHp,h.hp+Math.floor(h.maxHp*.18)));state.heroTimers=[0,0,0,0];state.enemyTimer=0;makeEnemy();state.paused=false;log("Stage "+state.stage+" begins!");},900);
}
function defeat(){state.paused=true;render();log("The party was defeated... recovering and retrying Stage "+state.stage+".");setTimeout(()=>{HEROES.forEach(h=>h.hp=h.maxHp);makeEnemy();state.heroTimers=[0,0,0,0];state.enemyTimer=0;state.paused=false},1800)}
function reset(){HEROES.forEach((h,i)=>{let base=[[150,19,60],[110,15,55],[90,23,58],[105,11,52]][i];h.maxHp=h.hp=base[0];h.atk=base[1];h.level=1;h.xp=0;h.nextXp=base[2]});state={stage:1,gold:0,paused:false,enemy:null,heroTimers:[0,0,0,0],enemyTimer:0,ended:false};makeEnemy();log("A new adventure begins...")}
$("pauseBtn").onclick=()=>{state.paused=!state.paused;$("pauseBtn").textContent=state.paused?"▶ RESUME":"Ⅱ PAUSE";log(state.paused?"Battle paused.":"Auto battle resumed.")};
$("resetBtn").onclick=()=>{if(confirm("Reset Prototype 0.1?"))reset()};
let last=performance.now();function loop(now){let dt=(now-last)/1000;last=now;if(!state.paused&&!state.ended&&state.enemy){HEROES.forEach((h,i)=>{if(h.hp>0){state.heroTimers[i]+=dt;if(state.heroTimers[i]>=h.spd){state.heroTimers[i]=0;attack(i)}}});state.enemyTimer+=dt;if(state.enemyTimer>=1.75&&state.enemy.hp>0){state.enemyTimer=0;enemyAttack()}}requestAnimationFrame(loop)}
makeEnemy();requestAnimationFrame(loop);