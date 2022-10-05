const rhino3dm = require('rhino3dm')
const fs = require('fs')

let rhino
const filePath = ''

async function readFile3dm() {
  rhino = await rhino3dm()

  const buffer = fs.readFileSync(filePath)
  const byteArray = new Int8Array(buffer)
  const file3dm = rhino.File3dm.fromByteArray(byteArray)

  const objects = file3dm.objects()

  for (let i = 0; i < objects.count; i++) {
    console.log(objects.get(i).geometry())
  }
}

readFile3dm()
