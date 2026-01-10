# Secret
kubectl create secret generic jwt-secret --from-literal JWT_KEY=asdf

# Kafka port forward
kubectl port-forward deploy/kafka-depl 9094:9094




# Common

Shared NestJS library for the `ticketing-ts` microservices. The package is ready to be published to npm and exposes a simple module/service you can extend with shared DTOs, guards, filters, and utilities.

## Development

- Install dependencies: `npm install`
- Run tests: `npm test`
- Lint: `npm run lint`
- Build library output: `npm run build` (emits to `dist/` with type declarations)

## Publishing

1. Update the version in `package.json` as needed.
2. Build the package (`npm run build`).
3. Publish: `npm publish --access public` (or adjust access for a private registry).

The `files` field limits the published contents to the `dist/` output so consumers receive only the compiled artifacts and type declarations.




# Run in the console to connect from outside the k8s cluster:
` kubectl port-forward deploy/kafka-depl 9094:9094`

# List topics
`kafka-topics.sh --bootstrap-server localhost:9092 --list`

# Add partitions
`kafka-topics.sh --bootstrap-server localhost:9092 --alter --topic your-topic --partitions 2`

# Delete entire topic
`kafka-topics.sh --bootstrap-server localhost:9092 --delete --topic your-topic`




# Ingress web page
`https://kubernetes.github.io/ingress-nginx/deploy/`