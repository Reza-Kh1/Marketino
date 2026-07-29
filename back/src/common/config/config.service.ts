const configServices = () => ({
  s3: {
    endpoint: process.env.S3_ENDPOINT,
    accessKey: process.env.S3_ACCESS_KEY,
    secretKey: process.env.S3_SECRET_KEY,
    bucket: process.env.S3_BUCKET_NAME,
    region: process.env.S3_REGION,
  },
  limit: {
    product: process.env.ALL_PRODUCTS || 10,
    blogs: process.env.ALL_BLOGS || 10,
    users: process.env.ALL_USERS || 10,
    discounts: process.env.ALL_DISCOUNTS || 10,
    orders: process.env.ALL_ORDERS || 10,
    wishlists: process.env.ALL_WISHLISTS || 10,
    reviews: process.env.ALL_REVIEWS || 10,
    medias: process.env.ALL_MEDIAS || 10,
    carts: process.env.ALL_CARTS || 10,
  }
});

export default configServices;
