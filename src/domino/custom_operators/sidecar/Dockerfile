FROM bitnami/python:3.10

RUN apt update \
    && apt -y install fuse3 \
    && apt install curl -y \
    && apt install p7zip-full -y \
    && apt-get install psmisc -y \
    && apt-get install -y man-db \
    && curl -O https://downloads.rclone.org/v1.64.2/rclone-v1.64.2-linux-amd64.zip && unzip rclone-v1.64.2-linux-amd64.zip && cd rclone-*-linux-amd64 && cp rclone /usr/bin/ \
    && chown root:root /usr/bin/rclone && chmod 755 /usr/bin/rclone \
    && mkdir -p /usr/local/share/man/man1 && cp rclone.1 /usr/local/share/man/man1/ && mandb 

RUN mkdir -p /.config/rclone
COPY rclone.conf /.config/rclone/rclone.conf
COPY fuse.conf /etc/fuse.conf
COPY sidecar_lifecycle.sh .
RUN chmod u+x sidecar_lifecycle.sh
COPY logger.py . 
COPY mount.py .