import { Component, computed, signal, viewChild } from '@angular/core';

import { HlmButton } from '@spartan-ng/helm/button';
import { HlmButtonGroup, HlmButtonGroupSeparator } from '@spartan-ng/helm/button-group';
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
import { HlmNativeSelect, HlmNativeSelectOption } from '@spartan-ng/helm/native-select';
import {
  HlmCaption,
  HlmTable,
  HlmTableContainer,
  HlmTBody,
  HlmTd,
  HlmTh,
  HlmTHead,
  HlmTr,
} from '@spartan-ng/helm/table';

import { MOCK_TRANSACTIONS } from './mock-transactions';
import type { LineItem, PosTransaction, TransactionStatus } from './transaction.types';

@Component({
  selector: 'app-pos-demo',
  imports: [
    HlmButton,
    HlmButtonGroup,
    HlmButtonGroupSeparator,
    HlmCaption,
    HlmDialog,
    HlmDialogClose,
    HlmDialogContent,
    HlmDialogDescription,
    HlmDialogFooter,
    HlmDialogHeader,
    HlmDialogPortal,
    HlmDialogTitle,
    HlmNativeSelect,
    HlmNativeSelectOption,
    HlmTableContainer,
    HlmTable,
    HlmTBody,
    HlmTd,
    HlmTh,
    HlmTHead,
    HlmTr,
  ],
  template: `
    <section class="mx-auto max-w-5xl">
      <h2 class="text-base font-medium tracking-tight">POS UI spike</h2>
      <p class="text-muted-foreground mt-1 text-sm">
        Spartan <strong class="text-foreground font-medium">table</strong>,
        <strong class="text-foreground font-medium">native select</strong>,
        <strong class="text-foreground font-medium">buttons</strong> / <strong class="text-foreground font-medium">button group</strong>,
        and <strong class="text-foreground font-medium">dialog</strong> on row click.
      </p>

      <div class="mt-6 flex flex-col gap-4">
        <div class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div class="w-full max-w-xs shrink-0">
            <label class="text-muted-foreground mb-1.5 block text-xs font-medium" for="pos-status-filter">
              Status filter
            </label>
            <hlm-native-select
              selectId="pos-status-filter"
              class="block w-full max-w-xs"
              [value]="statusFilter()"
              (valueChange)="onStatusFilter($event)"
            >
              <option hlmNativeSelectOption value="all">All statuses</option>
              <option hlmNativeSelectOption value="paid">Paid</option>
              <option hlmNativeSelectOption value="open">Open tab</option>
              <option hlmNativeSelectOption value="refunded">Refunded</option>
            </hlm-native-select>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button type="button" hlmBtn variant="secondary" (click)="onToolbarRefresh()">Refresh</button>
            <div hlmButtonGroup>
              <button type="button" hlmBtn variant="outline" (click)="onReceiptAction('print')">Print receipt</button>
              <div hlmButtonGroupSeparator decorative></div>
              <button type="button" hlmBtn variant="outline" (click)="onReceiptAction('email')">Email receipt</button>
            </div>
          </div>

          <p class="text-muted-foreground text-xs xl:pb-2 xl:text-end">
            Showing <span class="text-foreground font-medium tabular-nums">{{ filteredTransactions().length }}</span>
            of
            <span class="text-foreground font-medium tabular-nums">{{ allCount() }}</span>
            · click a row for details
          </p>
        </div>
        @if (toolbarHint(); as hint) {
          <p class="text-muted-foreground border-border border-t pt-3 text-xs">{{ hint }}</p>
        }
      </div>

      <div hlmTableContainer class="mt-4 rounded-lg border border-border">
        <table hlmTable>
          <caption hlmCaption class="sr-only">Recent POS transactions</caption>
          <thead hlmTHead>
            <tr hlmTr>
              <th hlmTh scope="col">Tab</th>
              <th hlmTh scope="col">Transaction</th>
              <th hlmTh scope="col" class="text-end">Guests</th>
              <th hlmTh scope="col" class="text-end">Amount</th>
              <th hlmTh scope="col">Status</th>
            </tr>
          </thead>
          <tbody hlmTBody>
            @for (tx of filteredTransactions(); track tx.id) {
              <tr
                hlmTr
                class="cursor-pointer"
                tabindex="0"
                (click)="openDetail(tx)"
                (keydown.enter)="openDetail(tx)"
                (keydown.space)="$event.preventDefault(); openDetail(tx)"
              >
                <td hlmTd class="font-medium">{{ tx.tabLabel }}</td>
                <td hlmTd class="text-muted-foreground whitespace-normal">
                  <span class="text-foreground font-mono text-xs">{{ tx.id }}</span>
                  <span class="mx-1 text-muted-foreground">·</span>
                  <span>{{ formatWhen(tx) }}</span>
                </td>
                <td hlmTd class="text-end tabular-nums text-muted-foreground">{{ tx.guestCount }}</td>
                <td hlmTd class="text-end tabular-nums font-medium">{{ formatMoney(tx) }}</td>
                <td hlmTd class="capitalize text-muted-foreground">{{ tx.status }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <hlm-dialog #detailDialog (closed)="onDetailClosed()">
        <ng-template hlmDialogPortal>
          <hlm-dialog-content>
            @if (selectedTx(); as tx) {
              <hlm-dialog-header>
                <h2 hlmDialogTitle>{{ tx.tabLabel }}</h2>
                <p hlmDialogDescription>
                  {{ tx.id }} · internal tab <span class="font-mono">{{ tx.tabInternalId }}</span>
                </p>
              </hlm-dialog-header>

              <div class="grid gap-3 text-sm">
                <dl class="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
                  <div>
                    <dt class="text-muted-foreground text-xs">Section</dt>
                    <dd class="font-medium">{{ tx.section }}</dd>
                  </div>
                  <div>
                    <dt class="text-muted-foreground text-xs">Guests</dt>
                    <dd class="font-medium tabular-nums">{{ tx.guestCount }}</dd>
                  </div>
                  <div>
                    <dt class="text-muted-foreground text-xs">Cashier</dt>
                    <dd class="font-medium">{{ tx.cashierName }}</dd>
                  </div>
                  <div>
                    <dt class="text-muted-foreground text-xs">Terminal</dt>
                    <dd class="font-mono text-xs font-medium">{{ tx.terminalId }}</dd>
                  </div>
                  <div>
                    <dt class="text-muted-foreground text-xs">Opened</dt>
                    <dd>{{ formatWhen(tx) }}</dd>
                  </div>
                  <div>
                    <dt class="text-muted-foreground text-xs">Closed</dt>
                    <dd>{{ formatClosed(tx) }}</dd>
                  </div>
                  <div class="col-span-2 sm:col-span-3">
                    <dt class="text-muted-foreground text-xs">Payment</dt>
                    <dd>{{ tx.paymentMethod ?? '—' }}</dd>
                  </div>
                  @if (tx.notes) {
                    <div class="col-span-2 sm:col-span-3">
                      <dt class="text-muted-foreground text-xs">Notes</dt>
                      <dd class="text-foreground/90">{{ tx.notes }}</dd>
                    </div>
                  }
                </dl>

                <div>
                  <h3 class="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">Line items</h3>
                  <ul class="border-border divide-border max-h-48 divide-y overflow-y-auto rounded-md border">
                    @for (line of tx.lineItems; track line.name) {
                      <li class="flex items-baseline justify-between gap-4 px-3 py-2">
                        <span
                          ><span class="tabular-nums text-muted-foreground">{{ line.quantity }}×</span>
                          {{ line.name }}</span
                        >
                        <span class="tabular-nums font-medium">{{ formatLine(tx, line) }}</span>
                      </li>
                    }
                  </ul>
                </div>

                <p class="text-end text-base font-semibold tabular-nums">
                  Total {{ formatMoney(tx) }}
                  <span class="text-muted-foreground ml-2 text-sm font-normal capitalize">({{ tx.status }})</span>
                </p>
              </div>
            }

            <hlm-dialog-footer>
              <button type="button" hlmBtn variant="outline" hlmDialogClose>Close</button>
            </hlm-dialog-footer>
          </hlm-dialog-content>
        </ng-template>
      </hlm-dialog>
    </section>
  `,
})
export class PosDemo {
  private readonly _all = signal<readonly PosTransaction[]>([...MOCK_TRANSACTIONS]);

