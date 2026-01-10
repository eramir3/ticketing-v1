# Dockerfile for building kafka image with java-corretto-21 and kafka binaries
FROM confluentinc/cp-kafka:7.8.0

ARG KAFKA_VERSION=3.8.0
ARG SCALA_VERSION=2.13

USER root

# ---- Install debug + networking tools ----
RUN microdnf install -y \
    iproute \
    net-tools \
    nmap-ncat \
    curl \
    procps-ng \
    || yum install -y \
    iproute \
    net-tools \
    nmap-ncat \
    curl \
    procps-ng \
    && microdnf clean all || yum clean all

# ---- Install Corretto 21 ----
RUN rpm --import https://yum.corretto.aws/corretto.key \
    && curl -o /etc/yum.repos.d/corretto.repo https://yum.corretto.aws/corretto.repo \
    && microdnf install -y java-21-amazon-corretto-devel \
    || yum install -y java-21-amazon-corretto-devel \
    && microdnf clean all || yum clean all

# ---- Install Kafka binaries ----
RUN curl -fL "https://archive.apache.org/dist/kafka/${KAFKA_VERSION}/kafka_${SCALA_VERSION}-${KAFKA_VERSION}.tgz" -o /tmp/kafka.tgz \
    && mkdir -p /opt \
    && tar -xzf /tmp/kafka.tgz -C /opt \
    && ln -sfn /opt/kafka_${SCALA_VERSION}-${KAFKA_VERSION} /opt/kafka \
    && rm /tmp/kafka.tgz \
    && chown -R appuser:appuser /opt/kafka_${SCALA_VERSION}-${KAFKA_VERSION} /opt/kafka

ENV JAVA_HOME=/usr/lib/jvm/java-21-amazon-corretto
ENV KAFKA_HOME=/opt/kafka
ENV PATH=$JAVA_HOME/bin:$KAFKA_HOME/bin:$PATH

USER appuser
