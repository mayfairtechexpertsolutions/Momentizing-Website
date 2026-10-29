"use client";

import { useEffect, useSyncExternalStore } from "react";
import { getLocale } from "@/i18n";
import { getFieldErrorSnapshot, normalizeFieldKey, subscribeFieldErrors } from "@/lib/field-errors";

/**
 * Marks every form control that the last failed save was about: red outline, `aria-invalid`, and the server's reason
 * under it. Works on any <input>, <select> or <textarea> (checkboxes included), whatever component renders it, by
 * matching the request field to the control's `name`, `id`, `aria-label` or visible label. A control whose component was given an explicit
 * `error` prop (`data-field-managed`) is skipped. A `<fieldset>` whose <legend> names the field (e.g. working hours) is
 * outlined as a whole. The mark disappears when the user
 * edits the control or the next save starts. Mount once in the root layout.
 */
const CONTROLS = "input, select, textarea";
const SERVER_SNAPSHOT = { version: 0, errors: {} as Record<string, string> };
const SYNONYMS: Record<string, string[]> = {
  phonenumber: ["phone", "whatsappnumber", "whatsapp", "mobile"],
  name: ["fullname", "displayname"],
  dateofbirth: ["dob", "birthdate"],
  workinghours: ["hours"],
};

function labelTexts(el: Element): string[] {
  const out: string[] = [];
  const add = (s: string | null | undefined) => {
    const k = s ? normalizeFieldKey(s) : "";
    if (k) out.push(k);
  };
  add(el.getAttribute("name"));
  add(el.getAttribute("id"));
  add(el.getAttribute("aria-label"));
  const id = el.getAttribute("id");
  if (id) document.querySelectorAll(`label[for="${CSS.escape(id)}"]`).forEach((l) => add(l.textContent));
  const wrap = el.closest("label");
  if (wrap) {
    // The label's own text, without the control's own value/option text.
    const clone = wrap.cloneNode(true) as HTMLElement;
    clone.querySelectorAll("input, select, textarea, button, [role=alert]").forEach((n) => n.remove());
    add(clone.textContent);
  }
  const labelledBy = el.getAttribute("aria-labelledby");
  if (labelledBy) labelledBy.split(" ").forEach((i) => add(document.getElementById(i)?.textContent));
  // Bare label sitting just before the control (<span>Label</span><input/>), common in the older pages.
  const prev = el.previousElementSibling ?? el.parentElement?.previousElementSibling;
  if (prev && !prev.matches(CONTROLS) && (prev.textContent ?? "").length < 60) add(prev.textContent);
  return out;
}

/** "priceCents" -> "price", "optionsJson" -> "options": the unit/format suffixes the form's label never mentions. */
const stripSuffix = (k: string) => k.replace(/(cents|json|ids?)$/, "");

function matches(key: string, names: string[]): "exact" | "loose" | null {
  const targets = [key, stripSuffix(key), ...(SYNONYMS[key] ?? [])].filter((t) => t.length > 0);
  if (names.some((n) => targets.includes(n) || targets.includes(stripSuffix(n)))) return "exact";
  const k = stripSuffix(key);
  if (k.length >= 5 && names.some((n) => n.length >= 5 && (n.includes(k) || k.includes(n)))) return "loose";
  return null;
}

/** The control the user last pressed/typed in: the save they just attempted starts from here. */
let lastTrigger: Element | null = null;
if (typeof document !== "undefined") {
  for (const ev of ["pointerdown", "keydown", "submit"]) {
    document.addEventListener(ev, (e) => (lastTrigger = e.target instanceof Element ? e.target : lastTrigger), true);
  }
}

export function FieldErrorOverlay() {
  const snap = useSyncExternalStore(subscribeFieldErrors, getFieldErrorSnapshot, () => SERVER_SNAPSHOT);

  // The page language follows the chosen/detected locale (read by screen readers and the browser translator).
  useEffect(() => {
    document.documentElement.lang = getLocale();
  }, []);

  useEffect(() => {
    const cleanups: (() => void)[] = [];
    const entries = Object.entries(snap.errors);
    if (!entries.length) return;
    const controls = Array.from(document.querySelectorAll<HTMLElement>(CONTROLS)).filter(
      (c) =>
        !c.hasAttribute("data-field-managed") &&
        !c.closest("[hidden], [aria-hidden=true]") &&
        (c as HTMLInputElement).type !== "hidden" &&
        c.tabIndex !== -1 // honeypots are tabindex -1 and must never be flagged to a person
    );
    const fieldsets = Array.from(document.querySelectorAll<HTMLElement>("fieldset")).filter((f) => !f.hasAttribute("data-field-managed"));
    const allNamed = controls.map((c) => ({ c, names: labelTexts(c) }));
    // Several forms can share a page (create + edit, each with a "Title"): only mark the one the user just submitted,
    // i.e. the nearest container of the pressed button that holds a control for one of the failing fields.
    let scope: Element | null = lastTrigger;
    while (scope && scope !== document.body) {
      const here = scope;
      if (allNamed.some((n) => here.contains(n.c) && entries.some(([key]) => matches(key, n.names) === "exact"))) break;
      scope = scope.parentElement;
    }
    const inScope = scope && scope !== document.body ? scope : null;
    const named = inScope ? allNamed.filter((n) => inScope.contains(n.c)) : allNamed;

    for (const [key, reason] of entries) {
      let hit = named.filter((n) => matches(key, n.names) === "exact").map((n) => n.c);
      if (!hit.length) {
        const loose = named.filter((n) => matches(key, n.names) === "loose").map((n) => n.c);
        if (loose.length === 1) hit = loose;
      }
      if (!hit.length) {
        hit = fieldsets.filter((f) => matches(key, [normalizeFieldKey(f.querySelector("legend")?.textContent ?? "")]) === "exact");
      }
      for (const el of hit) {
        const prevInvalid = el.getAttribute("aria-invalid");
        el.setAttribute("aria-invalid", "true");
        el.classList.add("field-error-outline");
        const msg = document.createElement("p");
        msg.setAttribute("role", "alert");
        msg.className = "field-error-message";
        msg.textContent = reason;
        const anchor = el.closest("label") ?? el;
        anchor.insertAdjacentElement("afterend", msg);
        const clear = () => {
          el.classList.remove("field-error-outline");
          if (prevInvalid === null) el.removeAttribute("aria-invalid");
          else el.setAttribute("aria-invalid", prevInvalid);
          msg.remove();
          el.removeEventListener("input", clear);
          el.removeEventListener("change", clear);
        };
        el.addEventListener("input", clear);
        el.addEventListener("change", clear);
        cleanups.push(clear);
      }
    }
    return () => cleanups.forEach((f) => f());
  }, [snap]);

  return null;
}
