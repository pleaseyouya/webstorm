#!/bin/sh
# ------------------------------------------------------
# WebStorm formatting script.
# ------------------------------------------------------

IDE_BIN_HOME="${0%/*}"
exec "$IDE_BIN_HOME/webstorm.sh" format "$@"
