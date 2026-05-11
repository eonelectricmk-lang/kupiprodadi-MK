import type { Metadata } from 'next';
import getDb from '@/lib/db';
import { getCategoryTree } from '@/lib/category-store';
import { normalizeCategorySlug } from '@/lib/category-aliases';
import CategoryPageClient from './CategoryPageClient';

type PageProps = {
  params: Promise<{ slug: string }>;
};

function buildDescription(categoryName: string) {
  return `Прегледај огласи во категоријата ${categoryName} на КупиПродади.`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = normalizeCategorySlug(resolvedParams.slug);
  const db = getDb();
  const categories = getCategoryTree(db, true);
  let foundCategory = false;

  let categoryName = slug;
  for (const category of categories) {
    if (normalizeCategorySlug(category.slug) === slug) {
      categoryName = category.name;
      foundCategory = true;
      break;
    }

    const matchedSubcategory = category.subcategories.find((sub) => normalizeCategorySlug(sub.slug) === slug);
    if (matchedSubcategory) {
      categoryName = matchedSubcategory.name;
      foundCategory = true;
      break;
    }
  }

  const title = `${categoryName} огласи | КупиПродади`;
  const description = buildDescription(categoryName);

  return {
    title,
    description,
    robots: foundCategory
      ? {
          index: true,
          follow: true,
        }
      : {
          index: false,
          follow: false,
        },
    alternates: {
      canonical: `/categories/${slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = normalizeCategorySlug(resolvedParams.slug);
  const db = getDb();
  const categories = getCategoryTree(db, true);
  let categoryName = '';

  for (const category of categories) {
    if (normalizeCategorySlug(category.slug) === slug) {
      categoryName = category.name;
      break;
    }

    const matchedSubcategory = category.subcategories.find((sub) => normalizeCategorySlug(sub.slug) === slug);
    if (matchedSubcategory) {
      categoryName = matchedSubcategory.name;
      break;
    }
  }

  return <CategoryPageClient slug={slug} initialCategoryName={categoryName} />;
}
