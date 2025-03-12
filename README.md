# pfl-wsr

Build and deploy Next.js practical cases.

## Apps

| Name              | Description                       | Staging website                                 | Production website                      |
| ----------------- | --------------------------------- | ----------------------------------------------- | --------------------------------------- |
| Notes             | A Notes application               | https://notes.staging.pfl-wsr.store             | https://notes.pfl-wsr.store             |
| Stackoverflow     | Stackoverflow clone               | https://stackoverflow.staging.pfl-wsr.store     | https://stackoverflow.pfl-wsr.store     |
| large-file-upload | Large file upload, chunks enabled | https://large-file-upload.staging.pfl-wsr.store | https://large-file-upload.pfl-wsr.store |

## Develop application

- Configure your environment variables in `configs/next/.env.local`, you can see the details in [configs/next/.env.local.example](./configs/next/.env.local.example)

As this repo is only for learn, this is the default environment for pasting:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_c3RpcnJlZC1mbGVhLTMuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_Xx0zLQaur636egnWNgSPADqUxgT6U9vzno2DZ8W6g1
```

- Setup database

```bash
docker compose -f ./db.docker-compose.yml up
```

- Compile libs

```
pnpm turbo compile
```

> This is required because `pnpm dev` needs to run dev command provided by tool `@pfl-wsr/cli`.

- Start dev server

```bash
pnpm dev
```

or run the following command in any folder inside the repo:

```bash
pnpm -w dev
```

## Develop libraries

```bash
pnpm turbo compile:watch
```

## Deployment

- For production deployment: See [Deploy production](./deploy/production/README.md)

- For staging deployment: See [Deploy staging](./deploy/staging/README.md)

## Todo list

| Task                                                       | Complete | Developing |
| ---------------------------------------------------------- | -------- | ---------- |
| Deploy as changed                                          | 1        |            |
| Env refactor                                               | 1        |            |
| CI for check                                               | 1        |            |
| Development flow                                           | 1        |            |
| Webhook                                                    |          |            |
| Fix styles for `stackoverflow`                             | 1        |            |
| Dep check                                                  |          |            |
| Git commit message lint                                    | 1        |            |
| The flow of publish libraries                              | 1        |            |
| Research turbo generators                                  |          |            |
| Replace next config with `@pfl-wsr/next-config`            | 1        |            |
| Refactor all consoles                                      | 1        |            |
| Console env                                                | 1        |            |
| Extract shared next config to plugin                       |          |            |
| Replace clerk.js key to production                         |          |            |
| Translate to English                                       |          |            |
| i18n                                                       |          |            |
| Prisma cache                                               |          |            |
| Deploy                                                     |          |            |
| App logo                                                   |          |            |
| Centralized management of authentication and Authorization |          |            |
| Index page                                                 |          |            |
| Enable Docker cache in CI                                  |          |            |
| Fix the `createUserIfNeeded`                               |          |            |
| Turbo remote cache                                         | 1        |            |
| Do e2e test in CI                                          |          |            |
| CI file reuse                                              | 1        |            |
| CI refactor                                                |          | 1          |
| SENTRY                                                     |          |            |

## Contributions

Feel free to open issues or submit pull requests if you have any improvements or find any bugs.

## License

This project is licensed under the MIT License.

## References

- [examples-next-prisma-starter](https://github.com/trpc/examples-next-prisma-starter/blob/main/package.json)
- [blitz](https://github.com/blitz-js/blitz/tree/main)
- [Next-js-Boilerplate](https://github.com/ixartz/Next-js-Boilerplate/tree/main)
- [create-t3-app](https://github.com/t3-oss/create-t3-app/blob/main/.github/workflows/ci.yml)
- [nextjs-monorepo-example](https://github.com/belgattitude/nextjs-monorepo-example)
