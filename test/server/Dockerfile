FROM ubuntu:16.04

RUN apt-get update
RUN apt-get -yq install openssh-server; \
  mkdir -p /var/run/sshd; \
  mkdir /root/.ssh && chmod 700 /root/.ssh; \
  touch /root/.ssh/authorized_keys

COPY ./server/sshd_config /etc/ssh/sshd_config


COPY ./keys/authorized_keys /root/.ssh/authorized_keys


EXPOSE 22 23
CMD /usr/sbin/sshd -D -p 22 -p 23