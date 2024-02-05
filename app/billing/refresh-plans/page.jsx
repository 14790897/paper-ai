/* /app/billing/refresh-plans/page.jsx */

import prisma from "@/lib/prisma";
import LemonSqueezy from "@lemonsqueezy/lemonsqueezy.js";

const ls = new LemonSqueezy(process.env.LEMONSQUEEZY_API_KEY);

export const dynamic = "force-dynamic"; // Don't cache API results

async function getPlans() {
  const params = { include: ["product"], perPage: 50 };

  let hasNextPage = true;
  let page = 1;

  let variants = [];
  let products = [];

  while (hasNextPage) {
    const resp = await ls.getVariants(params);

    variants = variants.concat(resp["data"]);
    products = products.concat(resp["included"]);

    if (resp["meta"]["page"]["lastPage"] > page) {
      page += 1;
      params["page"] = page;
    } else {
      hasNextPage = false;
    }
  }

  // Nest products inside variants
  const prods = {};
  for (let i = 0; i < products.length; i++) {
    prods[products[i]["id"]] = products[i]["attributes"];
  }
  for (let i = 0; i < variants.length; i++) {
    variants[i]["product"] = prods[variants[i]["attributes"]["product_id"]];
  }
}
export default async function Page() {
  await getPlans();

  return <p>Done!</p>;
}
