import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class TreeControlService {

  constructor() { }
  private expandAllSource = new Subject<void>();
  expandAll$ = this.expandAllSource.asObservable();

  private collapseAllSource = new Subject<void>();
  collapseAll$ = this.collapseAllSource.asObservable();

  expandAll(): void {
    this.expandAllSource.next();
  }

  collapseAll(): void {
    this.collapseAllSource.next();
  }
}
