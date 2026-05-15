import type { Metadata } from 'next';
import getDb from '@/lib/db';
import { getCategoryTree } from '@/lib/category-store';
import { normalizeCategorySlug } from '@/lib/category-aliases';
import ProductDetailsClient from './ProductDetailsClient';

type PageProps = {
  params: Promise<{ id: string }>;
};

function buildDescription(title: string, description?: string, categoryLabel?: string) {
  const base = description?.trim().replace(/\s+/g, ' ') || `Погледни го огласот за ${title}.`;
  const suffix = categoryLabel ? ` Категорија: ${categoryLabel}.` : '';
  const combined = `${base}${suffix}`.trim();
  return combined.length > 160 ? `${combined.slice(0, 157)}...` : combined;
}

export async function generateMetadata({ params, searchParams }: PageProps & { searchParams: Promise<{ seller_id?: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const id = Number(resolvedParams.id);
  const db = getDb();
  const sellerId = resolvedSearch.seller_id ? Number(resolvedSearch.seller_id) : 0;

  const product = db.prepare(`
    SELECT id, status, title, description, category, subcategory, image_url
    FROM products
    WHERE id = ? AND (status = 'active' OR (status = 'pending' AND seller_id = ?))
  `).get(id, sellerId) as
    | {
        id: number;
        status: string;
        title: string;
        description: string;
        category: string;
        subcategory: string | null;
        image_url: string | null;
      }
    | undefined;

  if (!product) {
    return {
      title: 'Огласот не постои | КупиПродади',
      description: 'Огласот што го барате не е достапен.',
      robots: {
        index: false,
        follow: false,
      },
      alternates: {
        canonical: `/products/${resolvedParams.id}`,
      },
    };
  }

  const categories = getCategoryTree(db, true);
  const rawCat = (product.category || '').trim();
  const rawSub = (product.subcategory || '').trim();
  const normalizedCategory = normalizeCategorySlug(rawCat);
  const normalizedSubcategory = normalizeCategorySlug(rawSub);

  let categoryLabel = '';
  for (const category of categories) {
    const catSlug = normalizeCategorySlug(category.slug);
    if (catSlug === normalizedCategory || category.name === rawCat) {
      const matchedSubcategory = category.subcategories.find(
        (sub) => normalizeCategorySlug(sub.slug) === normalizedSubcategory || sub.name === rawSub,
      );
      categoryLabel = matchedSubcategory ? `${category.name} / ${matchedSubcategory.name}` : category.name;
      break;
    }

    const matchedSubcategory = category.subcategories.find(
      (sub) => normalizeCategorySlug(sub.slug) === normalizedCategory || sub.name === rawCat,
    );
    if (matchedSubcategory) {
      categoryLabel = `${category.name} / ${matchedSubcategory.name}`;
      break;
    }
  }

  const image = product.image_url || undefined;
  const title = `${product.title} | КупиПродади`;
  const description = buildDescription(product.title, product.description, categoryLabel);

  return {
    title,
    description,
    robots: {
      index: product.status === 'active',
      follow: product.status === 'active',
    },
    alternates: {
      canonical: `/products/${resolvedParams.id}`,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      images: image ? [{ url: image, alt: product.title }] : undefined,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function AdDetailsPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <ProductDetailsClient id={resolvedParams.id} />;
}
