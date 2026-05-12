import { Component, computed, model, signal, viewChild } from '@angular/core';

import { HlmButton } from '@spartan-ng/helm/button';
import {
  HlmDialog,
  HlmDialogClose,
  HlmDialogContent,
  HlmDialogDescription,
  HlmDialogFooter,
  HlmDialogHeader,
  HlmDialogPortal,
  HlmDialogTitle,
} from '@spartan-ng/helm/dialog';
import { HlmNumberedPagination } from '@spartan-ng/helm/pagination';

import { MOCK_PRODUCT_TILES } from './mock-product-tiles';
import type { CartLine, ProductTile } from './pos-kassa.models';

@Component({
  selector: 'app-pos-kassa',
  imports: [
    HlmButton,
    HlmDialog,
    HlmDialogClose,
    HlmDialogContent,
    HlmDialogDescription,
    HlmDialogFooter,
    HlmDialogHeader,
    HlmDialogPortal,
    HlmDialogTitle,
    HlmNumberedPagination,
  ],
  templateUrl: './pos-kassa.html',
  styleUrl: './pos-kassa.css',
})
export class PosKassa {
  readonly navItems = [
    { id: 'kassa', label: 'Checkout', icon: '◆' },
    { id: 'bord', label: 'Table map', icon: '▣' },
    { id: 'bok', label: 'Bookings', icon: '◔' },
    { id: 'not', label: 'Open tabs', icon: '☰' },
    { id: 'kvitto', label: 'Receipts', icon: '▤' },
  ] as const;

  readonly productTiles: readonly ProductTile[] = MOCK_PRODUCT_TILES;

  readonly productCurrentPage = model(1);
  readonly productItemsPerPage = model(6);

  protected readonly pagedProductTiles = computed(() => {
    const page = this.productCurrentPage() - 1;
    const per = this.productItemsPerPage();
    const start = page * per;
    return this.productTiles.slice(start, start + per);
  });

  protected readonly showProductPagination = computed(
    () => this.productTiles.length > this.productItemsPerPage(),
  );

  protected readonly activeNav = signal<string>('kassa');
  protected readonly dineIn = signal(true);
  protected readonly footerHint = signal<string | null>(null);

  protected readonly cartLines = signal<CartLine[]>([
    { id: 'l1', name: 'Chicken salad', quantity: 1, unitPrice: 95 },
    { id: 'l2', name: 'Green drink', quantity: 1, unitPrice: 25 },
  ]);

  protected readonly selectedLine = signal<CartLine | null>(null);

  private readonly _lineDialog = viewChild.required<HlmDialog>('lineDialog');

  protected readonly cartTotal = computed(() =>
    this.cartLines().reduce((sum, l) => sum + l.quantity * l.unitPrice, 0),
  );

  protected formatMoney(amount: number): string {
    return new Intl.NumberFormat('en-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 2,
    }).format(amount);
  }

  protected formatLineTotal(line: CartLine): string {
    return this.formatMoney(line.quantity * line.unitPrice);
  }

  protected openCartLine(line: CartLine): void {
    this.selectedLine.set(line);
    this._lineDialog().open();
  }

  protected onLineDialogClosed(): void {
    this.selectedLine.set(null);
  }

  protected addTileToCart(tile: ProductTile): void {
    this.cartLines.update((lines) => {
      const existing = lines.find((l) => l.name === tile.productName);
      if (existing) {
        return lines.map((l) =>
          l.id === existing.id ? { ...l, quantity: l.quantity + 1 } : l,
        );
      }
      return [
        ...lines,
        {
          id: `l-${Date.now()}`,
          name: tile.productName,
          quantity: 1,
          unitPrice: tile.unitPrice,
        },
      ];
    });
    this.footerHint.set(`${tile.productName} added to cart.`);
  }

  protected parkOrder(): void {
    this.footerHint.set('Park order (demo — no backend).');
  }

  protected otherPayment(): void {
    this.footerHint.set('Other payment methods (demo).');
  }

  protected payCard(): void {
    this.footerHint.set('Card payment started (demo).');
  }

  protected showLastTx(): void {
    this.footerHint.set('Last transaction (demo — wire to receipts later).');
  }
}
