'use strict'

const express = require('express')
const app = express()
const ipfs = require('./StorageConnector/IPFSConnector.js')
const contractService = require('./ServiceConnector/ContractServiceConnector.js')
const path = require('path')
const multer = require('multer')
const fs = require('fs')
const MAX_SIZE = 103809024
const uploadDirectory = 'upload'
const downloadDirectory = 'download'
const cors = require('cors')

app.use(cors())

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory)
}
if (!fs.existsSync(downloadDirectory)) {
  fs.mkdirSync(downloadDirectory)
}

const storage = multer.diskStorage({
  destination (req, file, cb) {
    cb(null, uploadDirectory)
  },
  filename (req, file, cb) {
    cb(null, `${file.originalname}`)
  }
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_SIZE
  }
})

const type = upload.single('file')

function deleteFile (filePath) {
  try {
    fs.unlink(filePath)
  } catch (e) {
    console.log(`Error removing: ${filePath}`)
  }
}

app.post('/v1/:storageConnector/', type, function (req, res) {
  if (!req.file) {
    return res.status(422).json({
      error: `File needs to be provided.`
    })
  }

  const fileSize = req.file.size
  if (fileSize > MAX_SIZE) {
    return res.status(422).json({
      error: `File needs to be smaller than ${MAX_SIZE} bytes.`
    })
  }

  const storageConnectorType = req.params.storageConnector
  const authorizationHeader = req.headers.authorization
  const contractId = req.headers.contractid
  const fileToUpload = req.file.path
  var storageConnector = ipfs

  switch (storageConnectorType) {
    case 'ipfs' :
      storageConnector = ipfs
      break
    default:
      storageConnector = ipfs
      break
  }

  contractService.validateContract(contractId, authorizationHeader)
    .then((result) => {
      console.log(`Validated Contract-Id: ${contractId}`)
      return storageConnector.upload(fileToUpload)
    })
    .then((result) => {
      console.log(`File Uploaded: ${fileToUpload}`)
      deleteFile(fileToUpload)
      return contractService.addHashToBlockChain(result.hash, contractId, authorizationHeader)
    })
    .then((result) => {
      res.status(200).send(result)
    })
    .catch((err) => {
      if (err) {
        console.log(err)
      }
      res.status(403).send({
        error: {
          description: `Upload to IPFS failed for contract: ${contractId}`,
          details: err
        }
      })
    })
})

app.get('/v1/:storageConnector/:hash', function (req, res) {
  const fileHashCode = req.params.hash
  const contractId = req.headers.contractid
  const authorizationHeader = req.headers.authorization
  const destFilePath = path.join(__dirname, downloadDirectory, req.params.hash)
  const storageConnectorType = req.params.storageConnector

  var storageConnector = ipfs
  switch (storageConnectorType) {
    case 'ipfs' :
      storageConnector = ipfs
      break
    default:
      storageConnector = ipfs
      break
  }

  contractService.validateContract(contractId, authorizationHeader)
    .then((result) => {
      console.log(`Validated Contract-Id: ${contractId}`)
      return storageConnector.download(fileHashCode, destFilePath)
    })
    .then((result) => {
      return contractService.updateBlockchainForFileReceived(contractId, authorizationHeader)
    })
    .then((result) => {
      console.log(`Transaction registred to Blockchain: ${contractId}`)
      res.status(200).sendFile(destFilePath, function (err) {
        if (err) {
          console.log(err)
        }
        deleteFile(destFilePath)
      })
    })
    .catch((err) => {
      if (err) {
        console.log(err)
      }
      res.status(403).send({
        error: {
          description: `Download failed for contract: ${contractId} and hash: ${fileHashCode}`,
          details: err
        }
      })
    })
})

app.listen(3000, () => console.log(`App listening on port 3000!`))
