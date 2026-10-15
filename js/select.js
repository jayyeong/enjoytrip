// Keep native selects as the source of truth for forms and async option updates.
export function enhanceSelects(selects) {
  const closeAll = () => document.querySelectorAll('.select-trigger[aria-expanded="true"]').forEach(b => {
    b.setAttribute('aria-expanded', 'false'); b.nextElementSibling.hidden = true;
  });
  document.addEventListener('click', e => { if (!e.target.closest('.quiet-select')) closeAll(); });
  for (const select of selects) {
    const labelElement = select.parentElement;
    const field = document.createElement('div'); field.className = 'filter-field';
    field.append(...labelElement.childNodes); labelElement.replaceWith(field);
    const wrap = document.createElement('span'); wrap.className = 'quiet-select';
    select.before(wrap); wrap.append(select); select.hidden = true;
    const trigger = document.createElement('button'); trigger.type = 'button'; trigger.className = 'select-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox'); trigger.setAttribute('aria-expanded', 'false');
    const list = document.createElement('span'); list.className = 'select-options'; list.id = select.id + '-options';
    list.setAttribute('role', 'listbox'); list.hidden = true; trigger.setAttribute('aria-controls', list.id);
    const label = select.parentElement.parentElement.firstChild.textContent.trim();
    list.setAttribute('aria-label', label); wrap.append(trigger, list);
    const sync = () => {
      const text = select.selectedOptions[0]?.textContent || '전체';
      trigger.disabled = select.disabled; trigger.textContent = text; trigger.setAttribute('aria-label', label + ': ' + text);
      list.replaceChildren(...Array.from(select.options, (option, index) => {
        const item = document.createElement('button'); item.type = 'button'; item.className = 'select-option';
        item.textContent = option.textContent; item.setAttribute('role', 'option');
        item.setAttribute('aria-selected', String(option.selected)); item.disabled = option.disabled;
        item.onclick = () => { select.selectedIndex = index; select.dispatchEvent(new Event('change', { bubbles: true })); sync(); closeAll(); trigger.focus(); };
        return item;
      }));
    };
    trigger.onclick = () => {
      const open = trigger.getAttribute('aria-expanded') !== 'true'; closeAll();
      trigger.setAttribute('aria-expanded', String(open)); list.hidden = !open;
      if (open) list.querySelector('[aria-selected="true"]')?.focus();
    };
    wrap.onkeydown = e => {
      if (e.key === 'Escape') { closeAll(); trigger.focus(); }
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
        e.preventDefault(); trigger.setAttribute('aria-expanded', 'true'); list.hidden = false;
        const items = Array.from(list.querySelectorAll('button:not(:disabled)'));
        let index = items.indexOf(document.activeElement);
        index = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : Math.max(0, Math.min(items.length - 1, index + (e.key === 'ArrowDown' ? 1 : -1)));
        items[index]?.focus();
      }
    };
    wrap.addEventListener('focusout', e => { if (e.relatedTarget && !wrap.contains(e.relatedTarget)) { trigger.setAttribute('aria-expanded', 'false'); list.hidden = true; } });
    select.addEventListener('change', sync); new MutationObserver(sync).observe(select, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled'] }); sync();
  }
}
