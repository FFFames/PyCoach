const pptxgen = require('pptxgenjs');
const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'PyCoach';
pptx.subject = 'FDE & AI Research Engineer Practical Assessment';
pptx.title = 'PyCoach — Adaptive Python Practice';
pptx.company = 'Beyond Education Group practical assessment';
pptx.lang = 'en-US';
pptx.theme = { headFontFace: 'Arial', bodyFontFace: 'Arial', lang: 'en-US' };
pptx.defineSlideMaster({title:'MASTER',background:{color:'F6F8F2'},objects:[{line:{x:.45,y:7.1,w:12.4,h:0,line:{color:'DCE5D8',width:1}}},{text:{text:'PYCOACH  /  FDE PRACTICAL ASSESSMENT',options:{x:.55,y:7.18,w:5.8,h:.16,fontFace:'Arial',fontSize:6.5,bold:true,color:'587060',charSpacing:1.4,margin:0}}},{text:{text:'01 JUL 2026',options:{x:11.7,y:7.18,w:1.05,h:.16,fontFace:'Arial',fontSize:6.5,bold:true,color:'587060',align:'right',margin:0}}}],slideNumber:{x:12.8,y:7.18,color:'587060',fontFace:'Arial',fontSize:6.5}});
const C={ink:'17221B',paper:'F6F8F2',moss:'295B3B',lime:'C7F36B',clay:'EF6A47',muted:'607067',white:'FFFFFF',line:'DCE5D8'};
const opts={margin:0,breakLine:false,fit:'shrink'};
function slide(){return pptx.addSlide('MASTER')}
function title(s,kicker,heading,sub){s.addText(kicker.toUpperCase(),{x:.65,y:.48,w:4.5,h:.2,fontSize:8,bold:true,color:C.moss,charSpacing:2,margin:0});s.addText(heading,{x:.65,y:.78,w:11.9,h:.7,fontSize:31,bold:true,color:C.ink,margin:0,breakLine:false,fit:'shrink'});if(sub)s.addText(sub,{x:.67,y:1.52,w:10.8,h:.38,fontSize:12,color:C.muted,margin:0,fit:'shrink'})}
function pill(s,text,x,y,w,fill=C.lime,color=C.ink){s.addShape(pptx.ShapeType.roundRect,{x,y,w,h:.34,rectRadius:.16,fill:{color:fill},line:{color:fill}});s.addText(text,{x,y:y+.085,w,h:.12,fontSize:7.5,bold:true,color,align:'center',margin:0,charSpacing:.7})}
function card(s,x,y,w,h,fill=C.white){s.addShape(pptx.ShapeType.roundRect,{x,y,w,h,rectRadius:.14,fill:{color:fill},line:{color:C.line,width:1}})}

// 1 — cover
{
 const s=slide();s.background={color:C.ink};s.addText('PYCOACH',{x:.7,y:.6,w:3,h:.25,fontSize:11,bold:true,color:C.lime,charSpacing:2,margin:0});
 s.addText('Python clicks\nwhen you build it.',{x:.7,y:1.35,w:7.8,h:2.2,fontSize:48,bold:true,color:C.white,margin:0,breakLine:false,fit:'shrink'});
 s.addText('Adaptive practice, immediate feedback, and an instructor-ready view of learning.',{x:.75,y:3.85,w:6.8,h:.65,fontSize:17,color:'C7D0C9',margin:0,breakLine:false,fit:'shrink'});
 pill(s,'FDE + AI RESEARCH ENGINEER',.75,5.05,2.25,C.clay,C.white);pill(s,'DEPLOYABLE MVP',3.18,5.05,1.55,C.lime,C.ink);
 s.addShape(pptx.ShapeType.arc,{x:8.6,y:.65,w:4.2,h:4.2,adjustPoint:.25,rotate:20,line:{color:C.lime,width:3,transparency:20},fill:{color:C.ink,transparency:100}});
 s.addShape(pptx.ShapeType.roundRect,{x:8.25,y:2.0,w:4.2,h:3.85,rectRadius:.2,fill:{color:'20372A'},line:{color:'3D5D49',width:1}});
 s.addText('def is_palindrome(text):\n    clean = text.lower()\n    return clean == clean[::-1]\n\nprint(is_palindrome(input()))',{x:8.62,y:2.55,w:3.5,h:1.9,fontFace:'Courier New',fontSize:13,color:'DDF3C6',margin:0,breakLine:false,fit:'shrink'});
 s.addShape(pptx.ShapeType.roundRect,{x:8.62,y:4.65,w:3.45,h:.55,rectRadius:.1,fill:{color:C.lime},line:{color:C.lime}});s.addText('✓  All tests passed',{x:8.85,y:4.84,w:3,h:.16,fontSize:10,bold:true,color:C.ink,margin:0});
}

