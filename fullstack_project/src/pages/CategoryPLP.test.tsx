import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import CategoryPLP from './CategoryPLP';

jest.mock('@/components/common/Header', () => () => <div data-testid="header" />);
jest.mock('@/components/common/TextCategoryBar', () => () => <nav data-testid="top-tabs" />);
jest.mock('@/components/products/ProductCard', () => ({ product }: any) => (
  <div data-testid="product-card">{product?.name ?? product?.id}</div>
));
jest.mock('@/components/skeleton/PLPskeleton', () => ({
  SkeletonFilterColumn: () => <div data-testid="skeleton-filter" />,
  SkeletonGrid: ({ count = 12 }: any) => <div data-testid="skeleton-grid">count:{count}</div>,
  SkeletonRightHeader: () => <div data-testid="skeleton-right-header" />,
}));

jest.mock('@/lib/api', () => ({
  api: {
    categoryPage: jest.fn(),
    parentCategoryOf: jest.fn(),
  },
}));

jest.mock('@/lib/sorters', () => {
  const actual = jest.requireActual('@/lib/sorters');
  return actual;
});

import { api } from '@/lib/api';

function renderAt(pathname: string) {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <Routes>
        <Route path="/category/:slug" element={<CategoryPLP />} />
        <Route path="/category/:parentSlug/:childSlug" element={<CategoryPLP />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('CategoryPLP', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows loading skeleton then renders products and counts', async () => {
    (api.categoryPage as jest.Mock).mockResolvedValueOnce({
      category: { id: 'c1', slug: 'women', name: 'Women', parent_id: null },
      children: [{ id: 't1', slug: 'tops', name: 'Tops' }],
      products: [
        { id: 'p1', name: 'Alpha Tee', price: 499, rating: 4.6, badge: 'Bestseller' },
        { id: 'p2', name: 'Beta Tee', price: 299, rating: 3.8 },
      ],
    });

    renderAt('/category/women');

    expect(screen.getByTestId('skeleton-filter')).toBeInTheDocument();
    expect(screen.getByTestId('skeleton-grid')).toBeInTheDocument();

    expect(await screen.findAllByTestId('product-card')).toHaveLength(2);
    expect(screen.getByText(/2 available/i)).toBeInTheDocument();
  });

  test('supports nested route with parent and child, no children list when viewing child', async () => {
    (api.categoryPage as jest.Mock).mockResolvedValueOnce({
      category: { id: 'c2', slug: 'tops', name: 'Tops', parent_id: 'women' },
      products: [{ id: 'p3', name: 'Cool Top', price: 899, rating: 4.9 }],
    });
    (api.parentCategoryOf as jest.Mock).mockResolvedValueOnce({
      id: 'c1', slug: 'women', name: 'Women', parent_id: null,
    });

    renderAt('/category/women/tops');

    expect(await screen.findAllByTestId('product-card')).toHaveLength(1);
    expect(screen.getByText('Women')).toBeInTheDocument();
    expect(screen.getByText('Tops')).toBeInTheDocument();
  });

  test('applies price, rating, and highlight filters via URL search params and clears them', async () => {
    (api.categoryPage as jest.Mock).mockResolvedValueOnce({
      category: { id: 'c1', slug: 'women', name: 'Women', parent_id: null },
      children: [],
      products: [
        { id: 'p1', name: 'Low Price', price: 100, rating: 0, tags: ['trending'] },
        { id: 'p2', name: 'Mid Price', price: 500, rating: 4.0, badge: 'Bestseller' },
        { id: 'p3', name: 'High Price', price: 1000, rating: 5.0 },
      ],
    });

    renderAt('/category/women');

    expect(await screen.findAllByTestId('product-card')).toHaveLength(3);

    // Price min/max in desktop sidebar
    const minInput = screen.getAllByPlaceholderText(/min/i)[0];
    await userEvent.clear(minInput);
    await userEvent.type(minInput, '200');

    const maxInput = screen.getAllByPlaceholderText(/max/i)[0];
    await userEvent.clear(maxInput);
    await userEvent.type(maxInput, '800');

    // Rating >= 4.0 in desktop sidebar
    const desktopSidebar = screen.getByRole('complementary');
    const rating4Desktop = within(desktopSidebar).getByLabelText(/4\.0\+ stars/i);
    await userEvent.click(rating4Desktop);

    // Toggle Bestseller in desktop sidebar (disambiguate from mobile copy)
    const bestsellerDesktop = within(desktopSidebar).getByLabelText(/bestseller/i);
    await userEvent.click(bestsellerDesktop);

    // Now only Mid Price qualifies
    const cards = await screen.findAllByTestId('product-card');
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveTextContent('Mid Price');

    // Clear the chips visible in the content area
    await userEvent.click(screen.getByRole('button', { name: /min/i }));
    await userEvent.click(screen.getByRole('button', { name: /max/i }));
    // Rating chip text can vary; find a chip with ★ or "No ratings"
    const chipButtons = screen.getAllByRole('button');
    const ratingChip = chipButtons.find((b) => /★|no ratings/i.test(b.textContent || ''));
    if (ratingChip) await userEvent.click(ratingChip);
    const bestsellerChip = chipButtons.find((b) => /bestseller ×/i.test(b.textContent || ''));
    if (bestsellerChip) await userEvent.click(bestsellerChip);

    expect(await screen.findAllByTestId('product-card')).toHaveLength(3);
  });

  test('sorts results by select box', async () => {
    (api.categoryPage as jest.Mock).mockResolvedValueOnce({
      category: { id: 'c1', slug: 'women', name: 'Women', parent_id: null },
      children: [],
      products: [
        { id: 'p1', name: 'A', price: 700, rating: 4.0 },
        { id: 'p2', name: 'B', price: 300, rating: 5.0 },
      ],
    });

    renderAt('/category/women');

    await screen.findAllByTestId('product-card');

    const select = screen.getAllByRole('combobox', { name: /sort/i })[0];
    await userEvent.selectOptions(select, 'price_low');

    const list = screen.getAllByTestId('product-card').map((el) => el.textContent);
    expect(list).toEqual(['B', 'A']);
  });

  test('mobile filters drawer toggles open/close', async () => {
    (api.categoryPage as jest.Mock).mockResolvedValueOnce({
      category: { id: 'c1', slug: 'women', name: 'Women', parent_id: null },
      children: [],
      products: [],
    });

    renderAt('/category/women');

    const openBtn = await screen.findByRole('button', { name: /open filters/i });
    await userEvent.click(openBtn);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /done/i }));

    // Assert hidden state via class transitions
    const overlay = dialog.previousElementSibling as HTMLElement;
    expect(dialog.className).toMatch(/translate-y-full/);
    expect(overlay.className).toMatch(/opacity-0/);
  });
});
