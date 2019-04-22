/*
 Copyright (c) 2019 LG Electronics Inc.
 SPDX-License-Identifier: Apache-2.0
*/

const request = require('request')
const contractServiceHost = process.env.CHAIN_SERVICE_HOST

exports.validateContract = function validateContract (contractId, authorizationToken) {
  return new Promise((resolve, reject) => {
    console.log(`Validating Contract-Id: ${contractId}`)
    request.get({
      url: `${contractServiceHost}api/DataContract/${contractId}`,
      header: {
        'Authorization': authorizationToken
      }
    }, (err, response, body) => {
      if (err || response.statusCode !== 200) {
        console.log(`Invalid Contract-Id: ${contractId}`)
        return reject(err)
      }
      return resolve(body)
    })
  })
}

exports.addHashToBlockChain = function addHashToBlockChain (hash, contractId, authorizationToken) {
  return new Promise((resolve, reject) => {
    console.log(`Updating Contract-Id: ${contractId} for new hash`)
    request.post({
      url: `${contractServiceHost}api/DataInfoSentToConsumer`,
      header: {
        'Authorization': authorizationToken
      },
      body: {
        'hash': {
          'method': 'md5',
          'value': hash
        },
        'dataContract': `${contractId}`
      },
      json: true
    }, (err, response, body) => {
      if (err || response.statusCode !== 200) {
        console.log(`Invalid Contract-Id: ${contractId}, Error: ${err}`)
        return reject(err)
      }
      return resolve({
        'hash': hash
      })
    })
  })
}

exports.updateBlockchainForFileReceived = function updateBlockchainForFileReceived (contractId, authorizationToken) {
  return new Promise((resolve, reject) => {
    request.post({
      url: `${contractServiceHost}api/DataReceivedByConsumer`,
      header: {
        'Authorization': authorizationToken
      },
      body: {
        'dataContract': `${contractId}`,
      },
      json: true
    }, (err, response, body) => {
      if (err || response.statusCode !== 200) {
        console.log(`Invalid Contract-Id: ${contractId}`)
        return reject(err)
      }
      return resolve(body)
    })
  })
}
