// =====================================================================
// SHARED RENDER LOGIC — used by mathematics.html, reasoning.html,
// general-science.html, general-awareness.html, test-practice.html
// =====================================================================

function renderQA(data, containerId, tagClass, tagLabel) {
    const container = document.getElementById(containerId);
    if (!container || container.children.length > 0) return;
    const row = document.createElement('div');
    row.className = 'row';
    data.forEach((item, i) => {
        const col = document.createElement('div');
        col.className = 'col-lg-6 ani';
        col.style.animationDelay = (i * 0.03) + 's';
        col.innerHTML = `
        <div class="q-card">
        <div class="q-card-hdr">
            <span class="q-num">Q${i + 1}</span>
            <div><span class="stag ${tagClass}">${tagLabel}</span>
            <div class="q-text mt-1">${item.q}</div>
            </div>
        </div>
        <div class="q-body">
            <div class="ans-label"><i class="fas fa-check-circle"></i> Answer</div>
            <div class="ans-text">${item.a}</div>
            <button class="sol-toggle" onclick="toggleSol(this)"><i class="fas fa-eye me-1"></i>View Explanation</button>
            <div class="sol-box d-none">${item.s}</div>
        </div>
        </div>`;
        row.appendChild(col);
    });
    container.appendChild(row);
}

function toggleSol(btn) {
    const box = btn.nextElementSibling;
    if (box.classList.contains('d-none')) {
        box.classList.remove('d-none');
        btn.innerHTML = '<i class="fas fa-eye-slash me-1"></i>Hide Explanation';
    } else {
        box.classList.add('d-none');
        btn.innerHTML = '<i class="fas fa-eye me-1"></i>View Explanation';
    }
}

// =====================================================================
// TEST PRACTICE (100 Questions: 30 Math + 25 Reasoning + 25 Science + 20 Awareness)
// Requires mathQ, reasonQ, sciQ, awareQ to already be loaded on the page.
// =====================================================================
const testAnswers = {};
let testData = [];
let testSubmitted = false;

function sample(arr, n) { return [...arr].sort(() => Math.random() - .5).slice(0, n); }

function buildTest() {
    const mq = sample(mathQ, 30).map(q => ({ ...q, tag: 'math', tl: 'Mathematics', tc: 't-math' }));
    const rq = sample(reasonQ, 25).map(q => ({ ...q, tag: 'reason', tl: 'Reasoning', tc: 't-reason' }));
    const sq = sample(sciQ, 25).map(q => ({ ...q, tag: 'sci', tl: 'Science', tc: 't-sci' }));
    const aq = sample(awareQ, 20).map(q => ({ ...q, tag: 'aware', tl: 'Awareness', tc: 't-aware' }));
    testData = [...mq, ...rq, ...sq, ...aq].sort(() => Math.random() - .5);
}

function getAllAnswers() { return [...mathQ, ...reasonQ, ...sciQ, ...awareQ]; }

function makeOptions(correct) {
    const pool = getAllAnswers().map(q => q.a).filter(a => a !== correct);
    const others = [...new Set(pool)].sort(() => Math.random() - .5).slice(0, 3);
    return [correct, ...others].sort(() => Math.random() - .5);
}

function renderTest() {
    Object.keys(testAnswers).forEach(k => delete testAnswers[k]);
    testData = []; testSubmitted = false;
    buildTest();
    const container = document.getElementById('test-content');
    const letters = ['A', 'B', 'C', 'D'];
    let html = `
    <div class="test-hdr">
    <div style="font-size:2.8rem;opacity:.9"><i class="fas fa-file-alt"></i></div>
    <div>
        <h2 style="font-family:'Rajdhani',sans-serif;font-size:1.65rem;font-weight:700;margin-bottom:5px">RRB CBT 2 Mock Test</h2>
        <p style="opacity:.78;font-size:.88rem;margin:0">Attempt all 100 questions. Each correct answer carries 1 mark. Negative marking: 1/3 per wrong answer.</p>
        <div class="test-meta">
        <span class="t-meta-item"><i class="fas fa-question-circle"></i> 100 Questions</span>
        <span class="t-meta-item"><i class="fas fa-clock"></i> 90 Minutes</span>
        <span class="t-meta-item"><i class="fas fa-star"></i> 100 Marks</span>
        <span class="t-meta-item"><i class="fas fa-minus-circle"></i> 1/3 Negative</span>
        </div>
    </div>
    </div>
    <div class="test-prog" id="tProg">
    <div class="d-flex justify-content-between align-items-center">
        <span style="font-family:'Rajdhani',sans-serif;font-weight:600;font-size:.9rem">Progress: <span id="pCount">0</span>/100 answered</span>
        <span style="font-size:.8rem;color:var(--muted)"><span id="pPct">0</span>%</span>
    </div>
    <div class="prog-rail"><div class="prog-fill" id="pFill" style="width:0%"></div></div>
    </div>`;

    testData.forEach((item, i) => {
        const opts = makeOptions(item.a);
        window['_opts_' + i] = opts;
        let optsHtml = opts.map((opt, oi) => `
          <label class="t-opt" id="topt-${i}-${oi}" onclick="pickOpt(${i},${oi})">
            <input type="radio" name="tq${i}" id="tradio-${i}-${oi}">
            <strong style="color:var(--blue)">${letters[oi]})</strong> ${opt}
          </label>`).join('');
                    html += `
        <div class="tq-card" id="tqc-${i}">
          <div class="tq-num">Q${i + 1} <span class="stag ${item.tc}">${item.tl}</span></div>
          <div class="tq-text">${item.q}</div>
          <div>${optsHtml}</div>
        </div>`;
    });

    html += `<div class="text-center py-4"><button class="sub-btn" onclick="submitTest()"><i class="fas fa-paper-plane me-2"></i>Submit Test</button></div>`;
    container.innerHTML = html;
}

