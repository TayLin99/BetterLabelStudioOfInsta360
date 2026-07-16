// ==UserScript==
// @name         LabelStudio-视频切帧快捷键
// @namespace    http://tampermonkey.net/
// @version      0.6
// @description  通过自定义快捷键触发按钮点击、阻断网页原有快捷键响应，并在顶栏显示快捷键提示
// @author       Codex
// @match        https://label.insta360.com/*
// @supportURL   https://github.com/TayLin99/BetterLabelStudioOfInsta360
// @grant        none
// @run-at       document-start
// @inject-into  page
// @all-frames   true
// ==/UserScript==

(function() {
    'use strict';

    // 会阻断这些按键原有的可能响应的功能，避免一次性触发了多个东西。
    // 因此，最好脚本不用的时候就关掉，避免自己的其他任务无法正常使用快捷键。
    // 如果按键不顺手，可以修改每项开头的字母；顶栏提示会自动跟着变化。（如果是字母，要用小写字母）
    const keyMap = {
        q: {
            label: '打帧',
            xpath: '//*[(@id="label-studio-dm" or @id="review-studio-dm")]/div/div[2]/div/div[1]/div/div/div[1]/div[1]/div[1]/div/div[2]/div[1]/div[1]/div[2]/div[1]/button[1]'
        },
        w: {
            label: '打线',
            xpath: '//*[(@id="label-studio-dm" or @id="review-studio-dm")]/div/div[2]/div/div[1]/div/div/div[1]/div[1]/div[1]/div/div[2]/div[1]/div[1]/div[2]/div[1]/button[2]'
        },
        a: {
            label: '上一帧',
            xpath: '//*[(@id="label-studio-dm" or @id="review-studio-dm")]/div/div[2]/div/div[1]/div/div/div[1]/div[1]/div[1]/div/div[2]/div[1]/div[1]/div[2]/div[2]/button[2]'
        },
        d: {
            label: '下一帧',
            xpath: '//*[(@id="label-studio-dm" or @id="review-studio-dm")]/div/div[2]/div/div[1]/div/div/div[1]/div[1]/div[1]/div/div[2]/div[1]/div[1]/div[2]/div[2]/button[4]'
        },
        z: {
            label: '上一关键帧',
            xpath: '//*[(@id="label-studio-dm" or @id="review-studio-dm")]/div/div[2]/div/div[1]/div/div/div[1]/div[1]/div[1]/div/div[2]/div[1]/div[1]/div[2]/div[2]/button[1]'
        },
        c: {
            label: '下一关键帧',
            xpath: '//*[(@id="label-studio-dm" or @id="review-studio-dm")]/div/div[2]/div/div[1]/div/div/div[1]/div[1]/div[1]/div/div[2]/div[1]/div[1]/div[2]/div[2]/button[5]'
        }
    };

    // 在这里添加需要显示的自定义文本，每行一条。
    // 删除行首的 // 即可启用示例，也可以继续添加更多内容。
    const customHintTexts = [
         '三击触发自动播放',
         '再次点击则暂停'
    ];

    const HOTKEY_HINT_ID = 'label-studio-hotkey-hint';
    const blockedKeys = new Set(Object.keys(keyMap).map(key => key.toLowerCase()));
    const keyboardEvents = new Set(['keydown', 'keypress', 'keyup']);

    function isEditableTarget(target) {
        if (!target) return false;

        const element = target.closest
            ? target.closest('input, textarea, select, [contenteditable="true"], [contenteditable=""]')
            : null;

        return Boolean(element);
    }

    function isLabelStudioTimelinePage() {
        return Boolean(document.querySelector('.lsf-timeline'));
    }

    function getKey(event) {
        return String(event.key || '').toLowerCase();
    }

    function shouldBlock(event) {
        const key = getKey(event);

        if (!blockedKeys.has(key)) return false;
        if (event.ctrlKey || event.altKey || event.metaKey) return false;
        if (isEditableTarget(event.target)) return false;
        if (!isLabelStudioTimelinePage()) return false;

        return true;
    }

    function blockEvent(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
    }

    function clickByXPath(xpath) {
        try {
            const result = document.evaluate(
                xpath,
                document,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
            );

            const element = result.singleNodeValue;

            if (element) {
                element.click();
                console.log('[LabelStudio Hotkey] clicked:', element);
            }
        } catch (error) {
            console.error('[LabelStudio Hotkey] XPath error:', error);
        }
    }

    function hotkeyHandler(event) {
        if (!shouldBlock(event)) return;

        blockEvent(event);

        if (event.type === 'keydown') {
            clickByXPath(keyMap[getKey(event)].xpath);
        }
    }

    function getHotkeyHintText() {
        const hotkeyTexts = Object.entries(keyMap)
            .map(([key, config]) => `${key.toUpperCase()}${config.label}`)
        return [...hotkeyTexts, ...customHintTexts].join('、');
    }

    function createHotkeyHint() {
        const hint = document.createElement('div');
        hint.id = HOTKEY_HINT_ID;
        hint.textContent = getHotkeyHintText();
        hint.title = '视频标注快捷键';
        hint.style.cssText = [
            'display:inline-flex',
            'align-items:center',
            'flex:0 0 auto',
            'margin-left:8px',
            'padding:5px 10px',
            'border-radius:6px',
            'background:#16a34a',
            'color:#fff',
            'font-size:12px',
            'font-weight:600',
            'line-height:18px',
            'letter-spacing:0',
            'white-space:nowrap',
            'box-sizing:border-box'
        ].join(';');

        return hint;
    }

    function mountHotkeyHint() {
        const target = document.querySelector('.lsf-topbar__group_slot_left');
        if (!target) return;

        let hint = document.getElementById(HOTKEY_HINT_ID);
        if (!hint) {
            hint = createHotkeyHint();
        }

        if (hint.parentElement !== target || hint !== target.lastElementChild) {
            target.appendChild(hint);
        }
    }

    // 先用最高优先级捕获阶段拦截。
    ['keydown', 'keypress', 'keyup'].forEach(type => {
        window.addEventListener(type, hotkeyHandler, true);
        document.addEventListener(type, hotkeyHandler, true);
    });

    // Label Studio 是动态页面，顶栏出现或被重新渲染时重新挂载提示。
    const topbarObserver = new MutationObserver(mountHotkeyHint);

    function startHotkeyHintObserver() {
        mountHotkeyHint();
        topbarObserver.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    if (document.documentElement) {
        startHotkeyHintObserver();
    } else {
        document.addEventListener('readystatechange', () => {
            if (document.documentElement) startHotkeyHintObserver();
        }, { once: true });
    }

    // 再包装页面后续注册的键盘监听，避免页面自己的快捷键逻辑继续收到这些按键。
    const rawAddEventListener = EventTarget.prototype.addEventListener;
    const rawRemoveEventListener = EventTarget.prototype.removeEventListener;
    const listenerMap = new WeakMap();

    EventTarget.prototype.addEventListener = function(type, listener, options) {
        if (!keyboardEvents.has(type) || !listener) {
            return rawAddEventListener.call(this, type, listener, options);
        }

        let wrappedByType = listenerMap.get(listener);

        if (!wrappedByType) {
            wrappedByType = new Map();
            listenerMap.set(listener, wrappedByType);
        }

        if (!wrappedByType.has(type)) {
            const wrapped = function(event) {
                if (shouldBlock(event)) {
                    blockEvent(event);
                    return;
                }

                if (typeof listener === 'function') {
                    return listener.call(this, event);
                }

                if (listener && typeof listener.handleEvent === 'function') {
                    return listener.handleEvent.call(listener, event);
                }
            };

            wrappedByType.set(type, wrapped);
        }

        return rawAddEventListener.call(this, type, wrappedByType.get(type), options);
    };

    EventTarget.prototype.removeEventListener = function(type, listener, options) {
        const wrappedByType = listenerMap.get(listener);
        const wrapped = wrappedByType && wrappedByType.get(type);

        return rawRemoveEventListener.call(this, type, wrapped || listener, options);
    };
})();
