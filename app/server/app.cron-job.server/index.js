import { runJob  as socketEmitFids } from './socket-emit-fids.js';
import { runJob  as updateSessionOdoo } from './update-odoo-session.js'





const listScheduledTask = {
  socketEmitFids : socketEmitFids,
  updateSessionOdoo : updateSessionOdoo
}

export { listScheduledTask };