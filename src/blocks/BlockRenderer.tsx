import type { ComponentType } from 'react';
import type { LayoutBlock } from '../api/types';
import { RestaurantHero } from './components/RestaurantHero';
import { CardGrid } from './components/CardGrid';
import { Carousel } from './components/Carousel';
import { PromoRail } from './components/PromoRail';
import { TextBlockComponent } from './components/TextBlock';
import { RestaurantCta } from './components/RestaurantCta';
import { ImageBlockComponent } from './components/ImageBlock';
import { CtaBlock } from './components/CtaBlock';
import { ContentBlock } from './components/ContentBlock';
import { MediaBlock } from './components/MediaBlock';
import { ArchiveBlock } from './components/ArchiveBlock';
import { FormBlockComponent } from './components/FormBlock';
import { UnknownBlock } from './components/UnknownBlock';

export interface BlockProps {
  block: LayoutBlock;
}

export const BLOCK_RENDERERS: Record<
  string,
  ComponentType<BlockProps>
> = {
  restaurantHero: props => <RestaurantHero block={props.block as any} />,
  cardGrid: props => <CardGrid block={props.block as any} />,
  carousel: props => <Carousel block={props.block as any} />,
  promoRail: props => <PromoRail block={props.block as any} />,
  textBlock: props => <TextBlockComponent block={props.block as any} />,
  restaurantCTA: props => <RestaurantCta block={props.block as any} />,
  imageBlock: props => <ImageBlockComponent block={props.block as any} />,
  cta: props => <CtaBlock block={props.block as any} />,
  content: props => <ContentBlock block={props.block as any} />,
  mediaBlock: props => <MediaBlock block={props.block as any} />,
  archive: props => <ArchiveBlock block={props.block as any} />,
  formBlock: props => <FormBlockComponent block={props.block as any} />,
};

export function BlockRenderer({ block }: BlockProps): JSX.Element {
  const Renderer =
    BLOCK_RENDERERS[block.blockType] ??
    (() => <UnknownBlock blockType={block.blockType} />);

  return <Renderer block={block} />;
}
