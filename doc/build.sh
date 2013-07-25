#!/bin/sh

VER=$1

carton install

mkdir rex-io-webui-$VER
mkdir rex-io-webui-$VER/doc
cp -R {bin,lib,t,local} rex-io-webui-$VER
cp doc/rex-io-webui.init rex-io-webui-$VER/doc

tar czf rex-io-webui-$VER.tar.gz rex-io-webui-$VER

rm -rf rex-io-webui-$VER
