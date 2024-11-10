# trunk-ignore-all(trivy/DS002)
# trunk-ignore-all(checkov/CKV_DOCKER_3)
FROM debian:bookworm-slim@sha256:36e591f228bb9b99348f584e83f16e012c33ba5cad44ef5981a1d7c0a93eca22

ENV SHELL=/bin/zsh
ENV NX_DAEMON=true
ENV PNPM_HOME=/var/lib/pnpm
ENV PATH="$PATH:/var/lib/pnpm"

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Install required packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    ca-certificates \
    zsh \
    git \
    curl \
    jq \
    gnupg \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install git-lfs
RUN curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | bash \
    && apt-get install -y --no-install-recommends git-lfs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install zsh and oh-my-zsh and setup powerlevel10k theme
RUN curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh | sh - \
    && git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ~/.oh-my-zsh/custom/themes/powerlevel10k \
    && sed -i 's/ZSH_THEME=".*"/ZSH_THEME="powerlevel10k\/powerlevel10k"/g' ~/.zshrc \
    && echo 'source ~/.oh-my-zsh/custom/themes/powerlevel10k/powerlevel10k.zsh-theme' >>~/.zshrc \
    && echo '[[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh' >> ~/.zshrc \
    && git clone --depth=1 https://github.com/zsh-users/zsh-syntax-highlighting.git ~/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting \
    && git clone --depth=1 https://github.com/zsh-users/zsh-autosuggestions ~/.oh-my-zsh/custom/plugins/zsh-autosuggestions \
    && sed -i 's/plugins=(git)/plugins=(git zsh-syntax-highlighting zsh-autosuggestions git-auto-fetch)/g' ~/.zshrc \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install docker
RUN curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc \
    && chmod a+r /etc/apt/keyrings/docker.asc \
    && echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
        $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
    tee /etc/apt/sources.list.d/docker.list > /dev/null \
    && apt-get update \
    && apt-get install -y --no-install-recommends docker-ce docker-ce-cli docker-compose-plugin docker-buildx-plugin \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install trunk.io
RUN curl https://get.trunk.io -fsSL | bash

# Install latest node pnpm and nx
RUN curl -sL https://deb.nodesource.com/setup_lts.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && npm install -g pnpm@latest \
    && pnpm config set store-dir /var/lib/pnpm \
    && npm remove -g npm \
    && pnpm add -g nx

RUN rm -rf /var/log/*  && rm -rf /var/cache/*  && rm -rf /tmp/* && rm -rf /var/tmp/*

COPY .devcontainer/p10k.zsh  /root/.p10k.zsh
COPY --chmod=0755 .devcontainer/entrypoint.sh /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

CMD ["tail", "-f", "/dev/null"]

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s CMD docker ps
