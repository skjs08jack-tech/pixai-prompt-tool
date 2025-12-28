// app.js（完コピ風UI：details/summary + ランダム + 出力 + 履歴）

const STORAGE_KEY = "pixai_prompt_tool_history_v2";
const MAX_HISTORY = 50;

// 参考サイトの注意「ポーズ系複数で軽微なバグ」対策：どれか選んだら他は未選択に戻す
const POSE_EXCLUSIVE_IDS = ["normal_pose", "ero_pose", "sex_pose"];

const state = {}; // id -> { mode: "none"|"random"|"pick", value: string }

function $(id){ return document.getElementById(id); }

function loadHistory(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  }catch(e){ return []; }
}
function saveHistory(arr){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); }catch(e){}
}
function pushHistory(text){
  if(!text) return;
  const hist = loadHistory();
  // 重複整理
  for(let i=hist.length-1;i>=0;i--){
    if(hist[i] === text) hist.splice(i,1);
  }
  hist.unshift(text);
  if(hist.length > MAX_HISTORY) hist.length = MAX_HISTORY;
  saveHistory(hist);
  renderHistoryArea();
}
function renderHistoryArea(){
  const area = $("history_area");
  if(!area) return;
  area.value = loadHistory().join("\n");
}
function clearHistory(){
  saveHistory([]);
  renderHistoryArea();
}
window.clearHistory = clearHistory;

function initState(){
  for(const cat of PROMPT_CATEGORIES){
    state[cat.id] = { mode:"none", value:"" };
  }
}

function pickRandomValue(cat){
  const items = cat.items || [];
  if(!items.length) return "";
  const n = Math.floor(Math.random() * items.length);
  return (items[n].value || "").trim();
}

function setCategoryMode(catId, mode, value=""){
  state[catId] = { mode, value };

  // ポーズ系排他：一個をpick/randomにしたら他はnoneへ
  if(POSE_EXCLUSIVE_IDS.includes(catId) && mode !== "none"){
    for(const otherId of POSE_EXCLUSIVE_IDS){
      if(otherId !== catId){
        state[otherId] = { mode:"none", value:"" };
        // UI側もnoneにチェックを戻す
        const noneRadio = document.querySelector(`input[name="cat_${otherId}"][value="__NONE__"]`);
        if(noneRadio) noneRadio.checked = true;
      }
    }
  }

  // UI同期（radio）
  const name = `cat_${catId}`;
  if(mode === "none"){
    const r = document.querySelector(`input[name="${name}"][value="__NONE__"]`);
    if(r) r.checked = true;
  }else if(mode === "random"){
    const r = document.querySelector(`input[name="${name}"][value="__RANDOM__"]`);
    if(r) r.checked = true;
  }else{
    // pickの場合：valueに一致するradioを探す
    const r = document.querySelector(`input[name="${name}"][data-pick="1"][data-val="${cssEscape(value)}"]`);
    if(r) r.checked = true;
  }
}

function buildPrompt(){
  const parts = [];
  if(typeof FIXED_PREFIX === "string" && FIXED_PREFIX.trim()) parts.push(FIXED_PREFIX.trim());

  for(const cat of PROMPT_CATEGORIES){
    const s = state[cat.id];
    if(!s) continue;

    if(s.mode === "pick" && s.value){
      parts.push(s.value);
    }else if(s.mode === "random"){
      const rv = pickRandomValue(cat);
      if(rv) parts.push(rv);
    }
  }

  if(typeof FIXED_SUFFIX === "string" && FIXED_SUFFIX.trim()) parts.push(FIXED_SUFFIX.trim());

  // 参考に近い：value側に「, 」が含まれてる想定もあるので、そのまま連結→軽く整形
  let text = parts.join(" ").replace(/\s+/g, " ").trim();
  text = text.replace(/,\s*,/g, ", ").replace(/\s+,/g, ", ").replace(/,{2,}/g, ",");
  return text.trim();
}

