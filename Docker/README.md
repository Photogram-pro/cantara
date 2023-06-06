This Dockerfile can be used to build a Node.js 14-based image with the current Cantara-ph version installed.

[Package Repo](https://github.com/Photogram-pro/cantara/pkgs/container/cantara)

## How to Build:
- Run `docker build --tag cantara-ph:<tag> -f ./Dockerfile .`
- For Apple Silicon Mac, run `docker buildx build --platform linux/amd64 -t cantara-ph:<tag> .`

## How to Publish to the GitHub Package Repository:
- Tag the image with the command `docker tag <image-id> ghcr.io/photogram-pro/cantara:<tag>`
- Log in to the GitHub Package Registry using `docker login ghcr.io -u <github username> -p <personal access token>`
- Push the image to the GitHub Package Registry with `docker push ghcr.io/photogram-pro/cantara:<tag>`
