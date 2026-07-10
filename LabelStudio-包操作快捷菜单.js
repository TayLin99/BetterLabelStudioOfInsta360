// ==UserScript==
// @name         LabelStudio-包操作快捷菜单
// @namespace    https://label.insta360.com/
// @version      1.0.10
// @description  在项目卡片和 data 页工具栏添加标注、审核、验收、管理快捷按钮
// @author       Codex
// @match        https://label.insta360.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const LINK_SELECTOR = '.ls-projects-page__link';
  const INFO_ROW_SELECTOR = '.ls-project-card__info-row';
  const MENU_SELECTOR = '.ls-project-card__menu';
  const TOOLBAR_SELECTOR = '.dm-tab-panel > .dm-space.dm-space_direction_horizontal.dm-space_size_small';
  const BUTTON_GROUP_CLASS = 'tm-insta360-card-actions';
  const TOOLBAR_GROUP_CLASS = 'tm-insta360-toolbar-actions';
  const STYLE_ID = 'tm-insta360-card-actions-style';
  const ACTIVE_PATH_PREFIX = '/workspaces/';
  const DATA_PAGE_PATTERN = /^\/workspaces\/[^/]+\/projects\/[^/]+\/data(?:\/.*)?$/;

  const actions = [
    { text: '标注', suffix: '?labeling=1', background: '#0099FF', color: 'white', shadow: '#006bb3' },
    { text: '审核', suffix: '?reviewing=1', background: '#f6c54a', color: 'white', shadow: '#d28f4a' },
    { text: '验收', suffix: '?accepting=1', background: '#9aca4f', color: 'white', shadow: '#5d8624' },
    { text: '管理', suffix: '/settings', background: '#b9b9b9', color: 'white', shadow: '#777777' },
  ];

  let observer = null;
  let scanTimer = null;
  let scheduled = false;

  function isWorkspacePage() {
    return window.location.hostname === 'label.insta360.com' && window.location.pathname.startsWith(ACTIVE_PATH_PREFIX);
  }

  function isProjectDataPage() {
    return isWorkspacePage() && DATA_PAGE_PATTERN.test(window.location.pathname);
  }

  function addStyle() {
    if (document.getElementById(STYLE_ID)) return;
    if (!document.head) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .ls-project-card__created-date {
        display: none !important;
      }

      ${INFO_ROW_SELECTOR} {
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
      }

      .${BUTTON_GROUP_CLASS} {
        position: relative;
        isolation: isolate;
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: 6px;
        margin-left: auto;
        padding: 5px 6px;
        border-radius: 6px;
        flex: 0 0 auto;
        opacity: 1 !important;
        pointer-events: auto;
      }

      .${BUTTON_GROUP_CLASS}::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: rgba(0, 0, 0, 0.34);
        pointer-events: none;
      }

      .${BUTTON_GROUP_CLASS} button {
        position: relative;
        border: 0;
        border-radius: 4px;
        min-width: 44px;
        height: 26px;
        padding: 0 10px;
        font-size: 14px;
        line-height: 26px;
        font-weight: 500;
        cursor: pointer;
        pointer-events: auto;
        opacity: 1 !important;
        background-clip: padding-box;
        box-shadow: 0 0 0 2px var(--tm-action-border), 0 2px 7px rgba(0, 0, 0, 0.28);
        transition: box-shadow 120ms ease, filter 120ms ease, transform 120ms ease;
        appearance: none;
      }

      .${BUTTON_GROUP_CLASS} button:hover {
        filter: brightness(0.96);
        box-shadow: 0 0 0 2px #ffffff, 0 0 0 5px var(--tm-action-border), 0 4px 10px rgba(0, 0, 0, 0.36);
      }

      .${BUTTON_GROUP_CLASS} button:active {
        transform: translateY(1px);
      }
    `;

    document.head.appendChild(style);
  }

  function buildTargetUrl(rawHref, suffix) {
    const url = new URL(rawHref, window.location.origin);

    if (suffix === '/settings') {
      url.pathname = url.pathname.replace(/\/data\/?$/, '/settings');
      url.search = '';
      return url.toString();
    }

    url.search = suffix;
    return url.toString();
  }

  function createButton(action, rawHref) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = action.text;
    button.style.backgroundColor = action.background;
    button.style.color = action.color;
    button.style.setProperty('--tm-action-border', action.shadow);

    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      window.location.assign(buildTargetUrl(rawHref, action.suffix));
    });

    return button;
  }

  function createButtonGroup(rawHref, extraClassName) {
    const buttonGroup = document.createElement('span');
    buttonGroup.className = extraClassName ? `${BUTTON_GROUP_CLASS} ${extraClassName}` : BUTTON_GROUP_CLASS;

    actions.forEach((action) => {
      buttonGroup.appendChild(createButton(action, rawHref));
    });

    return buttonGroup;
  }

  function decorateProjectCard(link) {
    const infoRow = link.querySelector(INFO_ROW_SELECTOR);
    const menu = link.querySelector(MENU_SELECTOR);
    if (!infoRow || !menu) return;
    if (infoRow.querySelector(`.${BUTTON_GROUP_CLASS}`)) return;

    const rawHref = link.getAttribute('href') || link.querySelector('a[href]')?.getAttribute('href');
    if (!rawHref) return;

    infoRow.insertBefore(createButtonGroup(rawHref), menu);
  }

  function decorateDataToolbar() {
    if (!isProjectDataPage()) return;

    const toolbar = document.querySelector(TOOLBAR_SELECTOR);
    if (!toolbar || toolbar.querySelector(`.${TOOLBAR_GROUP_CLASS}`)) return;

    toolbar.appendChild(createButtonGroup(window.location.href, TOOLBAR_GROUP_CLASS));
  }

  function decorateAll() {
    if (!isWorkspacePage()) return;
    addStyle();
    document.querySelectorAll(LINK_SELECTOR).forEach(decorateProjectCard);
    decorateDataToolbar();
  }

  function scheduleDecorate() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      decorateAll();
    });
  }

  function startObserver() {
    if (observer || !document.documentElement) return;

    observer = new MutationObserver(scheduleDecorate);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  function startPolling() {
    if (scanTimer) return;
    scanTimer = window.setInterval(decorateAll, 1200);
  }

  function patchHistory() {
    ['pushState', 'replaceState'].forEach((methodName) => {
      const original = history[methodName];
      if (original.__tmInsta360Patched) return;

      history[methodName] = function (...args) {
        const result = original.apply(this, args);
        window.dispatchEvent(new Event('tm-insta360-location-change'));
        return result;
      };

      history[methodName].__tmInsta360Patched = true;
    });
  }

  function boot() {
    addStyle();
    startObserver();
    startPolling();
    scheduleDecorate();
  }

  patchHistory();
  window.addEventListener('popstate', scheduleDecorate);
  window.addEventListener('hashchange', scheduleDecorate);
  window.addEventListener('tm-insta360-location-change', scheduleDecorate);
  window.addEventListener('focus', scheduleDecorate);
  document.addEventListener('visibilitychange', scheduleDecorate);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();

