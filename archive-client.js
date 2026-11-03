/* Public-side archive client; contains no credentials. */
(function(){'use strict';
const config = window.MUTAH_ARCHIVE_CONFIG || {};
const enabled = /^https:\/\//.test(config.apiUrl||'') && !!config.turnstileSiteKey;
let widgetId=null;
function resetChallenge(){try{if(widgetId!==null)window.turnstile?.reset(widgetId);}catch(_){}}
function init(){
 const box=document.getElementById('archiveSecurity');
 if(!enabled){box.hidden=true;document.getElementById('archiveConsentWrap').hidden=true;document.getElementById('archiveConsent').required=false;return;}
 box.hidden=false;
 const script=document.createElement('script');
 script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
 script.async=true;script.defer=true;
 script.onload=()=>{
   try{widgetId=window.turnstile.render('#turnstileWidget',{
     sitekey:config.turnstileSiteKey,
     action:'admission_submit',
     theme:'auto',
     language:'ar'
   });}catch(_){document.getElementById('archiveChallengeText').textContent='تعذّر تحميل التحقق الأمني. حدّث الصفحة عند توفر الإنترنت.';}
 };
 script.onerror=()=>{document.getElementById('archiveChallengeText').textContent='تعذّر الاتصال بخدمة التحقق الأمني.';};
 document.head.appendChild(script);
}
async function submit(data) {
 if(!enabled)throw new Error('الحفظ الإلكتروني غير مفعّل في إعدادات الموقع. يمكنك المتابعة بالطباعة أو حفظ PDF.');
 if(widgetId===null || !window.turnstile)throw new Error('خدمة التحقق الأمني لم تجهز بعد. تحقق من اتصال الإنترنت.');
 const token=window.turnstile.getResponse(widgetId);
 if(!token)throw new Error('يرجى إكمال التحقق الأمني قبل حفظ الطلب لدى الإدارة.');
 try{
   const res=await fetch(config.apiUrl,{
     method:'POST',
     headers:{'Content-Type':'application/json'},
     body:JSON.stringify({token,data}),
     mode:'cors',
     cache:'no-store',
     signal:AbortSignal.timeout(18000)
   });
   const result=await res.json().catch(()=>({}));
   if(!res.ok || !result.ok)throw new Error(result.message||'لم يكتمل حفظ الطلب إلكترونيًا.');
   return result.receipt;
 }catch(err){
   if(err?.name==='TimeoutError' || err?.name==='AbortError')throw new Error('انتهت مهلة الاتصال؛ قد يكون الطلب حُفظ. راجع الإدارة قبل إعادة الإرسال.');
   if(err instanceof TypeError)throw new Error('تعذّر الاتصال بخدمة الحفظ. تأكد من الإنترنت أو من إعداد رابط الخدمة.');
   throw err;
 }finally{resetChallenge();}
}
window.mutahArchive={enabled,init,submit,resetChallenge};
})();
