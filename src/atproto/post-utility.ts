import { isTag } from '../lexicon/types/app/bsky/richtext/facet'
import { Record as Post } from '../lexicon/types/app/bsky/feed/post'

export const getTags = (post: Post): string[] => {
  const silentTags = [...(post.tags ?? [])]
  const facetTags =
    post.facets?.flatMap((facet) =>
      facet.features.flatMap((feature) => (isTag(feature) ? [feature.tag] : []))
    ) ?? []
  return [...new Set([...silentTags, ...facetTags])]
}
