import { getCollection, type CollectionEntry } from 'astro:content'

export type Project = CollectionEntry<'projects'>
type Site = CollectionEntry<'site'>['data']
type Group = Project['data']['group']

export interface NumberedProject {
	entry: Project
	/** Position in the full work list, zero-padded: "01", "02", … */
	n: string
	href: string
}

export interface Chip {
	title: string
	href?: string
}

export interface Person {
	name: string
	href?: string
	chips: Chip[]
}

/** site.yaml, home.yaml and people.yaml are single-file collections. */
async function single<C extends 'site' | 'home' | 'people'>(name: C) {
	const [entry] = await getCollection(name)
	if (!entry) throw new Error(`src/content/${name}.yaml is missing`)
	return entry.data as CollectionEntry<C>['data']
}

export const getSite = () => single('site')
export const getHome = () => single('home')

export const projectHref = (id: string) => `/work/${id}/`

/**
 * The work list order: groups in the order site.yaml declares them, then the
 * most recently finished first (ongoing ahead of finished in the same year),
 * then the most recently started, then `priority`.
 */
export async function getProjects(site: Site): Promise<NumberedProject[]> {
	const groupOrder = Object.keys(site.groups) as Group[]
	const end = (p: Project) => p.data.ended + (p.data.ongoing ? 0.5 : 0)
	const entries = await getCollection('projects')

	return entries
		.sort(
			(a, b) =>
				groupOrder.indexOf(a.data.group) - groupOrder.indexOf(b.data.group) ||
				end(b) - end(a) ||
				b.data.started - a.data.started ||
				b.data.priority - a.data.priority ||
				a.id.localeCompare(b.id)
		)
		.map((entry, i) => ({
			entry,
			n: String(i + 1).padStart(2, '0'),
			href: projectHref(entry.id)
		}))
}

/** Names from people.yaml that have their own site. Used to link credits. */
export async function getPersonLinks(): Promise<Map<string, string>> {
	const { people } = await single('people')
	return new Map(people.flatMap((p) => (p.href ? [[p.name, p.href] as const] : [])))
}

/**
 * The People grid. Everyone credited under `people:` on a project gets a card
 * with a chip per project; people.yaml adds extra chips, links, and opt-outs.
 * Cards with the most chips come first.
 */
export async function getPeople(site: Site, projects: NumberedProject[]): Promise<Person[]> {
	const { people: extras } = await single('people')
	const byId = new Map(projects.map((p) => [p.entry.id, p]))
	const credited = new Map<string, string[]>()

	for (const { entry } of projects) {
		for (const credit of entry.data.credits) {
			for (const name of credit.people ?? []) {
				if (name === site.name) continue
				const ids = credited.get(name) ?? []
				if (!ids.includes(entry.id)) ids.push(entry.id)
				credited.set(name, ids)
			}
		}
	}

	const extraByName = new Map(extras.map((p) => [p.name, p]))
	const names = new Set([...credited.keys(), ...extras.filter((p) => p.also.length).map((p) => p.name)])
	const projectChip = (id: string): Chip => {
		const p = byId.get(id)!
		return { title: p.entry.data.title, href: p.href }
	}

	return [...names]
		.filter((name) => !extraByName.get(name)?.hidden)
		.map((name) => {
			const extra = extraByName.get(name)
			const also = extra?.also ?? []
			const chips = [
				...also.map((tag) => (byId.has(tag) ? projectChip(tag) : { title: tag })),
				...(credited.get(name) ?? []).filter((id) => !also.includes(id)).map(projectChip)
			]
			return { name, href: extra?.href, chips }
		})
		.sort((a, b) => b.chips.length - a.chips.length || a.name.localeCompare(b.name))
}

/** Splits a trailing full stop off a headline so it can be drawn in the accent colour. */
export function splitAccentDot(text: string): { text: string; dot: boolean } {
	return text.endsWith('.') ? { text: text.slice(0, -1), dot: true } : { text, dot: false }
}
