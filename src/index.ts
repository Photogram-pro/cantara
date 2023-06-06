#!/usr/bin/env node
import 'array-flat-polyfill';
import setupCliInterface from './cli';

function main() {
  console.info("cantara photogram");
  setupCliInterface();
}

main();
