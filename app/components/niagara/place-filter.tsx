'use client';
import type { Language } from '../home-copy';
import { niagaraCopy } from './niagara-copy';
import s from './niagara.module.css';
export default function PlaceFilter({ name, label, options, selected, language, optionLabel, onChange }: { name: string; label: string; options: string[]; selected: string[]; language: Language; optionLabel(value: string): string; onChange(values: string[]): void }) {
  const t = niagaraCopy[language], all = selected.length === options.length;
  return <details className={s.filterGroup} data-filter={name} onKeyDown={e => { if (e.key === 'Escape') { e.currentTarget.open = false; e.currentTarget.querySelector('summary')?.focus(); e.stopPropagation(); } }}>
    <summary><span>{label}</span><strong>{all ? t.all : selected.length === 1 ? optionLabel(selected[0]) : `${selected.length} ${t.chosen}`}<span aria-hidden="true">⌄</span></strong></summary>
    <fieldset className={s.filterOptions}>
      <legend className={s.srOnly}>{label}</legend>
      <label><input type="checkbox" value="all" checked={all} ref={node => { if (node) node.indeterminate = selected.length > 0 && !all; }} onChange={() => onChange(all ? [] : [...options])} /><span>{t.all}</span></label>
      {options.map(value => <label key={value}><input type="checkbox" value={value} checked={selected.includes(value)} onChange={() => onChange(options.filter(v => v === value ? !selected.includes(v) : selected.includes(v)))} /><span>{optionLabel(value)}</span></label>)}
    </fieldset>
  </details>;
}
