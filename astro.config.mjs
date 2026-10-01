// @ts-check
import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import { satteri } from '@astrojs/markdown-satteri'
import { galleryPlugin } from './src/lib/markdown-gallery.mjs'

// https://astro.build/config
export default defineConfig({
	site: 'https://scottschaffter.com',
	// Every page is prerendered to plain HTML, so Netlify serves `dist/` with no adapter.
	output: 'static',
	integrations: [sitemap()],
	image: {
		// Markdown and <Image> output get a srcset and never upscale past the source.
		layout: 'constrained'
	},
	markdown: {
		processor: satteri({ hastPlugins: [galleryPlugin] })
	}
})
