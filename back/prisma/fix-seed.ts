/**
 * Quick fix: Add images to existing products and set admin isSuperAdmin
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Fix admin isSuperAdmin
  const admin = await prisma.user.findUnique({ where: { username: 'admin' } });
  if (admin) {
    await prisma.user.update({
      where: { username: 'admin' },
      data: { isSuperAdmin: true, permissions: '["all"]' },
    });
    console.log('✅ Admin isSuperAdmin set to true');
  }

  // 2. Add images to products that don't have any
  const products = await prisma.product.findMany({
    include: { images: true },
  });

  console.log(`📦 Found ${products.length} products`);

  for (const product of products) {
    if (product.images.length > 0) {
      console.log(`⏭️ ${product.title} already has ${product.images.length} images`);
      continue;
    }

    const imageCount = 3 + Math.floor(Math.random() * 3); // 3-5 images
    for (let i = 1; i <= imageCount; i++) {
      await prisma.productImage.create({
        data: {
          url: `https://picsum.photos/seed/${product.slug}-${i}/600/600`,
          alt: `${product.title} - تصویر ${i}`,
          sortOrder: i,
          isMain: i === 1,
          productId: product.id,
        },
      });
    }
    console.log(`🖼️ Added ${imageCount} images to: ${product.title}`);
  }

  console.log('✅ All fixes applied!');
}

main()
  .catch(e => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
