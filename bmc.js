let BMC = {
  parseFileSystemHandle(handle){
    return new Promise(res=>{
      handle.getFile().then(f=>{
        let fr = new FileReader();
        fr.onload = ()=>BMC.parseArrayBuffer(fr.result).then(res);
        fr.readAsArrayBuffer(f);
      });
    });
  },
  parseArrayBuffer(buffer){
    buffer = new Uint8Array(buffer);
    let view = new DataView(buffer.buffer);
    let tableCount = view.getUint32(12);
    let tables = new Array(tableCount);
    let pointer = 32;
    for(let i=0;i<tableCount;i++){
      pointer = Math.ceil(pointer/32)*32+8;
      let version = buffer[pointer];
      pointer+=6;
      let colorCount = view.getUint16(pointer);
      pointer+=2;
      let colors = new Array(colorCount);
      colors.version = version;
      for(let j=0;j<colorCount;j++){
        colors[j] = {
          r:buffer[pointer],
          g:buffer[pointer+1],
          b:buffer[pointer+2],
          a:buffer[pointer+3]
        };
        pointer+=4;
      }
      tables[i] = colors;
    }
    return new Promise(res=>res(new BMC.Data(tables)));
  },
  bmcify(data){
    let fileSize = 32+data.tables.reduce((a,c)=>a+Math.ceil((c.length*4+16)/32)*32,0);
    let buffer = new Uint8Array(fileSize);
    let view = new DataView(buffer.buffer);
    let te = new TextEncoder();
    buffer.set(te.encode("MGCLbmc1"),0);
    view.setUint32(8,fileSize);
    view.setUint16(14,data.tables.length);
    let pointer = 32;
    let header = te.encode("CLT1");
    for(let [i,t] of data.tables.entries()){
      pointer = Math.ceil(pointer/32)*32;
      buffer.set(header,pointer);
      pointer+=4;
      view.setUint16(pointer,i);
      pointer+=2;
      view.setUint16(pointer,Math.ceil((16+t.length*4)/32)*32);
      pointer+=2;
      view.setUint8(pointer,t.version);
      pointer+=6;
      view.setUint16(pointer,t.length);
      pointer+=2;
      for(let c of t){
        buffer[pointer] = c.r;
        buffer[pointer+1] = c.g;
        buffer[pointer+2] = c.b;
        buffer[pointer+3] = c.a;
        pointer+=4;
      }
    }
    return buffer;
  },
  Data:function(tables=[]){
    if(tables instanceof BMC.Data){
      let old = arguments[0];
      this.tables = new Array(old.tables.length);
      for(let [i,t] of old.tables.entries()){
        this.tables[i] = new Array(t.length);
        for(let [j,c] of t.entries())
          this.tables[i][j] = {r:c.r,g:c.g,b:c.b,a:c.a};
      }
      return this;
    }
    this.tables = tables;
  }
}
