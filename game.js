(() => {
  'use strict';
  const canvas = document.querySelector('#arena');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const $ = id => document.getElementById(id);
  const ui = {
    overlay:$('overlay'),art:$('overlayArt'),kicker:$('overlayKicker'),title:$('overlayTitle'),body:$('overlayBody'),
    modes:$('modePicker'),start:$('startBtn'),hint:$('overlayHint'),time:$('timeLabel'),score:$('scoreLabel'),
    guests:$('guestsLabel'),combo:$('comboLabel'),mission:$('missionLabel'),dash:$('dashBtn'),
    dashStatus:$('dashStatus'),pause:$('pauseBtn'),sound:$('soundBtn'),toast:$('toast')
  };
  const names = ['Luna Bat','Sunny Fox','Poppy Dash','CatNap','DogDay','Bobby BearHug','Hoppy Hopscotch','CraftyCorn','Bubba Bubbaphant','KickinChicken','PickyPiggy','Baba Chops','Mikey','JJ'];
  const files = ['critter_01_lunabat','critter_02_sunnyfox','critter_03_poppydash','critter_04_catnap','critter_05_dogday','critter_06_bobby','critter_07_hoppy','critter_08_craftycorn','critter_09_bubba','critter_10_kickin','critter_11_picky','critter_12_babachops','mikey','jj'];
  const images = files.map(file => { const im = new Image(); im.src=`assets/guests/${file}.webp`; return im; });
  const scene = new Image(); scene.src='assets/scenes/061.svg';
  const keys = new Set();
  const pointer = {active:false,x:W/2,y:H/2};
  const config = {classic:{seconds:90,speed:1,name:'团圆夜'},rush:{seconds:60,speed:1.3,name:'闪电局'},endless:{seconds:45,speed:1.12,name:'不散场'}};
  let selected='classic', game=null, last=0, toastTimer=0, audio=null, muted=false;
  const rand=(a,b)=>a+Math.random()*(b-a);
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);

  function tone(freq=520,duration=.12,type='sine',volume=.08){
    if(muted)return;
    try{
      audio ||= new (window.AudioContext||window.webkitAudioContext)();
      if(audio.state==='suspended') audio.resume();
      const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime;
      o.type=type;o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(Math.max(80,freq*.67),t+duration);
      g.gain.setValueAtTime(volume,t);g.gain.exponentialRampToValueAtTime(.001,t+duration);
      o.connect(g).connect(audio.destination);o.start(t);o.stop(t+duration);
    }catch(_){}
  }
  function fanfare(){[523,659,784,1046].forEach((n,i)=>setTimeout(()=>tone(n,.2,'triangle',.07),i*85));}
  function say(message){ui.toast.textContent=message;ui.toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>ui.toast.classList.remove('show'),1450);}
  function spawnPoint(){let p;do{p={x:rand(48,W-48),y:rand(52,H-52)}}while(distance(p,{x:W/2,y:H/2})<145);return p;}
  function spawnGuest(){const p=spawnPoint();const id=Math.random()<.11?12+Math.floor(Math.random()*2):Math.floor(Math.random()*12);return {...p,id,phase:rand(0,7),vx:rand(-14,14),vy:rand(-14,14)};}
  function spawnCake(){return {...spawnPoint(),phase:rand(0,7)};}
  function makeCloud(){return {x:rand(80,W-80),y:rand(70,H-70),vx:rand(-62,62),vy:rand(-48,48),r:27,phase:rand(0,7)};}
  function confetti(x,y,n=24){if(!game)return;for(let i=0;i<n;i++)game.particles.push({x,y,vx:rand(-190,190),vy:rand(-230,55),life:rand(.5,1.2),max:1.2,color:['#ffdd93','#ff9cae','#d1b7ff','#9fe5d2'][i%4],size:rand(3,7)});}
  function readBest(mode){try{return Number(localStorage.getItem(`reunion-best-${mode}`))||0}catch(_){return 0}}
  function saveBest(mode,score){if(score>readBest(mode)){try{localStorage.setItem(`reunion-best-${mode}`,String(score))}catch(_){}return true}return false}
  function showRecords(){for(const [mode,id] of [['classic','bestClassic'],['rush','bestRush'],['endless','bestEndless']])$(id).textContent=readBest(mode).toLocaleString();}
  function start(){
    const c=config[selected];
    game={mode:selected,playing:true,paused:false,time:c.seconds,score:0,delivered:0,combo:0,comboLeft:0,
      player:{x:W/2,y:H/2+122,r:21},followers:[],guests:Array.from({length:9},spawnGuest),cakes:Array.from({length:5},spawnCake),
      clouds:Array.from({length:selected==='rush'?4:3},makeCloud),particles:[],spawnClock:0,damageCooldown:0,dashCooldown:0,dashTime:0,secondsPlayed:0};
    pointer.active=false;keys.clear();last=performance.now();
    ui.overlay.classList.add('hidden');ui.pause.disabled=false;ui.dash.disabled=false;ui.pause.textContent='Ⅱ';
    ui.mission.textContent='接朋友 → 带回中央宴席 → 连击加分';
    fanfare();updateHud();
  }
  function pause(){if(!game?.playing)return;game.paused=!game.paused;ui.pause.textContent=game.paused?'▶':'Ⅱ';if(game.paused){showOverlay('⏸','派对暂停','朋友们在等你回来！','继续派对','暂停中');ui.modes.hidden=true;ui.hint.textContent='按 P 或点击右上角也能继续';}else{ui.overlay.classList.add('hidden');last=performance.now();}}
  function showOverlay(art,title,body,action,kicker){ui.art.textContent=art;ui.title.textContent=title;ui.body.textContent=body;ui.start.innerHTML=`${action} <span>↗</span>`;ui.kicker.textContent=kicker;ui.overlay.classList.remove('hidden');}
  function finish(){
    if(!game||!game.playing)return;
    game.playing=false;game.paused=false;ui.pause.disabled=true;ui.dash.disabled=true;
    const best=saveBest(game.mode,game.score);showRecords();fanfare();confetti(W/2,H/2,70);
    const title=game.delivered>=20?'满堂欢喜，今夜大团圆！':game.delivered>=8?'今晚的宴席好热闹！':'下次再叫更多朋友来！';
    showOverlay('🎉',title,`接回 ${game.delivered} 位朋友 · 获得 ${game.score.toLocaleString()} 分${best?' · 新纪录！':''}`,'再玩一局',`${config[game.mode].name} · 派对结束`);
    ui.modes.hidden=false;ui.hint.textContent='换个模式，再办一场不一样的派对';
  }
  function updateHud(){if(!game)return;ui.time.textContent=Math.ceil(game.time);ui.score.textContent=game.score.toLocaleString();ui.guests.textContent=game.delivered;ui.combo.textContent=`×${Math.max(1,game.combo)}`;ui.dashStatus.textContent=game.dashCooldown>0?`冲刺 ${game.dashCooldown.toFixed(1)} 秒`:'冲刺准备就绪';}
  function dash(){if(!game?.playing||game.paused||game.dashCooldown>0)return;game.dashTime=.3;game.dashCooldown=4.2;tone(610,.2,'sawtooth',.04);confetti(game.player.x,game.player.y,13);}
  function deliver(){
    const g=game,n=g.followers.length;if(!n)return;
    const multiplier=1+Math.min(4,Math.floor((n-1)/2));
    const special=g.followers.filter(f=>f.id>=12).length;
    const points=n*110*multiplier+special*140;
    g.score+=points;g.delivered+=n;g.followers=[];g.combo=Math.min(8,g.combo+1);g.comboLeft=8;
    if(g.mode==='endless')g.time=Math.min(90,g.time+n*2.3);
    else g.time=Math.min(config[g.mode].seconds,g.time+Math.min(3,n*.55));
    if(Math.floor(g.delivered/5)>Math.floor((g.delivered-n)/5)){g.time+=3;say(`🎊 ${g.delivered} 位到场！再加 3 秒`);fanfare()}
    else say(`团圆 ×${n}！+${points} 分${special?' · 贵宾加分':''}`);
    confetti(W/2,H/2,Math.min(70,18+n*7));tone(660,.22,'triangle');
    setTimeout(()=>tone(880,.22,'triangle'),100);
  }
  function update(dt){
    if(!game?.playing||game.paused)return;
    const g=game,p=g.player,c=config[g.mode];
    g.time-=dt;g.secondsPlayed+=dt;g.comboLeft=Math.max(0,g.comboLeft-dt);if(!g.comboLeft)g.combo=0;
    g.damageCooldown=Math.max(0,g.damageCooldown-dt);g.dashCooldown=Math.max(0,g.dashCooldown-dt);g.dashTime=Math.max(0,g.dashTime-dt);
    if(g.time<=0){g.time=0;finish();return}
    let dx=Number(keys.has('arrowright')||keys.has('d'))-Number(keys.has('arrowleft')||keys.has('a'));
    let dy=Number(keys.has('arrowdown')||keys.has('s'))-Number(keys.has('arrowup')||keys.has('w'));
    if(!dx&&!dy&&pointer.active){dx=pointer.x-p.x;dy=pointer.y-p.y;if(Math.hypot(dx,dy)<9)dx=dy=0}
    const len=Math.hypot(dx,dy)||1,speed=(g.dashTime>0?590:245);
    p.x=clamp(p.x+dx/len*speed*dt,25,W-25);p.y=clamp(p.y+dy/len*speed*dt,28,H-26);
    g.followers.forEach((f,i)=>{const target=i?g.followers[i-1]:p;const d=distance(f,target);if(d>36){const k=Math.min(1,(d-36)/d*8*dt);f.x+=(target.x-f.x)*k;f.y+=(target.y-f.y)*k}f.phase+=dt*3});
    for(let i=g.guests.length-1;i>=0;i--){const f=g.guests[i];f.phase+=dt*2;f.x=clamp(f.x+f.vx*dt,40,W-40);f.y=clamp(f.y+f.vy*dt,42,H-40);
      if(f.x<=40||f.x>=W-40)f.vx*=-1;if(f.y<=42||f.y>=H-40)f.vy*=-1;
      if(distance(p,f)<35){g.followers.push({...f});g.guests.splice(i,1);tone(450+g.followers.length*75,.14,'triangle');confetti(f.x,f.y,8);if(g.followers.length>=4&&g.followers.length%4===0)say(`${g.followers.length} 人小队！送回宴席拿高倍积分`)}
    }
    for(let i=g.cakes.length-1;i>=0;i--){const cake=g.cakes[i];cake.phase+=dt*3;if(distance(p,cake)<32){g.score+=25+g.combo*5;g.cakes.splice(i,1);tone(920,.08,'sine');confetti(cake.x,cake.y,7)}}
    for(const cloud of g.clouds){cloud.phase+=dt*1.5;cloud.x+=cloud.vx*dt*c.speed;cloud.y+=cloud.vy*dt*c.speed;if(cloud.x<50||cloud.x>W-50)cloud.vx*=-1;if(cloud.y<50||cloud.y>H-50)cloud.vy*=-1;
      if(g.damageCooldown<=0&&g.dashTime<=0&&distance(cloud,p)<42){g.damageCooldown=1.5;g.time=Math.max(0,g.time-2);const lost=g.followers.pop();if(lost){lost.x=clamp(p.x+rand(-100,100),50,W-50);lost.y=clamp(p.y+rand(-100,100),50,H-50);g.guests.push(lost)}say('☁️ 乌云捣乱！少了 2 秒');tone(170,.27,'sawtooth',.045)}
    }
    if(distance(p,{x:W/2,y:H/2})<75&&g.followers.length)deliver();
    g.spawnClock+=dt;if(g.spawnClock>1.6/c.speed){g.spawnClock=0;if(g.guests.length<10)g.guests.push(spawnGuest());if(g.cakes.length<5)g.cakes.push(spawnCake())}
    g.particles=g.particles.filter(q=>q.life>0);for(const q of g.particles){q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=210*dt;q.life-=dt}
    updateHud();
  }
  function circle(x,y,r,fill){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill()}
  function drawGuest(f,r=22,following=false){
    const bob=Math.sin(f.phase)*3;ctx.save();ctx.shadowColor=following?'#ffdf9b':'#0009';ctx.shadowBlur=following?22:10;
    circle(f.x,f.y+bob,r+4,following?'#ffdb8a':'#fff4d9');ctx.save();ctx.beginPath();ctx.arc(f.x,f.y+bob,r,0,Math.PI*2);ctx.clip();
    const im=images[f.id];if(im.complete&&im.naturalWidth)ctx.drawImage(im,f.x-r,f.y+bob-r,r*2,r*2);else{circle(f.x,f.y+bob,r,'#ecadbe');ctx.fillStyle='#483047';ctx.font='24px sans-serif';ctx.textAlign='center';ctx.fillText('✿',f.x,f.y+bob+9)}ctx.restore();ctx.restore();
    if(f.id>=12&&!following){ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillStyle='#ffe69b';ctx.fillText('★ 贵宾',f.x,f.y-r-13)}
  }
  function draw(){
    ctx.clearRect(0,0,W,H);
    if(scene.complete&&scene.naturalWidth){ctx.drawImage(scene,0,0,W,H)}else{const bg=ctx.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#273859');bg.addColorStop(1,'#65436e');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H)}
    ctx.fillStyle='#111333af';ctx.fillRect(0,0,W,H);
    const t=performance.now()/1000;
    for(let i=0;i<32;i++){const x=(i*233+59)%W,y=(i*171+80)%H;circle(x,y,1.3+Math.sin(t*2+i)*.5,'#ffdf9e99')}
    ctx.strokeStyle='#ffd89524';ctx.lineWidth=3;ctx.strokeRect(20,20,W-40,H-40);
    const glow=ctx.createRadialGradient(W/2,H/2,25,W/2,H/2,115);glow.addColorStop(0,'#ffdf97a0');glow.addColorStop(1,'#ffce8000');circle(W/2,H/2,115,glow);
    circle(W/2,H/2,70,'#fff1c41e');ctx.beginPath();ctx.arc(W/2,H/2,69,0,Math.PI*2);ctx.strokeStyle='#ffe0a0';ctx.lineWidth=4;ctx.stroke();
    ctx.beginPath();ctx.arc(W/2,H/2,58,0,Math.PI*2);ctx.strokeStyle='#ffe0a080';ctx.lineWidth=1.5;ctx.setLineDash([5,8]);ctx.stroke();ctx.setLineDash([]);
    ctx.textAlign='center';ctx.fillStyle='#fff0cb';ctx.font='bold 21px sans-serif';ctx.fillText('月亮宴席',W/2,H/2+6);ctx.font='12px sans-serif';ctx.fillText('把朋友带到这里',W/2,H/2+28);
    if(game){
      const g=game;
      for(const cake of g.cakes){ctx.save();ctx.translate(cake.x,cake.y+Math.sin(cake.phase)*3);ctx.shadowColor='#ffce7b';ctx.shadowBlur=17;circle(0,0,16,'#f8cd83');circle(0,0,11,'#c67e58');ctx.fillStyle='#fff5cd';ctx.font='15px sans-serif';ctx.textAlign='center';ctx.fillText('月',0,5);ctx.restore()}
      for(const cloud of g.clouds){ctx.save();ctx.globalAlpha=.82;ctx.translate(cloud.x,cloud.y+Math.sin(cloud.phase)*3);circle(-16,3,17,'#a98bc9');circle(0,-5,22,'#b59ed5');circle(20,4,16,'#a98bc9');ctx.fillStyle='#45345c';ctx.font='19px sans-serif';ctx.fillText('☂',-8,9);ctx.restore()}
      g.guests.forEach(f=>drawGuest(f));g.followers.slice().reverse().forEach(f=>drawGuest(f,19,true));
      const p=g.player;ctx.save();ctx.globalAlpha=g.damageCooldown>0&&Math.sin(t*25)>0?.48:1;ctx.shadowColor='#fff2bc';ctx.shadowBlur=25;circle(p.x,p.y,23,'#fff2d9');ctx.fillStyle='#fff1db';
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(-.2);ctx.beginPath();ctx.ellipse(-10,-27,7,20,0,0,Math.PI*2);ctx.ellipse(9,-27,7,20,0,0,Math.PI*2);ctx.fill();ctx.restore();
      circle(p.x-7,p.y-2,2,'#44344a');circle(p.x+7,p.y-2,2,'#44344a');circle(p.x,p.y+5,2.5,'#e6a3b0');ctx.restore();
      ctx.fillStyle='#ffe6ac';ctx.textAlign='center';ctx.font='bold 12px sans-serif';ctx.fillText('你 · 玉兔',p.x,p.y+41);
      for(const q of g.particles){ctx.globalAlpha=clamp(q.life/q.max,0,1);ctx.fillStyle=q.color;ctx.fillRect(q.x,q.y,q.size,q.size)}ctx.globalAlpha=1;
      if(g.followers.length){ctx.textAlign='center';ctx.font='bold 14px sans-serif';ctx.fillStyle='#fff2d1';ctx.fillText(`跟队 ${g.followers.length} 位`,p.x,p.y-49)}
    }else{ctx.fillStyle='#fff0c944';ctx.font='bold 48px sans-serif';ctx.textAlign='center';ctx.fillText('✦  月下等你来  ✦',W/2,H/2+180)}
  }
  function frame(now){const dt=Math.min(.05,(now-last)/1000||0);last=now;update(dt);draw();requestAnimationFrame(frame)}
  function point(e){const box=canvas.getBoundingClientRect();pointer.x=clamp((e.clientX-box.left)/box.width*W,0,W);pointer.y=clamp((e.clientY-box.top)/box.height*H,0,H)}
  canvas.addEventListener('pointerdown',e=>{pointer.active=true;point(e);canvas.setPointerCapture(e.pointerId)});
  canvas.addEventListener('pointermove',e=>{if(pointer.active)point(e)});
  canvas.addEventListener('pointerup',()=>{pointer.active=false});canvas.addEventListener('pointercancel',()=>{pointer.active=false});
  window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright',' ','p'].includes(k))e.preventDefault();if(k===' '&&!e.repeat)dash();else if(k==='p'&&!e.repeat)pause();else keys.add(k)});
  window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
  window.addEventListener('blur',()=>{keys.clear();pointer.active=false;if(game?.playing&&!game.paused)pause()});
  document.querySelectorAll('.mode').forEach(btn=>btn.addEventListener('click',()=>{selected=btn.dataset.mode;document.querySelectorAll('.mode').forEach(b=>b.classList.toggle('selected',b===btn));tone(570,.08)}));
  ui.start.addEventListener('click',()=>game?.paused?pause():start());ui.pause.addEventListener('click',pause);ui.dash.addEventListener('click',dash);
  ui.sound.addEventListener('click',()=>{muted=!muted;ui.sound.textContent=muted?'♪̸':'♫';ui.sound.setAttribute('aria-label',muted?'开启音效':'关闭音效');if(!muted)tone(700,.1)});
  showRecords();requestAnimationFrame(frame);
})();
