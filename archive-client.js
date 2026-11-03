/* Minimal-friction archive client. No credentials are included in public files.
 * Archive processing is disclosed in the page's privacy/data notice.
 */
(function () { 'use strict';
  const config = window.MUTAH_ARCHIVE_CONFIG || {};
  const enabled = /^https:\/\//.test(config.apiUrl || '') && !!config.turnstileSiteKey;
  let widgetId = null;
  let readyPromise = null;
  let tokenResolver = null;
  function resetChallenge(){
    try { if (widgetId !== null) window.turnstile?.reset(widgetId); } catch (_) {}
  }
  function init(){
    if(!enabled) return;
    const box = document.getElementById('archiveSecurity');
    if(box) box.hidden = false;
    readyPromise = new Promise((resolve, reject) => {
      const script=document.createElement('script');
      script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async=true;
      script.onload=()=>{
        try {
          widgetId=window.turnstile.render('#turnstileWidget',{
            sitekey:config.turnstileSiteKey,
            action:'admission_submit',
            theme:'auto',language:'ar',
            appearance:'interaction-only',execution:'execute',
            callback:(token)=>{if(tokenResolver){tokenResolver.resolve(token);tokenResolver=null;}},
            'error-callback':()=>{if(tokenResolver){tokenResolver.reject(new Error('Security check failed'));tokenResolver=null;}},
            'timeout-callback':()=>{if(tokenResolver){tokenResolver.reject(new Error('Security check timed out'));tokenResolver=null;}},
          });
          resolve();
        } catch(err){reject(err);}
      };
      script.onerror=()=>reject(new Error('Could not load security verification'));
      document.head.appendChild(script);
    });
    readyPromise.catch(()=>{}); // Optional archiving must never block PDF/printing.
  }
  async function getToken(){
    if(!readyPromise) throw new Error('Archive unavailable');
    await readyPromise;
    return await new Promise((resolve,reject)=>{
      let settled=false;
      const timeout=setTimeout(()=>{
        if(!settled){settled=true;tokenResolver=null;reject(new Error('Security timeout'));}
      },15000);
      tokenResolver={resolve:(value)=>{if(!settled){settled=true;clearTimeout(timeout);resolve(value);}},reject:(err)=>{if(!settled){settled=true;clearTimeout(timeout);reject(err);}}};
      try {window.turnstile.execute(widgetId);} catch(err){tokenResolver.reject(err);}
    });
  }
  async function submit(data){
    if(!enabled) throw new Error('Archive disabled');
    const token = await getToken();
    try {
      const res=await fetch(config.apiUrl, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({token,data}),
        mode:'cors',cache:'no-store',keepalive:true,
        signal:AbortSignal.timeout(20000)
      });
      const result=await res.json().catch(()=>({}));
      if(!res.ok || !result.ok) throw new Error('Archive HTTP '+res.status);
      return result.receipt || 'ok';
    } finally {resetChallenge();}
  }
  window.mutahArchive={enabled,init,submit,resetChallenge};
})();
