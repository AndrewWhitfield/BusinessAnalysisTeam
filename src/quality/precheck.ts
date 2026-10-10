import { readFile } from 'node:fs/promises';
import { standardsPath, type AnalysisPaths } from '../orchestrator/paths.js';

/**
 * The orchestrator's mechanical pre-check — written by the orchestrator, never by an agent (no
 * self-grading). It catches what a tool can count before QC's judgement is spent: required sections,
 * the source register, citations, requirement tables, traceability coverage, vague terms and
 * placeholders. Every problem is reported as a MAJOR finding with its uplift, in the standard's form.
 */
export interface PrecheckFinding {
  where: string;
  problem: string;
  uplift: string;
}

export interface PrecheckResult {
  pass: boolean;
  findings: PrecheckFinding[];
}

export interface PrecheckOptions {
  repoRoot: string;
  minSources: number;
}

const REQUIREMENT_SECTIONS = ['Business requirements', 'Functional requirements', 'Non-functional requirements'] as const;
const REQUIREMENT_ID = /^(BR|FR|NFR)-\d+$/;
const PRIORITIES = ['must', 'should', 'could', "won't", 'wont'];
const PLACEHOLDERS = /\b(TBD|TBC|TODO|FIXME|XXX)\b|lorem ipsum|\[insert|<analysis title>|\?\?\?/i;
/** ISO/IEC/IEEE 29148 vague terms — flagged in a requirement unless the same cell gives a number. */
export const VAGUE_TERMS = [
  'user-friendly', 'user friendly', 'easy', 'easily', 'intuitive', 'fast', 'quickly', 'efficient', 'flexible', 'robust',
  'seamless', 'seamlessly', 'simple', 'adequate', 'appropriate', 'as needed', 'etc', 'and/or', 'state-of-the-art',
  'best-in-class', 'optimal', 'sufficient', 'if possible', 'where possible', 'minimal', 'as soon as possible',
];

/** Level-2 headings of a markdown document, without numbering ("## 3. Scope" → "scope"). */
export function headings(markdown: string): string[] {
  return [...markdown.matchAll(/^##\s+(.+?)\s*$/gm)].map((m) => normaliseHeading(m[1]!));
}

function normaliseHeading(h: string): string {
  return h.replace(/^[\d.]+\s*/, '').replace(/[*_`]/g, '').trim().toLowerCase();
}

/** The body under a level-2 heading, up to the next level-2 heading ('' when absent). */
export function section(markdown: string, title: string): string {
  const lines = markdown.split('\n');
  const want = title.toLowerCase();
  const start = lines.findIndex((l) => /^##\s/.test(l) && normaliseHeading(l.replace(/^##\s+/, '')) === want);
  if (start < 0) return '';
  const end = lines.findIndex((l, i) => i > start && /^##\s/.test(l));
  return lines.slice(start + 1, end < 0 ? undefined : end).join('\n');
}

function missingSections(doc: string, template: string, file: string): PrecheckFinding[] {
  const have = new Set(headings(doc));
  return headings(template)
    .filter((h) => !have.has(h))
    .map((h) => ({
      where: file,
      problem: `required section "## ${h}" is missing`,
      uplift: `Add the section with the template's heading wording (numbering allowed), filled in — or "Not applicable — <reason>".`,
    }));
}

function emptySections(doc: string, file: string): PrecheckFinding[] {
  return headings(doc)
    .filter((h) => section(doc, h).replace(/^>.*$/gm, '').trim().length < 20)
    .map((h) => ({ where: `${file} § ${h}`, problem: 'section is empty or a stub', uplift: 'Write the section in full, or state "Not applicable — <reason>".' }));
}

function placeholderFindings(doc: string, file: string): PrecheckFinding[] {
  return doc
    .split('\n')
    .map((line, i) => ({ line, n: i + 1 }))
    .filter(({ line }) => PLACEHOLDERS.test(line))
    .map(({ line, n }) => ({
      where: `${file}:${n}`,
      problem: `placeholder left in: "${line.trim().slice(0, 100)}"`,
      uplift: 'Replace it with the content, or move the unknown to Open questions (who answers, what it blocks) or Assumptions (to be validated, by whom).',
    }));
}

export interface SourceEntry {
  id: number;
  line: string;
}

export function sourceRegister(report: string): SourceEntry[] {
  return [...section(report, 'Sources').matchAll(/^\s*[-*]?\s*\[S(\d+)\](.*)$/gm)].map((m) => ({ id: Number(m[1]), line: m[0].trim() }));
}

/** Every `[S#]` cited outside the register (also inside `[S1, S3]` / `[S1][S3]`). */
export function citedSources(text: string): Set<number> {
  const ids = new Set<number>();
  for (const group of text.matchAll(/\[(S\d+(?:\s*[,;]\s*S\d+)*)\]/g)) {
    for (const id of group[1]!.matchAll(/S(\d+)/g)) ids.add(Number(id[1]));
  }
  return ids;
}

function withoutSources(report: string): string {
  const body = section(report, 'Sources');
  return body ? report.replace(body, '') : report;
}

function domainOf(line: string): string | undefined {
  const url = /https?:\/\/([^/\s)>\]]+)/i.exec(line)?.[1];
  return url?.replace(/^www\./, '').toLowerCase();
}

