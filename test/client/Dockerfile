FROM stocard/node:8.11
COPY ./package.json ./package.json
COPY ./yarn.lock ./yarn.lock
RUN yarn install --silent --frozen-lockfile

COPY ./tsconfig.json ./
COPY ./tslint.json ./
COPY ./src ./src
RUN yarn build

# adds the ssh keys
COPY ./test/keys /root/.ssh/

# add the non protected key as the standard key
COPY ./test/keys/id_rsa_no_pass /root/.ssh/id_rsa
COPY ./test/keys/id_rsa_no_pass.pub /root/.ssh/id_rsa.pub


# COPY ./dist ./dist
COPY ./test ./test


CMD ["yarn", "test"]
