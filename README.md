#### How to Use
To parse a BMC file, either provide a FileSystemHandle of the .arc file to BMC.parseFileSystemHandle or either a Uint8Array or ArrayBuffer to BMC.parseArrayBuffer. For example, if you were to enable drag and drop onto your page, you could do:
```js
let dropFiles = async function(e){
  e.preventDefault();
  if(e.dataTransfer.files[0].name.match(/.bmc$/)){
    e.dataTransfer.items[0].getAsFileSystemHandle().then(BMC.parseFileSystemHandle).then(colorTables=>{
      //Use the colors here
    });
  }
}
```

To create a BMC file, provide a BMC.Data object to BMC.bmcify.
```js
BMC.parseArrayBuffer(someArrayBuffer).then(colorTables=>{
  let a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([BMC.bmcify(colorTables)],{type:"application/octet-stream"}));
  a.download = "file.bmc";
  a.click();
});
```

The BMC.Data class has the following structure:
```js
BMC.Data.tables = [
  [
    {
      r:redValue,  
      g:greenValue,
      b:blueValue,
      a:alphaValue
    },
    ...
  ],
  ...
]
```

You can copy a BMC.Data object by passing one such object into its constructor.
```js
BMC.parseArrayBuffer(someArrayBuffer).then(colorTables=>{
  let colorTableCopy = new BMC.Data(colorTables);
});
```

The function signatures are as follows:
```js
RARC.parseFileSystemHandle(FileSystemHandle) -> Promise -> BMC.Data
RARC.parseArrayBuffer(ArrayBuffer)           -> Promise -> BMC.Data
RARC.parseArrayBuffer(Uint8Array)            -> Promise -> BMC.Data
RARC.bmgify(BMC.Data)                        -> Uint8Array
```
