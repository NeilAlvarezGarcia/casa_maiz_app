/**
 * @format
 *
 * Required block-rendering coverage:
 *  1. At least one successfully rendered CMS block path.
 *  2. Unknown / future block types render safely instead of crashing.
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import { BlockRenderer } from '../src/blocks/BlockRenderer';
import { ThemeProvider } from '../src/ui/theme';
import type { LayoutBlock } from '../src/api/types';

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({ navigate: jest.fn() }),
  };
});

function renderBlock(block: LayoutBlock) {
  return render(
    <ThemeProvider>
      <BlockRenderer block={block} />
    </ThemeProvider>,
  );
}

describe('BlockRenderer successful path', () => {
  it('renders a textBlock from CMS content', () => {
    const { getByText } = renderBlock({
      blockType: 'textBlock',
      heading: 'Casa Maíz',
      body: 'Cocina mexicana de temporada.',
    });

    expect(getByText('Casa Maíz')).toBeTruthy();
    expect(getByText('Cocina mexicana de temporada.')).toBeTruthy();
  });
});

describe('BlockRenderer unknown-block behavior', () => {
  it('renders a safe placeholder for an unknown block type without crashing', () => {
    const { getByTestId, getByText } = renderBlock({
      blockType: 'videoFeature',
      title: 'Some future block',
    });

    expect(getByTestId('unknown-block-videoFeature')).toBeTruthy();
    expect(getByText('Bloque no disponible')).toBeTruthy();
  });
});
