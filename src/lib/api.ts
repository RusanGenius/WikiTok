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
    console.warn("Failed to fetch related articles via Wikipedia API, using predefined fallback...", e);
    const list = PREDEFINED_ARTICLES[lang] || PREDEFINED_ARTICLES['en'] || [];
    return list.filter(art => art.title !== title).slice(0, count);
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
        console.warn("Failed to search articles via Wikipedia API, using predefined fallback...", e);
        const list = PREDEFINED_ARTICLES[lang] || PREDEFINED_ARTICLES['en'] || [];
        const q = query.toLowerCase();
        return list.filter(art => art.title.toLowerCase().includes(q) || art.extract.toLowerCase().includes(q)).slice(0, count);
    }
}

const PREDEFINED_ARTICLES: Record<string, Article[]> = {
  ru: [
    {
      id: "all_universe",
      title: "Вселенная",
      extract: "Вселенная — весь существующий материальный мир, безграничный во времени и пространстве и бесконечно разнообразный по формам, которые принимает материя в процессе своего развития. Вселенная включает в себя все галактики, звёзды, планеты, межгалактическое пространство, а также тёмную материю и тёмную энергию. Изучением Вселенной занимается наука космология.",
      imageUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80",
      url: "https://ru.wikipedia.org/wiki/Вселенная",
      lang: "ru"
    },
    {
      id: "all_earth",
      title: "Земля",
      extract: "Земля — третья от Солнца планета Солнечной системы. Самая плотная, пятая по диаметру и массе среди всех планет и крупнейшая среди планет земной группы. Единственное известное человеку тело во Вселенной, населённое живыми организмами. Земля образовалась около 4,54 миллиарда лет назад из протопланетного диска.",
      imageUrl: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=1200&q=80",
      url: "https://ru.wikipedia.org/wiki/Земля",
      lang: "ru"
    },
    {
      id: "all_wikipedia",
      title: "Википедия",
      extract: "Википедия — многоязычная универсальная интернет-энциклопедия со свободным контентом, реализуемая на принципах вики. Википедия — самый крупный и наиболее популярный справочник в Интернете. Название образовано от слов «вики» (технология создания сайтов) и «энциклопедия».",
      imageUrl: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80",
      url: "https://ru.wikipedia.org/wiki/Википедия",
      lang: "ru"
    }
  ],
  en: [
    {
      id: "all_universe_en",
      title: "Universe",
      extract: "The universe is all of space and time and their contents, including planets, stars, galaxies, and all other forms of matter and energy. While the spatial size of the entire universe is unknown, it is possible to measure the size of the observable universe, which is approximately 93 billion light-years in diameter at the present day.",
      imageUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80",
      url: "https://en.wikipedia.org/wiki/Universe",
      lang: "en"
    },
    {
      id: "all_earth_en",
      title: "Earth",
      extract: "Earth is the third planet from the Sun and the only astronomical object known to harbor life. About 29.2% of Earth's surface is land consisting of continents and islands. The remaining 70.8% is covered with water, mostly by oceans, seas, and gulfs, but also by lakes, rivers, and other freshwater, which together constitute the hydrosphere.",
      imageUrl: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=1200&q=80",
      url: "https://en.wikipedia.org/wiki/Earth",
      lang: "en"
    },
    {
      id: "all_wikipedia_en",
      title: "Wikipedia",
      extract: "Wikipedia is a free-content online encyclopedia written and maintained by a community of volunteers, known as Wikipedians, through open collaboration. Wikipedia is the largest and most-read reference work in history. It is consistently ranked as one of the ten most popular websites in the world.",
      imageUrl: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80",
      url: "https://en.wikipedia.org/wiki/Wikipedia",
      lang: "en"
    }
  ]
};

export async function fetchRandomArticles(lang: string = 'ru', count: number = 3): Promise<Article[]> {
  // Method 1: Try Action API
  try {
    const res = await fetch(`https://${lang}.wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&grnlimit=${count}&prop=extracts|pageimages|info&inprop=url&exintro=1&explaintext=1&pithumbsize=640&format=json&origin=*`);
    if (res.ok) {
      const data = await res.json();
      const pages = data.query?.pages || {};
      const articles = Object.values(pages).map((p: any) => ({
        id: p.pageid || p.title,
        title: p.title,
        extract: p.extract || "",
        imageUrl: p.thumbnail?.source,
        url: p.fullurl || `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(p.title)}`,
        lang,
      })).filter(art => art.extract.length > 50); // Filter out extremely short or empty pages

      if (articles.length > 0) {
        return articles;
      }
    }
  } catch (e) {
    console.warn("Failed to fetch random articles via Action API, trying REST API fallback...", e);
  }

  // Method 2: Try REST API as fallback
  try {
    const articles: Article[] = [];
    for (let i = 0; i < count; i++) {
      const res = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/random/summary`);
      if (res.ok) {
        const data = await res.json();
        if (data.extract) {
          articles.push({
            id: data.pageid || data.title,
            title: data.title,
            extract: data.extract,
            imageUrl: data.originalimage?.source || data.thumbnail?.source,
            url: data.content_urls?.desktop?.page,
            lang,
          });
        }
      }
    }
    if (articles.length > 0) {
      return articles;
    }
  } catch (e) {
    console.warn("Failed to fetch random articles via REST API, trying predefined fallback...", e);
  }

  // Method 3: Fallback to Beautiful Predefined Articles
  const fallbackList = PREDEFINED_ARTICLES[lang] || PREDEFINED_ARTICLES['en'] || [];
  // Shuffle/randomize the fallback list slightly to make it feel dynamic
  return [...fallbackList].sort(() => Math.random() - 0.5).slice(0, count);
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
    const res = await fetch(`https://${lang}.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=extracts|pageimages|info&inprop=url&exintro=1&explaintext=1&pithumbsize=640&format=json&origin=*`);
    if (!res.ok) throw new Error("Network response was not ok");
    const data = await res.json();
    const pages = data.query?.pages || {};
    const page = Object.values(pages)[0] as any;
    if (!page || page.missing !== undefined) return null;
    return {
      id: page.pageid || page.title,
      title: page.title,
      extract: page.extract || "",
      imageUrl: page.thumbnail?.source,
      url: page.fullurl || `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(page.title)}`,
      lang,
    };
  } catch (e) {
    console.error("Failed to fetch article summary", e);
    return null;
  }
}
