This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Container CI/CD

Pull requests targeting `main` run `npm ci`, lint, and the production Next.js
build. A push to `main` builds a standalone production image and publishes both
of these tags:

- `ghcr.io/mju-sw-engineering/todo-fe:latest`
- `ghcr.io/mju-sw-engineering/todo-fe:<commit-sha>`

After the image is published, GitHub Actions calls the Coolify deploy webhook.
The image listens on port `3000` and runs as the non-root `node` user.

### GitHub configuration

Create this Actions repository variable:

- `NEXT_PUBLIC_API_URL`: public production API origin used by browser code

Create these Actions repository secrets:

- `COOLIFY_FE_WEBHOOK_URL`: deploy webhook of the image-based Coolify resource
- `COOLIFY_API_TOKEN`: Coolify API token with deploy permission

`NEXT_PUBLIC_API_URL` is compiled into the browser bundle during `next build`.
Changing it requires publishing a new image. Server-only secrets such as
`ELEVENLABS_API_KEY` must not be passed as Docker build arguments.

### Coolify migration

1. Create a Docker image resource using
   `ghcr.io/mju-sw-engineering/todo-fe:latest`.
2. Configure the container port as `3000` and add `ELEVENLABS_API_KEY` as a
   runtime environment variable.
3. If the GHCR package is private, configure registry credentials with package
   read permission.
4. Copy the new resource's deploy webhook into `COOLIFY_FE_WEBHOOK_URL`.
5. Deploy and verify the image resource before moving `todo.bluerack.org` to it.
6. After the new resource is healthy, disable the previous Git-source Auto
   Deploy and remove the old GitHub push webhook to prevent duplicate deploys.

For the first rollout, the image publish step completes before the workflow
checks the Coolify secrets. If the image resource and its webhook do not exist
yet, the final deploy step can fail while still leaving the initial GHCR image
available. Configure the resource and secrets, then rerun the workflow.
