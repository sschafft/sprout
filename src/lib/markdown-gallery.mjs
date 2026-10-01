import { defineHastPlugin } from 'satteri'

const el = (tagName, properties, children) => ({ type: 'element', tagName, properties, children })
const isBlank = (node) => node.type === 'text' && !node.value.trim()

/**
 * Lets authors build a captioned image grid with plain Markdown.
 *
 * A paragraph that holds only images, e.g.
 *
 *   ![Daily summary](../../assets/work/tela-summary.jpeg)
 *   ![Symptom data over time](../../assets/work/tela-data.jpeg)
 *
 * becomes <div class="gallery"> of <figure>s, with each image's alt text reused as its caption.
 * Images mixed into a sentence are left alone.
 */
export const galleryPlugin = defineHastPlugin({
	name: 'gallery',
	element: {
		filter: ['p'],
		visit(node, ctx) {
			const kids = node.children.filter((child) => !isBlank(child))
			const onlyImages =
				kids.length > 0 && kids.every((child) => child.type === 'element' && child.tagName === 'img')
			if (!onlyImages) return

			ctx.replaceNode(
				node,
				el(
					'div',
					{ className: ['gallery'] },
					kids.map((img) =>
						el('figure', {}, [
							el('img', { ...img.properties }, []),
							el('figcaption', {}, [{ type: 'text', value: String(img.properties.alt ?? '') }])
						])
					)
				)
			)
		}
	}
})
