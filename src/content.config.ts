import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

/**
 * Everything a non-developer might want to change lives in `src/content/`.
 * These schemas are the contract: a typo or a missing field fails the build
 * with a message naming the file, instead of shipping a broken page.
 */

const link = z.object({ label: z.string(), href: z.string() })

/** Work groups and tag kinds are referenced by key; their labels live in site.yaml. */
const GROUPS = ['recent', 'other', 'bivee'] as const
const KINDS = ['live', 'private', 'client', 'advisor', 'company', 'nonprofit'] as const

const projects = defineCollection({
	loader: glob({ pattern: '*.md', base: './src/content/projects' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			/** Small line beside the tag on the case study, e.g. "Bivee · 2017–2020". */
			kicker: z.string(),
			/** Large intro sentence on the case study. */
			tagline: z.string(),
			/** Short description in the home page work list. */
			blurb: z.string(),
			/** Line under the title in the work list. */
			org: z.string(),
			/** Shown at the right of the work list row. May be empty. */
			years: z.string().default(''),
			group: z.enum(GROUPS),
			kind: z.enum(KINDS),
			/** Sort keys within a group: latest `ended` first, then latest `started`. */
			started: z.number(),
			ended: z.number(),
			/** Ongoing work sorts above anything that ended the same year. */
			ongoing: z.boolean().default(false),
			/** Tie-breaker when the dates match. Higher comes first. */
			priority: z.number().default(0),
			/** The project's live site, if it has one. */
			url: z.url().optional(),
			/** Thumbnail and case study lead image. For a live site, use a screenshot. */
			hero: image().optional(),
			heroCaption: z.string().default(''),
			/** Built-in interactive mock to show instead of an image. */
			mock: z.enum(['pelicash']).optional(),
			meta: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
			links: z.array(link).default([]),
			stats: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
			credits: z
				.array(
					z.object({
						role: z.string(),
						/** Individuals. They also appear in the People section on the home page. */
						people: z.array(z.string()).optional(),
						/** An organisation or free text. Shown as a single chip; not listed under People. */
						note: z.string().optional()
					})
				)
				.default([])
		})
})

const pages = defineCollection({
	loader: glob({ pattern: '*.md', base: './src/content/pages' }),
	schema: z.object({
		title: z.string(),
		description: z.string().optional(),
		eyebrow: z.string(),
		heading: z.string(),
		lede: z.string(),
		cards: z
			.array(z.object({ label: z.string(), text: z.string(), href: z.string().optional() }))
			.default([])
	})
})

const site = defineCollection({
	loader: glob({ pattern: 'site.yaml', base: './src/content' }),
	schema: z.object({
		name: z.string(),
		title: z.string(),
		description: z.string(),
		nav: z.array(link),
		contact: z.array(link),
		copyright: z.string(),
		groups: z.record(z.enum(GROUPS), z.object({ label: z.string(), note: z.string() })),
		kinds: z.record(z.enum(KINDS), z.string())
	})
})

const home = defineCollection({
	loader: glob({ pattern: 'home.yaml', base: './src/content' }),
	schema: ({ image }) => z.object({
		headline: z.string(),
		/** Round portrait beside the headline. */
		photo: image(),
		photoAlt: z.string(),
		facts: z.array(z.object({ label: z.string(), text: z.string() })),
		work: z.object({ heading: z.string(), allLabel: z.string(), countLabel: z.string() }),
		experience: z.object({
			heading: z.string(),
			jobs: z.array(
				z.object({ years: z.string(), role: z.string(), org: z.string(), note: z.string() })
			),
			earlierLabel: z.string(),
			earlier: z.array(
				z.object({ title: z.string(), note: z.string(), href: z.string().optional() })
			)
		}),
		people: z.object({
			heading: z.string(),
			intro: z.string(),
			thanksLabel: z.string(),
			thanksText: z.string(),
			family: z.array(z.string())
		}),
		about: z.object({ heading: z.string(), text: z.string() })
	})
})

const people = defineCollection({
	loader: glob({ pattern: 'people.yaml', base: './src/content' }),
	schema: z.object({
		people: z.array(
			z.object({
				name: z.string(),
				/** Personal site. Turns the name into a link wherever it appears. */
				href: z.url().optional(),
				/** Keep the credit on case studies but leave them out of the People grid. */
				hidden: z.boolean().default(false),
				/**
				 * Extra chips on their People card. A project id (the filename in
				 * content/projects) becomes a link to that case study; anything else is plain text.
				 */
				also: z.array(z.string()).default([])
			})
		)
	})
})

export const collections = { projects, pages, site, home, people }
