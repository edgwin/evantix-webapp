import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-edgwin-grid',
  templateUrl: './edgwin-grid.component.html',
  styleUrls: ['./edgwin-grid.component.css']
})
export class EdgwinGridComponent {
  @Input() columns: any[] = [];
  @Input() data: any[] = [];
  @Output() action = new EventEmitter<{ type: string, row: any }>();

  filterText: string = '';
  sortColumn: string = '';
  sortAsc: boolean = true;

  // Paginación
  currentPage = 1;
  pageSize = 5;

  get filteredData() {
    if (!this.filterText.trim()) return this.data;
    const text = this.filterText.toLowerCase();
    return this.data.filter(row =>
      this.columns.some(col =>
        row[col.field]?.toString().toLowerCase().includes(text)
      )
    );
  }

  get sortedData() {
    if (!this.sortColumn) return this.filteredData;
    return [...this.filteredData].sort((a, b) => {
      const aVal = a[this.sortColumn];
      const bVal = b[this.sortColumn];
      return this.sortAsc
        ? aVal > bVal ? 1 : aVal < bVal ? -1 : 0
        : aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    });
  }

  get paginatedData() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.sortedData.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.sortedData.length / this.pageSize);
  }

  onHeaderClick(field: string) {
    if (this.sortColumn === field) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortColumn = field;
      this.sortAsc = true;
    }
  }

  onAction(type: string, row: any) {
    this.action.emit({ type, row });
  }

  changePage(delta: number) {
    const next = this.currentPage + delta;
    if (next >= 1 && next <= this.totalPages) {
      this.currentPage = next;
    }
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  hasActionsColumn(): boolean {
    return this.columns?.some(c => c.type === 'actions');
  }

  getStatusStyle(status: string) {
    status = status?.toUpperCase();
    const styles: any = {
      'CREADO': { backgroundColor: '#fdd017', color: '#c7A317' },
      'PAGO CREADO': { backgroundColor: '#00FF00', color: '#000000' },
      'PAGADO': { backgroundColor: '#00FF00', color: '#1B3925' },
      'PENDIENTE': { backgroundColor: '#036103ff', color: '#ffffffff' },
      'EN PROCESO': { backgroundColor: '#ffff00', color: '#ff9800' },
      'PAGO EN PROCESO': { backgroundColor: '#ffff00', color: '#ff9800' },
      'PAGO DECLINADO': { backgroundColor: '#ff0000ff', color: '#fffb00ff' },
      'PAGO CANCELADO': { backgroundColor: '#ffcdd2', color: '#c62828' },
      'PAGO RECHAZADO': { backgroundColor: '#930001', color: '#FF0000' },
      'PAGO PENDIENTE': { backgroundColor: '#fff3e0', color: '#ff9800' },
      'EN REVISION': { backgroundColor: '#fd0707ff', color: '#000000ff' },
      'REVISADO': { backgroundColor: '#008f0cff', color: '#000000ff' },
      'PUBLICADO': { backgroundColor: '#0734fdff', color: '#ffffffff' }
    };
    return {
      padding: '4px 10px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      ...(styles[status] || {})
    };
  }

  isDisabled(showPayment: boolean) {
    return showPayment;
  }
}