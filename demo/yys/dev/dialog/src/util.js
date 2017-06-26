'use strict';
const MODAL_EVENTS = {
  OPEN: 'open',
  CLOSE: 'close',
  DESTROY: 'destroy'
};

let $body = null;

function getBody() {
  if (!$body) {
    $body = $('body');
  }
  return $body;
}

// 弹层层次管理
let layerCount = 0;
let layerIndex = 1000;

function getLayerIndex() {
  layerCount++;
  return layerIndex += 2;
}

function recoverLayer() {
  layerCount--;
  if (layerCount <= 0) {
    layerIndex = 1000;
  }
}
