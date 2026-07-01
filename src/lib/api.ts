import { Article } from '../types';

export async function fetchRelatedArticles(title: string, lang: string = 'ru', count: number = 3): Promise<Article[]> {
  try {
    const res = await fetch(`https://${lang}.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=morelike:${encodeURIComponent(title)}&gsrlimit=${count}&prop=extracts|pageimages|info&inprop=url&exintro=1&explaintext=1&pithumbsize=640&format=json&origin=*`);
    if (!res.ok) throw new Error("Network response was not ok");
    const data = await res.json();
    const pages = data.query?.pages || {};
    
    const articles = Object.values(pages).map((p: any) => ({
      id: p.pageid || p.title,
      title: p.title,
      extract: p.extract,
      imageUrl: p.thumbnail?.source,
      url: p.fullurl || `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(p.title)}`,
      lang,
    }));
    return articles;
  } catch (e) {
    console.error("Failed to fetch related articles", e);
    return [];
  }
}

export async function searchArticles(query: string, lang: string = 'ru', count: number = 3): Promise<Article[]> {
    try {
        const res = await fetch(`https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&origin=*`);
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        const searchResults = data.query?.search || [];
        
        // Fetch summaries for the search results
        const articles: Article[] = [];
        for (const result of searchResults.slice(0, count)) {
            const summary = await fetchArticleSummary(result.title, lang);
            if (summary) articles.push(summary as Article);
        }
        return articles;
    } catch (e) {
        console.error("Failed to search articles", e);
        return [];
    }
}

export async function fetchRandomArticles(lang: string = 'ru', count: number = 3): Promise<Article[]> {
  const articles: Article[] = [];
  for (let i = 0; i < count; i++) {
    try {
      const res = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/random/summary`);
      if (!res.ok) continue;
      const data = await res.json();
      articles.push({
        id: data.pageid || data.title,
        title: data.title,
        extract: data.extract,
        imageUrl: data.originalimage?.source || data.thumbnail?.source,
        url: data.content_urls?.desktop?.page,
        lang,
      });
    } catch (e) {
      console.error("Failed to fetch random article", e);
    }
  }
  return articles;
}

export async function fetchAvailableLanguages(title: string, currentLang: string) {
  try {
    const res = await fetch(`https://${currentLang}.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=langlinks&lllimit=50&format=json&origin=*`);
    const data = await res.json();
    const pages = data.query?.pages;
    if (!pages) return [];
    const page = Object.values(pages)[0] as any;
    return page.langlinks || [];
  } catch (e) {
    console.error("Failed to fetch lang links", e);
    return [];
  }
}

export async function fetchArticleSummary(title: string, lang: string) {
  try {
    const res = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
    const data = await res.json();
    return {
      id: data.pageid || data.title,
      title: data.title,
      extract: data.extract,
      imageUrl: data.originalimage?.source || data.thumbnail?.source,
      url: data.content_urls?.desktop?.page,
      lang,
    };
  } catch (e) {
    console.error("Failed to fetch translated article", e);
    return null;
  }
}