// 2 — product
{
 const s=slide();title(s,'The product','One loop. Two useful views.','PyCoach keeps the learner close to the work while giving instructors a clean signal of progress.');
 const cols=[['01','Attempt','Open a focused Python exercise and write code in Monaco.'],['02','Learn','Receive immediate grade, test feedback, and a mastery update.'],['03','Adjust','Get the next exercise from the lowest estimated skill mastery.']];
 cols.forEach((c,i)=>{const x=.68+i*4.18;card(s,x,2.25,3.75,2.2);s.addText(c[0],{x:x+.25,y:2.5,w:.5,h:.3,fontSize:12,bold:true,color:C.clay,margin:0});s.addText(c[1],{x:x+.25,y:2.98,w:3.15,h:.42,fontSize:24,bold:true,color:C.ink,margin:0});s.addText(c[2],{x:x+.25,y:3.57,w:3.15,h:.55,fontSize:11.5,color:C.muted,margin:0,breakLine:false,fit:'shrink'})});
 s.addShape(pptx.ShapeType.roundRect,{x:.68,y:4.85,w:12.0,h:1.4,rectRadius:.16,fill:{color:C.ink},line:{color:C.ink}});s.addText('STUDENT',{x:1.05,y:5.15,w:1.1,h:.18,fontSize:8,bold:true,color:C.lime,charSpacing:1.5,margin:0});s.addText('Exercises · editor · feedback · mastery · recommendation',{x:2.25,y:5.1,w:4.4,h:.3,fontSize:13,bold:true,color:C.white,margin:0});s.addText('INSTRUCTOR',{x:7.05,y:5.15,w:1.3,h:.18,fontSize:8,bold:true,color:C.clay,charSpacing:1.5,margin:0});s.addText('Student · assignment · grade · submission time',{x:8.45,y:5.1,w:3.8,h:.3,fontSize:13,bold:true,color:C.white,margin:0});
}

// 3 — actual screens
{
 const s=slide();title(s,'Built, not mocked','The working learner experience','Verified in a browser at desktop and mobile breakpoints.');
 s.addImage({path:'/tmp/pycoach-student.png',x:.68,y:2.02,w:7.7,h:4.32});
 s.addShape(pptx.ShapeType.roundRect,{x:8.75,y:2.02,w:2.22,h:4.32,rectRadius:.18,fill:{color:'EAF0E5'},line:{color:C.line}});s.addImage({path:'/tmp/pycoach-mobile-fixed.png',x:8.93,y:2.02,w:1.86,h:4.03});
 pill(s,'DESKTOP',.9,5.76,.88,C.lime,C.ink);pill(s,'390 PX',9.39,5.76,.82,C.clay,C.white);
 s.addText('Adaptive recommendation and visible mastery are on the same screen—no analytics scavenger hunt.',{x:11.25,y:3.15,w:1.35,h:1.45,fontSize:14,bold:true,color:C.ink,margin:0,fit:'shrink'});
}

// 4 — architecture
{
 const s=slide();title(s,'Architecture','A deliberately small deployment surface','One Next.js repository; clear boundaries around execution and persistence.');
 const nodes=[{x:.85,t:'Browser',d:'Next.js App Router\nMonaco Editor',c:'FFFFFF'},{x:4.65,t:'Route handlers',d:'Grade · mastery\nrecommendations',c:'EAF0E5'},{x:8.45,t:'Supabase',d:'Auth · PostgreSQL\nRLS policies',c:'FFFFFF'}];
 nodes.forEach(n=>{card(s,n.x,2.35,3.1,1.65,n.c);s.addText(n.t,{x:n.x+.25,y:2.68,w:2.6,h:.35,fontSize:21,bold:true,color:C.ink,margin:0});s.addText(n.d,{x:n.x+.25,y:3.22,w:2.55,h:.55,fontSize:11.5,color:C.muted,margin:0,breakLine:false,fit:'shrink'})});
 s.addShape(pptx.ShapeType.chevron,{x:4.05,y:2.93,w:.38,h:.45,fill:{color:C.clay},line:{color:C.clay}});s.addShape(pptx.ShapeType.chevron,{x:7.85,y:2.93,w:.38,h:.45,fill:{color:C.clay},line:{color:C.clay}});
 s.addShape(pptx.ShapeType.line,{x:6.18,y:4.0,w:0,h:.68,line:{color:C.moss,width:2,dash:'dash'}});card(s,4.65,4.67,3.1,1.25,C.ink);s.addText('Isolated Python runner',{x:4.95,y:4.95,w:2.5,h:.3,fontSize:17,bold:true,color:C.white,margin:0,align:'center'});s.addText('E2B / Firecracker-class sandbox',{x:4.95,y:5.37,w:2.5,h:.2,fontSize:9,color:'C8D2CB',margin:0,align:'center'});
 pill(s,'SAFE FALLBACK WHEN UNCONFIGURED',9.0,5.16,2.85,C.lime,C.ink);
}

