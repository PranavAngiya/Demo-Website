const fs = require('fs');
const path = require('path');

// Read the original FAQ data
const originalFAQs = JSON.parse(fs.readFileSync(path.join(__dirname, '../docs/FAQ.json'), 'utf8'));

// Category mapping
const categoryMap = {
  'Your account': 'account',
  'Superannuation': 'super',
  'Insurance in super': 'insurance',
  'Retirement': 'retirement',
  'Financial advice': 'advice',
  'Investments': 'investments',
  'Employer (Clearing House)': 'employer',
  'e-Signatures (adviser context)': 'esignatures',
  'e-Signatures (member help)': 'esignatures',
  'Regulatory (YFYS)': 'regulatory'
};

// Define categories
const categories = [
  { id: 'account', name: 'Your Account', icon: 'User', color: 'blue' },
  { id: 'super', name: 'Superannuation', icon: 'PiggyBank', color: 'green' },
  { id: 'insurance', name: 'Insurance', icon: 'Shield', color: 'purple' },
  { id: 'retirement', name: 'Retirement Planning', icon: 'Home', color: 'orange' },
  { id: 'investments', name: 'Investments', icon: 'TrendingUp', color: 'red' },
  { id: 'advice', name: 'Financial Advice', icon: 'Lightbulb', color: 'yellow' },
  { id: 'employer', name: 'Employer Services', icon: 'Briefcase', color: 'indigo' },
  { id: 'esignatures', name: 'Digital Signatures', icon: 'FileText', color: 'pink' },
  { id: 'regulatory', name: 'Regulatory', icon: 'Scale', color: 'gray' }
];

// Function to generate tags from question and answer
function generateTags(question, answer) {
  const text = (question + ' ' + answer).toLowerCase();
  const keywords = [];
  
  // Common important keywords
  const importantWords = [
    'super', 'contribution', 'account', 'balance', 'insurance', 'claim',
    'retirement', 'pension', 'age', 'tax', 'fee', 'investment', 'cover',
    'death', 'tpd', 'income protection', 'beneficiary', 'firstnet', 'app',
    'employer', 'employee', 'clearing house', 'advice', 'adviser', 'financial',
    'consolidate', 'rollover', 'withdraw', 'access', 'early release', 'hardship',
    'preservation age', 'concessional', 'non-concessional', 'salary sacrifice',
    'portfolio', 'holdings', 'unit price', 'statement', 'transaction',
    'personal details', 'nominated', 'esignature', 'upload', 'form',
    'superstream', 'yfys', 'performance test'
  ];
  
  importantWords.forEach(word => {
    if (text.includes(word) && !keywords.includes(word)) {
      keywords.push(word);
    }
  });
  
  return keywords.slice(0, 5); // Max 5 tags
}

// Function to generate realistic view count
function generateViewCount(category, index) {
  const baseCounts = {
    'account': 2000,
    'super': 3500,
    'insurance': 2500,
    'retirement': 3000,
    'investments': 2200,
    'advice': 1800,
    'employer': 1200,
    'esignatures': 800,
    'regulatory': 900
  };
  
  const base = baseCounts[category] || 1000;
  const variance = Math.floor(Math.random() * base * 0.5);
  return base + variance - Math.floor(index * 50); // Decrease slightly for later items
}

// Function to generate helpful votes
function generateHelpfulVotes(views) {
  const helpfulRate = 0.85 + Math.random() * 0.1; // 85-95% helpful
  const totalVotes = Math.floor(views * 0.3); // 30% of viewers vote
  const helpful = Math.floor(totalVotes * helpfulRate);
  const notHelpful = totalVotes - helpful;
  
  return { helpful, notHelpful };
}

// Transform FAQs
const transformedFAQs = originalFAQs.map((faq, index) => {
  const categoryId = categoryMap[faq.category] || 'account';
  const views = generateViewCount(categoryId, index);
  const { helpful, notHelpful } = generateHelpfulVotes(views);
  const tags = generateTags(faq.question, faq.answer);
  
  return {
    id: `faq-${String(index + 1).padStart(3, '0')}`,
    category: categoryId,
    question: faq.question,
    answer: faq.answer,
    tags: tags,
    views: views,
    helpful: helpful,
    notHelpful: notHelpful
  };
});

// Create final structure
const output = {
  categories: categories,
  faqs: transformedFAQs
};

// Write to file
fs.writeFileSync(
  path.join(__dirname, '../src/data/faqData.json'),
  JSON.stringify(output, null, 2),
  'utf8'
);

console.log(`✅ Transformed ${transformedFAQs.length} FAQs successfully!`);
console.log(`📊 Categories: ${categories.length}`);
console.log(`🏷️  Total tags generated: ${transformedFAQs.reduce((sum, faq) => sum + faq.tags.length, 0)}`);
