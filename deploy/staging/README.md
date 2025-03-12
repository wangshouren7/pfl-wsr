# next.js-practical-cases - deploy production

## Deploy by hand

### Prerequisites

Ensure you have Docker and Docker Compose installed on your machine. You can check the installation with the following commands:

```bash
docker --version
docker-compose --version
```

### Setup

Place this directory to the server.

You can clone this project:

```bash
git clone https://github.com/xiaosen7/pfl-wsr/tree/develop -b main --depth 1
```

And `cd` to this directory

```bash
cd ./pfl-wsr/deploy/develop
```

### Generate SSL

Use the following command to generate SSL Certificate for this project domain.

```bash
docker compose -f ./docker-compose.ssl.yml up
```

The following console output will be shown.

```bash
certbot  |
certbot  | Successfully received certificate.
# ...
certbot  | If you like Certbot, please consider supporting our work by:
certbot  |  * Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
certbot  |  * Donating to EFF:                    https://eff.org/donate-le
certbot  | - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
```

Then you can press `Ctrl + C` to stop the process.

**Note**: If you encounter any issues with the SSL generation, ensure that the domain's DNS records are properly configured to point to your server.

### Startup containers

Use the following command to start up containers.

```bash
docker compose up -d
```

To check the status of containers, use:

```bash
docker ps
```

You will see the info like this:

```bash
CONTAINER ID   IMAGE                                             COMMAND                   CREATED          STATUS                    PORTS                                            NAMES
d6517d01c1c7   nginx:latest                                      "/docker-entrypoint.…"   14 minutes ago   Up 14 minutes             0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp         nginx
33c54bd9356b   ghcr.io/xiaosen7/pfl-wsr-notes:staging               "docker-entrypoint.s…"   14 minutes ago   Up 14 minutes             0.0.0.0:3001->3000/tcp                           notes
139a80149fd5   ghcr.io/xiaosen7/pfl-wsr-template:staging            "docker-entrypoint.s…"   14 minutes ago   Up 14 minutes             0.0.0.0:3000->3000/tcp                           template
976f22d70635   ghcr.io/xiaosen7/pfl-wsr-large-file-upload:staging   "docker-entrypoint.s…"   14 minutes ago   Up 14 minutes             0.0.0.0:9999->9999/tcp, 0.0.0.0:3003->3000/tcp   large-file-upload
91d21bae9ef5   ghcr.io/xiaosen7/pfl-wsr-stackoverflow:staging       "docker-entrypoint.s…"   14 minutes ago   Up 14 minutes             0.0.0.0:3002->3000/tcp                           stackoverflow
bff8f3954623   postgres:16                                       "docker-entrypoint.s…"   14 minutes ago   Up 14 minutes (healthy)   0.0.0.0:5432->5432/tcp                           postgres
f2529dd24685   certbot/certbot                                   "/bin/sh -c 'trap ex…"   14 minutes ago   Up 14 minutes             80/tcp, 443/tcp                                  certbot
```

## Cheat sheet

```bash
# Load env vars
export $(grep -v '^#' ~/.env.local | xargs)
# Pull the latest image
docker compose pull <app>
# Restart container
docker compose up -d <app>
# Clear unused images
docker image prune -f
```

To kill all containers in current machine:

```bash
docker kill $(docker ps -q) && docker rm $(docker ps -a -q)
```

## Notes

- Make sure your `.env.local` file is properly configured with the required environment variables before starting the containers.
- Monitor the container logs to ensure everything is running smoothly:

```bash
docker logs <container-name>
```

Replace <container_name> with the name of the container you want to monitor.
