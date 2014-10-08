
// register to reuse
simcir.registerDevice('RS-FF',
{
  "width":600,
  "height":200,
  "toolbox":[
    {"type":"In"},
    {"type":"Out"},
    {"type":"DC"},
    {"type":"PushOff"},
    {"type":"PushOn"},
    {"type":"Toggle"},
    {"type":"NAND"}
  ],
  "devices":[
    {"type":"In","id":"dev0","x":216,"y":112,"label":"~R"},
    {"type":"NAND","id":"dev1","x":264,"y":56,"label":"NAND"},
    {"type":"NAND","id":"dev2","x":264,"y":104,"label":"NAND"},
    {"type":"Out","id":"dev3","x":312,"y":56,"label":"Q"},
    {"type":"Out","id":"dev4","x":312,"y":104,"label":"~Q"},
    {"type":"DC","id":"dev5","x":104,"y":80,"label":"DC"},
    {"type":"PushOff","id":"dev6","x":160,"y":48,"label":"PushOff"},
    {"type":"PushOff","id":"dev7","x":160,"y":112,"label":"PushOff"},
    {"type":"In","id":"dev8","x":216,"y":48,"label":"~S"}
  ],
  "connectors":[
    {"from":"dev0.0","to":"dev7.1"},
    {"from":"dev1.0","to":"dev8.1"},
    {"from":"dev1.1","to":"dev2.2"},
    {"from":"dev2.0","to":"dev1.2"},
    {"from":"dev2.1","to":"dev0.1"},
    {"from":"dev3.0","to":"dev1.2"},
    {"from":"dev4.0","to":"dev2.2"},
    {"from":"dev6.0","to":"dev5.0"},
    {"from":"dev7.0","to":"dev5.0"},
    {"from":"dev8.0","to":"dev6.1"}
  ]
}
);

simcir.registerDevice('JK-FF',
{
  "width":600,
  "height":240,
  "toolbox":[
    {"type":"In"},
    {"type":"Out"},
    {"type":"DC"},
    {"type":"PushOff"},
    {"type":"PushOn"},
    {"type":"Toggle"},
    {"type":"NAND"},
    {"type":"NAND","numInputs":3},
    {"type":"NOT"},
    {"type":"RS-FF"}
  ],
  "devices":[
    {"type":"NAND","numInputs":3,"id":"dev0","x":192,"y":152,"label":"NAND"},
    {"type":"RS-FF","id":"dev1","x":232,"y":120,"label":"RS-FF"},
    {"type":"NAND","id":"dev2","x":304,"y":152,"label":"NAND"},
    {"type":"NAND","id":"dev3","x":304,"y":88,"label":"NAND"},
    {"type":"NAND","numInputs":3,"id":"dev4","x":192,"y":88,"label":"NAND"},
    {"type":"In","id":"dev5","x":136,"y":120,"label":"CLK"},
    {"type":"In","id":"dev6","x":136,"y":72,"label":"J"},
    {"type":"In","id":"dev7","x":136,"y":168,"label":"K"},
    {"type":"RS-FF","id":"dev8","x":352,"y":120,"label":"RS-FF"},
    {"type":"NOT","id":"dev9","x":192,"y":32,"label":"NOT"},
    {"type":"Out","id":"dev10","x":432,"y":88,"label":"Q"},
    {"type":"Out","id":"dev11","x":432,"y":152,"label":"~Q"},
    {"type":"DC","id":"dev12","x":24,"y":120,"label":"DC"},
    {"type":"PushOn","id":"dev13","x":80,"y":120,"label":"PushOn"},
    {"type":"Toggle","id":"dev14","x":80,"y":168,"label":"Toggle"},
    {"type":"Toggle","id":"dev15","x":80,"y":72,"label":"Toggle"}
  ],
  "connectors":[
    {"from":"dev0.0","to":"dev5.1"},
    {"from":"dev0.1","to":"dev7.1"},
    {"from":"dev0.2","to":"dev8.2"},
    {"from":"dev1.0","to":"dev4.3"},
    {"from":"dev1.1","to":"dev0.3"},
    {"from":"dev2.0","to":"dev1.3"},
    {"from":"dev2.1","to":"dev9.1"},
    {"from":"dev3.0","to":"dev9.1"},
    {"from":"dev3.1","to":"dev1.2"},
    {"from":"dev4.0","to":"dev8.3"},
    {"from":"dev4.1","to":"dev6.1"},
    {"from":"dev4.2","to":"dev5.1"},
    {"from":"dev5.0","to":"dev13.1"},
    {"from":"dev6.0","to":"dev15.1"},
    {"from":"dev7.0","to":"dev14.1"},
    {"from":"dev8.0","to":"dev3.2"},
    {"from":"dev8.1","to":"dev2.2"},
    {"from":"dev9.0","to":"dev5.1"},
    {"from":"dev10.0","to":"dev8.2"},
    {"from":"dev11.0","to":"dev8.3"},
    {"from":"dev13.0","to":"dev12.0"},
    {"from":"dev14.0","to":"dev12.0"},
    {"from":"dev15.0","to":"dev12.0"}
  ]
}
);
