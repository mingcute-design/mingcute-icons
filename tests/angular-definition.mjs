// Synthetic renderer regression fixture, independent of the shipped artwork.
export default {
  name: 'loading_2', componentName: 'Loading2Filled', style: 'core-filled',
  viewBox: '0 0 24 24', metadata: { category: 'testing' },
  elements: [{ tag: 'path', attributes: { fill: 'url(#mgc-angular-0)', d: 'M12 2a10 10 0 1 0 10 10' } }],
  gradients: [{
    id: 'mgc-angular-0', type: 'angular',
    attributes: { opacity: 1, 'transform-m00': 3, 'transform-m01': -18, 'transform-m02': 19.5,
      'transform-m10': -18, 'transform-m11': -3, 'transform-m12': 22.5 },
    stops: [{ offset: 0, color: 'rgb(16 22 31)' }, { offset: 1, color: 'rgb(16 22 31 / 0)' }],
  }],
};
