# !/bin/bash
# example taken from airflow xcom sidecar container command
python mount.py mount; trap "exit 0" INT; while true; do sleep 1; done;