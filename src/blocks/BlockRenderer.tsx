import React from 'react';
import type {LayoutBlock} from '../api/types';
import {RestaurantHero} from './components/RestaurantHero';
import {CardGrid} from './components/CardGrid';
import {Carousel} from './components/Carousel';
import {PromoRail} from './components/PromoRail';
import {TextBlockComponent} from './components/TextBlock';
import {RestaurantCta} from './components/RestaurantCta';
import {ImageBlockComponent} from './components/ImageBlock';
import {UnknownBlock} from './components/UnknownBlock';

/**
 * Maps a parsed CMS blockType to its rendering component.
 *
 * The renderer is data-driven: adding a new documented block is a single
 * entry in this registry (plus its schema) with no screen changes. Unknown
 * types fall through to UnknownBlock instead of crashing.
 *
 * Blocks with full implementations below are live-rendered from Home/Menu.
 * Documented-but-not-yet-implemented blocks intentionally render nothing (safe
 * no-op) rather than a placeholder.
 */
export interface BlockProps {
  block: LayoutBlock;
}

const NO_OP: React.ComponentType<BlockProps> = () => null;

export const BLOCK_RENDERERS: Record<string, React.ComponentType<BlockProps>> = {
  restaurantHero: props => <RestaurantHero block={props.block as any} />,
  cardGrid: props => <CardGrid block={props.block as any} />,
  carousel: props => <Carousel block={props.block as any} />,
  promoRail: props => <PromoRail block={props.block as any} />,
  textBlock: props => <TextBlockComponent block={props.block as any} />,
  restaurantCTA: props => <RestaurantCta block={props.block as any} />,
  imageBlock: props => <ImageBlockComponent block={props.block as any} />,
  // Documented but not present in the live Home/Menu payloads: render a safe
  // no-op. Implementations can be added here without touching screens.
  cta: NO_OP,
  content: NO_OP,
  mediaBlock: NO_OP,
  archive: NO_OP,
  formBlock: NO_OP,
};

export function BlockRenderer({block}: BlockProps): React.JSX.Element {
  const Renderer = BLOCK_RENDERERS[block.blockType] ?? (() => <UnknownBlock blockType={block.blockType} />);
  return <Renderer block={block} />;
}
