
require('dotenv').config();

import log from 'scpdb-logger';
import rotateDaily from './daily-rotation';
import rotateWeekly from './weekly-rotation';

const task = process.argv[2];

switch (task) {
  case 'rotateDaily':
    rotateDaily().catch(console.error);
    break;
  case 'rotateWeekly':
    rotateWeekly().catch(console.error);
    break;
  default:
    log('Usage: node build <rotateDaily|rotateWeekly>', { type: 'error' });
    process.exit(1);
}
