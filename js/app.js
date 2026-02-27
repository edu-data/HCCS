/* =========================================================================
   HCCS — 고교학점제 설문 애플리케이션 로직
   ========================================================================= */
(function () {
    'use strict';

    const $ = s => document.querySelector(s);
    const $$ = s => document.querySelectorAll(s);

    // ─── State ───
    const STORAGE_KEY = 'hccs_state';
    const state = {
        currentPart: 'intro', // intro, 1, 2, 3, 4, 5, done
        grade: '',
        schoolType: '',
        region: '',
        hasSelected: '',
        q1: '', q2: '', q3: '', q4: '',
        q5: [],   // checkbox array
        q6: '',   // text
        q7: '', q8: '', q9: '', q10: '', q11: '',
        q12: '',  // text
        q13: '', q14: '',
        q15: [],  // checkbox array
        q16: '', q17: '', q18: '', q19: '', q20: '',
        q21: '', q22: '', q23: '', q24: '', q25: '', q26: '',
        q27: ''   // text
    };

    // ─── Persistence ───
    function saveState() {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) { }
    }
    function loadState() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                Object.assign(state, JSON.parse(saved));
                return true;
            }
        } catch (_) { }
        return false;
    }
    function clearState() {
        try { localStorage.removeItem(STORAGE_KEY); } catch (_) { }
    }

    // ─── Toast ───
    function showToast(msg, isError) {
        const t = $('#toast');
        t.textContent = msg;
        t.classList.toggle('error', !!isError);
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 2500);
    }

    // ─── Navigation ───
    const PARTS = ['intro', '1', '2', '3', '4', '5', 'done'];

    function showPart(partId) {
        $$('.survey-part').forEach(el => el.classList.remove('active'));
        const target = partId === 'intro' ? '#partIntro'
            : partId === 'done' ? '#partDone'
                : `#part${partId}`;
        $(target).classList.add('active');
        state.currentPart = partId;
        saveState();
        updateProgress(partId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function updateProgress(partId) {
        const partNum = partId === 'intro' ? 0
            : partId === 'done' ? 6
                : parseInt(partId);
        $$('.progress-step').forEach(step => {
            const s = parseInt(step.dataset.step);
            step.classList.remove('active', 'completed');
            if (s < partNum) step.classList.add('completed');
            else if (s === partNum) step.classList.add('active');
        });
        for (let i = 1; i <= 4; i++) {
            const line = $(`#line${i}`);
            if (line) line.classList.toggle('completed', i < partNum);
        }
    }

    // ─── Sync UI → State ───
    function syncRadio(name) {
        const el = $(`input[name="${name}"]:checked`);
        state[name] = el ? el.value : '';
    }

    function syncCheckboxes(name) {
        const checked = [];
        $$(`input[name="${name}"]:checked`).forEach(cb => checked.push(cb.value));
        state[name] = checked;
    }

    function syncTextarea(id) {
        const el = $(`#${id}`);
        state[id] = el ? el.value : '';
    }

    // ─── Sync State → UI (restore) ───
    function restoreRadio(name) {
        if (state[name]) {
            const el = $(`input[name="${name}"][value="${state[name]}"]`);
            if (el) el.checked = true;
        }
    }

    function restoreCheckboxes(name) {
        if (Array.isArray(state[name])) {
            state[name].forEach(val => {
                const el = $(`input[name="${name}"][value="${val}"]`);
                if (el) {
                    el.checked = true;
                    const label = el.closest('.checkbox-option');
                    if (label) label.classList.add('checked');
                }
            });
        }
    }

    function restoreTextarea(id) {
        const el = $(`#${id}`);
        if (el && state[id]) el.value = state[id];
    }

    function restoreSelect(id) {
        const el = $(`#${id}`);
        if (el && state[id]) el.value = state[id];
    }

    // ─── Collect All Data ───
    function collectAllData() {
        // Sync everything before collecting
        ['grade', 'schoolType', 'hasSelected',
            'q1', 'q2', 'q3', 'q4', 'q7', 'q8', 'q9', 'q10', 'q11',
            'q13', 'q14', 'q16', 'q17', 'q18', 'q19', 'q20',
            'q21', 'q22', 'q23', 'q24', 'q25', 'q26'].forEach(n => syncRadio(n));
        syncCheckboxes('q5');
        syncCheckboxes('q15');
        syncTextarea('q6');
        syncTextarea('q12');
        syncTextarea('q27');
        state.region = $('#region').value;

        return {
            timestamp: new Date().toISOString(),
            grade: state.grade,
            schoolType: state.schoolType,
            region: state.region,
            hasSelected: state.hasSelected,
            // Part 2
            q1_selectFactor: state.q1,
            q2_courseAvailability: state.q2,
            q3_courseGuidance: state.q3,
            q4_careerLink: state.q4,
            q5_difficulties: (state.q5 || []).join(', '),
            q6_courseImprovement: state.q6,
            // Part 3
            q7_achievementUnderstanding: state.q7,
            q8_achievementFairness: state.q8,
            q9_fiveTierApproval: state.q9,
            q10_incompleteSystem: state.q10,
            q11_assessmentProblem: state.q11,
            q12_assessmentImprovement: state.q12,
            // Part 4 — Iloh
            q13_infoAccess: state.q13,
            q14_infoQuality: state.q14,
            q15_infoSources: (state.q15 || []).join(', '),
            q16_timeAutonomy: state.q16,
            q17_timeMeaning: state.q17,
            q18_opportunityAccess: state.q18,
            q19_opportunityFairness: state.q19,
            q20_biggestBarrier: state.q20,
            // Part 5 — Eudaimonia
            q21_selfGrowth: state.q21,
            q22_selfDetermination: state.q22,
            q23_flowExperience: state.q23,
            q24_belonging: state.q24,
            q25_purposeMeaning: state.q25,
            q26_overallSatisfaction: state.q26,
            q27_freeComment: state.q27
        };
    }

    // ─── Submit ───
    async function submitSurvey() {
        const data = collectAllData();
        const statusEl = $('#submitStatus');

        // If no GAS URL, show local success + download
        if (!CONFIG.GAS_URL) {
            statusEl.className = 'submit-status submit-status--success';
            statusEl.innerHTML = '✅ 응답이 저장되었습니다!<br><small>(GAS 엔드포인트 미설정 — 로컬 저장만 완료)</small>';

            // Auto-download JSON
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `HCCS_response_${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
            clearState();
            return;
        }

        try {
            const res = await fetch(CONFIG.GAS_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (result.status === 'ok') {
                statusEl.className = 'submit-status submit-status--success';
                statusEl.textContent = '✅ 응답이 성공적으로 제출되었습니다!';
                clearState();
            } else {
                throw new Error(result.message || '제출 실패');
            }
        } catch (err) {
            statusEl.className = 'submit-status submit-status--error';
            statusEl.textContent = '❌ 제출 중 오류: ' + err.message;

            // Fallback: download JSON
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `HCCS_response_${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }
    }

    // ─── Auto-save on input change ───
    function setupAutoSave() {
        // Radios
        $$('input[type="radio"]').forEach(el => {
            el.addEventListener('change', () => {
                syncRadio(el.name);
                saveState();
            });
        });

        // Checkboxes
        $$('input[type="checkbox"]').forEach(el => {
            el.addEventListener('change', () => {
                const label = el.closest('.checkbox-option');
                if (label) label.classList.toggle('checked', el.checked);
                syncCheckboxes(el.name);
                saveState();
            });
        });

        // Textareas
        ['q6', 'q12', 'q27'].forEach(id => {
            const el = $(`#${id}`);
            if (el) el.addEventListener('input', () => { state[id] = el.value; saveState(); });
        });

        // Select
        $('#region').addEventListener('change', () => { state.region = $('#region').value; saveState(); });
    }

    // ─── Init ───
    function init() {
        const loaded = loadState();

        // Restore UI from state
        if (loaded) {
            restoreRadio('grade');
            restoreRadio('schoolType');
            restoreSelect('region');
            restoreRadio('hasSelected');

            restoreRadio('q1');
            for (let i = 2; i <= 4; i++) restoreRadio(`q${i}`);
            restoreCheckboxes('q5');
            restoreTextarea('q6');

            for (let i = 7; i <= 11; i++) restoreRadio(`q${i}`);
            restoreTextarea('q12');

            for (let i = 13; i <= 14; i++) restoreRadio(`q${i}`);
            restoreCheckboxes('q15');
            for (let i = 16; i <= 20; i++) restoreRadio(`q${i}`);

            for (let i = 21; i <= 26; i++) restoreRadio(`q${i}`);
            restoreTextarea('q27');
        }

        // Setup auto-save
        setupAutoSave();

        // Navigation buttons
        $('#startSurveyBtn').addEventListener('click', () => showPart('1'));
        $('#backToIntro').addEventListener('click', () => showPart('intro'));
        $('#toPart2Btn').addEventListener('click', () => showPart('2'));
        $('#backToPart1').addEventListener('click', () => showPart('1'));
        $('#toPart3Btn').addEventListener('click', () => showPart('3'));
        $('#backToPart2').addEventListener('click', () => showPart('2'));
        $('#toPart4Btn').addEventListener('click', () => showPart('4'));
        $('#backToPart3').addEventListener('click', () => showPart('3'));
        $('#toPart5Btn').addEventListener('click', () => showPart('5'));
        $('#backToPart4').addEventListener('click', () => showPart('4'));

        // Complete button
        $('#completeBtn').addEventListener('click', () => {
            showPart('done');
            submitSurvey();
        });

        // Progress bar clicks
        $$('.progress-step').forEach(step => {
            step.addEventListener('click', () => {
                const s = step.dataset.step;
                if (s) showPart(s);
            });
        });

        // Restore to saved part
        if (loaded && state.currentPart !== 'intro') {
            showPart(state.currentPart);
        }
    }

    document.addEventListener('DOMContentLoaded', init);
})();
