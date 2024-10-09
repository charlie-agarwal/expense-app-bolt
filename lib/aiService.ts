// This is a mock AI service. In a real-world scenario, you would replace this
// with actual API calls to your AI service provider.

interface AISuggestion {
  category: string;
  confidence: number;
}

export async function getAISuggestions(description: string, amount: number): Promise<AISuggestion[]> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Mock AI logic
  const suggestions: AISuggestion[] = [];

  if (description.toLowerCase().includes('aws') || description.toLowerCase().includes('amazon')) {
    suggestions.push({ category: 'Hosting', confidence: 0.9 });
  } else if (description.toLowerCase().includes('ads') || description.toLowerCase().includes('facebook')) {
    suggestions.push({ category: 'Advertising', confidence: 0.8 });
  } else if (description.toLowerCase().includes('salary') || description.toLowerCase().includes('payroll')) {
    suggestions.push({ category: 'Payroll', confidence: 0.95 });
  } else if (amount < 0) {
    suggestions.push({ category: 'Income', confidence: 0.7 });
  } else {
    suggestions.push({ category: 'Other', confidence: 0.5 });
  }

  return suggestions;
}