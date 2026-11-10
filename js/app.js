(function(){
var MAX_ZIP=25*1024*1024, MAX_UNZIPPED=100*1024*1024;
var STEP_NAMES=['เลือกไฟล์','ตรวจไฟล์','กรอกข้อมูล','ผู้ดูแลตรวจ'];
var SUBJECTS=[{id:'hydraulics',name:'Hydraulics'},{id:'statics',name:'Statics'},{id:'highway',name:'Highway'},{id:'survey',name:'Survey'}];
var ICONS={
  statics:'M8 36 34 10M27 10h7v7M8 36h28M30 31l6 5-6 5M8 36V10M3 16l5-6 5 6',
  hydraulics:'M7 7v30h30V7M7 18c5-4 10 4 15 0s10 4 15 0M15 26h10M21 22l4 4-4 4',
  survey:'M12 6h20v9H12zM6 10h6M32 10h6M22 15v7M22 22 11 39M22 22l11 17M22 22v17',
  highway:'M5 12h34M5 21h34M5 30h34M5 39h34M11 15v3M21 15v3M31 15v3M16 24v3M26 24v3M36 24v3'
};
var LABS=[];
var HUMAN_CHECKS=['เล่นบนมือถือได้','มีวัตถุประสงค์ของแล็บ','ตรวจคำตอบในแล็บได้','ผ่านการตรวจความถูกต้องทางวิชาการ','ไม่มีข้อมูลส่วนตัว'];
var BLOCKED=/\.(exe|bat|cmd|com|msi|sh|ps1|vbs|docx?|xlsx?|pptx?|psd|ai|fig|blend)$/i;
var MIME={png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',webp:'image/webp',svg:'image/svg+xml',mp3:'audio/mpeg',wav:'audio/wav',mp4:'video/mp4',webm:'video/webm',css:'text/css',js:'text/javascript',json:'application/json',glb:'model/gltf-binary',woff2:'font/woff2',woff:'font/woff',ttf:'font/ttf'};
var MONTHS=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

var S={email:'',pending:'',loginError:'',screen:'login',subjectId:'hydraulics',labId:'',q:'',published:''};
var U;
function resetUpload(){U={editId:null,fileChanged:false,step:1,busy:'',error:'',file:null,entries:[],checks:[],meta:{},html:'',srcdoc:'',cover:'',form:null,returned:false,formError:''};}
resetUpload();

function h(tag,props){
  var e=document.createElement(tag);
  Object.keys(props||{}).forEach(function(k){
    var v=props[k];
    if(k==='class')e.className=v;
    else if(k==='text')e.textContent=v;
    else if(k.slice(0,2)==='on')e.addEventListener(k.slice(2),v);
    else if(k==='srcdoc'||k==='value'||k==='checked'||k==='disabled'||k==='selected'||k==='hidden')e[k]=v;
    else if(v!==false&&v!=null)e.setAttribute(k,v);
  });
  for(var i=2;i<arguments.length;i++){var c=arguments[i];if(c==null)continue;e.appendChild(typeof c==='string'?document.createTextNode(c):c);}
  return e;
}
function list(tag,props,items){return h.apply(null,[tag,props].concat(items));}
function clear(n){n.textContent='';return n;}
function bytes(n){return n<1024?n+' B':n<1048576?Math.round(n/1024)+' KB':(n/1048576).toFixed(1)+' MB';}
function esc(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
function subjectOf(id){return SUBJECTS.filter(function(s){return s.id===id;})[0];}
function labsOf(id){return LABS.filter(function(l){return l.s===id;});}
function svgIcon(id){var s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('width','44');s.setAttribute('height','44');s.setAttribute('viewBox','0 0 44 44');s.setAttribute('aria-hidden','true');var p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',ICONS[id]);s.appendChild(p);return s;}

function nav(screen,patch){
  Object.assign(S,{screen:screen,published:''},patch||{});
  document.body.classList.remove('teaching');
  render();
  try{window.scrollTo(0,0);}catch(e){}
  focusTitle();
}
function focusTitle(){var t=document.querySelector('#view h2')||document.querySelector('#view h1');if(screenFocus()&&t){t.setAttribute('tabindex','-1');t.focus({preventScroll:true});}}
function screenFocus(){return S.screen!=='home'&&S.screen!=='login';}
function openSubmit(){resetUpload();nav('submit');}

function renderBar(){
  var bar=clear(document.getElementById('bar'));
  if(S.screen==='login')return;
  var lock=h('span',{});lock.insertAdjacentHTML('afterbegin','<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="7" width="10" height="7" rx="1"></rect><path d="M5 7V5a3 3 0 0 1 6 0v2"></path></svg>');lock.appendChild(document.createTextNode(S.email));
  var brand=h('button',{class:'brand',type:'button',onclick:function(){nav('home',{q:''});}});
  brand.insertAdjacentHTML('afterbegin','<svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><path d="M11 3h6M12 3v8L5 23a1.5 1.5 0 0 0 1.3 2h15.4a1.5 1.5 0 0 0 1.3-2L16 11V3M8.5 18h11"></path></svg>');
  brand.appendChild(document.createTextNode('คลังแล็บ'));
  bar.appendChild(h('header',{class:'bar'},h('div',{class:'wrap'},brand,
    h('nav',{class:'nav','aria-label':'เมนูหลัก'},
      h('button',{type:'button',onclick:function(){nav('home',{q:''});}},'รายวิชา'),
      h('button',{type:'button',onclick:function(){nav('people');}},'ผู้ลงแล็บ'),h('button',{type:'button',onclick:openSubmit},'ส่งแล็บใหม่')),
    h('div',{class:'who'},lock,h('button',{type:'button',onclick:function(){nav('login',{email:'',pending:'',loginError:''});}},'ออกจากระบบ')))));
}

function labRow(l,opts){
  opts=opts||{};
  return h('button',{class:'row'+(l.isNew?' new':''),type:'button',onclick:function(){nav('lab',{labId:l.id,subjectId:l.s});}},
    opts.num?h('span',{class:'n',text:opts.num}):null,
    h('span',{class:'body'},h('b',{text:l.title}),h('span',{text:(opts.showSubject?subjectOf(l.s).name+(l.desc?' · ':''):'')+(l.desc||(opts.showSubject?'':'ยังไม่มีคำอธิบาย'))})),
    l.isNew?h('span',{class:'tag new',text:'ใหม่'}):null,
    h('span',{class:'date',text:l.dateText}),
    h('span',{class:'go',text:'เปิดแล็บ'}));
}

function viewHome(){
  var rowsTitle=h('h2',{id:'rows-title'});
  var rowsHost=h('div',{class:'stack'});
  var cards=SUBJECTS.map(function(s){
    var own=labsOf(s.id);
    return h('button',{class:'card',type:'button',onclick:function(){nav('subject',{subjectId:s.id});}},
      h('span',{class:'top'},svgIcon(s.id),h('span',{class:'num',text:own.length+' แล็บ'})),
      h('b',{text:s.name}),
      own.length?list('ul',{},own.map(function(l){return h('li',{text:l.title});})):h('span',{class:'muted',text:'ยังไม่มีแล็บ'}));
  });
  var subjects=h('section',{class:'section','aria-labelledby':'subjects-title'},h('h2',{id:'subjects-title',text:'รายวิชา'}),list('div',{class:'cards'},cards));
  function update(){
    var q=S.q.trim().toLowerCase();
    subjects.hidden=!!q;
    rowsTitle.textContent=q?'ผลการค้นหา':'เพิ่งอัปเดต';
    var found=q?LABS.filter(function(l){return (l.title+' '+l.desc+' '+subjectOf(l.s).name).toLowerCase().indexOf(q)!==-1;}):LABS.slice().sort(function(a,b){return a.date<b.date?1:a.date>b.date?-1:0;}).slice(0,5);
    clear(rowsHost);
    if(!found.length){rowsHost.appendChild(h('p',{class:'empty',text:q?'ไม่พบแล็บที่ตรงกับคำค้น ลองใช้คำอื่น':'ยังไม่มีแล็บ กด “ส่งแล็บใหม่” เพื่อเพิ่มแล็บแรก'}));return;}
    rowsHost.appendChild(list('div',{class:'rows'},found.map(function(l){return labRow(l,{showSubject:true});})));
  }
  var input=h('input',{id:'lab-search',type:'search',value:S.q,placeholder:'เช่น แรงดันน้ำ, วัดระดับ, Marshall',oninput:function(e){S.q=e.target.value;update();}});
  var page=h('main',{},
    h('section',{class:'print hero'},h('div',{class:'wrap'},
      h('h1',{},'แล็บและเกมสำหรับสอน',h('br'),'จัดเก็บตามรายวิชา'),
      h('p',{text:SUBJECTS.length+' รายวิชา · '+LABS.length+' แล็บ'}),
      h('div',{class:'searchbox'},h('label',{for:'lab-search',text:'ค้นหาแล็บ'}),input))),
    h('div',{class:'wrap page'},subjects,h('section',{class:'section','aria-labelledby':'rows-title'},rowsTitle,rowsHost)));
  update();
  return page;
}

function viewSubject(){
  var s=subjectOf(S.subjectId),own=labsOf(s.id);
  return h('main',{class:'wrap page'},h('div',{class:'section'},
    h('button',{class:'link',type:'button',onclick:function(){nav('home',{q:''});}},'กลับไปรายวิชาทั้งหมด'),
    S.published?h('p',{class:'summary pass',role:'status',text:S.published}):null,
    h('div',{},h('h1',{text:s.name}),h('p',{class:'muted',text:own.length+' แล็บในรายวิชานี้'})),
    own.length?list('div',{class:'rows'},own.map(function(l,i){return labRow(l,{num:String(i+1).padStart(2,'0')});})):h('div',{class:'empty stack'},h('p',{text:'ยังไม่มีแล็บในรายวิชานี้'}),h('div',{},h('button',{class:'btn',type:'button',onclick:openSubmit},'ส่งแล็บใหม่')))));
}

var sampleSrc=null;
function loadSample(){
  if(!sampleSrc)sampleSrc=window.JSZip?JSZip.loadAsync(sampleBlob()).then(function(z){return z.files['index.html'].async('string');}):Promise.reject(new Error('no zip'));
  return sampleSrc;
}
function labFrame(title,src){return h('iframe',{class:'stage',title:title,sandbox:'allow-scripts',srcdoc:src});}

function metaList(rows){return list('dl',{class:'meta'},rows.reduce(function(a,r){a.push(h('dt',{text:r[0]}),h('dd',{text:r[1]}));return a;},[]));}

function viewLab(){
  var l=LABS.filter(function(x){return x.id===S.labId;})[0];
  var s=subjectOf(l.s),showAns=false;
  var stage=h('div',{class:'stagebox'});
  if(l.srcdoc)stage.appendChild(labFrame(l.title,l.srcdoc));
  else if(l.sample){
    var wait=h('div',{class:'noframe'},h('span',{text:'กำลังเปิดแล็บ'}));
    stage.appendChild(wait);
    loadSample().then(function(src){stage.replaceChild(labFrame(l.title,src),wait);}).catch(function(){clear(wait).appendChild(h('span',{text:'เปิดแล็บไม่สำเร็จ ลองรีเฟรชหน้านี้'}));});
  }else{
    stage.appendChild(h('div',{class:'noframe'},h('b',{text:l.title}),h('span',{class:'muted',text:'ยังไม่ได้นำไฟล์แล็บนี้ขึ้นเว็บ'}),h('button',{class:'btn',type:'button',onclick:openSubmit},'ส่งไฟล์แล็บ')));
  }
  var answers=[],ansBtns=[];
  function ansEl(cls){var e=h('p',{class:cls,text:l.a||'',hidden:true});answers.push(e);return e;}
  function ansBtn(cls){var b=h('button',{class:cls,type:'button',text:'แสดงเฉลย',onclick:function(){showAns=!showAns;answers.forEach(function(a){a.hidden=!showAns;});ansBtns.forEach(function(x){x.textContent=showAns?'ซ่อนเฉลย':'แสดงเฉลย';});}});ansBtns.push(b);return b;}
  var root=h('main',{class:'labview'});
  var teachBtn=h('button',{class:'teachbtn',type:'button',text:'โหมดสอนหน้าห้อง',onclick:function(){
    var on=root.classList.toggle('teach');
    document.body.classList.toggle('teaching',on);
    teachBtn.textContent=on?'ออกจากโหมดสอน':'โหมดสอนหน้าห้อง';
    try{window.scrollTo(0,0);}catch(e){}
  }});
  var fbBtn=h('button',{class:'btn',type:'button',text:'ส่งความเห็น',onclick:function(){fbBtn.textContent='บันทึกแล้ว (ตัวอย่าง)';}});
  root.appendChild(h('div',{class:'wrap'},
    h('div',{class:'labhead'},h('div',{},
      h('button',{class:'link hide-teach',type:'button',onclick:function(){nav('subject',{subjectId:l.s});}},'กลับไป'+s.name),
      h('h1',{text:l.title})),teachBtn),
    h('div',{class:'labgrid'},
      h('div',{class:'labmain'},stage,
        l.q?h('section',{class:'band','aria-label':'คำถามชวนคิด'},h('div',{},h('p',{class:'q',text:l.q}),l.a?ansEl('a'):null),l.a?ansBtn('ghost'):null):null),
      h('aside',{class:'aside hide-teach'},
        h('section',{class:'box'},h('h2',{style:'font-size:19px',text:'เกี่ยวกับแล็บ'}),h('p',{text:l.desc||'ยังไม่มีคำอธิบาย'}),
          metaList([['ผู้สร้าง',l.author||'ยังไม่ระบุ'],['เวลาในคาบ',l.duration?l.duration+' นาที':'ยังไม่ระบุ'],['บทเรียน',l.chapter||'ยังไม่ระบุ'],['ผู้ส่งแล็บ',l.ownerEmail||'ยังไม่ระบุ']]),l.ownerEmail===S.email?h('div',{},h('button',{class:'btn',type:'button',onclick:function(){startEdit(l);}},'แก้ไขแล็บ')):h('p',{class:'muted',style:'font-size:14px',text:'แก้ไขได้เฉพาะเจ้าของอีเมลที่ส่งแล็บนี้'})),
        h('section',{class:'box'},h('h2',{style:'font-size:19px',text:'มุมผู้สอน'}),
          l.q?h('p',{text:l.q}):h('p',{class:'muted',text:'ยังไม่มีคำถามชวนคิด'}),
          l.a?ansEl('answer'):null,
          l.a?h('div',{},ansBtn('btn')):null),
        h('section',{class:'box'},h('label',{class:'t',for:'feedback',style:'font-size:19px;font-weight:700',text:'แจ้งปัญหาหรือเสนอแนะ'}),
          h('textarea',{id:'feedback',rows:'3',placeholder:'บอกผู้สร้างว่าควรปรับตรงไหน'}),h('div',{},fbBtn))))));
  return root;
}

var ADMIN_EMAILS=['vasiya.kawicha@gmail.com'];
var ALLOWED_EMAILS=['teacher1@example.com','teacher2@example.com'];
function isAllowed(mail){return ADMIN_EMAILS.concat(ALLOWED_EMAILS).some(function(m){return m.toLowerCase()===mail;});}
var ACCOUNTS={};
function viewLogin(){
  var card=h('section',{class:'login'},h('div',{},h('h1',{style:'font-size:30px',text:'คลังแล็บ'}),h('p',{class:'muted',text:'สำหรับอาจารย์ผู้สอนเท่านั้น'})));
  var pw=h('input',{id:'password',type:'password',autocomplete:'current-password'});
  function signIn(e){
    e.preventDefault();
    var mail=S.pending.trim().toLowerCase();
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)){S.loginError='กรอกอีเมลให้ครบ เช่น name@example.com';render();return;}
    if(!isAllowed(mail)){S.loginError='อีเมลนี้ยังไม่ได้รับอนุญาตให้เข้าใช้ ติดต่อผู้ดูแล';render();return;}
    if(!pw.value){S.loginError='กรอกรหัสผ่าน';render();return;}
    if(ACCOUNTS[mail]&&ACCOUNTS[mail]!==pw.value){S.loginError='อีเมลหรือรหัสผ่านไม่ถูกต้อง';render();return;}
    ACCOUNTS[mail]=pw.value;
    S.loginError='';
    nav('home',{q:'',email:mail});
  }
  card.appendChild(h('form',{novalidate:'novalidate',class:'stack',onsubmit:signIn},
    h('div',{class:'field'},h('label',{class:'t',for:'email',text:'อีเมล'}),h('input',{id:'email',type:'email',autocomplete:'email',value:S.pending,oninput:function(e){S.pending=e.target.value;}})),
    h('div',{class:'field'},h('label',{class:'t',for:'password',text:'รหัสผ่าน'}),pw),
    S.loginError?h('p',{class:'err',role:'alert',text:S.loginError}):null,
    h('button',{class:'btn primary',type:'submit',text:'เข้าสู่ระบบ'})));
  card.appendChild(h('p',{class:'muted',style:'font-size:14px',text:'หน้าตัวอย่าง: อีเมลที่เข้าครั้งแรกจะใช้รหัสที่กรอกเป็นรหัสของบัญชีนั้น'}));
  return h('main',{class:'print loginpage'},card);
}

function sampleBlob(){
  var bin=atob(window.SAMPLE_ZIP_B64),u=new Uint8Array(bin.length);
  for(var i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
  return new Blob([u],{type:'application/zip'});
}
function badSample(){
  return JSZip.loadAsync(sampleBlob()).then(function(z){
    var out=new JSZip(),names=Object.keys(z.files);
    return Promise.all(names.map(function(n){return z.files[n].async('uint8array').then(function(d){out.file('cop-lab/'+n,d);});})).then(function(){
      out.file('คะแนนนักศึกษา รุ่น 1.xlsx','ตัวอย่างไฟล์ที่ไม่ควรแนบ');
      return out.generateAsync({type:'blob'});
    });
  });
}

function runChecks(zip,file){
  var entries=Object.keys(zip.files).map(function(n){return zip.files[n];}).filter(function(f){return !f.dir&&!/^__MACOSX\//.test(f.name)&&!/(^|\/)\.DS_Store$/.test(f.name);});
  var names=entries.map(function(f){return f.name;});
  var checks=[];
  function add(kind,title,note){checks.push({kind:kind,title:title,note:note});}
  function sizeOf(f){return f._data&&f._data.uncompressedSize||0;}
  U.entries=entries.map(function(f){return {name:f.name,size:sizeOf(f)};});
  add(file.size<=MAX_ZIP?'pass':'fail','ขนาดไฟล์ไม่เกิน 25 MB',bytes(file.size));
  var total=entries.reduce(function(a,f){return a+sizeOf(f);},0);
  if(total>MAX_UNZIPPED)add('fail','ไฟล์เมื่อแตกแล้วใหญ่เกินไป','แตกแล้ว '+bytes(total)+' เกินเพดาน 100 MB');
  var unsafe=names.filter(function(n){return /(^|\/)\.\.(\/|$)/.test(n)||/^([\/\\]|[a-zA-Z]:)/.test(n);});
  if(unsafe.length)add('fail','มีตำแหน่งไฟล์ที่ไม่ปลอดภัย',unsafe.join(', '));
  var top=names.indexOf('index.html')!==-1;
  var nested=names.filter(function(n){return /\/index\.html$/i.test(n);})[0];
  if(top)add('pass','มี index.html ที่ชั้นบนสุด','');
  else if(nested)add('fail','index.html ซ้อนอยู่ในโฟลเดอร์','พบที่ '+nested+' ให้เข้าไปในโฟลเดอร์ เลือกไฟล์ทั้งหมด แล้วค่อยบีบ');
  else add('fail','ไม่พบ index.html','ตั้งชื่อหน้าแรกของแล็บเป็น index.html');
  var blocked=names.filter(function(n){return BLOCKED.test(n);});
  add(blocked.length?'fail':'pass',blocked.length?'มีไฟล์ที่ไม่ควรแนบ':'ไม่มีไฟล์ต้องห้าม',blocked.length?blocked.join(', ')+' ให้ลบออกก่อนบีบ':'');
  var odd=names.filter(function(n){return !/^[a-z0-9._\/-]+$/.test(n);});
  add(odd.length?'warn':'pass',odd.length?'ชื่อไฟล์ควรเป็นภาษาอังกฤษตัวเล็ก ไม่เว้นวรรค':'ชื่อไฟล์เรียบร้อย',odd.join(', '));
  var cover=names.filter(function(n){return /^cover\.(png|jpe?g|webp)$/i.test(n);})[0];
  add(cover?'pass':'warn',cover?'มีรูปการ์ด':'ยังไม่มีรูปการ์ด',cover||'เพิ่ม cover.png เพื่อให้แล็บดูดีในหน้ารายวิชา');
  var jobs=[];
  U.meta={};U.html='';U.srcdoc='';U.cover='';
  if(zip.files['lab.json']){
    jobs.push(zip.files['lab.json'].async('string').then(function(t){
      try{U.meta=JSON.parse(t);add('pass','อ่าน lab.json ได้','');}
      catch(e){add('fail','lab.json เขียนไม่ถูกต้อง','ตรวจเครื่องหมายคำพูดและจุลภาค หรือลบไฟล์นี้แล้วกรอกในฟอร์มแทน');}
    }));
  }else add('warn','ไม่มี lab.json','กรอกข้อมูลในขั้นถัดไปแทนได้');
  if(top){
    jobs.push(zip.files['index.html'].async('string').then(function(html){
      U.html=html;
      var tm=html.match(/<title[^>]*>([^<]*)/i);if(tm&&!U.meta.title)U.meta.title=tm[1].trim();
      var bad=html.match(/\b(?:src|href)\s*=\s*["'](?:\/(?!\/)|[a-zA-Z]:\\|file:)[^"']*/gi);
      add(bad?'fail':'pass',bad?'มี path ที่เว็บหาไฟล์ไม่เจอ':'path ของไฟล์ใช้งานบนเว็บได้',bad?bad.slice(0,3).join(', ')+' ให้เปลี่ยนเป็นแบบ assets/ชื่อไฟล์':'');
      var hosts={},re=/<(?:script|link)\b[^>]*\b(?:src|href)\s*=\s*["']https?:\/\/([^\/"']+)/gi,m;
      while((m=re.exec(html)))hosts[m[1]]=1;
      var hl=Object.keys(hosts);
      add(hl.length?'warn':'pass',hl.length?'ใช้ไฟล์จากอินเทอร์เน็ต ควรลองเปิดตอนเน็ตช้า':'ไม่ต้องโหลดไฟล์จากอินเทอร์เน็ต',hl.join(', '));
      var inline=entries.filter(function(f){return f.name!=='index.html'&&!/\.(html?)$/i.test(f.name)&&html.indexOf(f.name)!==-1;});
      return Promise.all(inline.map(function(f){return f.async('base64').then(function(b){
        var ext=f.name.split('.').pop().toLowerCase();
        return {name:f.name,uri:'data:'+(MIME[ext]||'application/octet-stream')+';base64,'+b};
      });})).then(function(arr){
        U.srcdoc=arr.reduce(function(acc,a){return acc.replace(new RegExp('(["\'(])(?:\\./)?'+esc(a.name),'g'),function(_,q){return q+a.uri;});},html);
      });
    }));
  }
  if(cover)jobs.push(zip.files[cover].async('base64').then(function(b){U.cover='data:'+MIME[cover.split('.').pop().toLowerCase()]+';base64,'+b;}));
  return Promise.all(jobs).then(function(){
    var order={fail:0,warn:1,pass:2};
    U.checks=checks.sort(function(a,b){return order[a.kind]-order[b.kind];});
  });
}

function intake(blob,name){
  if(!window.JSZip){U.error='โหลดตัวอ่าน ZIP ไม่สำเร็จ ลองรีเฟรชหน้านี้';render();return;}
  var isHtml=/\.html?$/i.test(name);
  if(!isHtml&&!/\.zip$/i.test(name)){U.error='รองรับเฉพาะไฟล์ .html และ .zip';render();return;}
  U.error='';U.busy='กำลังอ่าน '+name;U.file={name:name,size:blob.size};if(U.editId){U.fileChanged=true;U.form.checks=U.form.checks.map(function(){return false;});}else U.form=null;U.returned=false;render();
  var ready=isHtml?blob.text().then(function(t){var p=new JSZip();p.file('index.html',t);return p.generateAsync({type:'blob'});}):Promise.resolve(blob);
  ready.then(function(b){return JSZip.loadAsync(b);}).then(function(z){return runChecks(z,blob);}).then(function(){
    U.busy='';step(2);
  }).catch(function(){
    U.busy='';U.error='เปิดไฟล์นี้ไม่ได้ ลองบันทึกหรือบีบไฟล์ใหม่อีกครั้ง';render();
  });
}
function step(n){U.step=n;U.formError='';render();try{window.scrollTo(0,0);}catch(e){}focusTitle();}
function tree(rows){return list('ul',{class:'tree'},rows.map(function(r){return h('li',{},h('span',{text:r[0]}),h('span',{text:r[1]}));}));}

function startEdit(l){
  if(l.ownerEmail!==S.email)return;
  resetUpload();
  U.editId=l.id;U.srcdoc=l.srcdoc;U.step=3;
  U.form={title:l.title,subject:l.s,chapter:l.chapter||'',author:l.author||'',duration:l.duration||'',description:l.desc||'',q:l.q||'',a:l.a||'',checks:HUMAN_CHECKS.map(function(){return true;})};
  nav('submit');
}
function publish(){
  var f=U.form,now=new Date();
  var old=U.editId?LABS.filter(function(l){return l.id===U.editId;})[0]:null;
  if(U.editId&&(!old||old.ownerEmail!==S.email))return;
  var lab={id:old?old.id:'u'+now.getTime(),ownerEmail:old?old.ownerEmail:S.email,s:f.subject,title:f.title.trim(),desc:f.description.trim(),date:now.toISOString(),dateText:now.getDate()+' '+MONTHS[now.getMonth()]+' '+String((now.getFullYear()+543)%100).padStart(2,'0'),srcdoc:U.srcdoc,author:f.author.trim(),duration:Number(f.duration),chapter:f.chapter.trim(),q:f.q.trim()||null,a:f.a.trim()||null,isNew:!old};
  LABS=LABS.filter(function(l){l.isNew=false;return l.id!==lab.id&&!(l.title===lab.title&&l.ownerEmail===lab.ownerEmail);});
  LABS.push(lab);
  var msg=old?'บันทึกการแก้ไข “'+lab.title+'” แล้ว':'“'+lab.title+'” ขึ้นเว็บแล้ว อาจารย์ทุกคนเห็นในหน้ารายวิชานี้';
  resetUpload();
  nav('subject',{subjectId:lab.s,published:msg});
}

var STEPS={
1:function(){
  var input=h('input',{id:'zip-input',type:'file',accept:'.html,.htm,.zip',onchange:function(e){var f=e.target.files[0];if(f)intake(f,f.name);}});
  var drop=h('label',{class:'drop',for:'zip-input'},input,h('strong',{text:'ลากไฟล์ .html หรือ .zip มาวาง หรือกดเพื่อเลือกไฟล์'}),h('span',{class:'muted',text:'แล็บไฟล์เดียวส่ง .html ได้เลย ถ้ามีรูปหรือเสียงแยกให้ส่ง .zip ไม่เกิน 25 MB'}));
  ['dragenter','dragover'].forEach(function(t){drop.addEventListener(t,function(e){e.preventDefault();drop.classList.add('over');});});
  ['dragleave','drop'].forEach(function(t){drop.addEventListener(t,function(e){e.preventDefault();drop.classList.remove('over');});});
  drop.addEventListener('drop',function(e){var f=e.dataTransfer.files[0];if(f)intake(f,f.name);});
  return h('section',{class:'panel'},h('h2',{text:'เลือกไฟล์แล็บ'}),
    h('div',{class:'split'},
      h('div',{class:'wide stack'},drop,
        U.busy?h('p',{class:'muted',role:'status',text:U.busy}):null,
        U.error?h('p',{class:'err',role:'alert',text:U.error}):null,
        h('div',{class:'actions'},
          h('button',{class:'btn primary',type:'button',disabled:!!U.busy,onclick:function(){intake(sampleBlob(),'cop-lab.zip');}},'ใช้ไฟล์ตัวอย่าง cop-lab.zip'),
          h('button',{class:'btn warn',type:'button',disabled:!!U.busy,onclick:function(){if(!window.JSZip){U.error='โหลดตัวอ่าน ZIP ไม่สำเร็จ ลองรีเฟรชหน้านี้';render();return;}badSample().then(function(b){intake(b,'cop-lab-จัดไฟล์ผิด.zip');});}},'ลองไฟล์ที่จัดผิด'))),
      h('div',{class:'stack'},h('h3',{text:'ถ้าส่งเป็น ZIP ต้องมี'}),tree([['index.html','จำเป็น'],['lab.json','กรอกในฟอร์มแทนได้'],['cover.png','แนะนำ'],['assets/','ถ้ามีรูปหรือเสียง']]))));
},
2:function(){
  var fails=U.checks.filter(function(c){return c.kind==='fail';}).length,warns=U.checks.filter(function(c){return c.kind==='warn';}).length;
  var LABEL={pass:'ผ่าน',warn:'ควรปรับ',fail:'ต้องแก้'};
  var rows=list('ul',{class:'checks'},U.checks.map(function(c){return h('li',{},h('span',{class:'tag '+c.kind,text:LABEL[c.kind]}),h('div',{},h('strong',{text:c.title}),c.note?h('small',{text:c.note}):null));}));
  return h('section',{class:'panel'},h('h2',{text:'ตรวจไฟล์ '+U.file.name}),
    h('p',{class:'summary '+(fails?'fail':'pass'),role:'status',text:fails?'ยังส่งไม่ได้ ต้องแก้ '+fails+' รายการ':'ไฟล์ส่งได้'+(warns?' มีข้อแนะนำ '+warns+' รายการ':'')}),
    h('div',{class:'split'},h('div',{class:'wide'},rows),h('div',{class:'stack'},h('h3',{text:'ไฟล์ที่พบ'}),tree(U.entries.map(function(e){return [e.name,bytes(e.size)];})))),
    h('div',{class:'actions'},
      fails?null:h('button',{class:'btn primary',type:'button',onclick:function(){step(3);}},'ไปกรอกข้อมูล'),
      h('button',{class:'btn',type:'button',onclick:function(){step(1);}},fails?'เลือกไฟล์ใหม่':'เปลี่ยนไฟล์')));
},
3:function(){
  if(!U.form){var m=U.meta;U.form={title:m.title||'',subject:subjectOf(m.subject)?m.subject:'hydraulics',chapter:m.chapter||'',author:m.author||'',duration:m.duration||'',description:m.description||'',q:m.question||'',a:m.answer||'',checks:HUMAN_CHECKS.map(function(){return false;})};}
  var f=U.form;
  function bind(k){return function(e){f[k]=e.target.value;};}
  function field(id,label,ctl,req,full){return h('div',{class:'field'+(full?' full':'')},h('label',{class:'t',for:id},label,req?h('span',{class:'req',text:' จำเป็น'}):null),ctl);}
  var form=h('form',{novalidate:'novalidate',class:'stack',style:'gap:18px',onsubmit:function(e){
      e.preventDefault();
      if(!f.title.trim()||!f.author.trim()||!(Number(f.duration)>0)){U.formError='กรอกชื่อแล็บ ผู้สร้าง และเวลาในคาบให้ครบ';render();return;}
      if(f.checks.indexOf(false)!==-1){U.formError='ติ๊กรายการตรวจก่อนส่งให้ครบทั้ง '+HUMAN_CHECKS.length+' ข้อ';render();return;}
      var tt=f.title.trim(),clash=LABS.filter(function(l){return l.title===tt&&l.id!==U.editId&&l.ownerEmail!==S.email;})[0];
      if(clash){U.formError='มีแล็บชื่อนี้แล้ว แก้ไขได้เฉพาะ '+clash.ownerEmail+' ให้ตั้งชื่อใหม่';render();return;}
      U.returned=false;if(U.editId&&!U.fileChanged)publish();else step(4);
    }},
    h('div',{class:'fields'},
      field('f-title','ชื่อแล็บ',h('input',{id:'f-title',type:'text',value:f.title,oninput:bind('title')}),true),
      field('f-subject','รายวิชา',list('select',{id:'f-subject',onchange:bind('subject')},SUBJECTS.map(function(s){return h('option',{value:s.id,selected:s.id===f.subject,text:s.name});}))),
      field('f-author','ผู้สร้าง',h('input',{id:'f-author',type:'text',value:f.author,oninput:bind('author')}),true),
      field('f-duration','เวลาในคาบ (นาที)',h('input',{id:'f-duration',type:'number',min:'1',value:f.duration,oninput:bind('duration')}),true),
      field('f-chapter','บทเรียน',h('input',{id:'f-chapter',type:'text',value:f.chapter,oninput:bind('chapter')}),false,true),
      field('f-desc','คำอธิบายสั้น',h('textarea',{id:'f-desc',rows:'3',oninput:bind('description')},f.description),false,true),
      field('f-q','คำถามชวนคิด',h('textarea',{id:'f-q',rows:'2',oninput:bind('q')},f.q)),
      field('f-a','เฉลย',h('textarea',{id:'f-a',rows:'2',oninput:bind('a')},f.a))),
    list('fieldset',{},[h('legend',{text:'ตรวจก่อนส่ง'})].concat(HUMAN_CHECKS.map(function(t,i){return h('label',{class:'cb'},h('input',{id:'chk-'+i,type:'checkbox',checked:f.checks[i],onchange:function(e){f.checks[i]=e.target.checked;}}),h('span',{text:t}));}))),
    U.formError?h('p',{class:'err',role:'alert',text:U.formError}):null,
    h('div',{class:'actions'},h('button',{class:'btn primary',type:'submit'},U.editId&&!U.fileChanged?'บันทึกการแก้ไข':'ส่งเข้าคิวตรวจ'),U.editId?h('button',{class:'btn',type:'button',onclick:function(){step(1);}},'เปลี่ยนไฟล์แล็บ'):null,h('button',{class:'btn',type:'button',onclick:function(){if(U.editId)nav('lab',{labId:U.editId});else step(2);}},U.editId?'ยกเลิก':'ย้อนกลับ')));
  return h('section',{class:'panel'},h('h2',{text:U.editId?'แก้ไขข้อมูลแล็บ':'กรอกข้อมูลแล็บ'}),
    U.returned?h('p',{class:'summary back',text:'ผู้ดูแลส่งกลับให้แก้ไข ปรับข้อมูลแล้วส่งอีกครั้ง'}):null,
    h('div',{class:'split'},h('div',{class:'wide'},form),U.cover?h('div',{class:'stack'},h('h3',{text:'รูปการ์ด'}),h('img',{class:'cover',src:U.cover,alt:'รูปการ์ดของแล็บ'})):null));
},
4:function(){
  var f=U.form,s=subjectOf(f.subject);
  return h('section',{class:'panel'},h('h2',{text:'ผู้ดูแลตรวจ: '+f.title}),
    h('p',{class:'muted',text:'ผู้ดูแลลองเล่นแล็บในกรอบนี้ก่อนตัดสินใจ'}),
    h('div',{class:'labgrid'},h('div',{class:'labmain'},h('div',{class:'stagebox'},labFrame('พรีวิวแล็บ '+f.title,U.srcdoc))),
      h('div',{class:'aside'},metaList([['รายวิชา',s.name],['บท',f.chapter||'ไม่ระบุ'],['ผู้สร้าง',f.author],['เวลาในคาบ',f.duration+' นาที']]),f.description?h('p',{text:f.description}):null,
        h('div',{class:'actions'},
          h('button',{class:'btn primary',type:'button',onclick:publish},'อนุมัติขึ้นเว็บ'),
          h('button',{class:'btn warn',type:'button',onclick:function(){U.returned=true;step(3);}},'ส่งกลับให้แก้')))));
}
};

function viewSubmit(){
  return h('main',{class:'wrap page',style:'gap:20px'},
    h('h1',{text:U.editId?'แก้ไขแล็บ':'ส่งแล็บใหม่'}),
    list('ol',{class:'steps','aria-label':'ขั้นตอนการส่งแล็บ'},STEP_NAMES.map(function(n,i){var k=i+1,cls=k<U.step?'done':k===U.step?'now':'';return h('li',{class:cls,'aria-current':k===U.step?'step':null},h('b',{text:String(k)}),h('span',{text:n}));})),
    STEPS[U.step]());
}

function viewPeople(){
  var map={};
  LABS.forEach(function(l){var k=l.ownerEmail||'';(map[k]=map[k]||{email:k,labs:[]}).labs.push(l);});
  var people=Object.keys(map).map(function(k){
    var p=map[k],latest=p.labs.slice().sort(function(a,b){return a.date<b.date?1:a.date>b.date?-1:0;})[0];
    p.name=latest.author||k;
    return p;
  }).sort(function(a,b){return a.name.localeCompare(b.name,'th');});
  return h('main',{class:'wrap page'},h('div',{class:'section'},
    h('div',{},h('h1',{text:'ผู้ลงแล็บ'}),h('p',{class:'muted',text:people.length+' คน · '+LABS.length+' แล็บ'})),
    people.length?list('div',{class:'stack',style:'gap:28px'},people.map(function(p){
      return h('section',{class:'stack'},
        h('div',{},h('h2',{text:p.name}),h('p',{class:'muted',text:p.email+' · เจ้าของ '+p.labs.length+' แล็บ'})),
        list('div',{class:'rows'},p.labs.map(function(l){return labRow(l,{showSubject:true});})));
    })):h('div',{class:'empty stack'},h('p',{text:'ยังไม่มีผู้ลงแล็บ'}),h('div',{},h('button',{class:'btn',type:'button',onclick:openSubmit},'ส่งแล็บใหม่')))));
}

var VIEWS={people:viewPeople,home:viewHome,subject:viewSubject,lab:viewLab,submit:viewSubmit,login:viewLogin};
function render(){
  renderBar();
  clear(document.getElementById('view')).appendChild(VIEWS[S.screen]());
}
render();
})();