function pickOpt(qi, oi) {
    testAnswers[qi] = { oi, val: window['_opts_' + qi][oi] };
    document.getElementById('tqc-' + qi).classList.add('answered');
    const answered = Object.keys(testAnswers).length;
    const pct = Math.round((answered / 100) * 100);
    document.getElementById('pCount').textContent = answered;
    document.getElementById('pPct').textContent = pct;
    document.getElementById('pFill').style.width = pct + '%';
}

function submitTest() {
    if (testSubmitted) return;
    const attempted = Object.keys(testAnswers).length;
    if (attempted < 10 && !confirm(`You've only answered ${attempted}/100 questions. Submit anyway?`)) return;
    testSubmitted = true;
    let correct = 0, wrong = 0;
    testData.forEach((item, i) => {
        const opts = window['_opts_' + i];
        const correctIdx = opts.indexOf(item.a);
        for (let oi = 0; oi < 4; oi++) {
            const el = document.getElementById('topt-' + i + '-' + oi);
            if (!el) continue;
            if (oi === correctIdx) el.classList.add('correct-ans');
            if (testAnswers[i] !== undefined && testAnswers[i].oi === oi && oi !== correctIdx) el.classList.add('wrong-ans');
            const r = document.getElementById('tradio-' + i + '-' + oi);
            if (r) r.disabled = true;
        }
        if (testAnswers[i] !== undefined) {
            if (testAnswers[i].oi === correctIdx) correct++;
            else wrong++;
        }
    });
    const score = (correct - (wrong / 3)).toFixed(2);
    const pct = ((score / 100) * 100).toFixed(1);
    const grade = pct >= 70 ? '🏆 Excellent' : pct >= 50 ? '✅ Good' : pct >= 35 ? '⚠️ Average' : '❌ Needs More Practice';
    const unattempted = 100 - attempted;
    const resultHtml = `
<div class="result-card" id="resultBox">
<div style="font-family:'Rajdhani',sans-serif;font-size:1.9rem;font-weight:700;margin-bottom:6px">Test Completed! ${grade}</div>
<div class="res-score">${score}</div>
<p style="opacity:.78;font-size:.93rem;margin:0 0 6px">out of 100 marks (with 1/3 negative marking)</p>
<div style="font-size:1.2rem;font-family:'Rajdhani',sans-serif;font-weight:700;opacity:.88">${pct}%</div>
<div class="res-grid">
  <div class="res-stat"><div class="res-val">100</div><div class="res-lbl">Total Questions</div></div>
  <div class="res-stat"><div class="res-val">${attempted}</div><div class="res-lbl">Attempted</div></div>
  <div class="res-stat"><div class="res-val" style="color:#6ee7b7">${correct}</div><div class="res-lbl">Correct</div></div>
  <div class="res-stat"><div class="res-val" style="color:#fca5a5">${wrong}</div><div class="res-lbl">Wrong</div></div>
  <div class="res-stat"><div class="res-val">${unattempted}</div><div class="res-lbl">Unattempted</div></div>
  <div class="res-stat"><div class="res-val" style="color:var(--accent)">${pct}%</div><div class="res-lbl">Percentage</div></div>
</div>
<button class="sub-btn mt-4" onclick="renderTest()"><i class="fas fa-redo me-2"></i>Retry Test</button>
</div>`;
    const container = document.getElementById('test-content');
    container.insertAdjacentHTML('afterbegin', resultHtml);
    document.getElementById('resultBox').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// =====================================================================
// NAVBAR: collapse the mobile menu after a link is tapped
// =====================================================================
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('#navMain .nav-btn').forEach(link => {
        link.addEventListener('click', () => {
            const nb = document.getElementById('navMain');
            if (nb && nb.classList.contains('show')) {
                bootstrap.Collapse.getInstance(nb)?.hide();
            }
        });
    });
});
