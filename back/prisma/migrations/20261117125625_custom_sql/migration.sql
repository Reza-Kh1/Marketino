CREATE UNIQUE INDEX "wallets_one_platform_idx" ON "wallets" ("is_platform")
WHERE
    "is_platform" = true;