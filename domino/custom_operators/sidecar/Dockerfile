FROM bitnami/python:3.8

RUN apt update \
    && apt install fuse -y \
    && apt -y install fuse3 \
    && apt install curl -y \
    && apt install p7zip-full -y \
    && apt-get install psmisc -y \
    && curl https://rclone.org/install.sh | bash

RUN mkdir -p /.config/rclone
COPY rclone.conf /.config/rclone/rclone.conf
COPY fuse.conf /etc/fuse.conf
COPY sidecar_lifecycle.sh .
RUN chmod u+x sidecar_lifecycle.sh
COPY logger.py . 
COPY mount.py .

CMD ["bash", "-c", "./sidecar_lifecycle.sh"]