function registerFindings(register: SourceEntry[], minSources: number): PrecheckFinding[] {
  const where = 'research-report.md § Sources';
  const findings: PrecheckFinding[] = [];
  if (register.length < minSources) {
    findings.push({ where, problem: `${register.length} source(s) in the register; at least ${minSources} required`, uplift: `Research further and register at least ${minSources} credible, verified sources.` });
  }
  const seen = new Set<number>();
  for (const s of register) {
    if (seen.has(s.id)) findings.push({ where, problem: `S${s.id} is registered twice`, uplift: 'Give every source one unique number.' });
    seen.add(s.id);
    if (!domainOf(s.line) && !/owner/i.test(s.line)) {
      findings.push({ where, problem: `S${s.id} has no URL and isn't marked as owner-provided`, uplift: 'Add the URL (and access date), or mark it "provided by the owner (<file>)".' });
    }
  }
  const domains = new Set(register.map((s) => domainOf(s.line)).filter(Boolean));
  const needDomains = Math.min(3, minSources);
  if (register.length >= minSources && domains.size < needDomains) {
    findings.push({ where, problem: `sources come from only ${domains.size} distinct website(s)`, uplift: `Draw on at least ${needDomains} independent publishers.` });
  }
  return findings;
}

function citationFindings(register: SourceEntry[], report: string, spec: string): PrecheckFinding[] {
  const registered = new Set(register.map((s) => s.id));
  const cited = new Set([...citedSources(withoutSources(report)), ...citedSources(spec)]);
  const findings: PrecheckFinding[] = [];
  for (const id of cited) {
    if (!registered.has(id)) findings.push({ where: 'citations', problem: `[S${id}] is cited but not in the source register`, uplift: `Register S${id} in research-report.md § Sources, or correct the citation.` });
  }
  for (const id of registered) {
    if (!cited.has(id)) findings.push({ where: 'research-report.md § Sources', problem: `S${id} is registered but never cited`, uplift: `Cite S${id} where it supports a claim, or remove it from the register.` });
  }
  return findings;
}

export interface RequirementRow {
  id: string;
  section: string;
  cells: string[];
}

