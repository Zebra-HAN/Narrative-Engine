/* Pure grammar and save compatibility helpers; no existing app data is touched. */
(() => {
  'use strict';

  function withParticle(value, role) {
    const text = String(value ?? '');
    if (!text) return '';
    const last = text.trimEnd().charCodeAt(text.trimEnd().length - 1);
    const hangul = last >= 0xAC00 && last <= 0xD7A3;
    if (!hangul) return text + (role === 'subject' ? '이(가)' : '을(를)');
    const final = (last - 0xAC00) % 28 !== 0;
    return text + (role === 'subject' ? (final ? '이' : '가') : (final ? '을' : '를'));
  }

  function restore(entry, catalog) {
    const mode = Number(entry.mode);
    const values = {...entry.values};
    // A v1 custom object may be a phrase with its own particle or no particle.
    // Preserve it verbatim rather than guessing and damaging words such as 노을.
    let legacyObject = entry.version === 2 && typeof entry.legacyObject === 'string'
      ? entry.legacyObject : null;
    if (entry.version !== 2 && mode === 0) {
      const noun = catalog.materials.find(material =>
        material.kind === '명사' && material.legacyNames?.includes(values.object));
      if (noun) values.object = noun.name;
      else legacyObject = values.object;
    }
    return {mode, values, legacyObject};
  }

  window.IdeaMineCore = {withParticle, restore};
})();
