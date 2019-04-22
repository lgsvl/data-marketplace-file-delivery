/*
 Copyright (c) 2019 LG Electronics Inc.
 SPDX-License-Identifier: Apache-2.0
*/

const IPFS = require('ipfs-api')
const config = require('config')
const ipfsConfig = config.get('ipfs.config')
const ipfs = new IPFS(ipfsConfig)
const fs = require('fs')

exports.upload = function uploadFileToIPFS (filePath) {
  console.log(`Uploading File: ${filePath}`)
  const files = [
    {
      path: filePath,
      content: fs.readFileSync(filePath)
    }
  ]
  return new Promise((resolve, reject) => {
    ipfs.files.add(files, (err, files) => {
      if (err) {
        return reject(err)
      }
      return resolve({ hash: files[0].hash })
    })
  })
}

exports.download = function IPFSdownload (hash, destFilePath) {
  return new Promise((resolve, reject) => {
    ipfs.files.get(hash, (err, files) => {
      if (err) {
        return reject(err)
      }
      files.forEach((file) => {
        fs.writeFile(destFilePath, file.content, (err) => {
          if (err) {
            return reject(err)
          } else {
            return resolve()
          }
        })
      })
    })
  })
}
