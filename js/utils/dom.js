/**
 * DOM Helper Functions
 * Utility functions for common DOM operations.
 */

/**
 * Create a button element with standard properties
 *
 * @param {string} className - CSS classes
 * @param {string} textContent - Button text
 * @param {Object} dataset - Data attributes
 * @param {Function} onClick - Click handler
 * @returns {HTMLButtonElement}
 */
export function createButton(className, textContent, dataset = {}, onClick = null) {
  const btn = document.createElement('button');
  btn.className = className;
  btn.textContent = textContent;

  Object.entries(dataset).forEach(([key, value]) => {
    btn.dataset[key] = value;
  });

  if (onClick) {
    btn.addEventListener('click', onClick);
  }

  return btn;
}

/**
 * Clear all child nodes from a container
 *
 * @param {string|HTMLElement} container - Container selector or element
 */
export function clearContainer(container) {
  const el = typeof container === 'string' ? document.getElementById(container) : container;
  if (el) {
    el.innerHTML = '';
  }
}

/**
 * Set active/inactive state on buttons matching a selector
 *
 * @param {string} selector - CSS selector for buttons
 * @param {string} activeClass - Class to add for active state
 * @param {string} inactiveClass - Class to add for inactive state
 * @param {string} activeValue - data attribute value of active button
 * @param {string} dataAttr - Data attribute to match (default: 'sid' for station, 'r' for region)
 */
export function setActiveButton(selector, activeClass, inactiveClass, activeValue, dataAttr = 'sid') {
  document.querySelectorAll(selector).forEach(btn => {
    const isActive = btn.dataset[dataAttr] === activeValue;
    // Split class strings by spaces since they may contain multiple classes
    const activeClasses = activeClass.split(' ').filter(Boolean);
    const inactiveClasses = inactiveClass.split(' ').filter(Boolean);
    btn.classList.remove(...activeClasses, ...inactiveClasses);
    btn.classList.add(...(isActive ? activeClasses : inactiveClasses));
  });
}

/**
 * Show a placeholder message in a container
 *
 * @param {string} containerId - Container element ID
 * @param {string} message - Message to display
 * @param {string} className - Optional CSS class (default: placeholder message class)
 */
export function showPlaceholder(containerId, message, className = 'flex items-center justify-center h-[200px] text-sm text-gray-400') {
  const el = document.getElementById(containerId);
  if (el) {
    el.innerHTML = `<div class="${className}">${message}</div>`;
  }
}

/**
 * Show an error message in a container
 *
 * @param {string} containerId - Container element ID
 * @param {string} message - Error message
 */
export function showError(containerId, message) {
  const el = document.getElementById(containerId);
  if (el) {
    el.innerHTML = `<div class="px-2 py-2 rounded-lg text-[#3b6d11] text-[15px] font-medium">Error: ${message}</div>`;
  }
}

/**
 * Create a chart container div
 *
 * @param {string} id - Element ID
 * @param {number} height - Height in pixels
 * @returns {HTMLDivElement}
 */
export function createChartContainer(id, height) {
  const div = document.createElement('div');
  div.id = id;
  div.style.width = '100%';
  div.style.height = `${height}px`;
  return div;
}

/**
 * Toggle visibility of tab content
 *
 * @param {string} tabName - Name of tab to show
 * @param {string} tabContentPrefix - Prefix for tab content IDs (default: 'tab-')
 * @param {string} tabBtnSelector - Selector for tab buttons (default: '.tab-btn')
 */
export function switchTabContent(tabName, tabContentPrefix = 'tab-') {
  document.querySelectorAll(`.${tabContentPrefix}content, [id^="${tabContentPrefix}"]`).forEach(el => {
    // Handle both class-based and id-based tab content
  });

  // Hide all
  document.querySelectorAll(`[id^="${tabContentPrefix}"]`).forEach(el => {
    if (el.id.startsWith(tabContentPrefix)) {
      el.classList.add('hidden');
      el.classList.remove('block');
    }
  });

  // Show active
  const activeTab = document.getElementById(`${tabContentPrefix}${tabName}`);
  if (activeTab) {
    activeTab.classList.remove('hidden');
    activeTab.classList.add('block');
  }
}

/**
 * Update tab button active states
 *
 * @param {string} activeTabName - Name of active tab
 * @param {string} tabBtnSelector - Selector for tab buttons
 * @param {string} activeClass - Active button class
 * @param {string} inactiveClass - Inactive button class
 */
export function updateTabButtons(activeTabName, tabBtnSelector = '.tab-btn', activeClass = 'bg-[#2c2c2a] text-white', inactiveClass = 'bg-[#d1cfc6] text-[#5f5e5a] hover:bg-[#b4b2a9]') {
  document.querySelectorAll(tabBtnSelector).forEach(btn => {
    const isActive = btn.dataset.tab === activeTabName;
    // Remove both classes first
    btn.className = btn.className
      .replace(/bg-\[#2c2c2a\]|text-white|bg-\[#d1cfc6\]|text-\[#5f5e5a\]|hover:bg-\[#b4b2a9\]/g, '')
      .trim();
    btn.classList.add(...(isActive ? activeClass.split(' ') : inactiveClass.split(' ')));
  });
}