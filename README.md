# Data Marketplace File Delivery
This repository contains the needed code to deliver files through ipfs for the data marketplace operations and concepts. The project is written in Node.
To run this component correctly, you should be familiar with the [Data marketplace](https://github.com/lgsvl/data-marketplace) components because there is a particular dependency between the components.


### Download and work with the code

```bash
git clone git@github.com:lgsvl/data-marketplace-file-delivery.git
cd data-marketplace-file-delivery
```



### Docker Build

You can use the dockerfile to build a docker image:
```
docker build -t file-delivery .
docker run -p 3000:3000 file-delivery
```

### Kubernetes deployment

The [deployment](./deployment) folder contains the deployment and service/ingress manifests to deploy this component.
We assume that you have a running Hyperledger Fabric network running with the [Data marketplace Chaincode](https://github.com/lgsvl/data-marketplace-chaincode) deployed on top of it as well as the [Data marketplace](https://github.com/lgsvl/data-marketplace-chaincode-rest)REST API.
