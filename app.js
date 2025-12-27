// app.js
(function () {
  var STORAGE_KEY = "pixai_prompt_tool_history_v1";
  var MAX_HISTORY = 30;

  var state = {}; // categoryId -> { mode: "none"|"random"|"pick", value: string }

  function $(id) { return document.getElementById(id); }

  function escapeHtml(s) {
    return (s || "").replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }

  function loadHistory() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var arr = JSON.parse(raw);
      if (arr && arr.length) return arr;
    } catch (e) {}
    return [];
  }

  function saveHistory(arr) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); } catch (e) {}
  }

  function pushHistory(text) {
    if (!text) return;
    var hist = loadHistory();
    // 先頭重複は消す
    if (hist.length && hist[0] === text) return;
    // 同一要素は後ろから除去
    var i;
    for (i = hist.length - 1; i >= 0; i--) {
      if (hist[i] === text) hist.splice(i, 1);
    }
    hist.unshift(text);
    if (hist.length > MAX_HISTORY) hist.length = MAX_HISTORY;
    saveHistory(hist);
    renderHistory();
  }

  function renderHistory() {
    var hist = loadHistory();
    var el = $("history");
    if (!hist.length) {
      el.innerHTML = '<div class="small">履歴なし</div>';
      return;
    }
    var html = "";
    for (var i = 0; i < hist.length; i++) {
      html += '<div class="historyItem" data-idx="' + i + '">' + escapeHtml(hist[i]) + "</div>";
    }
    el.innerHTML = html;

    // クリックで復帰
    var items = el.getElementsByClassName("historyItem");
    for (i = 0; i < items.length; i++) {
      items[i].onclick = function () {
        var idx = parseInt(this.getAttribute("data-idx"), 10);
        var h = loadHistory();
        $("output").value = h[idx] || "";
      };
    }
  }

  function initState() {
    for (var i = 0; i < PROMPT_CATEGORIES.length; i++) {
      state[PROMPT_CATEGORIES[i].id] = { mode: "none", value: "" };
    }
  }

  function pickRandomItem(cat) {
    var items = cat.items || [];
    if (!items.length) return "";
    var n = Math.floor(Math.random() * items.length);
    return items[n].value || "";
  }

  function buildPrompt() {
    var parts = [];
    if (typeof FIXED_PREFIX === "string" && FIXED_PREFIX.trim()) parts.push(FIXED_PREFIX.trim());

    for (var i = 0; i < PROMPT_CATEGORIES.length; i++) {
      var cat = PROMPT_CATEGORIES[i];
      var s = state[cat.id];
      if (!s) continue;

      if (s.mode === "pick" && s.value) {
        parts.push(s.value);
      } else if (s.mode === "random") {
        var rv = pickRandomItem(cat);
        if (rv) parts.push(rv);
      }
      // none は何もしない
    }

    var extra = $("extra").value || "";
    if (extra.trim()) parts.push(extra.trim());

    if (typeof FIXED_SUFFIX === "string" && FIXED_SUFFIX.trim()) parts.push(FIXED_SUFFIX.trim());

    // カンマ区切りを整える（雑に二重カンマを消す）
    var text = parts.join(", ");
    text = text.replace(/\s+,/g, ",").replace(/,\s+,/g, ", ").replace(/,{2,}/g, ",");
    return text.trim();
  }

  function setCategory(catId, mode, value) {
    state[catId] = { mode: mode, value: value || "" };
    // ラジオUI反映
    var name = "cat_" + catId;
    var radios = document.getElementsByName(name);
    for (var i = 0; i < radios.length; i++) {
      var r = radios[i];
      if (r.value === (mode === "pick" ? value : mode)) {
        r.checked = true;
      }
    }
  }

  function renderCategories() {
    var root = $("categories");
    var html = "";

    for (var i = 0; i < PROMPT_CATEGORIES.length; i++) {
      var cat = PROMPT_CATEGORIES[i];
      html += '<div class="cat">';
      html += '<div class="catTitle"><div><b>' + escapeHtml(cat.name) + '</b></div>';
      html += '<div><button type="button" data-rand="' + escapeHtml(cat.id) + '">このカテゴリをランダム</button></div></div>';

      html += '<div class="choices">';
      // 未選択
      html += choiceRadio(cat.id, "none", "未選択", "none");
      // ランダム
      html += choiceRadio(cat.id, "random", "ランダム", "random");

      var items = cat.items || [];
      for (var j = 0; j < items.length; j++) {
        var it = items[j];
        html += choiceRadio(cat.id, it.value, it.label, "pick");
      }
      html += "</div></div>";
    }

    root.innerHTML = html;

    // ラジオ動作
    for (i = 0; i < PROMPT_CATEGORIES.length; i++) {
      (function (catId) {
        var name = "cat_" + catId;
        var radios = document.getElementsByName(name);
        for (var k = 0; k < radios.length; k++) {
          radios[k].onchange = function () {
            var v = this.value;
            if (v === "none") setCategory(catId, "none", "");
            else if (v === "random") setCategory(catId, "random", "");
            else setCategory(catId, "pick", v);
          };
        }
      })(PROMPT_CATEGORIES[i].id);
    }

    // カテゴリ単体ランダムボタン
    var btns = root.getElementsByTagName("button");
    for (i = 0; i < btns.length; i++) {
      (function (b) {
        var catId = b.getAttribute("data-rand");
        if (!catId) return;
        b.onclick = function () {
          setCategory(catId, "random", "");
        };
      })(btns[i]);
    }
  }

  function choiceRadio(catId, value, label, kind) {
    var name = "cat_" + catId;
    // valueが "none/random" と衝突しないように kind で区別してる
    var v = (kind === "pick") ? value : kind;
    return (
      '<label class="choice">' +
      '<input type="radio" name="' + escapeHtml(name) + '" value="' + escapeHtml(v) + '">' +
      '<span>' + escapeHtml(label) + '</span>' +
      "</label>"
    );
  }

  function copyToClipboard(text) {
    var status = $("copyStatus");
    status.textContent = "";

    // 1) 可能なら Clipboard API（ただし“安全なコンテキスト”条件がある） :contentReference[oaicite:2]{index=2}
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () {
        status.textContent = "コピーしたよ";
      }).catch(function () {
        // 2) フォールバック（execCommand） :contentReference[oaicite:3]{index=3}
        fallbackCopy(text, status);
      });
    }
    // 2) フォールバック
    fallbackCopy(text, status);
    return Promise.resolve();
  }

  function fallbackCopy(text, statusEl) {
    var ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try {
      var ok = document.execCommand("copy");
      statusEl.textContent = ok ? "コピーしたよ" : "コピー失敗（手動で選択してね）";
    } catch (e) {
      statusEl.textContent = "コピー失敗（手動で選択してね）";
    }
    document.body.removeChild(ta);
  }

  function wireUI() {
    $("btnGenerate").onclick = function () {
      var out = buildPrompt();
      $("output").value = out;
      pushHistory(out);
    };

    $("btnCopy").onclick = function () {
      var text = $("output").value || "";
      if (!text.trim()) return;
      copyToClipboard(text);
    };

    $("btnClear").onclick = function () {
      $("output").value = "";
      $("copyStatus").textContent = "";
    };

    $("btnRandomAll").onclick = function () {
      for (var i = 0; i < PROMPT_CATEGORIES.length; i++) {
        setCategory(PROMPT_CATEGORIES[i].id, "random", "");
      }
    };

    $("btnReset").onclick = function () {
      for (var i = 0; i < PROMPT_CATEGORIES.length; i++) {
        setCategory(PROMPT_CATEGORIES[i].id, "none", "");
      }
    };

    $("btnClearHistory").onclick = function () {
      saveHistory([]);
      renderHistory();
    };
  }

  function main() {
    initState();
    renderCategories();
    wireUI();
    renderHistory();

    // 初期は全部未選択にチェック
    for (var i = 0; i < PROMPT_CATEGORIES.length; i++) {
      setCategory(PROMPT_CATEGORIES[i].id, "none", "");
    }
  }

  main();
})();
