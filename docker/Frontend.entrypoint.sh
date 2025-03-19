#!/bin/sh
set -e

node server.js

# The purpose of the `tail -f /dev/null` command is to keep the container running without exiting.
# It achieves this by continuously monitoring the /dev/null file (a special device file that never contains content).
# In Docker containers, if the main process exits, the container will stop running.
# When the Next.js server runs in the background, this command prevents the container from terminating immediately,
# ensuring the container stays active until manually stopped or managed by an orchestration system (like Kubernetes).
tail -f /dev/null 