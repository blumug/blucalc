#!/bin/bash
set -e
source /home/blucalc/vars.sh
cd /var/www/blucalc/root/deploy
exec node bundle/main.js
