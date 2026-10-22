'use client';
import UiIcon from '../ui-icon';
import type { Language } from '../../translations/language';
import { niagaraTranslations } from '../../translations/niagara-translations';
import styles from './niagara.module.css';
export default function PlaceFilter({
  name,
  label,
  options,
  selected,
  language,
  optionLabel,
  onChange,
}: {
  name: string;
  label: string;
  options: string[];
  selected: string[];
  language: Language;
  optionLabel(value: string): string;
  onChange(values: string[]): void;
}) {
  const translations = niagaraTranslations[language];
  const all = selected.length === options.length;
  return (
    <details
      className={styles.filterGroup}
      data-filter={name}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.currentTarget.open = false;
          e.currentTarget.querySelector('summary')?.focus();
          e.stopPropagation();
        }
      }}
    >
      <summary>
        <span>{label}</span>
        <strong>
          {all
            ? translations.all
            : selected.length === 1
              ? optionLabel(selected[0])
              : `${selected.length} ${translations.chosen}`}
          <span aria-hidden="true">
            <UiIcon name="chevron" />
          </span>
        </strong>
      </summary>
      <fieldset className={styles.filterOptions}>
        <legend className={styles.srOnly}>{label}</legend>
        <label>
          <input
            type="checkbox"
            value="all"
            checked={all}
            ref={(node) => {
              if (node) node.indeterminate = selected.length > 0 && !all;
            }}
            onChange={() => onChange(all ? [] : [...options])}
          />
          <span>{translations.all}</span>
        </label>
        {options.map((value) => (
          <label key={value}>
            <input
              type="checkbox"
              value={value}
              checked={selected.includes(value)}
              onChange={() =>
                onChange(
                  options.filter((v) =>
                    v === value ? !selected.includes(v) : selected.includes(v),
                  ),
                )
              }
            />
            <span>{optionLabel(value)}</span>
          </label>
        ))}
      </fieldset>
    </details>
  );
}