// 5 — grading
{
 const s=slide();title(s,'Auto-grading','Fast feedback without pretending code is safe','The deployed app never executes arbitrary Python inside the Next.js process.');
 s.addImage({path:'/tmp/pycoach-graded.png',x:.68,y:2.0,w:7.45,h:4.19});
 const items=[['LOCAL / DEMO','Structural fallback gives immediate, clearly labelled formative feedback.'],['DEPLOYED','CODE_RUNNER_URL sends code + hidden tests to an isolated worker with timeout.'],['PRODUCTION','Ephemeral network-disabled sandbox; CPU, memory, process and output limits.']];
 items.forEach((it,i)=>{const y=2.05+i*1.34;pill(s,it[0],8.55,y,1.35,i===2?C.clay:C.lime,i===2?C.white:C.ink);s.addText(it[1],{x:8.55,y:y+.46,w:3.8,h:.62,fontSize:11.5,color:C.muted,bold:i===2,margin:0,fit:'shrink'})});
}

// 6 — BKT
{
 const s=slide();title(s,'Personalization','An interpretable model for sparse data','Bayesian Knowledge Tracing updates one latent mastery probability per learner and skill.');
 s.addShape(pptx.ShapeType.roundRect,{x:.68,y:2.08,w:5.0,h:3.7,rectRadius:.18,fill:{color:C.ink},line:{color:C.ink}});s.addText('OBSERVE',{x:1.05,y:2.48,w:1.1,h:.18,fontSize:8,bold:true,color:C.lime,charSpacing:1.8,margin:0});s.addText('correct / incorrect',{x:1.05,y:2.9,w:3.9,h:.35,fontSize:25,bold:true,color:C.white,margin:0});s.addText('Bayes update with slip + guess\n↓\nlearning transition\n↓\nnew P(mastery)',{x:1.05,y:3.58,w:3.9,h:1.45,fontSize:16,color:'D8E1DA',bold:true,align:'center',margin:0,breakLine:false,fit:'shrink'});
 const params=[['P(L₀)','0.30'],['P(T)','0.12'],['P(G)','0.20'],['P(S)','0.10']];params.forEach((p,i)=>{const x=6.15+(i%2)*2.8,y=2.15+Math.floor(i/2)*1.2;card(s,x,y,2.45,.9);s.addText(p[0],{x:x+.2,y:y+.2,w:.8,h:.2,fontSize:10,bold:true,color:C.moss,margin:0});s.addText(p[1],{x:x+1.25,y:y+.12,w:.9,h:.35,fontSize:22,bold:true,color:C.ink,align:'right',margin:0})});
 s.addShape(pptx.ShapeType.roundRect,{x:6.15,y:4.72,w:5.25,h:1.08,rectRadius:.12,fill:{color:'EAF0E5'},line:{color:C.line}});s.addText('RECOMMENDATION RULE',{x:6.45,y:4.97,w:2.1,h:.16,fontSize:7.5,bold:true,color:C.clay,charSpacing:1.2,margin:0});s.addText('Serve an unfinished assignment for the lowest-mastery skill.',{x:6.45,y:5.28,w:4.5,h:.22,fontSize:12,bold:true,color:C.ink,margin:0});
}

// 7 — evidence and next step
{
 const s=slide();title(s,'Evidence & handoff','A tested MVP with honest edges','The implementation is ready for Supabase credentials, an isolated runner, and Vercel deployment.');
 const checks=[['5 / 5','unit tests'],['17','routes + pages built'],['0','browser console errors'],['390 px','mobile QA passed']];checks.forEach((c,i)=>{const x=.68+i*3.02;card(s,x,2.1,2.7,1.35);s.addText(c[0],{x:x+.2,y:2.38,w:2.3,h:.42,fontSize:27,bold:true,color:i===2?C.clay:C.moss,align:'center',margin:0});s.addText(c[1].toUpperCase(),{x:x+.2,y:2.97,w:2.3,h:.16,fontSize:7.5,bold:true,color:C.muted,align:'center',charSpacing:1,margin:0})});
 s.addText('Research basis',{x:.72,y:4.0,w:2.2,h:.3,fontSize:20,bold:true,color:C.ink,margin:0});s.addText('Corbett & Anderson (1995)  ·  Classical Knowledge Tracing\nPardos & Heffernan (2010)  ·  Individualized BKT\nPiech et al. (2015)  ·  Deep Knowledge Tracing',{x:.72,y:4.55,w:6.3,h:1.05,fontSize:12,color:C.muted,breakLine:false,margin:0,fit:'shrink'});
 s.addShape(pptx.ShapeType.roundRect,{x:7.65,y:4.0,w:4.55,h:1.55,rectRadius:.15,fill:{color:C.lime},line:{color:C.lime}});s.addText('NEXT',{x:7.98,y:4.3,w:.75,h:.17,fontSize:8,bold:true,color:C.moss,charSpacing:1.5,margin:0});s.addText('Connect credentials → deploy → calibrate from real learning sequences.',{x:7.98,y:4.68,w:3.85,h:.48,fontSize:17,bold:true,color:C.ink,margin:0,fit:'shrink'});
}

pptx.writeFile({ fileName: 'PyCoach_Assessment_Deck.pptx' });
