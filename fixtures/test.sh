#!/usr/bin/env bash

rm -rf upm.yml upm-lock.yml web_modules

../dist/index.js init

cat upm.yml

../dist/index.js install

cat upm-lock.yml
tree web_modules

../dist/index.js install

cat upm-lock.yml
tree web_modules

