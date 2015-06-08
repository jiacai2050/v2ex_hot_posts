#!/usr/bin/env bash

cur=$(cd `dirname $0`;pwd)
set -x
forever start -a --minUptime 20 --spinSleepTime=20 -l $cur/logs/`date +%s`.log cron.js
