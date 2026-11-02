(()=>{'use strict';
const form=document.getElementById('admissionForm');
const previewScreen=document.getElementById('previewScreen');
const entryScreen=document.getElementById('entryScreen');
const paperStage=document.getElementById('paperStage');
const universityIdInput=document.getElementById('universityId');
const typeMismatch=document.getElementById('typeMismatch');
const saveStatus=document.getElementById('saveStatus');
const submitBtn=document.getElementById('submitBtn');
const priorInputs=[...form.querySelectorAll('[data-previous]')];
const typeInputs=[...form.querySelectorAll('input[name="admissionType"]')];
let previousPrefix='';
let inProgress=false;
let previewIsBlank=false;
let savedSnapshot=null;

function normalizeDigits(value){return String(value||'').replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-0x0660)).replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-0x06f0));}
function expectedType(){return {'1':'تنافس','4':'موازي','9':'دولي'}[normalizeDigits(universityIdInput.value.trim())[0]]||'';}
function updateTypeMismatch(){const selected=typeInputs.find(e=>e.checked)?.value||'';typeMismatch.hidden=!(selected&&expectedType()&&selected!==expectedType());}
universityIdInput.addEventListener('input',()=>{
 const prefix=normalizeDigits(universityIdInput.value.trim())[0]||'';
 if(prefix!==previousPrefix){const value=expectedType();if(value){const radio=typeInputs.find(e=>e.value===value);if(radio)radio.checked=true;}previousPrefix=prefix;}
 updateTypeMismatch();
});
typeInputs.forEach(i=>i.addEventListener('change',updateTypeMismatch));
function updatePriorRequired(){const any=priorInputs.some(e=>e.value.trim());priorInputs.forEach(e=>e.required=any);}
priorInputs.forEach(el=>el.addEventListener('input',updatePriorRequired));
const minWords={studentName:4,fatherName:2,motherName:2};
function validateNames(){
 for(const [id,minimum] of Object.entries(minWords)){
  const el=document.getElementById(id),words=el.value.trim().split(/\s+/).filter(Boolean);
  el.setCustomValidity(el.value.trim()&&words.length<minimum?(minimum===4?'يرجى إدخال اسم الطالب من أربعة مقاطع على الأقل.':'يرجى إدخال الاسم من مقطعين على الأقل.'):'');
 }
}
Object.keys(minWords).forEach(id=>document.getElementById(id).addEventListener('input',e=>e.target.setCustomValidity('')));
function validForm(){
 updatePriorRequired();validateNames();
 if(!form.reportValidity()){const el=form.querySelector(':invalid');if(el)el.scrollIntoView({block:'center',behavior:'smooth'});return false;}
 if(!/^\d{1,20}$/.test(normalizeDigits(universityIdInput.value.trim()))){
  universityIdInput.setCustomValidity('يرجى إدخال الرقم الجامعي بالأرقام فقط.');universityIdInput.reportValidity();universityIdInput.setCustomValidity('');return false;
 }
 return true;
}
function valuesFromForm(){const data=Object.fromEntries(new FormData(form).entries());data.universityId=normalizeDigits(data.universityId||'');data.studentPhone=normalizeDigits(data.studentPhone||'');data.fatherPhone=normalizeDigits(data.fatherPhone||'');data.motherPhone=normalizeDigits(data.motherPhone||'');return data;}
function setStatus(message,type='info'){
 saveStatus.hidden=!message;saveStatus.textContent=message;saveStatus.dataset.status=type;
}
function setPreviewScale(){
 const widthMm=210,available=Math.max(270,window.innerWidth-20),base=widthMm*96/25.4,scale=Math.min(1,available/base);
 paperStage.style.setProperty('--scale',String(scale));paperStage.style.width=`${base*scale}px`;paperStage.style.height=`${297*96/25.4*scale}px`;
}
function formattedDate(raw){const a=String(raw||'').split('-');return a.length===3?a.reverse().join(' / '):'     /     /     ';}
function applyValues(data,blank){
 document.querySelectorAll('[data-bind]').forEach(el=>{const value=blank?'':String(data[el.dataset.bind]||'').trim();el.textContent=value||' ';el.classList.toggle('is-small',value.length>32);el.classList.toggle('is-tiny',value.length>65);});
 document.querySelectorAll('[data-check]').forEach(el=>el.classList.toggle('checked',!blank&&el.dataset.check===data.admissionType));
 document.getElementById('paperBirthDate').textContent=blank?'     /     /     ':formattedDate(data.birthDate);
 const now=new Date();const date=`${String(now.getDate()).padStart(2,'0')} / ${String(now.getMonth()+1).padStart(2,'0')} / ${now.getFullYear()}`;
 document.getElementById('paperToday').textContent=blank?'     /     /     ':date;
 document.getElementById('paperUniversityId').textContent=blank?'\u00a0':data.universityId||'\u00a0';
}
function showPreview(blank=false,saved=false){
 previewIsBlank=blank;
 const data=blank?{}:valuesFromForm();
 applyValues(data,blank);entryScreen.hidden=true;previewScreen.hidden=false;
 document.getElementById('previewTitle').textContent=blank?'نموذج طلب التحاق فارغ':'معاينة نموذج طلب الالتحاق';
 const confirm=document.getElementById('saveConfirmation');
 confirm.hidden=!saved;confirm.textContent=saved?'تم استلام البيانات من خدمة الحفظ الإلكتروني. يمكنك الآن الطباعة أو تنزيل PDF.':'';
 document.body.classList.add('preview-page','print-enabled');setPreviewScale();window.scrollTo(0,0);
}
function editForm(){previewScreen.hidden=true;entryScreen.hidden=false;document.body.classList.remove('preview-page','print-enabled');previewIsBlank=false;window.scrollTo(0,0);}
function printCurrent(){
 if(!previewIsBlank)applyValues(valuesFromForm(),false);
 window.print();
}
async function downloadPDF(data,blank){
 if(typeof window.generateMutahPDF!=='function')throw new Error('تعذر بدء إنشاء PDF. يرجى إعادة تحميل الصفحة.');
 const id=blank?'blank':normalizeDigits(data.universityId||'student').replace(/[^0-9]/g,'').slice(0,20);
 const filename=blank?'Mutah_Admission_Blank.pdf':`Mutah_Admission_${id||'Student'}.pdf`;
 await window.generateMutahPDF(data,filename,{blank});
}
async function savePDF(blank){
 if(!blank&&!validForm())return;
 if(inProgress)return;
 inProgress=true;
 const btn=document.getElementById('savePdfBtn');btn.disabled=true;
 try{await downloadPDF(blank?{}:valuesFromForm(),blank);setStatus('تم تجهيز ملف PDF وبدء تنزيله على جهازك. هذه العملية لا ترسل البيانات إلى الإدارة.','success');}
 catch(error){setStatus(error?.message||'تعذّر إنشاء ملف PDF. حاول مرة أخرى.','error');}
 finally{inProgress=false;btn.disabled=false;}
}
async function submitNetlify(){
 if(!validForm()||inProgress)return;
 if(location.protocol==='file:'||location.hostname.endsWith('github.io')){
  setStatus('حفظ البيانات للإدارة يعمل بعد نشر المشروع على Netlify. يمكنك الآن معاينة الطلب أو تنزيل PDF دون إرسال.','error');return;
 }
 inProgress=true;submitBtn.disabled=true;setStatus('جاري إرسال البيانات إلى سجل الطلبات الإلكتروني...');
 const data=new FormData(form);data.set('universityId',normalizeDigits(data.get('universityId')));
 data.set('studentPhone',normalizeDigits(data.get('studentPhone')));
 data.set('fatherPhone',normalizeDigits(data.get('fatherPhone')));
 data.set('motherPhone',normalizeDigits(data.get('motherPhone')));
 data.set('submitted_at',new Date().toISOString());
 const params=new URLSearchParams();
 for(const [key,value] of data.entries())if(typeof value==='string')params.append(key,value);
 try{
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),25000);
  let response;
  try{response=await fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:params.toString(),signal:controller.signal,cache:'no-store'});}
  finally{clearTimeout(timer);}
  if(!response.ok)throw new Error('خدمة حفظ الطلبات غير متاحة حاليًا. يمكنك تنزيل PDF والاحتفاظ به لحين إعادة المحاولة.');
  savedSnapshot=JSON.stringify(valuesFromForm());
  setStatus('تم استلام بيانات الطلب. يمكنك الآن طباعة النسخة الورقية أو تنزيل PDF.','success');
  showPreview(false,true);
 }catch(error){
  const message=error?.name==='AbortError'?'انتهت مهلة الإرسال. تعذّر تأكيد الحفظ؛ يرجى التحقق من الإدارة قبل إعادة المحاولة (قد يصل الطلب مرتين).':(error?.message||'تعذر الاتصال بالخدمة.');
  setStatus(message,'error');saveStatus.scrollIntoView({block:'center',behavior:'smooth'});
 }finally{inProgress=false;submitBtn.disabled=false;}
}
form.addEventListener('submit',e=>{e.preventDefault();void submitNetlify();});
document.getElementById('previewBtn').addEventListener('click',()=>{if(validForm())showPreview(false,JSON.stringify(valuesFromForm())===savedSnapshot);});
document.getElementById('savePdfBtn').addEventListener('click',()=>void savePDF(false));
document.getElementById('blankPrintBtn').addEventListener('click',()=>{showPreview(true,false);requestAnimationFrame(()=>window.print());});
document.getElementById('previewPdfBtn').addEventListener('click',()=>void (async()=>{
 try{await downloadPDF(previewIsBlank?{}:valuesFromForm(),previewIsBlank);}
 catch(error){const confirmation=document.getElementById('saveConfirmation');confirmation.hidden=false;confirmation.textContent=error?.message||'تعذر حفظ PDF';}
})());
document.getElementById('editBtn').addEventListener('click',editForm);
document.getElementById('printBtn').addEventListener('click',printCurrent);
form.addEventListener('reset',()=>setTimeout(()=>{updatePriorRequired();typeMismatch.hidden=true;previousPrefix='';savedSnapshot=null;setStatus('');document.getElementById('formError').textContent='';Object.keys(minWords).forEach(id=>document.getElementById(id).setCustomValidity(''));},0));
form.addEventListener('input',()=>{if(savedSnapshot&&JSON.stringify(valuesFromForm())!==savedSnapshot)setStatus('تم تعديل البيانات بعد آخر إرسال. إذا أردت حفظ التعديلات في سجل الإدارة، أرسل الطلب مرة أخرى (قد يظهر سجل آخر).');});
window.addEventListener('resize',()=>{if(!previewScreen.hidden)setPreviewScale();});
window.addEventListener('beforeprint',()=>{if(!previewScreen.hidden)applyValues(previewIsBlank?{}:valuesFromForm(),previewIsBlank);});
const year=document.getElementById('schoolYear');year.max=new Date().getFullYear()+1;
const now=new Date();document.getElementById('birthDate').max=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
})();
