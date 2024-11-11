# trunk-ignore-all(checkov/CKV_DOCKER_3)
# trunk-ignore-all(trivy/DS002)
# trunk-ignore-all(trivy/DS026)
# trunk-ignore-all(checkov/CKV_DOCKER_2)

ARG ALPINE_VERSION
FROM alpine:${ALPINE_VERSION}
RUN apk add --no-cache curl \
    && rm -rf /var/cache/* lib/apk/* /etc/apk/* /etc/ssl/*

