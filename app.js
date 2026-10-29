'use strict';

// This file powers a conceptual demo only. No API, database, messaging,
// payment, identity lookup, or AI service is called.

(function () {
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[data-tab]'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-panel]'));

  function activateTab(name, shouldFocus) {
    var selected = tabs.find(function (tab) { return tab.getAttribute('data-tab') === name; });
    if (!selected) return;
    tabs.forEach(function (tab) {
      var active = tab === selected;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
      tab.tabIndex = active ? 0 : -1;
    });
    panels.forEach(function (panel) {
      panel.hidden = panel.getAttribute('data-panel') !== name;
    });
    if (shouldFocus) selected.focus();
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () { activateTab(tab.getAttribute('data-tab'), false); });
    tab.addEventListener('keydown', function (event) {
      var move = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
      if (!move && event.key !== 'Home' && event.key !== 'End') return;
      event.preventDefault();
      var next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + move + tabs.length) % tabs.length;
      activateTab(tabs[next].getAttribute('data-tab'), true);
    });
  });

  Array.prototype.forEach.call(document.querySelectorAll('[data-goto]'), function (card) {
    card.addEventListener('click', function () {
      activateTab(card.getAttribute('data-goto'), false);
    });
  });

  function textById(id, value) {
    var element = document.getElementById(id);
    if (element) element.textContent = value;
  }
  function doneButton(button, text) {
    button.disabled = true;
    button.classList.add('is-done');
    button.textContent = text;
  }
  function won(n) {
    return n.toLocaleString('ko-KR') + '원';
  }

  // 01 — attendance mockup
  var checkedIn = {};
  Array.prototype.forEach.call(document.querySelectorAll('[data-attend]'), function (button) {
    button.addEventListener('click', function () {
      var id = button.getAttribute('data-attend');
      if (checkedIn[id]) return;
      checkedIn[id] = true;
      doneButton(button, '✓ 출석 완료');
      var count = Object.keys(checkedIn).length;
      textById('attendance-present', (18 + count) + '명');
      textById('attendance-waiting', (6 - count) + '명');
      textById('attendance-result', '출석 ' + count + '건을 가상으로 처리했습니다. 실제 보호자 알림은 발송되지 않습니다.');
    });
  });

  // 02 — route and boarding mockup
  var boarded = {};
  var routeSelect = document.getElementById('route-select');
  var routeStats = {
    a: { base: 3, total: 6 },
    b: { base: 2, total: 4 }
  };
  function updateRoute() {
    var key = routeSelect.value;
    var rows = Array.prototype.slice.call(document.querySelectorAll('.vehicle-person'));
    var added = 0;
    rows.forEach(function (row) {
      var inRoute = row.getAttribute('data-route') === key;
      row.hidden = !inRoute;
      var button = row.querySelector('[data-board]');
      if (inRoute && button && boarded[button.getAttribute('data-board')]) added++;
    });
    textById('vehicle-boarded', (routeStats[key].base + added) + '명');
    textById('vehicle-total', routeStats[key].total + '명');
    textById('vehicle-waiting', (routeStats[key].total - routeStats[key].base - added) + '명');
  }
  if (routeSelect) {
    routeSelect.addEventListener('change', function () {
      updateRoute();
      textById('vehicle-result', '선택한 노선의 탑승 명단을 표시합니다. 실제 운행 기록은 저장되지 않습니다.');
    });
    updateRoute();
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-board]'), function (button) {
    button.addEventListener('click', function () {
      var id = button.getAttribute('data-board');
      if (boarded[id]) return;
      boarded[id] = true;
      doneButton(button, '✓ 탑승 완료');
      updateRoute();
      textById('vehicle-result', '가상 탑승 확인 처리. 학부모에게 실제 알림은 발송하지 않았습니다.');
    });
  });

  // 03 — promotion test mockup
  var promoted = {};
  Array.prototype.forEach.call(document.querySelectorAll('[data-promote]'), function (button) {
    button.addEventListener('click', function () {
      var id = button.getAttribute('data-promote');
      if (promoted[id]) return;
      promoted[id] = true;
      doneButton(button, '✓ 기록 완료');
      var n = Object.keys(promoted).length;
      textById('promotion-completed', (8 + n) + '명');
      textById('promotion-pending', (4 - n) + '명');
      textById('promotion-result', '심사 결과 ' + n + '건을 가상으로 기록했습니다. 실제 급수·띠 이력은 변경되지 않습니다.');
    });
  });

  // 04 — simple cashbook mockup; sample values only
  var addExpense = document.getElementById('add-expense');
  if (addExpense) addExpense.addEventListener('click', function () {
    var income = 7860000;
    var expense = 4320000 + 80000;
    textById('finance-expense', won(expense));
    textById('finance-diff', '+' + won(income - expense));
    var list = document.getElementById('finance-list');
    if (list) {
      var row = document.createElement('div');
      row.className = 'person-row';
      var info = document.createElement('div');
      info.className = 'finance-item';
      var name = document.createElement('strong');
      name.textContent = '도장 소모품 구입';
      var type = document.createElement('small');
      type.textContent = '지출 · 운영비 · 가상 입력';
      info.appendChild(name);
      info.appendChild(type);
      var amount = document.createElement('b');
      amount.className = 'amount-minus';
      amount.textContent = '−80,000원';
      row.appendChild(info);
      row.appendChild(amount);
      list.appendChild(row);
    }
    doneButton(addExpense, '✓ 예시 지출 기록 완료');
    textById('finance-result', '운영 차액이 80,000원 감소했습니다. 실제 DB나 장부에는 저장되지 않습니다.');
  });

  // 05 — predetermined counseling flow, NOT live AI
  var scripted = {
    schedule: {
      q: '이번 토요일 수업 있나요?',
      answer: '토요일 수업은 도장에 등록된 일정에 따라 달라집니다. 현재 목업에는 실제 시간표가 없어 확정 안내가 어렵습니다. 최신 공지를 확인하거나 도장에 문의하도록 안내하겠습니다.',
      status: '일반 문의 예시: 도장 일정·공지 데이터에 근거해 답변하고, 정보가 없으면 추측하지 않습니다.'
    },
    private: {
      q: '우리 아이 출석 확인해 주세요',
      answer: '출결 내역은 개인정보이므로 먼저 보호자 본인 확인이 필요합니다. 인증 후 연결된 자녀의 정보만 조회하는 방식으로 설계합니다.',
      status: '개인정보 문의 예시: 보호자 인증 전에는 아이의 출결 기록을 공개하지 않습니다.'
    },
    sensitive: {
      q: '아이가 친구와 다퉜어요',
      answer: '불편하셨을 것 같습니다. 이 내용은 사실 확인과 세심한 소통이 필요하므로 담당 지도자에게 상담을 요청하도록 안내하겠습니다. 상담 가능한 시간도 남길 수 있게 설계합니다.',
      status: '담당자 이관 예시가 표시되었습니다. 실제 상담 티켓은 생성되거나 전송되지 않습니다.'
    }
  };
  var chat = document.getElementById('chat-box');
  function appendChat(text, isBot) {
    if (!chat) return;
    var el = document.createElement('div');
    el.className = 'chat-bubble' + (isBot ? ' bot' : '');
    if (isBot) {
      var title = document.createElement('strong');
      title.textContent = 'TK 안내 도우미 · 예시 답변';
      var p = document.createElement('p');
      p.textContent = text;
      el.appendChild(title);
      el.appendChild(p);
    } else {
      el.textContent = text;
    }
    chat.appendChild(el);
    chat.scrollTop = chat.scrollHeight;
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-question]'), function (button) {
    button.addEventListener('click', function () {
      var choice = scripted[button.getAttribute('data-question')];
      if (!choice) return;
      appendChat(choice.q, false);
      appendChat(choice.answer, true);
      textById('handoff-status', choice.status);
    });
  });

  // 06 — search over the sample FAQ entries
  var faqSearch = document.getElementById('faq-search');
  if (faqSearch) faqSearch.addEventListener('input', function () {
    var q = faqSearch.value.trim().toLocaleLowerCase('ko-KR');
    var count = 0;
    Array.prototype.forEach.call(document.querySelectorAll('#faq-list details'), function (detail) {
      var haystack = ((detail.getAttribute('data-faq') || '') + ' ' + detail.textContent).toLocaleLowerCase('ko-KR');
      detail.hidden = q !== '' && !haystack.includes(q);
      if (!detail.hidden) count++;
    });
    document.getElementById('faq-empty').hidden = count !== 0;
  });

  // Plain-text feedback is copied locally. No collection, storage or network request.
  var form = document.getElementById('feedback-form');
  if (form) form.addEventListener('submit', async function (event) {
    event.preventDefault();
    var selected = Array.prototype.map.call(form.querySelectorAll('input[name="feature"]:checked'), function (el) {
      return el.value;
    });
    var existing = document.getElementById('existing-tools').value;
    var comment = document.getElementById('free-comment').value.trim();
    var message = [
      '[TK 도장 운영 MVP 의견]',
      '관심 기능: ' + (selected.length ? selected.join(', ') : '미선택'),
      '현재 관리 방식: ' + (existing || '미응답'),
      '원하는 점 / 불편한 점: ' + (comment || '미응답'),
      '',
      '(이 페이지는 실제 관원·학부모 데이터를 받지 않습니다.)'
    ].join('\n');
    var status = document.getElementById('copy-result');
    status.classList.remove('error');
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('clipboard unavailable');
      await navigator.clipboard.writeText(message);
      status.textContent = '✓ 의견이 복사됐어요. 카카오톡 대화에 붙여넣어 보내주세요.';
    } catch (err) {
      var helper = document.createElement('textarea');
      helper.value = message;
      helper.setAttribute('readonly', 'readonly');
      helper.style.position = 'fixed';
      helper.style.top = '10px';
      helper.style.left = '10px';
      helper.style.width = '90%';
      helper.style.zIndex = '9999';
      helper.style.opacity = '1';
      document.body.appendChild(helper);
      helper.focus();
      helper.select();
      var copied = false;
      try { copied = document.execCommand('copy'); } catch (_) {}
      if (copied) {
        document.body.removeChild(helper);
        status.textContent = '✓ 의견이 복사됐어요. 카카오톡 대화에 붙여넣어 보내주세요.';
      } else {
        status.classList.add('error');
        status.textContent = '자동 복사를 지원하지 않는 환경입니다. 표시된 내용을 길게 눌러 복사해 주세요.';
        helper.style.position = 'static';
        helper.style.display = 'block';
        helper.style.width = '100%';
        helper.style.opacity = '1';
        helper.style.marginTop = '8px';
        helper.style.height = '130px';
        form.appendChild(helper);
      }
    }
  });
})();
