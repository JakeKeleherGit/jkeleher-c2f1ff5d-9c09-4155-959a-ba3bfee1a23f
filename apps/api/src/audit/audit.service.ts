import { Injectable } from '@nestjs/common';

@Injectable()
export class AuditService {
  private buf: Array<{ ts: number; type: string; data: any }> = [];

  info(type: string, data: any) {
    this.buf.push({ ts: Date.now(), type, data });
    if (this.buf.length > 2000) this.buf.shift();
    console.log('[AUDIT]', type, data);
  }

  list() {
    return this.buf.slice(-200).reverse(); // latest first
  }
}
