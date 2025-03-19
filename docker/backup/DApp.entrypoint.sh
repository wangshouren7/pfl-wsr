#!/bin/sh
set -e

# 启动hardhat节点在后台运行
echo "启动Hardhat节点..."
pnpm turbo @pfl-wsr/dex-contracts hardhat node &

# 等待节点启动（给节点一些启动时间）
echo "等待节点启动..."
sleep 10

# 部署合约到本地网络
echo "开始部署合约..."
pnpm turbo @pfl-wsr/dex-contracts deploy:localhost

# 保持容器运行
echo "合约已部署，节点继续运行中..."

# 启动前端
echo "启动前端..."
node ./standalone/server.js

tail -f /dev/null 