/** Rows of the markdown tables in the three requirement sections whose first cell is a BR/FR/NFR ID. */
export function requirementRows(spec: string): RequirementRow[] {
  const rows: RequirementRow[] = [];
  for (const title of REQUIREMENT_SECTIONS) {
    for (const line of section(spec, title).split('\n')) {
      if (!line.trim().startsWith('|')) continue;
      const cells = line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
      const id = cells[0]?.replace(/[*`]/g, '') ?? '';
      if (REQUIREMENT_ID.test(id)) rows.push({ id, section: title, cells });
    }
  }
  return rows;
}

function vagueTermIn(text: string): string | undefined {
  if (/\d/.test(text)) return undefined;
  return VAGUE_TERMS.find((t) => new RegExp(`(^|[^a-z-])${t.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}($|[^a-z-])`, 'i').test(text));
}

function rowFindings(row: RequirementRow): PrecheckFinding[] {
  const where = `requirements-specification.md § ${row.section} ${row.id}`;
  const [, requirement = '', rationale = '', source = '', priority = '', acceptance = ''] = row.cells;
  const findings: PrecheckFinding[] = [];
  if (row.cells.length < 6) findings.push({ where, problem: `row has ${row.cells.length} columns; the table needs ID, Requirement, Rationale, Source, Priority, Acceptance criteria`, uplift: 'Use the template\'s six-column table.' });
  const blank = ([['Requirement', requirement], ['Rationale', rationale], ['Source', source], ['Acceptance criteria', acceptance]] as const).filter(([, v]) => !v.replace(/[-–—]/g, '').trim());
  blank.forEach(([name]) => findings.push({ where, problem: `${name} is empty`, uplift: `Fill in ${name} (see the template's column rules).` }));
  if (source && !/\[(Brief|A:Q-\d+|S\d+)/i.test(source)) findings.push({ where, problem: `Source "${source}" doesn't cite [Brief], [A:Q-n] or [S#]`, uplift: 'Cite where the requirement comes from in the template\'s form.' });
  if (!PRIORITIES.includes(priority.replace(/[*`]/g, '').trim().toLowerCase())) findings.push({ where, problem: `Priority "${priority}" isn't Must, Should, Could or Won't`, uplift: 'Use a MoSCoW priority.' });
  const vague = vagueTermIn(requirement);
  if (vague) findings.push({ where, problem: `vague term "${vague}" with no measurable definition`, uplift: 'Replace it with a measurable statement (metric, target, measurement method), per ISO/IEC/IEEE 29148.' });
  return findings;
}

function requirementFindings(spec: string): PrecheckFinding[] {
  const rows = requirementRows(spec);
  const findings: PrecheckFinding[] = [];
  if (rows.length === 0) {
    return [{ where: 'requirements-specification.md', problem: 'no requirement rows (BR-/FR-/NFR- IDs in the requirement tables) found', uplift: 'Write the requirements as rows of the template\'s six-column tables.' }];
  }
  const counts = new Map<string, number>();
  rows.forEach((r) => counts.set(r.id, (counts.get(r.id) ?? 0) + 1));
  for (const [id, n] of counts) if (n > 1) findings.push({ where: 'requirements-specification.md', problem: `${id} is defined ${n} times`, uplift: 'Give every requirement a unique ID.' });
  rows.forEach((r) => findings.push(...rowFindings(r)));
  const matrix = section(spec, 'Traceability matrix');
  for (const id of counts.keys()) {
    if (!new RegExp(`\\b${id}\\b`).test(matrix)) findings.push({ where: 'requirements-specification.md § Traceability matrix', problem: `${id} has no row in the traceability matrix`, uplift: `Add ${id} with what it traces from, its acceptance criteria and how it's verified.` });
  }
  const defined = new Set(counts.keys());
  const referenced = new Set([...spec.matchAll(/\b((?:BR|FR|NFR)-\d+)\b/g)].map((m) => m[1]!));
  for (const id of referenced) if (!defined.has(id)) findings.push({ where: 'requirements-specification.md', problem: `${id} is referenced but never defined`, uplift: `Define ${id} in its requirement table, or correct the reference.` });
  return findings;
}

async function readOrEmpty(file: string): Promise<string | undefined> {
  return readFile(file, 'utf8').catch(() => undefined);
}

function missingFile(name: string): PrecheckFinding {
  return { where: name, problem: 'the deliverable does not exist', uplift: `Write deliverables/${name} from its template.` };
}

export async function runPrecheck(paths: AnalysisPaths, opts: PrecheckOptions): Promise<PrecheckResult> {
  const report = await readOrEmpty(paths.researchReport);
  const spec = await readOrEmpty(paths.specification);
  const findings: PrecheckFinding[] = [];
  if (report === undefined) findings.push(missingFile('research-report.md'));
  if (spec === undefined) findings.push(missingFile('requirements-specification.md'));
  if (report !== undefined) {
    const template = await readFile(standardsPath(opts.repoRoot, 'research-report-template.md'), 'utf8');
    findings.push(...missingSections(report, template, 'research-report.md'), ...emptySections(report, 'research-report.md'), ...placeholderFindings(report, 'research-report.md'));
    const register = sourceRegister(report);
    findings.push(...registerFindings(register, opts.minSources), ...citationFindings(register, report, spec ?? ''));
  }
  if (spec !== undefined) {
    const template = await readFile(standardsPath(opts.repoRoot, 'requirements-specification-template.md'), 'utf8');
    findings.push(...missingSections(spec, template, 'requirements-specification.md'), ...emptySections(spec, 'requirements-specification.md'), ...placeholderFindings(spec, 'requirements-specification.md'), ...requirementFindings(spec));
  }
  return { pass: findings.length === 0, findings };
}

export function formatPrecheck(result: PrecheckResult): string {
  if (result.pass) return 'Mechanical pre-check: PASS — every required section, source, citation, requirement row and traceability entry checked.';
  const lines = result.findings.map((f, i) => `${i + 1}. [MAJOR] ${f.where} — ${f.problem}\n   Uplift to A: ${f.uplift}`);
  return `Mechanical pre-check: FAIL — ${result.findings.length} finding(s). QC does not grade until these are fixed.\n\n${lines.join('\n')}`;
}
