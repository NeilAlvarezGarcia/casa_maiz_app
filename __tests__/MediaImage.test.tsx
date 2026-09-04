/**
 * @format
 *
 * Media image behavior required by the assessment:
 *  1. Pick a responsive source appropriate for the current screen (DPR-aware).
 *  2. Preserve aspect ratio via a fixed container.
 *  3. Tolerate missing optional images (render nothing).
 *  4. Expose meaningful alternative text, or stay non-accessible when absent.
 *  5. Degrade gracefully on load error instead of crashing.
 */
import React from 'react';
import { act, render } from '@testing-library/react-native';
import { MediaImage } from '../src/ui/components/MediaImage';
import { ThemeProvider } from '../src/ui/theme';
import { PixelRatio } from 'react-native';

function renderImage(props: React.ComponentProps<typeof MediaImage>) {
  return render(
    <ThemeProvider>
      <MediaImage {...props} />
    </ThemeProvider>,
  );
}

describe('preferredMediaUrl responsive selection', () => {
  beforeEach(() => {
    PixelRatio.get = jest.fn(() => 3);
  });

  const media = {
    url: 'https://cdn.example.test/original.jpg',
    sizes: {
      small: { url: 'https://cdn.example.test/small.jpg', width: 320 },
      medium: { url: 'https://cdn.example.test/medium.jpg', width: 640 },
      large: { url: 'https://cdn.example.test/large.jpg', width: 1024 },
    },
  };

  it('selects the smallest responsive size that satisfies the screen width', () => {
    const { getByLabelText } = renderImage({
      media: { ...media, alt: 'taco' },
      accessibilityLabel: 'taco',
      width: 200,
    });
    // 200px container * 3 dpr = 600 target -> medium (640) is smallest fit.
    expect(getByLabelText('taco').props.source.uri).toBe(
      'https://cdn.example.test/medium.jpg',
    );
  });

  it('falls back to the largest size when none is large enough', () => {
    const { getByLabelText } = renderImage({
      media: { ...media, alt: 'taco' },
      accessibilityLabel: 'taco',
      width: 1200,
    });
    // 1200*3 = 3600 target -> no size fits, use the largest (large).
    expect(getByLabelText('taco').props.source.uri).toBe(
      'https://cdn.example.test/large.jpg',
    );
  });

  it('falls back to original url when no sizes are present', () => {
    const { getByLabelText } = renderImage({
      media: { url: media.url, alt: 'taco' },
      accessibilityLabel: 'taco',
    });
    expect(getByLabelText('taco').props.source.uri).toBe(media.url);
  });

  it('renders nothing when the image is missing entirely', () => {
    const { queryByLabelText } = renderImage({
      media: { alt: 'missing' },
      accessibilityLabel: 'missing',
    });
    expect(queryByLabelText('missing')).toBeNull();
  });
});

describe('MediaImage accessibility', () => {
  it('exposes a meaningful alt label as the accessibility label', () => {
    const { getByLabelText } = renderImage({
      media: { url: 'https://cdn.test/a.jpg', alt: 'Molcajete dish' },
    });
    const img = getByLabelText('Molcajete dish');
    expect(img.props.accessibilityRole).toBe('image');
    expect(img.props.accessible).toBe(true);
  });

  it('is not announced when no alt is available', () => {
    const { queryByLabelText } = renderImage({
      media: { url: 'https://cdn.test/noalt.jpg' },
      accessibilityLabel: undefined,
    });
    // No non-empty label present -> no accessible image node.
    expect(queryByLabelText('')).toBeNull();
  });
});

describe('MediaImage error handling', () => {
  it('shows a fallback placeholder instead of crashing on load error', () => {
    const { getByTestId, queryByLabelText } = renderImage({
      media: {
        url: 'https://cdn.test/error.jpg',
        alt: 'will fail',
      },
      testID: 'img',
    });

    const image = getByTestId('img');
    act(() => {
      image.props.children.props.onError();
    });

    expect(getByTestId('img-fallback')).toBeTruthy();
    expect(queryByLabelText('will fail')).toBeNull();
  });
});
