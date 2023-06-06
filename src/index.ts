#!/usr/bin/env node
import 'array-flat-polyfill';
import setupCliInterface from './cli';

function test() {
  console.log("Photogram cantara");
}

function main() {
  test();
  setupCliInterface();
}

main();