  protected readonly statusFilter = signal<string>('all');

  protected readonly toolbarHint = signal<string | null>(null);

  /** Row opened in the detail dialog */
  protected readonly selectedTx = signal<PosTransaction | null>(null);

  private readonly _detailDialog = viewChild.required<HlmDialog>('detailDialog');

  protected readonly allCount = computed(() => this._all().length);

  protected readonly filteredTransactions = computed(() => {
    const rows = this._all();
    const f = this.statusFilter();
    if (f === 'all') return rows;
    const isStatus = (s: string): s is TransactionStatus =>
      s === 'paid' || s === 'open' || s === 'refunded';
    if (!isStatus(f)) return rows;
    return rows.filter((t) => t.status === f);
  });

  protected onStatusFilter(value: unknown): void {
    const v =
      typeof value === 'string' || value === null
        ? value
        : value instanceof Event
          ? (value.target as HTMLSelectElement | null)?.value ?? null
          : null;
    this.statusFilter.set(v ?? 'all');
    this.toolbarHint.set(null);
  }

  protected onToolbarRefresh(): void {
    this.toolbarHint.set('List refreshed (demo only — no API).');
  }

  protected onReceiptAction(mode: 'print' | 'email'): void {
    const tx = this.selectedTx();
    const verb = mode === 'print' ? 'Print' : 'Email';
    this.toolbarHint.set(
      tx
        ? `${verb} receipt queued for ${tx.id} (demo).`
        : `${verb} receipt — open a row first, or use this after selecting from the table (demo).`,
    );
  }

  protected openDetail(tx: PosTransaction): void {
    this.selectedTx.set(tx);
    this._detailDialog().open();
  }

  protected onDetailClosed(): void {
    this.selectedTx.set(null);
  }

  protected formatMoney(tx: PosTransaction): string {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: tx.currency,
    }).format(tx.totalAmount);
  }

  protected formatLine(tx: PosTransaction, line: LineItem): string {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: tx.currency,
    }).format(line.lineTotal);
  }

  protected formatWhen(tx: PosTransaction): string {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(tx.startedAt));
  }

  protected formatClosed(tx: PosTransaction): string {
    if (!tx.closedAt) return '—';
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(tx.closedAt));
  }
}
