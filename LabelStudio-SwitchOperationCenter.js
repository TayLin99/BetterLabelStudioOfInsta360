// ==UserScript==
// @name         LabelStudio-SwitchOperationCenter
// @namespace    https://label.insta360.com/
// @version      1.6.3
// @description  稳定覆盖顶部操作中心，并提供下拉导航
// @supportURL   https://github.com/TayLin99/BetterLabelStudioOfInsta360
// @match        https://label.insta360.com/*
// @match        http://label.insta360.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const STYLE_ID = 'tm-insta360-operation-center-style';
  const OVERLAY_ID = 'tm-insta360-operation-center-overlay';
  const DROPDOWN_ID = 'tm-insta360-operation-center-dropdown';
  const SYNC_DELAY = 30;

  const ICONS = {
    workspaces: `<svg viewBox="64 64 896 896"><path d="M464 144H160c-8.8 0-16 7.2-16 16v304c0 8.8 7.2 16 16 16h304c8.8 0 16-7.2 16-16V160c0-8.8-7.2-16-16-16zm-52 268H212V212h200v200zm452-268H560c-8.8 0-16 7.2-16 16v304c0 8.8 7.2 16 16 16h304c8.8 0 16-7.2 16-16V160c0-8.8-7.2-16-16-16zm-52 268H612V212h200v200zM464 544H160c-8.8 0-16 7.2-16 16v304c0 8.8 7.2 16 16 16h304c8.8 0 16-7.2 16-16V560c0-8.8-7.2-16-16-16zm-52 268H212V612h200v200zm452-268H560c-8.8 0-16 7.2-16 16v304c0 8.8 7.2 16 16 16h304c8.8 0 16-7.2 16-16V560c0-8.8-7.2-16-16-16zm-52 268H612V612h200v200z"></path></svg>`,
    annotation: `<svg viewBox="64 64 896 896"><path d="M342 88H120c-17.7 0-32 14.3-32 32v224c0 8.8 7.2 16 16 16h48c8.8 0 16-7.2 16-16V168h174c8.8 0 16-7.2 16-16v-48c0-8.8-7.2-16-16-16zm578 576h-48c-8.8 0-16 7.2-16 16v176H682c-8.8 0-16 7.2-16 16v48c0 8.8 7.2 16 16 16h222c17.7 0 32-14.3 32-32V680c0-8.8-7.2-16-16-16zM342 856H168V680c0-8.8-7.2-16-16-16h-48c-8.8 0-16 7.2-16 16v224c0 17.7 14.3 32 32 32h222c8.8 0 16-7.2 16-16v-48c0-8.8-7.2-16-16-16zM904 88H682c-8.8 0-16 7.2-16 16v48c0 8.8 7.2 16 16 16h174v176c0 8.8 7.2 16 16 16h48c8.8 0 16-7.2 16-16V120c0-17.7-14.3-32-32-32z"></path></svg>`,
    review: `<svg viewBox="64 64 896 896"><path d="M866.9 169.9L527.1 54.1C523 52.7 517.5 52 512 52s-11 .7-15.1 2.1L157.1 169.9c-8.3 2.8-15.1 12.4-15.1 21.2v482.4c0 8.8 5.7 20.4 12.6 25.9L499.3 968c3.5 2.7 8 4.1 12.6 4.1s9.2-1.4 12.6-4.1l344.7-268.6c6.9-5.4 12.6-17 12.6-25.9V191.1c.2-8.8-6.6-18.3-14.9-21.2zM810 654.3L512 886.5 214 654.3V226.7l298-101.6 298 101.6v427.6zm-405.8-201c-3-4.1-7.8-6.6-13-6.6H336c-6.5 0-10.3 7.4-6.5 12.7l126.4 174a16.1 16.1 0 0026 0l212.6-292.7c3.8-5.3 0-12.7-6.5-12.7h-55.2c-5.1 0-10 2.5-13 6.6L468.9 542.4l-64.7-89.1z"></path></svg>`,
    acceptance: `<svg viewBox="64 64 896 896"><path d="M699 353h-46.9c-10.2 0-19.9 4.9-25.9 13.3L469 584.3l-71.2-98.8c-6-8.3-15.6-13.3-25.9-13.3H325c-6.5 0-10.3 7.4-6.5 12.7l124.6 172.8a31.8 31.8 0 0051.7 0l210.6-292c3.9-5.3.1-12.7-6.4-12.7z"></path><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path></svg>`,
    team: `<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#000" fill-opacity="0.35"></circle><path fill="#000" d="M3.605 17.411a3 3 0 0 1 1.32-2.198l2.183-1.454c.563-.376.608-1.204.153-1.705-.7-.77-1.515-1.912-1.515-3.054 0-2 .25-6 4.25-6s4.25 4 4.25 6c0 1.142-.815 2.284-1.515 3.054-.455.5-.41 1.33.153 1.705l2.182 1.454a3 3 0 0 1 1.321 2.198l.249 2.49A1 1 0 0 1 15.641 21H4.351a1 1 0 0 1-.995-1.1z"></path></svg>`,
    members: `<svg viewBox="0 0 18 18"><path fill="#000" fill-rule="evenodd" d="M4 0a4 4 0 1 0 0 8h10a4 4 0 0 0 0-8zm0 10a4 4 0 0 0 0 8h10a4 4 0 0 0 0-8zm2 4a2 2 0 1 1-4 0 2 2 0 0 1 4 0m8-8a2 2 0 1 0 0-4 2 2 0 0 0 0 4" clip-rule="evenodd"></path></svg>`,
  };

  const MENU_ITEMS = [
    { label: '项目中心', href: '/workspaces', icon: ICONS.workspaces, segments: ['项目中心'] },
    { label: '标注中心', href: '/annotation', icon: ICONS.annotation, segments: ['标注中心'] },
    { label: '审核中心', href: '/review', icon: ICONS.review, segments: ['审核中心'] },
    { label: '验收中心', href: '/acceptance', icon: ICONS.acceptance, segments: ['验收中心'] },
    { label: '团队管理', href: '/team', icon: ICONS.team, segments: ['团队管理'] },
    {
      label: '管理中心/成员管理',
      href: '/permission-config/members',
      icon: ICONS.members,
      segments: ['管理中心', '成员管理'],
      activePaths: ['/permission-config', '/permission-config/members'],
    },
  ];

  let syncTimer = null;
  let lastOverlayKey = '';

  function normalizePath(value) {
    return new URL(value || '/', location.origin).pathname.replace(/\/+$/, '') || '/';
  }

  function isPathMatch(path, base) {
    const normalizedPath = normalizePath(path);
    const normalizedBase = normalizePath(base);
    return normalizedPath === normalizedBase || normalizedPath.startsWith(`${normalizedBase}/`);
  }

  function getCurrentItem() {
    const currentPath = normalizePath(location.pathname);

    return MENU_ITEMS.find((item) => {
      const paths = item.activePaths || [item.href];
      return paths.some((path) => isPathMatch(currentPath, path));
    }) || MENU_ITEMS[0];
  }

  function addStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${OVERLAY_ID} {
        position: fixed;
        z-index: 999998;
        display: none;
        align-items: center;
        min-height: 24px;
        padding: 3px 8px;
        border-radius: 6px;
        background: #fff;
        color: rgba(0, 0, 0, 0.88);
        box-sizing: border-box;
        cursor: pointer;
        font-family: "Roboto", Arial, sans-serif !important;
        font-size: 14px;
        line-height: 1.15;
        user-select: none;
        white-space: nowrap;
        transition: color .15s ease, background .15s ease, box-shadow .15s ease;
      }

      #${OVERLAY_ID}:hover,
      #${OVERLAY_ID}.is-open {
        color: #1677ff;
        background: #fff;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.14);
      }

      #${OVERLAY_ID} .tm-crumb {
        display: inline-flex;
        align-items: center;
        font-size: 14px;
        line-height: 22px;
      }

      #${OVERLAY_ID} .tm-operation-icon {
        width: 18px;
        height: 18px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 18px;
        margin-right: 8px;
      }

      #${OVERLAY_ID} .tm-operation-icon svg {
        width: 18px !important;
        height: 18px !important;
        display: block !important;
        color: #000 !important;
      }

      #${OVERLAY_ID} .tm-operation-icon svg,
      #${OVERLAY_ID} .tm-operation-icon svg * {
        fill: #000 !important;
        stroke: none !important;
      }

      .tm-project-data-trigger {
        cursor: pointer !important;
        transition: color .15s ease, background .15s ease, box-shadow .15s ease;
      }

      .tm-project-data-trigger:hover {
        color: #1677ff !important;
      }

      #${OVERLAY_ID} .tm-crumb-muted {
        color: rgba(0, 0, 0, 0.45);
      }

      #${OVERLAY_ID}:hover .tm-crumb,
      #${OVERLAY_ID}.is-open .tm-crumb {
        color: #1677ff;
      }

      #${OVERLAY_ID} .tm-separator {
        display: inline-flex;
        align-items: center;
        padding: 0 8px;
        color: rgba(0, 0, 0, 0.35);
        font-size: 14px;
        line-height: 22px;
      }

      #${DROPDOWN_ID} {
        position: fixed;
        z-index: 999999;
        min-width: 210px;
        padding: 6px;
        background: #fff;
        border: 1px solid rgba(0, 0, 0, 0.08);
        border-radius: 6px;
        box-sizing: border-box;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
        display: none;
        font-family: "Roboto", Arial, sans-serif !important;
        font-size: 14px;
      }

      #${DROPDOWN_ID}.is-open {
        display: block;
      }

      #${DROPDOWN_ID} button {
        width: 100%;
        height: 36px;
        display: flex;
        align-items: center;
        gap: 10px;
        border: 0;
        border-radius: 4px;
        background: transparent;
        color: rgba(0, 0, 0, 0.88);
        font-size: 14px;
        text-align: left;
        padding: 0 10px;
        cursor: pointer;
      }

      #${DROPDOWN_ID} button:hover {
        background: rgba(22, 119, 255, 0.08);
        color: #1677ff;
      }

      #${DROPDOWN_ID} button.is-active {
        background: rgba(22, 119, 255, 0.13);
        color: #1677ff;
        font-weight: 600;
      }

      #${DROPDOWN_ID} .tm-menu-icon {
        width: 18px;
        height: 18px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 18px;
      }

      #${DROPDOWN_ID} .tm-menu-icon svg {
        width: 18px !important;
        height: 18px !important;
        display: block !important;
        color: #000 !important;
      }

      #${DROPDOWN_ID} .tm-menu-icon svg,
      #${DROPDOWN_ID} .tm-menu-icon svg * {
        fill: #000 !important;
        stroke: none !important;
      }

      #${DROPDOWN_ID} .tm-menu-label {
        flex: 1;
        min-width: 0;
      }
    `;
    document.head.appendChild(style);
  }

  function getBreadcrumbAnchor() {
    return document.querySelector('.ls-menu-header__context .ls-breadcrumbs');
  }

  function getPositionAnchor() {
    return getBreadcrumbAnchor()
      || document.querySelector('.ls-menu-header__context-item_left')
      || document.querySelector('.ls-menu-header__context');
  }

  function getOrCreateOverlay() {
    let overlay = document.getElementById(OVERLAY_ID);
    if (overlay) return overlay;

    overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.setAttribute('role', 'button');
    overlay.setAttribute('tabindex', '0');
    overlay.setAttribute('aria-haspopup', 'menu');

    overlay.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      const dropdown = document.getElementById(DROPDOWN_ID);
      if (dropdown?.classList.contains('is-open')) {
        closeDropdown();
      } else {
        openDropdown(overlay);
      }
    });

    overlay.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openDropdown(overlay);
      }
    });

    document.body.appendChild(overlay);
    return overlay;
  }

  function getOrCreateDropdown() {
    let dropdown = document.getElementById(DROPDOWN_ID);
    if (dropdown) return dropdown;

    dropdown = document.createElement('div');
    dropdown.id = DROPDOWN_ID;
    document.body.appendChild(dropdown);
    return dropdown;
  }

  function getBreadcrumbItems(anchor) {
    if (!anchor) return [];
    return Array.from(anchor.querySelectorAll('.ls-breadcrumbs__item'));
  }

  function isMembersItem(item) {
    return item.href === '/permission-config/members';
  }

  function getCoveredBreadcrumbItems(anchor, item) {
    const items = getBreadcrumbItems(anchor);
    if (!items.length) return [];

    if (isMembersItem(item)) {
      return items.slice(0, Math.min(2, items.length));
    }

    return [items[0]];
  }

  function buildOverlayHtml(item) {
    const icon = `<span class="tm-operation-icon">${item.icon}</span>`;
    const crumbs = item.segments.map((segment, index) => {
      const mutedClass = index === item.segments.length - 1 ? ' tm-crumb-muted' : '';
      const crumb = `<span class="tm-crumb${mutedClass}">${segment}</span>`;
      if (index === 0) return crumb;
      return `<span class="tm-separator">/</span>${crumb}`;
    }).join('');
    return `${icon}${crumbs}`;
  }

  function syncOverlayContent(overlay, item) {
    const key = `${normalizePath(location.pathname)}::${item.label}`;
    if (lastOverlayKey === key && overlay.childElementCount > 0) return;

    overlay.innerHTML = buildOverlayHtml(item);
    lastOverlayKey = key;
  }

  function clearCoveredBreadcrumbItems() {
    document.querySelectorAll('[data-tm-operation-hidden-content="1"]').forEach((node) => {
      node.style.visibility = '';
      node.style.pointerEvents = '';
      delete node.dataset.tmOperationHiddenContent;
    });

    document.querySelectorAll('[data-tm-operation-covered="1"]').forEach((node) => {
      node.style.visibility = '';
      node.style.pointerEvents = '';
      node.style.width = '';
      node.style.minWidth = '';
      node.style.boxSizing = '';
      delete node.dataset.tmOperationCovered;
    });
  }

  function getCoverRect(anchor, coveredItems) {
    if (coveredItems.length) {
      const firstRect = coveredItems[0].getBoundingClientRect();
      const lastRect = coveredItems[coveredItems.length - 1].getBoundingClientRect();
      return {
        left: firstRect.left,
        top: firstRect.top,
        width: Math.max(0, lastRect.right - firstRect.left),
        height: Math.max(firstRect.height, lastRect.height),
      };
    }

    return anchor.getBoundingClientRect();
  }

  function hideNodeContent(node) {
    node.querySelectorAll('a, .ls-breadcrumbs__label').forEach((child) => {
      child.dataset.tmOperationHiddenContent = '1';
      child.style.visibility = 'hidden';
      child.style.pointerEvents = 'none';
    });
  }

  function reserveCoveredSpace(overlay, coveredItems, item) {
    if (!coveredItems.length) return;

    const width = Math.ceil(overlay.getBoundingClientRect().width);
    const firstItem = coveredItems[0];

    coveredItems.forEach((node, index) => {
      node.dataset.tmOperationCovered = '1';
      node.style.boxSizing = 'border-box';

      if (isMembersItem(item)) {
        node.style.visibility = 'hidden';
        node.style.pointerEvents = 'none';
      } else {
        hideNodeContent(node);
      }

      if (index === 0) {
        node.style.width = `${width}px`;
        node.style.minWidth = `${width}px`;
      } else {
        node.style.width = '0px';
        node.style.minWidth = '0px';
      }
    });

    firstItem.style.width = `${width}px`;
    firstItem.style.minWidth = `${width}px`;
  }

  function positionOverlay(overlay, anchor, item) {
    clearCoveredBreadcrumbItems();

    const coveredItems = getCoveredBreadcrumbItems(getBreadcrumbAnchor(), item);
    const rect = getCoverRect(anchor, coveredItems);
    if (rect.width === 0 && rect.height === 0) {
      const fallback = document.querySelector('.ls-menu-header__context-item_left')
        || document.querySelector('.ls-menu-header__context');
      const fallbackRect = fallback?.getBoundingClientRect();
      if (!fallbackRect || (fallbackRect.width === 0 && fallbackRect.height === 0)) {
        overlay.style.display = 'none';
        closeDropdown();
        return;
      }

      overlay.style.left = `${Math.max(8, fallbackRect.left)}px`;
      overlay.style.top = `${Math.max(8, fallbackRect.top + Math.max(0, (fallbackRect.height - 30) / 2))}px`;
      overlay.style.minWidth = '';
      overlay.style.display = 'inline-flex';
      return;
    }

    overlay.style.left = `${Math.max(8, rect.left - 8)}px`;
    overlay.style.top = `${Math.max(8, rect.top - 3)}px`;
    overlay.style.minWidth = '';
    overlay.style.display = 'inline-flex';

    reserveCoveredSpace(overlay, coveredItems, item);
  }

  function closeDropdown() {
    document.getElementById(DROPDOWN_ID)?.classList.remove('is-open');
    document.getElementById(OVERLAY_ID)?.classList.remove('is-open');
  }

  function isActiveItem(item) {
    return item === getCurrentItem();
  }

  function renderDropdown() {
    const dropdown = getOrCreateDropdown();
    dropdown.innerHTML = '';

    MENU_ITEMS.forEach((item) => {
      const button = document.createElement('button');
      button.type = 'button';

      if (isActiveItem(item)) button.classList.add('is-active');

      const icon = document.createElement('span');
      icon.className = 'tm-menu-icon';
      icon.innerHTML = item.icon;

      const label = document.createElement('span');
      label.className = 'tm-menu-label';
      label.textContent = item.label;

      button.append(icon, label);

      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (isActiveItem(item)) {
          closeDropdown();
          return;
        }

        location.assign(new URL(item.href, location.origin).href);
      });

      dropdown.appendChild(button);
    });

    return dropdown;
  }

  function openDropdown(overlay) {
    const dropdown = renderDropdown();
    const rect = overlay.getBoundingClientRect();

    dropdown.style.left = `${Math.max(8, rect.left)}px`;
    dropdown.style.top = `${rect.bottom + 8}px`;

    overlay.classList.add('is-open');
    dropdown.classList.add('is-open');
  }

  function syncOperationCenter() {
    addStyle();

    const anchor = getPositionAnchor();
    const breadcrumbAnchor = getBreadcrumbAnchor();
    const overlay = getOrCreateOverlay();

    if (!anchor) {
      overlay.style.display = 'none';
      closeDropdown();
      return;
    }

    const item = getCurrentItem();
    syncOverlayContent(overlay, item);
    positionOverlay(overlay, anchor, item);
    bindProjectDataBreadcrumb();
  }

  function getProjectDataUrl() {
    const match = normalizePath(location.pathname).match(/^(.*\/projects\/[^/]+)(?:\/.*)?$/);
    if (!match) return '';

    return new URL(`${match[1]}/data`, location.origin).href;
  }

  function clearProjectDataTrigger() {
    document.querySelectorAll('.tm-project-data-trigger').forEach((node) => {
      node.classList.remove('tm-project-data-trigger');
      delete node.dataset.tmProjectDataTrigger;
    });
  }

  function bindProjectDataBreadcrumb() {
    clearProjectDataTrigger();

    const breadcrumbItems = getBreadcrumbItems(getBreadcrumbAnchor());
    if (breadcrumbItems.length < 3 || !getProjectDataUrl()) return;

    const labels = Array.from(document.querySelectorAll(
      '.ls-menu-header__context .ls-breadcrumbs__item_last .ls-breadcrumbs__label'
    ));
    const label = labels[labels.length - 1];
    if (!label) return;

    label.classList.add('tm-project-data-trigger');
    label.dataset.tmProjectDataTrigger = '1';
    label.setAttribute('role', 'link');
    label.setAttribute('tabindex', '0');
  }

  function goProjectData() {
    const targetUrl = getProjectDataUrl();
    if (!targetUrl) return;

    location.assign(targetUrl);
  }
  function scheduleSync() {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(syncOperationCenter, SYNC_DELAY);
  }

  function refreshAfterRouteChange() {
    closeDropdown();
    scheduleSync();
    setTimeout(syncOperationCenter, 100);
    setTimeout(syncOperationCenter, 300);
    setTimeout(syncOperationCenter, 800);
  }

  const rawPushState = history.pushState;
  const rawReplaceState = history.replaceState;

  history.pushState = function (...args) {
    const result = rawPushState.apply(this, args);
    refreshAfterRouteChange();
    return result;
  };

  history.replaceState = function (...args) {
    const result = rawReplaceState.apply(this, args);
    refreshAfterRouteChange();
    return result;
  };

  window.addEventListener('popstate', refreshAfterRouteChange);
  window.addEventListener('resize', syncOperationCenter);
  window.addEventListener('scroll', syncOperationCenter, true);
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest?.('.tm-project-data-trigger');
    if (trigger) {
      event.preventDefault();
      event.stopPropagation();
      goProjectData();
      return;
    }

    closeDropdown();
  });

  document.addEventListener('keydown', (event) => {
    const trigger = event.target.closest?.('.tm-project-data-trigger');
    if (!trigger || (event.key !== 'Enter' && event.key !== ' ')) return;

    event.preventDefault();
    goProjectData();
  });

  new MutationObserver(scheduleSync).observe(document.body, {
    childList: true,
    subtree: true,
  });

  refreshAfterRouteChange();
})();
