/*
 * منشئ PDF مستقل تمامًا عن نافذة طباعة المتصفح.
 * يرسم صفحة A4 عربية باستخدام Canvas، ثم يُضمّنها داخل PDF واحد.
 * لا يستخدم خدمات خارجية ولا ينقل بيانات الطالب عبر الإنترنت.
 * ملاحظة: النص داخل PDF الناتج صورة عالية الدقة، وليس نصًا قابلًا للتحديد.
 */
(function(){'use strict';
const W=210,H=297,SCALE=7;
function string(value){return String(value??'').trim();}
function arabicDigitsToEnglish(v){return string(v).replace(/[٠-٩]/g,x=>String(x.charCodeAt(0)-0x660)).replace(/[۰-۹]/g,x=>String(x.charCodeAt(0)-0x6f0));}
function dateFromInput(value){const bits=string(value).split('-');return bits.length===3?bits.reverse().join(' / '):'   /   /   ';}
function today(){const d=new Date();return `${String(d.getDate()).padStart(2,'0')} / ${String(d.getMonth()+1).padStart(2,'0')} / ${d.getFullYear()}`;}
function tryImage(src){return new Promise(resolve=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>resolve(null);i.src=src;});}
function makeCanvas(data,blank,logo){
 const canvas=document.createElement('canvas');canvas.width=W*SCALE;canvas.height=H*SCALE;
 const c=canvas.getContext('2d',{alpha:false});if(!c)throw new Error('هذا المتصفح لا يدعم إنشاء PDF عبر Canvas.');
 c.scale(SCALE,SCALE);c.fillStyle='#fff';c.fillRect(0,0,W,H);
 c.lineWidth=.32;c.strokeStyle='#111';c.fillStyle='#111';c.textAlign='center';c.textBaseline='middle';c.direction='rtl';
 const val=(key)=>blank?'':string(data[key]);
 function text(t,x,y,size=3.5,maxWidth=80,bold=true){
  if(!string(t))return;
  c.save();c.fillStyle='#0b0b0b';c.font=`${bold?'bold ':''}${size}px Arial, Tahoma, sans-serif`;
  c.textAlign='center';c.direction='rtl';c.textBaseline='middle';
  c.fillText(string(t),x,y,maxWidth);c.restore();
 }
 function rect(x,y,w,h,fill=''){c.save();c.lineWidth=.32;c.strokeStyle='#151515';if(fill){c.fillStyle=fill;c.fillRect(x,y,w,h);}c.strokeRect(x,y,w,h);c.restore();}
 function boxLabel(x,y,w,h,label,fill='',size=3.3){rect(x,y,w,h,fill);text(label,x+w/2,y+h/2,size,w-2);}
 function row(y,h,cols){let right=206;for(const col of cols){const width=202*(col.fraction||1/cols.length);const left=right-width;boxLabel(left,y,width,h,col.value||'',col.header?'#d3d3d3':'',col.size||3.35);right=left;}}
 function bar(y,title){boxLabel(4,y,202,6.8,title,'#d3d3d3',3.65);return y+6.8;}
 let y=48;
 function section(title,draw){y=bar(y,title);draw();y+=4.4;}
 // ترويسة مطابقة وظيفيًا لتوزيع نموذج الجامعة الورقي.
 text('طلب التحاق',105,6,4.35,65);
 text('جامعة مؤتة',177,8.8,4.2,52);
 text('وحدة القبول والتسجيل',177,14,3.85,52);
 text('الرقم الجامعي:',130,17.5,3.65,28);
 if(blank){c.beginPath();c.moveTo(74,20);c.lineTo(114,20);c.stroke();}
 else text(arabicDigitsToEnglish(val('universityId')),93,17.5,3.8,37);
 if(logo){try{c.drawImage(logo,96,18,18,21);}catch(_){}}
 text('صورة',28,21,3.6,23);text('شخصية',28,26,3.6,23);
 text('نوع الطلب',174,24,3.65,52);
 const options=[{name:'تنافس',x:192},{name:'موازي',x:164},{name:'دولي',x:137}];
 for(const item of options){text(item.name,item.x,33,3.7,22);rect(item.x-17,31.8,2.7,2.7);
  if(!blank&&data.admissionType===item.name)text('✓',item.x-15.65,33.1,2.6,2.5);
 }
 section('معلومات شخصية',()=>{
  const width=[.25,.45,.125,.175];
  row(y,7.2,[{fraction:width[0],value:'اسم الطالب (أربع مقاطع)',header:true},{fraction:width[1],value:val('studentName'),size:3.2},{fraction:width[2],value:'الديانة',header:true},{fraction:width[3],value:val('religion')}]);y+=7.2;
  row(y,7.2,[{fraction:width[0],value:'تاريخ الولادة',header:true},{fraction:width[1],value:blank?'   /   /   ':dateFromInput(data.birthDate)},{fraction:width[2],value:'الجنس',header:true},{fraction:width[3],value:val('gender')}]);y+=7.2;
  row(y,7.2,[{fraction:width[0],value:'مكان الولادة',header:true},{fraction:width[1],value:val('birthPlace')},{fraction:width[2],value:'الجنسية',header:true},{fraction:width[3],value:val('nationality')}]);y+=7.2;
  row(y,7.2,[{fraction:.25,value:'رقم الهاتف',header:true},{fraction:.45,value:arabicDigitsToEnglish(val('studentPhone'))},{fraction:.30,value:''}]);y+=7.2;
 });
 section('معلومات عن الوالدين',()=>{
  row(y,7,[{fraction:.25,value:'اسم الأب (أربعة مقاطع)',header:true},{fraction:.45,value:val('fatherName')},{fraction:.125,value:'رقم الهاتف',header:true},{fraction:.175,value:arabicDigitsToEnglish(val('fatherPhone'))}]);y+=7;
  row(y,7,[{fraction:.25,value:'اسم الأم (أربعة مقاطع)',header:true},{fraction:.45,value:val('motherName')},{fraction:.125,value:'رقم الهاتف',header:true},{fraction:.175,value:arabicDigitsToEnglish(val('motherPhone'))}]);y+=7;
 });
 section('العنوان البريدي لولي أمر الطالب',()=>{
  row(y,6.5,[{fraction:1/3,value:'المحافظة',header:true},{fraction:2/3,value:'العنوان الكامل',header:true}]);y+=6.5;
  row(y,9.2,[{fraction:1/3,value:val('governorate')},{fraction:2/3,value:val('fullAddress'),size:3.12}]);y+=9.2;
 });
 section('معلومات الثانوية العامة',()=>{
  row(y,6.5,[{value:'مصدر الشهادة',header:true},{value:'السنة',header:true},{value:'الفرع',header:true},{value:'المعدل',header:true}]);y+=6.5;
  row(y,8.5,[{value:val('certificateSource')},{value:val('schoolYear')},{value:val('schoolBranch')},{value:val('schoolAverage')}]);y+=8.5;
 });
 section('الجامعات الأردنية الأخرى (إذا سبق وأن درست فيها أو في جامعة مؤتة)',()=>{
  row(y,6.5,[{value:'اسم الجامعة',header:true},{value:'التخصص',header:true},{value:'الرقم الجامعي',header:true},{value:'سبب تركها',header:true}]);y+=6.5;
  row(y,8.5,[{value:val('priorUniversity')},{value:val('priorMajor')},{value:val('priorStudentId')},{value:val('priorReason')}]);y+=8.5;
 });
 section('التخصص المطلوب أو الذي قبل فيه',()=>{boxLabel(4,y,202,7.3,val('desiredMajor'),'',3.75);y+=7.3;});
 section('مكتب خدمة العلم (للطلبة الأردنيين / ذكور)',()=>{
  row(y,6.4,[{value:'الختم الرسمي',header:true},{value:'التوقيع',header:true}]);y+=6.4;
  row(y,8,[{value:''},{value:''}]);y+=8;
 });
 section('أقر وأعترف بأن جميع البيانات الواردة في هذا الطلب صحيحة وأتحمل مسؤولية أي خطأ فيها.',()=>{
  row(y,6.8,[{value:'توقيع الطالب: ____________________'},{value:'التاريخ: '+(blank?'   /   /   ':today())}]);y+=6.8;
 });
 y=bar(y,'الوثائق المطلوبة');
 row(y,8.1,[{value:'كشف الثانوية العامة ☐',size:3.0},{value:'صورة مصدقة عن شهادة الميلاد ☐',size:2.65},{value:'صورة مصدقة عن الهوية المدنية ☐',size:2.65},{value:'صورة شخصية عدد 1 ☐',size:3.0}]);
 return canvas;
}
function bytesFromBase64(base64){const binary=atob(base64);const out=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)out[i]=binary.charCodeAt(i);return out;}
function makePdf(jpg,width,height){
 const encoder=new TextEncoder(),parts=[];let offset=0;
 const add=t=>{const b=typeof t==='string'?encoder.encode(t):t;parts.push(b);offset+=b.length;};
 const positions=[0];
 add('%PDF-1.4\n%MUTAH-PDF\n');
 const obj=(number,body)=>{positions[number]=offset;add(`${number} 0 obj\n`);add(body);add('\nendobj\n');};
 obj(1,'<< /Type /Catalog /Pages 2 0 R >>');
 obj(2,'<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
 obj(3,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.276 841.89] /Resources << /XObject << /Im1 5 0 R >> >> /Contents 4 0 R >>');
 const content='q\n595.276 0 0 841.89 0 0 cm\n/Im1 Do\nQ\n';
 obj(4,`<< /Length ${encoder.encode(content).length} >>\nstream\n${content}endstream`);
 positions[5]=offset;
 add('5 0 obj\n');add(`<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`);add(jpg);add('\nendstream\nendobj\n');
 const xref=offset;add('xref\n0 6\n0000000000 65535 f \n');
 for(let n=1;n<=5;n++)add(`${String(positions[n]).padStart(10,'0')} 00000 n \n`);
 add(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
 return new Blob(parts,{type:'application/pdf'});
}
window.generateMutahPDF=async function(data,filename,{blank=false}={}){
 const logo=await tryImage(document.querySelector('.header-logo')?.src || 'logo.png');
 const canvas=makeCanvas(data||{},blank,logo);
 const jpeg=canvas.toDataURL('image/jpeg',0.93);
 const pdf=makePdf(bytesFromBase64(jpeg.slice(jpeg.indexOf(',')+1)),canvas.width,canvas.height);
 const url=URL.createObjectURL(pdf);const a=document.createElement('a');a.href=url;a.download=filename||'Mutah_Admission.pdf';a.style.display='none';document.body.appendChild(a);
 try{a.click();}finally{a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
 return pdf;
};
})();
