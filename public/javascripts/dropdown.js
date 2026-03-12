document.addEventListener("DOMContentLoaded", () => {
  // Find all triggers that reference a menu or a template
  const triggers = Array.from(
    document.querySelectorAll(
      ".dropdown-trigger[data-menu], .dropdown-trigger[data-template]"
    )
  );

  const popperMap = new Map(); // trigger -> popper instance
  const menuMap = new Map(); // trigger -> menu element
  const sharedTemplates = new Map(); // templateId -> shared cloned menu (if reuse requested)

  function findOrCloneMenu(trigger) {
    if (menuMap.has(trigger)) return menuMap.get(trigger);

    const menuRef = trigger.dataset.menu; // can be "#id" or "id" or a template id
    const tmplRef = trigger.dataset.template; // explicit template id
    const reuse = trigger.dataset.reuse === "true"; // optional: share one instance across triggers

    let menuEl = null;

    // 1) if data-menu refers to an existing element id, use it
    if (menuRef) {
      const id = menuRef.replace(/^#/, "");
      const existing = document.getElementById(id);
      if (existing && !existing.tagName.toLowerCase().includes("template")) {
        menuEl = existing;
        if (menuEl.parentElement !== document.body)
          document.body.appendChild(menuEl);
      } else {
        // maybe it's a template id - we'll treat below
      }
    }

    // 2) template path: use data-template first, else try menuRef as template id
    const templateId =
      tmplRef || (menuRef && !menuEl ? menuRef.replace(/^#/, "") : null);
    if (!menuEl && templateId) {
      // If reuse requested and sharedTemplates already has one -> use it
      if (reuse && sharedTemplates.has(templateId)) {
        menuEl = sharedTemplates.get(templateId);
      } else {
        const tpl = document.getElementById(templateId);
        if (tpl && tpl.tagName.toLowerCase() === "template" && tpl.content) {
          const frag = tpl.content.cloneNode(true);
          const candidate = frag.querySelector(".dropdown-menu");
          if (candidate) {
            // give unique id (unless reuse wants shared id)
            if (!candidate.id)
              candidate.id = "dd-" + Math.random().toString(36).slice(2);
            document.body.appendChild(candidate);
            menuEl = candidate;
            if (reuse) sharedTemplates.set(templateId, menuEl);
          }
        }
      }
    }

    // nothing found
    if (!menuEl) return null;

    // initial attributes/states
    menuEl.classList.remove("open");
    menuEl.setAttribute("role", menuEl.getAttribute("role") || "menu");
    menuEl.setAttribute("aria-hidden", "true");

    // store mapping
    menuMap.set(trigger, menuEl);
    return menuEl;
  }

  function createPopper(trigger, menuEl) {
    if (popperMap.has(trigger)) return popperMap.get(trigger);
    if (typeof Popper === "undefined" || !Popper.createPopper) return null;
    const instance = Popper.createPopper(trigger, menuEl, {
      placement: trigger.dataset.placement || "bottom-start",
      modifiers: [
        { name: "offset", options: { offset: [0, 5] } },
        {
          name: "flip",
          options: { fallbackPlacements: ["top", "right", "left"] },
        },
        { name: "preventOverflow", options: { boundary: "viewport" } },
      ],
    });
    popperMap.set(trigger, instance);
    return instance;
  }

  function closeAll(except = null) {
    document.querySelectorAll(".dropdown-menu.open").forEach((m) => {
      if (m !== except) {
        m.classList.remove("open");
        m.setAttribute("aria-hidden", "true");
      }
    });
    // unset expanded on any triggers not associated with except
    triggers.forEach((t) => {
      const menu = menuMap.get(t);
      if (menu && menu !== except) t.setAttribute("aria-expanded", "false");
    });
  }

  // global click delegation
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest(".dropdown-trigger");
    if (!trigger) {
      // if click not on a trigger and not inside an open menu -> close all
      if (!e.target.closest(".dropdown-menu")) closeAll();
      return;
    }

    // prevent form submits / anchors default
    if (
      trigger.tagName.toLowerCase() === "button" ||
      trigger.tagName.toLowerCase() === "a"
    ) {
      e.preventDefault();
    }
    e.stopPropagation();

    const menu = findOrCloneMenu(trigger);
    if (!menu) return;

    const opening = !menu.classList.contains("open");
    // close others
    closeAll(opening ? menu : null);

    if (opening) {
      menu.classList.add("open");
      menu.setAttribute("aria-hidden", "false");
      trigger.setAttribute("aria-expanded", "true");
      // optional contextual data: if trigger has data-context-json -> populate menu (user can implement)
      const context = trigger.dataset.contextJson;
      if (context) {
        try {
          menu.dispatchEvent(
            new CustomEvent("dropdown:context", { detail: JSON.parse(context) })
          );
        } catch {}
      }
      const inst = createPopper(trigger, menu);
      if (inst && typeof inst.update === "function") inst.update();
    } else {
      menu.classList.remove("open");
      menu.setAttribute("aria-hidden", "true");
      trigger.setAttribute("aria-expanded", "false");
      const inst = popperMap.get(trigger);
      if (inst && typeof inst.destroy === "function") {
        inst.destroy();
        popperMap.delete(trigger);
      }
    }
  });

  // close menus when clicking a menu item marked with data-close-on-click (or default .dropdown-item)
  document.addEventListener("click", (e) => {
    const item = e.target.closest(
      "[data-close-on-click], .dropdown-menu .dropdown-item"
    );
    if (!item) return;
    const menu = item.closest(".dropdown-menu");
    if (menu) {
      menu.classList.remove("open");
      menu.setAttribute("aria-hidden", "true");
    }
  });

  // close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll();
  });

  // keyboard activation for focused triggers
  document.addEventListener("keydown", (e) => {
    const focused = document.activeElement;
    if (!focused || !focused.classList.contains("dropdown-trigger")) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      focused.click();
    }
  });
});
