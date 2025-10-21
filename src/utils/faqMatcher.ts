interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

// Simple string similarity using Levenshtein distance
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j - 1] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j] + 1
        );
      }
    }
  }

  return dp[m][n];
}

function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  // Exact match
  if (s1 === s2) return 100;
  
  // Contains match
  if (s1.includes(s2) || s2.includes(s1)) return 85;
  
  // Levenshtein distance similarity
  const maxLen = Math.max(s1.length, s2.length);
  const distance = levenshteinDistance(s1, s2);
  const similarity = ((maxLen - distance) / maxLen) * 100;
  
  return similarity;
}

function extractKeywords(text: string): string[] {
  const stopWords = ['what', 'how', 'when', 'where', 'why', 'is', 'are', 'can', 'do', 'does', 'the', 'a', 'an', 'to', 'for', 'of', 'in', 'on'];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.includes(word));
}

function keywordMatch(query: string, faqQuestion: string): number {
  const queryKeywords = extractKeywords(query);
  const faqKeywords = extractKeywords(faqQuestion);
  
  if (queryKeywords.length === 0 || faqKeywords.length === 0) return 0;
  
  const matches = queryKeywords.filter(qk =>
    faqKeywords.some(fk => fk.includes(qk) || qk.includes(fk))
  );
  
  return (matches.length / queryKeywords.length) * 100;
}

export interface FAQMatch {
  question: string;
  answer: string;
  category: string;
  confidence: number;
}

export function findBestFAQMatch(userQuery: string, faqs: FAQItem[]): FAQMatch | null {
  if (!userQuery.trim() || faqs.length === 0) return null;

  let bestMatch: FAQMatch | null = null;
  let highestScore = 0;

  for (const faq of faqs) {
    // Calculate different similarity scores
    const exactSimilarity = calculateSimilarity(userQuery, faq.question);
    const keywordSimilarity = keywordMatch(userQuery, faq.question);
    
    // Weighted average (60% exact similarity, 40% keyword match)
    const finalScore = (exactSimilarity * 0.6) + (keywordSimilarity * 0.4);

    if (finalScore > highestScore && finalScore >= 70) {
      highestScore = finalScore;
      bestMatch = {
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        confidence: Math.round(finalScore)
      };
    }
  }

  return bestMatch;
}
