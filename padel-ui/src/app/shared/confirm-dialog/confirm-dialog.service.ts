import { Injectable, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  readonly isVisible = signal(false);
  readonly dialogData = signal<ConfirmDialogData>({ title: '', message: '' });
  
  private confirmSubject = new Subject<boolean>();

  confirm(data: ConfirmDialogData): Observable<boolean> {
    this.dialogData.set({
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      confirmButtonClass: 'btn-danger',
      icon: 'fa-exclamation-triangle',
      ...data
    });
    this.isVisible.set(true);
    
    return this.confirmSubject.asObservable();
  }

  onConfirm() {
    this.isVisible.set(false);
    this.confirmSubject.next(true);
    this.confirmSubject.complete();
    this.confirmSubject = new Subject<boolean>();
  }

  onCancel() {
    this.isVisible.set(false);
    this.confirmSubject.next(false);
    this.confirmSubject.complete();
    this.confirmSubject = new Subject<boolean>();
  }
}
