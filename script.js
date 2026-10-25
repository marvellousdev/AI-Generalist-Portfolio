// Human-reviewed, illustrative work samples. No external API requests.
const cases = [
  {
    category:"MATHEMATICAL REASONING",
    heading:"Check a straightforward percentage calculation",
    prompt:"A shop sold 18 out of 72 items. What percentage of its items did it sell? Explain briefly.",
    a:"25%. Divide 18 by 72 to get 0.25, then multiply by 100.",
    b:"20%. Divide 18 by 72 to get 0.20, then multiply by 100.",
    scoresA:[5,5,5,5],
    scoresB:[1,5,1,5],
    rationale:"A is correct: 18 ÷ 72 = 0.25, so 25% were sold. B presents a plausible-looking calculation but gets the division wrong. This is a factual error, not a stylistic preference.",
    correction:"Replace 20% and 0.20 with 25% and 0.25."
  },
  {
    category:"INSTRUCTION FOLLOWING",
    heading:"Verify compliance with an exact output format",
    prompt:"Name an aquatic mammal using exactly two lowercase words. Do not include punctuation or explanation.",
    a:"blue whale",
    b:"A blue whale is an aquatic mammal.",
    scoresA:[5,5,5,5],
    scoresB:[5,1,4,4],
    rationale:"Both responses name a valid aquatic mammal. Only A follows all formatting constraints: exactly two lowercase words, no punctuation and no explanation. B violates multiple explicit instructions.",
    correction:"Use only 'blue whale'. Remove the extra words and punctuation."
  },
  {
    category:"FACTUAL CONSISTENCY",
    heading:"Check summary fidelity against a source",
    prompt:"Summarize this note in one sentence: 'The pilot begins on May 12, lasts two weeks, includes 40 volunteers, and requires weekly feedback.'",
    a:"The two-week pilot starts May 12 with 40 volunteers and weekly feedback.",
    b:"The four-week pilot starts May 21 with 60 volunteers and daily feedback.",
    scoresA:[5,5,5,5],
    scoresB:[1,5,1,4],
    rationale:"A preserves all four source facts while condensing them. B changes the start date, duration, volunteer count and feedback cadence. A concise summary cannot introduce unsupported details.",
    correction:"Restore May 12, two weeks, 40 volunteers and weekly feedback."
  }
];
const $ = (id) => document.getElementById(id);
let currentExport = null;
function average(values){ return values.reduce((a,b)=>a+b,0)/values.length; }
function showCase(index){
  const c=cases[index];
  $("case-category").textContent=c.category;
  $("case-heading").textContent=c.heading;
  $("case-prompt").textContent=c.prompt;
  $("case-a").textContent=c.a;
  $("case-b").textContent=c.b;
  $("score-a").textContent=average(c.scoresA).toFixed(1)+" / 5";
  $("score-b").textContent=average(c.scoresB).toFixed(1)+" / 5";
  $("case-rationale").textContent=c.rationale;
  $("case-correction").textContent=c.correction;
  document.querySelectorAll(".case-tab").forEach((button,i)=>{
    button.classList.toggle("active",i===index);
    button.setAttribute("aria-pressed", String(i===index));
  });
}
document.querySelectorAll(".case-tab").forEach(btn=>btn.addEventListener("click",()=>showCase(Number(btn.dataset.case))));
document.querySelectorAll("select[data-response]").forEach(select=>{
  for(let i=1;i<=5;i++){const opt=document.createElement("option");opt.value=String(i);opt.textContent=i+" / 5";if(i===3) opt.selected=true;select.appendChild(opt);}
});
$("load-example").addEventListener("click",()=>{
  const c=cases[0];
  $("prompt-input").value=c.prompt;
  $("response-a-input").value=c.a;
  $("response-b-input").value=c.b;
  $("notes-input").value=c.rationale;
  const dimensions=["accuracy","instruction","reasoning","clarity"];
  dimensions.forEach((dimension,i)=>{
    document.querySelector(`select[data-response="a"][data-dimension="${dimension}"]`).value=String(c.scoresA[i]);
    document.querySelector(`select[data-response="b"][data-dimension="${dimension}"]`).value=String(c.scoresB[i]);
  });
  $("evaluation-result").hidden=true;
  currentExport=null;
});
$("evaluation-form").addEventListener("submit",(event)=>{
  event.preventDefault();
  const prompt=$("prompt-input").value.trim();
  const responseA=$("response-a-input").value.trim();
  const responseB=$("response-b-input").value.trim();
  const rationale=$("notes-input").value.trim();
  if(!prompt || !responseA || !responseB || !rationale){alert("Complete the prompt, responses and rationale.");return;}
  const criteria=["accuracy","instruction","reasoning","clarity"];
  const scoresA=criteria.map(x=>Number(document.querySelector(`select[data-response="a"][data-dimension="${x}"]`).value));
  const scoresB=criteria.map(x=>Number(document.querySelector(`select[data-response="b"][data-dimension="${x}"]`).value));
  const a=average(scoresA),b=average(scoresB);
  const winner=a>b?"Response A preferred":b>a?"Response B preferred":"Tie: equal scores";
  $("result-winner").textContent=winner;
  $("result-explanation").textContent="Human-scored rubric average. Review your written rationale before exporting.";
  $("result-a").textContent="A "+a.toFixed(2)+"/5";
  $("result-b").textContent="B "+b.toFixed(2)+"/5";
  $("evaluation-result").hidden=false;
  currentExport={prompt,responseA,responseB,rationale,scoresA,scoresB,averageA:a,averageB:b,winner};
  $("evaluation-result").scrollIntoView({behavior:"smooth",block:"nearest"});
});
function csvEscape(x){return '"'+String(x).replace(/"/g,'""')+'"';}
$("export-csv").addEventListener("click",()=>{
  if(!currentExport)return;
  const x=currentExport;
  const row=[x.prompt,x.responseA,x.responseB,...x.scoresA,...x.scoresB,x.averageA.toFixed(2),x.averageB.toFixed(2),x.winner,x.rationale];
  const labels=["prompt","response_a","response_b","a_accuracy","a_instruction_fit","a_reasoning","a_clarity","b_accuracy","b_instruction_fit","b_reasoning","b_clarity","a_average","b_average","preferred_response","evaluator_rationale"];
  const csv=[labels.map(csvEscape).join(","),row.map(csvEscape).join(",")].join("\r\n")+"\r\n";
  const blob=new Blob(["\uFEFF",csv],{type:"text/csv;charset=utf-8;"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");a.href=url;a.download="ai_response_evaluation.csv";document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
});
showCase(0);