function showResult(){
  const out = buildPrompt();
  const area = $("result_area");
  if(area) area.value = out;
  pushHistory(out);
}
window.showResult = showResult;

async function copyResult(){
  const area = $("result_area");
  const text = area ? area.value : "";
  if(!text) return;

  if(navigator.clipboard && navigator.clipboard.writeText){
    try{ await navigator.clipboard.writeText(text); return; }catch(e){}
  }
  // フォールバック
  if(area){
    area.focus();
    area.select();
    try{ document.execCommand("copy"); }catch(e){}
  }
}
window.copyResult = copyResult;

// ------- グループランダム（参考サイトのボタン群） -------
function randomizeIds(ids){
  for(const id of ids){
    setCategoryMode(id, "random");
  }
}
function bodyRandom(){ randomizeIds(["bodyShape","breasts"]); }
function hairRandom(){ randomizeIds(["front_hair","back_hair","hair_color","hair_accessory"]); }
function faceRandom(){ randomizeIds(["eye_shape","eye_color","expression"]); }
function clothesRandom(){ randomizeIds(["clothes"]); }
function poseRandom(){ randomizeIds(["normal_pose","ero_pose","sex_pose"]); }
function juiceRandom(){ randomizeIds(["juice"]); }
function allRandom(){
  bodyRandom(); hairRandom(); faceRandom(); clothesRandom(); poseRandom(); juiceRandom();
}
window.bodyRandom = bodyRandom;
window.hairRandom = hairRandom;
window.faceRandom = faceRandom;
window.clothesRandom = clothesRandom;
window.poseRandom = poseRandom;
window.juiceRandom = juiceRandom;
window.allRandom = allRandom;

// ------- UI生成（details/summaryの中にradioを並べる） -------
function renderCategories(){
  const root = $("categories");
  if(!root) return;

  let html = "";
  for(const cat of PROMPT_CATEGORIES){
    const name = `cat_${cat.id}`;

    html += `
      <div class="catBlock">
        <div class="catTitle">${escapeHtml(cat.name)}</div>
        <details>
          <summary><span>詳細</span></summary>
          <div class="choices">
            <label><input type="radio" name="${name}" value="__NONE__" checked> 未選択</label>
            <label><input type="radio" name="${name}" value="__RANDOM__"> ランダム</label>
            <hr>
    `;

    for(const it of (cat.items||[])){
      const v = (it.value || "");
      html += `<label><input type="radio" name="${name}" value="__PICK__" data-pick="1" data-val="${escapeAttr(v)}"> ${escapeHtml(it.label)}</label>`;
    }

    html += `
          </div>
        </details>
      </div>
    `;
  }

  root.innerHTML = html;

  // radio change => state反映
  for(const cat of PROMPT_CATEGORIES){
    const name = `cat_${cat.id}`;
    const radios = document.querySelectorAll(`input[name="${name}"]`);
    radios.forEach(r=>{
      r.addEventListener("change", ()=>{
        const v = r.value;
        if(v === "__NONE__") setCategoryMode(cat.id, "none");
        else if(v === "__RANDOM__") setCategoryMode(cat.id, "random");
        else {
          const chosen = r.getAttribute("data-val") || "";
          setCategoryMode(cat.id, "pick", chosen);
        }
      });
    });

    // 初期：noneに同期
    setCategoryMode(cat.id, "none");
  }

  renderHistoryArea();
}

function escapeHtml(s){
  return String(s||"").replace(/[&<>"']/g, c=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
}
function escapeAttr(s){
  return escapeHtml(s).replace(/"/g,"&quot;");
}
function cssEscape(s){
  // querySelector用の超簡易（今回はdata-val一致検索に使ってるので、原則不要だけど保険）
  return String(s||"").replace(/\\/g,"\\\\").replace(/"/g,'\\"');
}

(function main(){
  initState();
  renderCategories();
})();

