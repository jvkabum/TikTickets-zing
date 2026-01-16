export const jsplumbSetting = {
  // 动态锚点、位置自适应
  Anchors: [
    'Top',
    'TopCenter',
    'TopRight',
    'TopLeft',
    'Right',
    'RightMiddle',
    'Bottom',
    'BottomCenter',
    'BottomRight',
    'BottomLeft',
    'Left',
    'LeftMiddle'
  ],
  Container: 'efContainer',
  Connector: ['Bezier', { curviness: 70 }],
  ConnectionsDetachable: true,
  DeleteEndpointsOnDetach: false,
  Endpoint: ['Dot', { radius: 6 }],
  EndpointStyle: { fill: '#888888', stroke: '#666666', strokeWidth: 1 },
  LogEnabled: true,
  PaintStyle: {
    stroke: '#E0E3E7',
    strokeWidth: 1,
    outlineStroke: 'transparent',
    outlineWidth: 10
  },
  DragOptions: { cursor: 'pointer', zIndex: 2000 },
  Overlays: [
    ['Arrow', { width: 10, length: 8, location: 1, direction: 1, foldback: 0.623 }],
    ['Label', { label: '', location: 0.1, cssClass: 'aLabel' }]
  ],
  RenderMode: 'svg',
  HoverPaintStyle: { stroke: '#2e6da4', strokeWidth: 4 },
  EndpointHoverStyle: { fill: '#2196f3', stroke: '#1976d2', radius: 7 },
  Scope: 'jsPlumb_DefaultScope',
  ConnectionOverlays: [['Arrow', { width: 10, length: 10, location: 1 }]]
}

export const jsplumbConnectOptions = {
  isSource: true,
  isTarget: true,
  connector: ['Bezier', { curviness: 70 }],
  paintStyle: { strokeWidth: 3, stroke: '#8db1dd' },
  hoverPaintStyle: { stroke: '#2e6da4', strokeWidth: 4 },
  connectorStyle: { strokeWidth: 3, stroke: '#8db1dd' },
  connectorHoverStyle: { stroke: '#2e6da4', strokeWidth: 4 },
  overlays: [['Arrow', { width: 10, length: 10, location: 1 }]]
}

export const jsplumbSourceOptions = {
  filter: '.flow-node-drag',
  filterExclude: false,
  anchor: 'Continuous',
  allowLoopback: true,
  maxConnections: -1,
  isSource: true,
  endpoint: ['Dot', { radius: 6 }],
  paintStyle: { fill: '#888888', stroke: '#666666', strokeWidth: 1 },
  hoverPaintStyle: { fill: '#2196f3', stroke: '#1976d2' },
  connectorStyle: { stroke: '#8db1dd', strokeWidth: 3 },
  connectorHoverStyle: { stroke: '#2e6da4', strokeWidth: 4 },
  dragOptions: {}
}

export const jsplumbTargetOptions = {
  filter: '.flow-node-drag',
  filterExclude: false,
  anchor: 'Continuous',
  allowLoopback: true,
  isTarget: true,
  endpoint: ['Dot', { radius: 6 }],
  paintStyle: { fill: '#888888', stroke: '#666666', strokeWidth: 1 },
  hoverPaintStyle: { fill: '#2196f3', stroke: '#1976d2' },
  dropOptions: { hoverClass: 'ef-drop-hover' }
}
